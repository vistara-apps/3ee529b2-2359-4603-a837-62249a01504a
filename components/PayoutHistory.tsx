'use client';

import { Payout, Contributor } from '@/lib/types';
import { formatCurrency, formatDate, formatAddress } from '@/lib/utils';
import { BASE_SCAN_URL } from '@/lib/constants';
import { ExternalLink, CheckCircle, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PayoutHistoryProps {
  payouts: Payout[];
  contributors: Contributor[];
}

export function PayoutHistory({ payouts, contributors }: PayoutHistoryProps) {
  const getContributor = (contributorId: string) => {
    return contributors.find(c => c.contributorId === contributorId);
  };

  const statusIcons = {
    pending: Clock,
    completed: CheckCircle,
    failed: XCircle,
  };

  const statusColors = {
    pending: 'text-yellow-500',
    completed: 'text-green-500',
    failed: 'text-red-500',
  };

  if (payouts.length === 0) {
    return (
      <div className="text-center py-xl">
        <p className="text-textSecondary">No payouts yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-sm">
      <h3 className="text-lg font-semibold text-textPrimary">Payout History</h3>
      
      <div className="space-y-sm">
        {payouts.map((payout) => {
          const contributor = getContributor(payout.contributorId);
          const StatusIcon = statusIcons[payout.status];
          
          return (
            <div key={payout.payoutId} className="p-md bg-surface border border-gray-100 rounded-md">
              <div className="flex items-center justify-between mb-sm">
                <div className="flex items-center space-x-sm">
                  <StatusIcon className={cn('w-4 h-4', statusColors[payout.status])} />
                  <div>
                    <p className="text-sm font-medium text-textPrimary">
                      {contributor?.name || formatAddress(contributor?.walletAddress || '')}
                    </p>
                    <p className="text-xs text-textSecondary">
                      {contributor?.role}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-medium text-textPrimary">
                    {formatCurrency(payout.amount)} ETH
                  </p>
                  <p className="text-xs text-textSecondary">
                    {formatDate(payout.timestamp)}
                  </p>
                </div>
              </div>

              {payout.transactionHash && (
                <div className="flex items-center justify-between pt-sm border-t border-gray-100">
                  <span className="text-xs text-textSecondary">
                    {formatAddress(payout.transactionHash)}
                  </span>
                  <a
                    href={`${BASE_SCAN_URL}/tx/${payout.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-xs text-xs text-primary hover:text-primary/80 transition-colors duration-200"
                  >
                    <span>View on BaseScan</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
