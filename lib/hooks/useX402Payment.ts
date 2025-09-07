'use client';

import { useEffect, useState } from 'react';
import { useWalletClient, useAccount } from 'wagmi';
import { x402PaymentService } from '@/lib/x402-payment';

export interface PaymentResult {
  transactionHash: string;
  amount: string;
  recipient: string;
  token: string;
  chainId: number;
  status: 'pending' | 'completed' | 'failed';
}

export interface PaymentError {
  message: string;
  code?: string;
}

export function useX402Payment() {
  const { data: walletClient } = useWalletClient();
  const { address, isConnected } = useAccount();
  const [isInitialized, setIsInitialized] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<string>('0.000000');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Initialize the payment service when wallet client is available
  useEffect(() => {
    if (walletClient) {
      x402PaymentService.setWalletClient(walletClient);
      setIsInitialized(true);
    } else {
      x402PaymentService.setWalletClient(null);
      setIsInitialized(false);
    }
  }, [walletClient]);

  // Load USDC balance when address changes
  useEffect(() => {
    if (address && isInitialized) {
      loadUSDCBalance();
    }
  }, [address, isInitialized]);

  const loadUSDCBalance = async () => {
    if (!address || !isInitialized) return;

    setIsLoadingBalance(true);
    try {
      const balance = await x402PaymentService.getUSDCBalance(address);
      setUsdcBalance(balance);
    } catch (error) {
      console.error('Failed to load USDC balance:', error);
      setUsdcBalance('0.000000');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const executePayment = async (params: {
    amount: string;
    recipient: string;
    description?: string;
  }): Promise<PaymentResult> => {
    if (!isInitialized) {
      throw new Error('Payment service not initialized');
    }

    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const result = await x402PaymentService.executePayment(params);
      
      // Refresh balance after payment
      setTimeout(() => {
        loadUSDCBalance();
      }, 2000);

      return result;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Payment failed');
    }
  };

  const executeBatchPayment = async (payments: Array<{
    recipient: string;
    amount: string;
    description?: string;
  }>) => {
    if (!isInitialized) {
      throw new Error('Payment service not initialized');
    }

    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const results = await x402PaymentService.executeBatchPayment(payments);
      
      // Refresh balance after batch payment
      setTimeout(() => {
        loadUSDCBalance();
      }, 3000);

      return results;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Batch payment failed');
    }
  };

  const verifyPayment = async (transactionHash: string) => {
    if (!isInitialized) {
      throw new Error('Payment service not initialized');
    }

    try {
      return await x402PaymentService.verifyPayment(transactionHash);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Payment verification failed');
    }
  };

  const createPaymentRequest = async (params: {
    amount: string;
    recipient: string;
    description?: string;
    metadata?: Record<string, any>;
  }) => {
    if (!isInitialized) {
      throw new Error('Payment service not initialized');
    }

    try {
      return await x402PaymentService.createPaymentRequest(params);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create payment request');
    }
  };

  return {
    // State
    isInitialized,
    isConnected,
    address,
    usdcBalance,
    isLoadingBalance,

    // Actions
    executePayment,
    executeBatchPayment,
    verifyPayment,
    createPaymentRequest,
    loadUSDCBalance,

    // Utilities
    isReady: isInitialized && isConnected,
  };
}
