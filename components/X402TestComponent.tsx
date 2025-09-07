'use client';

import { useState } from 'react';
import { useX402Payment } from '@/lib/hooks/useX402Payment';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DollarSign, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export function X402TestComponent() {
  const [testAmount, setTestAmount] = useState('1.00');
  const [testRecipient, setTestRecipient] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestingPayment, setIsTestingPayment] = useState(false);
  const [isTestingVerification, setIsTestingVerification] = useState(false);

  const {
    isReady,
    address,
    usdcBalance,
    isLoadingBalance,
    executePayment,
    verifyPayment,
    loadUSDCBalance
  } = useX402Payment();

  const handleTestPayment = async () => {
    if (!testRecipient || !testAmount) return;

    setIsTestingPayment(true);
    setTestResult(null);

    try {
      const result = await executePayment({
        amount: testAmount,
        recipient: testRecipient,
        description: 'X402 Test Payment'
      });

      setTestResult({
        type: 'success',
        message: 'Payment executed successfully!',
        data: result
      });
    } catch (error) {
      setTestResult({
        type: 'error',
        message: error instanceof Error ? error.message : 'Payment failed',
        data: null
      });
    } finally {
      setIsTestingPayment(false);
    }
  };

  const handleTestVerification = async () => {
    if (!testResult?.data?.transactionHash) return;

    setIsTestingVerification(true);

    try {
      const verification = await verifyPayment(testResult.data.transactionHash);
      
      setTestResult(prev => ({
        ...prev,
        verification
      }));
    } catch (error) {
      setTestResult(prev => ({
        ...prev,
        verificationError: error instanceof Error ? error.message : 'Verification failed'
      }));
    } finally {
      setIsTestingVerification(false);
    }
  };

  if (!isReady) {
    return (
      <div className="p-lg bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center space-x-sm">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Wallet Not Connected</h3>
            <p className="text-sm text-yellow-700">Please connect your wallet to test X402 payments.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-lg p-lg bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center space-x-sm">
        <DollarSign className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">X402 Payment Test</h2>
      </div>

      {/* Wallet Info */}
      <div className="grid grid-cols-2 gap-md">
        <div className="p-md bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-900">Connected Address</p>
          <p className="text-sm text-blue-700 font-mono">
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
          </p>
        </div>
        <div className="p-md bg-green-50 rounded-lg">
          <p className="text-sm font-medium text-green-900">USDC Balance</p>
          <p className="text-sm text-green-700 font-mono">
            {isLoadingBalance ? 'Loading...' : `${usdcBalance} USDC`}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={loadUSDCBalance}
            className="mt-xs"
            disabled={isLoadingBalance}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Test Form */}
      <div className="space-y-md">
        <Input
          label="Test Amount (USDC)"
          type="number"
          min="0"
          step="0.01"
          value={testAmount}
          onChange={(e) => setTestAmount(e.target.value)}
          placeholder="1.00"
        />

        <Input
          label="Recipient Address"
          type="text"
          value={testRecipient}
          onChange={(e) => setTestRecipient(e.target.value)}
          placeholder="0x..."
        />

        <Button
          onClick={handleTestPayment}
          disabled={isTestingPayment || !testAmount || !testRecipient}
          className="w-full"
        >
          {isTestingPayment ? (
            <div className="flex items-center space-x-xs">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Executing Payment...</span>
            </div>
          ) : (
            'Test X402 Payment'
          )}
        </Button>
      </div>

      {/* Test Results */}
      {testResult && (
        <div className="space-y-md">
          <div className={`p-md rounded-lg border ${
            testResult.type === 'success' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-sm mb-sm">
              {testResult.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <h3 className={`text-sm font-medium ${
                testResult.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.type === 'success' ? 'Payment Successful' : 'Payment Failed'}
              </h3>
            </div>
            <p className={`text-sm ${
              testResult.type === 'success' ? 'text-green-700' : 'text-red-700'
            }`}>
              {testResult.message}
            </p>
          </div>

          {testResult.data && (
            <div className="p-md bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-sm">Transaction Details</h4>
              <div className="space-y-xs text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction Hash:</span>
                  <span className="font-mono text-gray-900">
                    {testResult.data.transactionHash.slice(0, 10)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">{testResult.data.amount} USDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">{testResult.data.status}</span>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={handleTestVerification}
                disabled={isTestingVerification}
                className="mt-sm"
              >
                {isTestingVerification ? (
                  <div className="flex items-center space-x-xs">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  'Verify Transaction'
                )}
              </Button>
            </div>
          )}

          {testResult.verification && (
            <div className="p-md bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-sm">Verification Result</h4>
              <div className="space-y-xs text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-600">Status:</span>
                  <span className="font-medium text-blue-900">{testResult.verification.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Block Number:</span>
                  <span className="font-medium text-blue-900">{testResult.verification.blockNumber?.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Confirmations:</span>
                  <span className="font-medium text-blue-900">{testResult.verification.confirmations}</span>
                </div>
              </div>
            </div>
          )}

          {testResult.verificationError && (
            <div className="p-md bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                Verification Error: {testResult.verificationError}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
