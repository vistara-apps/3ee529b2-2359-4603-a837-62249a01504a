'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { useX402Payment, X402PaymentConfig } from '@/lib/hooks/useX402Payment';
import { Button } from '@/components/ui/Button';
import { SUPPORTED_TOKENS } from '@/lib/constants';
import { formatCurrency, formatAddress } from '@/lib/utils';
import { X, AlertCircle, CheckCircle, Loader2, ExternalLink } from 'lucide-react';

interface X402PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (transactionHash: string) => void;
  defaultConfig?: Partial<X402PaymentConfig>;
  title?: string;
}

export function X402PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  defaultConfig,
  title = 'Make Payment',
}: X402PaymentModalProps) {
  const { address } = useAccount();
  const { processPayment, verifyPayment, estimateGas, isLoading, error } = useX402Payment();
  
  const [config, setConfig] = useState<X402PaymentConfig>({
    amount: '',
    token: 'USDC',
    recipient: '',
    description: '',
    ...defaultConfig,
  });
  
  const [gasEstimate, setGasEstimate] = useState<bigint | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean;
    transactionHash?: string;
    error?: string;
  } | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPaymentResult(null);
      setGasEstimate(null);
      setConfig(prev => ({ ...prev, ...defaultConfig }));
    }
  }, [isOpen, defaultConfig]);

  // Estimate gas when config changes
  useEffect(() => {
    if (config.amount && config.recipient && config.token) {
      estimateGas(config).then(setGasEstimate);
    }
  }, [config, estimateGas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      setPaymentResult({
        success: false,
        error: 'Please connect your wallet first',
      });
      return;
    }

    const result = await processPayment(config);
    setPaymentResult(result);

    if (result.success && result.transactionHash) {
      // Verify the payment
      setIsVerifying(true);
      try {
        const isVerified = await verifyPayment(result.transactionHash);
        if (isVerified) {
          onSuccess?.(result.transactionHash);
        }
      } catch (error) {
        console.error('Payment verification failed:', error);
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleClose = () => {
    if (!isLoading && !isVerifying) {
      onClose();
    }
  };

  const isFormValid = config.amount && config.recipient && config.token;
  const selectedToken = SUPPORTED_TOKENS.find(t => t.symbol === config.token);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-textPrimary">{title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isLoading || isVerifying}
              className="p-1"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Payment Result */}
          {paymentResult && (
            <div className={`mb-6 p-4 rounded-lg ${
              paymentResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start space-x-3">
                {paymentResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${
                    paymentResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {paymentResult.success ? 'Payment Successful!' : 'Payment Failed'}
                  </p>
                  {paymentResult.success && paymentResult.transactionHash && (
                    <div className="mt-2">
                      <p className="text-sm text-green-700">
                        Transaction: {formatAddress(paymentResult.transactionHash)}
                      </p>
                      <a
                        href={`https://basescan.org/tx/${paymentResult.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 mt-1"
                      >
                        <span>View on BaseScan</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {isVerifying && (
                        <div className="flex items-center space-x-2 mt-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-green-700">Verifying payment...</span>
                        </div>
                      )}
                    </div>
                  )}
                  {paymentResult.error && (
                    <p className="text-sm text-red-700 mt-1">{paymentResult.error}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && !paymentResult && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Token Selection */}
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-2">
                Token
              </label>
              <select
                value={config.token}
                onChange={(e) => setConfig(prev => ({ ...prev, token: e.target.value as 'ETH' | 'USDC' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isLoading || isVerifying}
              >
                {SUPPORTED_TOKENS.map((token) => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.name} ({token.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-2">
                Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={config.amount}
                  onChange={(e) => setConfig(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={isLoading || isVerifying}
                  required
                />
                <div className="absolute right-3 top-2 text-sm text-textSecondary">
                  {config.token}
                </div>
              </div>
            </div>

            {/* Recipient */}
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={config.recipient}
                onChange={(e) => setConfig(prev => ({ ...prev, recipient: e.target.value }))}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isLoading || isVerifying}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-2">
                Description (Optional)
              </label>
              <input
                type="text"
                value={config.description}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Payment description"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isLoading || isVerifying}
              />
            </div>

            {/* Gas Estimate */}
            {gasEstimate && selectedToken && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-textSecondary">
                  Estimated Gas: {formatUnits(gasEstimate, 18)} ETH
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading || isVerifying}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || isLoading || isVerifying || !!paymentResult?.success}
                className="flex-1 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : paymentResult?.success ? (
                  <span>Payment Complete</span>
                ) : (
                  <span>Send Payment</span>
                )}
              </Button>
            </div>
          </form>

          {/* X402 Info */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-textSecondary text-center">
              Powered by X402 • Secure on-chain payments
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
