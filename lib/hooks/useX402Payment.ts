'use client';

import { useState, useCallback } from 'react';
import { useWalletClient, usePublicClient } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import axios from 'axios';
import { SUPPORTED_TOKENS } from '@/lib/constants';

export interface X402PaymentConfig {
  amount: string;
  token: 'ETH' | 'USDC';
  recipient: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface X402PaymentResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  receipt?: any;
}

export interface X402PaymentState {
  isLoading: boolean;
  error: string | null;
  lastTransaction: string | null;
}

export function useX402Payment() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [state, setState] = useState<X402PaymentState>({
    isLoading: false,
    error: null,
    lastTransaction: null,
  });

  // Create axios instance for X402 API calls
  const x402Client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_X402_API_URL || 'https://api.x402.com',
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_X402_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  const processPayment = useCallback(async (
    config: X402PaymentConfig
  ): Promise<X402PaymentResult> => {
    if (!walletClient) {
      return {
        success: false,
        error: 'Wallet not connected',
      };
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      // Get token configuration
      const token = SUPPORTED_TOKENS.find(t => t.symbol === config.token);
      if (!token) {
        throw new Error(`Unsupported token: ${config.token}`);
      }

      // Parse amount based on token decimals
      const amountWei = parseUnits(config.amount, token.decimals);

      // Prepare payment request
      const paymentRequest = {
        amount: amountWei.toString(),
        token: token.address,
        recipient: config.recipient,
        description: config.description || 'CreatorChain Payment',
        metadata: {
          ...config.metadata,
          platform: 'CreatorChain',
          timestamp: Date.now(),
        },
      };

      // Create payment session with x402
      const sessionResponse = await x402Client.post('/payment/session', paymentRequest);
      const session = sessionResponse.data;

      // Execute the payment transaction
      let transactionHash: string;

      if (config.token === 'ETH') {
        // Native ETH transfer
        const hash = await walletClient.sendTransaction({
          to: config.recipient as `0x${string}`,
          value: amountWei,
          data: session.data || '0x',
        });
        transactionHash = hash;
      } else {
        // ERC-20 token transfer (USDC)
        const hash = await walletClient.writeContract({
          address: token.address as `0x${string}`,
          abi: [
            {
              name: 'transfer',
              type: 'function',
              stateMutability: 'nonpayable',
              inputs: [
                { name: 'to', type: 'address' },
                { name: 'amount', type: 'uint256' },
              ],
              outputs: [{ name: '', type: 'bool' }],
            },
          ],
          functionName: 'transfer',
          args: [config.recipient as `0x${string}`, amountWei],
        });
        transactionHash = hash;
      }

      // Wait for transaction confirmation
      if (!publicClient) {
        throw new Error('Public client not available');
      }
      
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: transactionHash as `0x${string}`,
        confirmations: 2, // Wait for 2 confirmations for security
      });

      // Verify payment with x402
      await x402Client.post('/payment/verify', {
        sessionId: session.id,
        transactionHash,
        receipt,
      });

      setState(prev => ({
        ...prev,
        isLoading: false,
        lastTransaction: transactionHash,
      }));

      return {
        success: true,
        transactionHash,
        receipt,
      };

    } catch (error: any) {
      const errorMessage = error?.message || 'Payment failed';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [walletClient, x402Client]);

  const verifyPayment = useCallback(async (
    transactionHash: string
  ): Promise<boolean> => {
    try {
      const response = await x402Client.get(`/payment/status/${transactionHash}`);
      return response.data.status === 'confirmed';
    } catch (error) {
      console.error('Payment verification failed:', error);
      return false;
    }
  }, [x402Client]);

  const getPaymentHistory = useCallback(async (
    walletAddress: string,
    limit = 10
  ) => {
    try {
      const response = await x402Client.get('/payment/history', {
        params: {
          wallet: walletAddress,
          limit,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      return [];
    }
  }, [x402Client]);

  const estimateGas = useCallback(async (
    config: X402PaymentConfig
  ): Promise<bigint | null> => {
    if (!walletClient || !publicClient) return null;

    try {
      const token = SUPPORTED_TOKENS.find(t => t.symbol === config.token);
      if (!token) return null;

      const amountWei = parseUnits(config.amount, token.decimals);

      if (config.token === 'ETH') {
        const gas = await publicClient.estimateGas({
          to: config.recipient as `0x${string}`,
          value: amountWei,
          account: walletClient.account,
        });
        return gas;
      } else {
        const gas = await publicClient.estimateContractGas({
          address: token.address as `0x${string}`,
          abi: [
            {
              name: 'transfer',
              type: 'function',
              stateMutability: 'nonpayable',
              inputs: [
                { name: 'to', type: 'address' },
                { name: 'amount', type: 'uint256' },
              ],
              outputs: [{ name: '', type: 'bool' }],
            },
          ],
          functionName: 'transfer',
          args: [config.recipient as `0x${string}`, amountWei],
          account: walletClient.account,
        });
        return gas;
      }
    } catch (error) {
      console.error('Gas estimation failed:', error);
      return null;
    }
  }, [walletClient, publicClient]);

  return {
    processPayment,
    verifyPayment,
    getPaymentHistory,
    estimateGas,
    isLoading: state.isLoading,
    error: state.error,
    lastTransaction: state.lastTransaction,
  };
}
