import { ethers } from 'ethers';
import { createPublicClient, createWalletClient, http, parseEther, formatEther } from 'viem';
import { base } from 'viem/chains';
import type { TransactionDetails, ContractInteraction } from '@/types';

// Base network configuration
const BASE_RPC_URL = process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org';
const ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;

// Contract addresses
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const REVENUE_SPLITTER_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_REVENUE_SPLITTER_FACTORY_ADDRESS;

// Create public client for reading blockchain data
export const publicClient = createPublicClient({
  chain: base,
  transport: http(BASE_RPC_URL),
});

// Revenue Splitter Contract ABI (simplified)
export const REVENUE_SPLITTER_ABI = [
  {
    inputs: [
      { name: '_payees', type: 'address[]' },
      { name: '_shares', type: 'uint256[]' },
    ],
    name: 'constructor',
    type: 'constructor',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'release',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'account', type: 'address' },
    ],
    name: 'release',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'releasable',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'account', type: 'address' },
    ],
    name: 'releasable',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'shares',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalShares',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'account', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'PaymentReleased',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: 'token', type: 'address' },
      { indexed: false, name: 'account', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'ERC20PaymentReleased',
    type: 'event',
  },
] as const;

// USDC Contract ABI (simplified)
export const USDC_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// Get transaction details from Base Scan
export async function getTransactionDetails(txHash: string): Promise<TransactionDetails | null> {
  if (!ETHERSCAN_API_KEY) {
    console.warn('Etherscan API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.basescan.org/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${ETHERSCAN_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.result) {
      const tx = data.result;
      return {
        hash: tx.hash,
        blockNumber: parseInt(tx.blockNumber, 16),
        timestamp: Date.now(), // Would need additional call to get block timestamp
        from: tx.from,
        to: tx.to,
        value: formatEther(BigInt(tx.value)),
        gasUsed: parseInt(tx.gas, 16),
        gasPrice: formatEther(BigInt(tx.gasPrice)),
        status: 'success', // Would need receipt to determine actual status
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    return null;
  }
}

// Get USDC balance for an address
export async function getUSDCBalance(address: string): Promise<number> {
  try {
    const balance = await publicClient.readContract({
      address: USDC_ADDRESS as `0x${string}`,
      abi: USDC_ABI,
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
    });
    
    // USDC has 6 decimals
    return Number(balance) / Math.pow(10, 6);
  } catch (error) {
    console.error('Error fetching USDC balance:', error);
    return 0;
  }
}

// Deploy a new revenue splitter contract
export async function deployRevenueSplitter(
  payees: string[],
  shares: number[],
  signer: any
): Promise<string> {
  if (!signer) {
    throw new Error('Wallet not connected');
  }

  try {
    // This would typically use a factory contract or deploy directly
    // For now, we'll simulate the deployment
    const contractFactory = new ethers.ContractFactory(
      REVENUE_SPLITTER_ABI,
      '0x', // Bytecode would go here
      signer
    );

    const contract = await contractFactory.deploy(payees, shares);
    await contract.waitForDeployment();
    
    return await contract.getAddress();
  } catch (error) {
    console.error('Error deploying revenue splitter:', error);
    throw error;
  }
}

// Release payments from a revenue splitter contract
export async function releasePayment(
  contractAddress: string,
  payeeAddress: string,
  tokenAddress?: string,
  signer?: any
): Promise<string> {
  if (!signer) {
    throw new Error('Wallet not connected');
  }

  try {
    const contract = new ethers.Contract(
      contractAddress,
      REVENUE_SPLITTER_ABI,
      signer
    );

    let tx;
    if (tokenAddress) {
      // Release ERC20 tokens (like USDC)
      tx = await contract.release(tokenAddress, payeeAddress);
    } else {
      // Release ETH
      tx = await contract.release(payeeAddress);
    }

    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error releasing payment:', error);
    throw error;
  }
}

// Get releasable amount for a payee
export async function getReleasableAmount(
  contractAddress: string,
  payeeAddress: string,
  tokenAddress?: string
): Promise<number> {
  try {
    const contract = new ethers.Contract(
      contractAddress,
      REVENUE_SPLITTER_ABI,
      publicClient
    );

    let amount;
    if (tokenAddress) {
      amount = await contract.releasable(tokenAddress, payeeAddress);
      // Assuming USDC (6 decimals)
      return Number(amount) / Math.pow(10, 6);
    } else {
      amount = await contract.releasable(payeeAddress);
      return Number(formatEther(amount));
    }
  } catch (error) {
    console.error('Error getting releasable amount:', error);
    return 0;
  }
}

// Send USDC to a revenue splitter contract
export async function sendUSDCToContract(
  contractAddress: string,
  amount: number,
  signer: any
): Promise<string> {
  if (!signer) {
    throw new Error('Wallet not connected');
  }

  try {
    const usdcContract = new ethers.Contract(
      USDC_ADDRESS,
      USDC_ABI,
      signer
    );

    // Convert amount to USDC units (6 decimals)
    const amountInUnits = Math.floor(amount * Math.pow(10, 6));
    
    const tx = await usdcContract.transfer(contractAddress, amountInUnits);
    await tx.wait();
    
    return tx.hash;
  } catch (error) {
    console.error('Error sending USDC to contract:', error);
    throw error;
  }
}

// Monitor contract events
export async function getContractEvents(
  contractAddress: string,
  fromBlock: number = 0
): Promise<any[]> {
  try {
    const logs = await publicClient.getLogs({
      address: contractAddress as `0x${string}`,
      fromBlock: BigInt(fromBlock),
      toBlock: 'latest',
    });

    return logs;
  } catch (error) {
    console.error('Error fetching contract events:', error);
    return [];
  }
}

// Validate contract address
export async function isValidContract(address: string): Promise<boolean> {
  try {
    const code = await publicClient.getBytecode({
      address: address as `0x${string}`,
    });
    
    return code !== undefined && code !== '0x';
  } catch (error) {
    console.error('Error validating contract:', error);
    return false;
  }
}

// Get current gas price
export async function getCurrentGasPrice(): Promise<string> {
  try {
    const gasPrice = await publicClient.getGasPrice();
    return formatEther(gasPrice);
  } catch (error) {
    console.error('Error fetching gas price:', error);
    return '0';
  }
}

// Estimate gas for a transaction
export async function estimateGas(
  to: string,
  data: string,
  value: string = '0'
): Promise<number> {
  try {
    const gas = await publicClient.estimateGas({
      to: to as `0x${string}`,
      data: data as `0x${string}`,
      value: parseEther(value),
    });
    
    return Number(gas);
  } catch (error) {
    console.error('Error estimating gas:', error);
    return 21000; // Default gas limit
  }
}

// Format blockchain error messages
export function formatBlockchainError(error: any): string {
  if (error?.reason) {
    return error.reason;
  }
  
  if (error?.message) {
    if (error.message.includes('user rejected')) {
      return 'Transaction was rejected by user';
    }
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient funds for transaction';
    }
    if (error.message.includes('gas')) {
      return 'Transaction failed due to gas issues';
    }
    return error.message;
  }
  
  return 'Unknown blockchain error occurred';
}
