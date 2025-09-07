'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useX402Payment } from '@/lib/hooks/useX402Payment';
import { DistributeRevenueData, RevenuePool } from '@/lib/types';
import { formatCurrency, calculatePayout } from '@/lib/utils';
import { PLATFORM_FEE } from '@/lib/constants';
import { DollarSign, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface X402PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: DistributeRevenueData & { transactionHashes: string[] }) => void;
  projectId: string;
  contributors: Array<{ 
    name?: string; 
    walletAddress: string; 
    sharePercentage: number; 
    role: string;
    contributorId: string;
  }>;
}

interface PaymentStatus {
  contributorId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionHash?: string;
  error?: string;
}

export function X402PaymentModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  projectId,
  contributors
}: X402PaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [source] = useState<RevenuePool['source']>('direct');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatuses, setPaymentStatuses] = useState<PaymentStatus[]>([]);
  const [completedPayments, setCompletedPayments] = useState<string[]>([]);

  const {
    isReady,
    usdcBalance,
    isLoadingBalance,
    executePayment,
    verifyPayment,
    loadUSDCBalance
  } = useX402Payment();

  // Initialize payment statuses
  useEffect(() => {
    if (contributors.length > 0) {
      setPaymentStatuses(contributors.map(c => ({
        contributorId: c.contributorId,
        status: 'pending'
      })));
    }
  }, [contributors]);

  // Load USDC balance when modal opens
  useEffect(() => {
    if (isOpen && isReady) {
      loadUSDCBalance();
    }
  }, [isOpen, isReady, loadUSDCBalance]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }

    const availableBalance = parseFloat(usdcBalance);
    if (numAmount > availableBalance) {
      newErrors.amount = `Insufficient USDC balance. Available: ${usdcBalance} USDC`;
    }

    if (!isReady) {
      newErrors.wallet = 'Please connect your wallet to continue';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updatePaymentStatus = (contributorId: string, update: Partial<PaymentStatus>) => {
    setPaymentStatuses(prev => prev.map(status => 
      status.contributorId === contributorId 
        ? { ...status, ...update }
        : status
    ));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    const transactionHashes: string[] = [];
    const numAmount = parseFloat(amount);

    try {
      // Process payments for each contributor
      for (const contributor of contributors) {
        updatePaymentStatus(contributor.contributorId, { status: 'processing' });

        try {
          const payoutAmount = calculatePayout(numAmount, contributor.sharePercentage);
          
          const result = await executePayment({
            amount: payoutAmount.toString(),
            recipient: contributor.walletAddress,
            description: `CreatorChain payout for ${contributor.name || contributor.role}`
          });

          updatePaymentStatus(contributor.contributorId, {
            status: 'completed',
            transactionHash: result.transactionHash
          });

          transactionHashes.push(result.transactionHash);
          setCompletedPayments(prev => [...prev, contributor.contributorId]);

          // Wait a bit between transactions to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Payment failed';
          updatePaymentStatus(contributor.contributorId, {
            status: 'failed',
            error: errorMessage
          });
        }
      }

      // Check if all payments were successful
      const failedPayments = paymentStatuses.filter(s => s.status === 'failed');
      
      if (failedPayments.length === 0) {
        // All payments successful
        onSuccess({
          projectId,
          amount: numAmount,
          source,
          transactionHashes
        });
      } else {
        // Some payments failed - show error but don't close modal
        setErrors({ 
          general: `${failedPayments.length} payment(s) failed. Please retry failed payments.` 
        });
      }

    } catch (error) {
      setErrors({ 
        general: error instanceof Error ? error.message : 'Payment processing failed' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const retryFailedPayment = async (contributor: typeof contributors[0]) => {
    updatePaymentStatus(contributor.contributorId, { status: 'processing', error: undefined });

    try {
      const payoutAmount = calculatePayout(parseFloat(amount), contributor.sharePercentage);
      
      const result = await executePayment({
        amount: payoutAmount.toString(),
        recipient: contributor.walletAddress,
        description: `CreatorChain payout retry for ${contributor.name || contributor.role}`
      });

      updatePaymentStatus(contributor.contributorId, {
        status: 'completed',
        transactionHash: result.transactionHash
      });

      setCompletedPayments(prev => [...prev, contributor.contributorId]);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      updatePaymentStatus(contributor.contributorId, {
        status: 'failed',
        error: errorMessage
      });
    }
  };

  const numAmount = parseFloat(amount) || 0;
  const afterFee = numAmount * (1 - PLATFORM_FEE);
  const platformFeeAmount = numAmount * PLATFORM_FEE;

  const getStatusIcon = (status: PaymentStatus['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="X402 USDC Payment Distribution">
      <div className="space-y-lg">
        {/* Wallet Status */}
        <div className="p-md bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">USDC Balance</p>
              <p className="text-lg font-bold text-blue-700">
                {isLoadingBalance ? 'Loading...' : `${usdcBalance} USDC`}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        {/* Amount Input */}
        <Input
          label="Distribution Amount (USDC)"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          error={errors.amount}
          disabled={isProcessing}
        />

        {/* Distribution Preview */}
        {numAmount > 0 && (
          <div className="space-y-md">
            <div className="p-md bg-gray-50 rounded-md">
              <h4 className="text-sm font-medium text-textPrimary mb-sm">Distribution Preview</h4>
              <div className="space-y-xs text-sm">
                <div className="flex justify-between">
                  <span className="text-textSecondary">Total Amount:</span>
                  <span className="font-medium">{formatCurrency(numAmount)} USDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-textSecondary">Platform Fee (2%):</span>
                  <span className="font-medium">-{formatCurrency(platformFeeAmount)} USDC</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-xs">
                  <span className="text-textSecondary">To Distribute:</span>
                  <span className="font-medium">{formatCurrency(afterFee)} USDC</span>
                </div>
              </div>
            </div>

            {/* Contributor Payouts with Status */}
            <div className="space-y-sm">
              <h4 className="text-sm font-medium text-textPrimary">Payment Status</h4>
              {contributors.map((contributor) => {
                const payout = calculatePayout(numAmount, contributor.sharePercentage);
                const status = paymentStatuses.find(s => s.contributorId === contributor.contributorId);
                
                return (
                  <div key={contributor.contributorId} className="flex justify-between items-center p-sm bg-surface border border-gray-100 rounded-md">
                    <div className="flex items-center space-x-sm">
                      {getStatusIcon(status?.status || 'pending')}
                      <div>
                        <p className="text-sm font-medium text-textPrimary">
                          {contributor.name || `${contributor.walletAddress.slice(0, 6)}...${contributor.walletAddress.slice(-4)}`}
                        </p>
                        <p className="text-xs text-textSecondary">
                          {contributor.role} • {contributor.sharePercentage}%
                        </p>
                        {status?.error && (
                          <p className="text-xs text-red-500 mt-1">{status.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-sm">
                      <span className="text-sm font-medium text-textPrimary">
                        {formatCurrency(payout)} USDC
                      </span>
                      {status?.status === 'failed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => retryFailedPayment(contributor)}
                          disabled={isProcessing}
                        >
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Error Messages */}
        {errors.general && (
          <div className="p-md bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{errors.general}</p>
          </div>
        )}

        {errors.wallet && (
          <div className="p-md bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-700">{errors.wallet}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-sm">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
            disabled={isProcessing || !numAmount || !isReady}
          >
            {isProcessing ? (
              <div className="flex items-center space-x-xs">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              'Distribute USDC'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
