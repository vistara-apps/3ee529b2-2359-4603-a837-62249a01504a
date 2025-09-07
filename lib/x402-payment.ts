'use client';

import { WalletClient } from 'viem';
import { base } from 'viem/chains';

// X402 Payment Service for USDC on Base
export class X402PaymentService {
  private walletClient: WalletClient | null = null;
  private baseUrl: string;

  // USDC contract address on Base
  private readonly USDC_CONTRACT_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

  constructor(baseUrl: string = 'https://api.x402.com') {
    this.baseUrl = baseUrl;
  }

  /**
   * Initialize the payment service with a wallet client
   */
  setWalletClient(walletClient: WalletClient | null) {
    this.walletClient = walletClient;
  }

  /**
   * Create a payment request using x402 protocol
   */
  async createPaymentRequest(params: {
    amount: string; // Amount in USDC (e.g., "10.50")
    recipient: string; // Recipient wallet address
    description?: string;
    metadata?: Record<string, any>;
  }) {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized');
    }

    try {
      // Convert USDC amount to wei (USDC has 6 decimals)
      const amountInWei = BigInt(Math.floor(parseFloat(params.amount) * 1_000_000));

      const paymentRequest = {
        chainId: base.id,
        token: this.USDC_CONTRACT_ADDRESS,
        amount: amountInWei.toString(),
        recipient: params.recipient,
        description: params.description || 'CreatorChain Payment',
        metadata: {
          ...params.metadata,
          timestamp: Date.now(),
          source: 'creatorchain'
        }
      };

      return paymentRequest;
    } catch (error) {
      console.error('Error creating payment request:', error);
      throw new Error('Failed to create payment request');
    }
  }

  /**
   * Execute a USDC payment on Base using the wallet client
   */
  async executePayment(params: {
    amount: string; // Amount in USDC
    recipient: string;
    description?: string;
  }) {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized');
    }

    try {
      const account = this.walletClient.account;
      if (!account) {
        throw new Error('No account connected');
      }

      // Convert USDC amount to wei (6 decimals)
      const amountInWei = BigInt(Math.floor(parseFloat(params.amount) * 1_000_000));

      // USDC transfer function signature
      const transferData = this.encodeTransferData(params.recipient, amountInWei);

      // Execute the transaction
      const hash = await this.walletClient.writeContract({
        address: this.USDC_CONTRACT_ADDRESS as `0x${string}`,
        abi: [
          {
            name: 'transfer',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'to', type: 'address' },
              { name: 'amount', type: 'uint256' }
            ],
            outputs: [{ name: '', type: 'bool' }]
          }
        ],
        functionName: 'transfer',
        args: [params.recipient as `0x${string}`, amountInWei],
        account: account.address,
        chain: base
      });

      return {
        transactionHash: hash,
        amount: params.amount,
        recipient: params.recipient,
        token: 'USDC',
        chainId: base.id,
        status: 'pending'
      };
    } catch (error) {
      console.error('Error executing payment:', error);
      throw new Error('Payment execution failed');
    }
  }

  /**
   * Verify a payment transaction
   */
  async verifyPayment(transactionHash: string) {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized');
    }

    try {
      // Get transaction receipt
      const receipt = await this.walletClient.getTransactionReceipt({
        hash: transactionHash as `0x${string}`
      });

      return {
        transactionHash,
        status: receipt.status === 'success' ? 'completed' : 'failed',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        confirmations: 1 // Base has fast finality
      };
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw new Error('Payment verification failed');
    }
  }

  /**
   * Get USDC balance for an address
   */
  async getUSDCBalance(address: string): Promise<string> {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized');
    }

    try {
      const balance = await this.walletClient.readContract({
        address: this.USDC_CONTRACT_ADDRESS as `0x${string}`,
        abi: [
          {
            name: 'balanceOf',
            type: 'function',
            stateMutability: 'view',
            inputs: [{ name: 'account', type: 'address' }],
            outputs: [{ name: '', type: 'uint256' }]
          }
        ],
        functionName: 'balanceOf',
        args: [address as `0x${string}`]
      });

      // Convert from wei to USDC (6 decimals)
      const balanceInUSDC = Number(balance) / 1_000_000;
      return balanceInUSDC.toFixed(6);
    } catch (error) {
      console.error('Error getting USDC balance:', error);
      return '0.000000';
    }
  }

  /**
   * Batch payment execution for multiple recipients
   */
  async executeBatchPayment(payments: Array<{
    recipient: string;
    amount: string;
    description?: string;
  }>) {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized');
    }

    const results = [];
    
    for (const payment of payments) {
      try {
        const result = await this.executePayment(payment);
        results.push({
          ...result,
          success: true,
          error: null
        });
      } catch (error) {
        results.push({
          recipient: payment.recipient,
          amount: payment.amount,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          transactionHash: null
        });
      }
    }

    return results;
  }

  /**
   * Encode transfer function data
   */
  private encodeTransferData(to: string, amount: bigint): `0x${string}` {
    // This is a simplified encoding - in production, use proper ABI encoding
    const methodId = '0xa9059cbb'; // transfer(address,uint256)
    const paddedTo = to.slice(2).padStart(64, '0');
    const paddedAmount = amount.toString(16).padStart(64, '0');
    return `${methodId}${paddedTo}${paddedAmount}` as `0x${string}`;
  }
}

// Export a singleton instance
export const x402PaymentService = new X402PaymentService();
