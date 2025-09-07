'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DistributeRevenueData, RevenuePool } from '@/lib/types';
import { formatCurrency, calculatePayout } from '@/lib/utils';
import { PLATFORM_FEE, REVENUE_SOURCES } from '@/lib/constants';

interface DistributeRevenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DistributeRevenueData) => void;
  projectId: string;
  contributors: Array<{ name?: string; walletAddress: string; sharePercentage: number; role: string }>;
  isLoading?: boolean;
}

export function DistributeRevenueModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  projectId,
  contributors,
  isLoading = false 
}: DistributeRevenueModalProps) {
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState<RevenuePool['source']>('direct');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const data: DistributeRevenueData = {
      projectId,
      amount: parseFloat(amount),
      source,
    };

    onSubmit(data);
  };

  const numAmount = parseFloat(amount) || 0;
  const afterFee = numAmount * (1 - PLATFORM_FEE);
  const platformFeeAmount = numAmount * PLATFORM_FEE;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Distribute Revenue">
      <div className="space-y-lg">
        <Input
          label="Revenue Amount (ETH)"
          type="number"
          min="0"
          step="0.001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          error={errors.amount}
        />

        <div>
          <label className="block text-sm font-medium text-textPrimary mb-xs">
            Revenue Source
          </label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as RevenuePool['source'])}
            className="input-field"
          >
            <option value="direct">Direct Payment</option>
            <option value="zora">Zora NFT Sale</option>
            <option value="other">Other</option>
          </select>
        </div>

        {numAmount > 0 && (
          <div className="space-y-md">
            <div className="p-md bg-gray-50 rounded-md">
              <h4 className="text-sm font-medium text-textPrimary mb-sm">Distribution Preview</h4>
              <div className="space-y-xs text-sm">
                <div className="flex justify-between">
                  <span className="text-textSecondary">Total Revenue:</span>
                  <span className="font-medium">{formatCurrency(numAmount)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-textSecondary">Platform Fee (2%):</span>
                  <span className="font-medium">-{formatCurrency(platformFeeAmount)} ETH</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-xs">
                  <span className="text-textSecondary">To Distribute:</span>
                  <span className="font-medium">{formatCurrency(afterFee)} ETH</span>
                </div>
              </div>
            </div>

            <div className="space-y-sm">
              <h4 className="text-sm font-medium text-textPrimary">Contributor Payouts</h4>
              {contributors.map((contributor, index) => {
                const payout = calculatePayout(numAmount, contributor.sharePercentage);
                return (
                  <div key={index} className="flex justify-between items-center p-sm bg-surface border border-gray-100 rounded-md">
                    <div>
                      <p className="text-sm font-medium text-textPrimary">
                        {contributor.name || `${contributor.walletAddress.slice(0, 6)}...${contributor.walletAddress.slice(-4)}`}
                      </p>
                      <p className="text-xs text-textSecondary">
                        {contributor.role} • {contributor.sharePercentage}%
                      </p>
                    </div>
                    <span className="text-sm font-medium text-textPrimary">
                      {formatCurrency(payout)} ETH
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex space-x-sm">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
            loading={isLoading}
            disabled={!numAmount}
          >
            Distribute Revenue
          </Button>
        </div>
      </div>
    </Modal>
  );
}
