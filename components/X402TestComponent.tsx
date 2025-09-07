'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useX402Payment } from '@/lib/hooks/useX402Payment';
import { Button } from '@/components/ui/Button';
import { SUPPORTED_TOKENS } from '@/lib/constants';
import { formatAddress } from '@/lib/utils';
import { CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';

export function X402TestComponent() {
  const { address } = useAccount();
  const { processPayment, verifyPayment, estimateGas, isLoading, error } = useX402Payment();
  
  const [testResults, setTestResults] = useState<{
    ethPayment?: { success: boolean; hash?: string; error?: string };
    usdcPayment?: { success: boolean; hash?: string; error?: string };
    gasEstimate?: { eth?: bigint; usdc?: bigint };
    verification?: { [hash: string]: boolean };
  }>({});

  const testRecipient = '0x742d35Cc6634C0532925a3b8D0C9e3e0C0C0C0C0'; // Test address

  const runEthPaymentTest = async () => {
    try {
      const result = await processPayment({
        amount: '0.001',
        token: 'ETH',
        recipient: testRecipient,
        description: 'X402 ETH Test Payment',
        metadata: { test: true, timestamp: Date.now() },
      });

      setTestResults(prev => ({
        ...prev,
        ethPayment: {
          success: result.success,
          hash: result.transactionHash,
          error: result.error,
        },
      }));

      // Verify the payment if successful
      if (result.success && result.transactionHash) {
        const isVerified = await verifyPayment(result.transactionHash);
        setTestResults(prev => ({
          ...prev,
          verification: {
            ...prev.verification,
            [result.transactionHash!]: isVerified,
          },
        }));
      }
    } catch (error: any) {
      setTestResults(prev => ({
        ...prev,
        ethPayment: {
          success: false,
          error: error.message,
        },
      }));
    }
  };

  const runUsdcPaymentTest = async () => {
    try {
      const result = await processPayment({
        amount: '1.0',
        token: 'USDC',
        recipient: testRecipient,
        description: 'X402 USDC Test Payment',
        metadata: { test: true, timestamp: Date.now() },
      });

      setTestResults(prev => ({
        ...prev,
        usdcPayment: {
          success: result.success,
          hash: result.transactionHash,
          error: result.error,
        },
      }));

      // Verify the payment if successful
      if (result.success && result.transactionHash) {
        const isVerified = await verifyPayment(result.transactionHash);
        setTestResults(prev => ({
          ...prev,
          verification: {
            ...prev.verification,
            [result.transactionHash!]: isVerified,
          },
        }));
      }
    } catch (error: any) {
      setTestResults(prev => ({
        ...prev,
        usdcPayment: {
          success: false,
          error: error.message,
        },
      }));
    }
  };

  const runGasEstimationTest = async () => {
    try {
      const ethGas = await estimateGas({
        amount: '0.001',
        token: 'ETH',
        recipient: testRecipient,
      });

      const usdcGas = await estimateGas({
        amount: '1.0',
        token: 'USDC',
        recipient: testRecipient,
      });

      setTestResults(prev => ({
        ...prev,
        gasEstimate: {
          eth: ethGas || undefined,
          usdc: usdcGas || undefined,
        },
      }));
    } catch (error) {
      console.error('Gas estimation test failed:', error);
    }
  };

  const renderTestResult = (
    title: string,
    result?: { success: boolean; hash?: string; error?: string }
  ) => (
    <div className="p-4 border rounded-lg">
      <h4 className="font-medium text-textPrimary mb-2">{title}</h4>
      {result ? (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            {result.success ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span className={result.success ? 'text-green-800' : 'text-red-800'}>
              {result.success ? 'Success' : 'Failed'}
            </span>
          </div>
          {result.hash && (
            <div className="text-sm">
              <p className="text-textSecondary">Transaction Hash:</p>
              <div className="flex items-center space-x-2">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {formatAddress(result.hash)}
                </code>
                <a
                  href={`https://basescan.org/tx/${result.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              {testResults.verification?.[result.hash] !== undefined && (
                <p className="text-xs mt-1">
                  Verification: {testResults.verification[result.hash] ? '✅ Verified' : '❌ Failed'}
                </p>
              )}
            </div>
          )}
          {result.error && (
            <p className="text-sm text-red-700">{result.error}</p>
          )}
        </div>
      ) : (
        <p className="text-textSecondary">Not tested</p>
      )}
    </div>
  );

  if (!address) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Please connect your wallet to run X402 tests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-surface rounded-lg shadow-card">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-textPrimary mb-2">X402 Payment Flow Tests</h3>
        <p className="text-sm text-textSecondary">
          Test the X402 payment integration with ETH and USDC on Base
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderTestResult('ETH Payment Test', testResults.ethPayment)}
        {renderTestResult('USDC Payment Test', testResults.usdcPayment)}
      </div>

      {testResults.gasEstimate && (
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium text-textPrimary mb-2">Gas Estimation Results</h4>
          <div className="space-y-1 text-sm">
            {testResults.gasEstimate.eth && (
              <p>ETH Transfer: {testResults.gasEstimate.eth.toString()} gas</p>
            )}
            {testResults.gasEstimate.usdc && (
              <p>USDC Transfer: {testResults.gasEstimate.usdc.toString()} gas</p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={runEthPaymentTest}
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          <span>Test ETH Payment</span>
        </Button>
        
        <Button
          onClick={runUsdcPaymentTest}
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          <span>Test USDC Payment</span>
        </Button>
        
        <Button
          variant="outline"
          onClick={runGasEstimationTest}
          disabled={isLoading}
        >
          Test Gas Estimation
        </Button>
      </div>

      <div className="text-xs text-textSecondary">
        <p>⚠️ These tests use small amounts and a test recipient address.</p>
        <p>🔗 All transactions are on Base mainnet and will use real funds.</p>
        <p>📊 Results include transaction verification through X402.</p>
      </div>
    </div>
  );
}
