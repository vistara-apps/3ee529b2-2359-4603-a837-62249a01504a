import type { ZoraNFTSale } from '@/types';

const ZORA_API_URL = process.env.NEXT_PUBLIC_ZORA_API_URL || 'https://api.zora.co/graphql';

// GraphQL queries for Zora API
const GET_NFT_SALES_QUERY = `
  query GetNFTSales($collectionAddress: String!, $limit: Int!, $offset: Int!) {
    sales(
      where: {
        collectionAddress: $collectionAddress
      }
      limit: $limit
      offset: $offset
      orderBy: { timestamp: DESC }
    ) {
      id
      tokenId
      salePrice
      currency
      buyer
      seller
      timestamp
      transactionHash
      collection {
        address
        name
      }
    }
  }
`;

const GET_COLLECTION_INFO_QUERY = `
  query GetCollectionInfo($address: String!) {
    collection(address: $address) {
      address
      name
      description
      totalSupply
      creator
      royaltyBPS
      sales {
        totalCount
        totalVolume
      }
    }
  }
`;

const GET_TOKEN_SALES_QUERY = `
  query GetTokenSales($collectionAddress: String!, $tokenId: String!) {
    sales(
      where: {
        collectionAddress: $collectionAddress
        tokenId: $tokenId
      }
      orderBy: { timestamp: DESC }
    ) {
      id
      tokenId
      salePrice
      currency
      buyer
      seller
      timestamp
      transactionHash
    }
  }
`;

// Helper function to make GraphQL requests to Zora API
async function zoraGraphQLRequest(query: string, variables: any = {}) {
  try {
    const response = await fetch(ZORA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`Zora API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(`Zora API errors: ${JSON.stringify(data.errors)}`);
    }

    return data.data;
  } catch (error) {
    console.error('Zora API request error:', error);
    throw error;
  }
}

// Get NFT sales for a specific collection
export async function getNFTSales(
  collectionAddress: string,
  limit: number = 50,
  offset: number = 0
): Promise<ZoraNFTSale[]> {
  try {
    const data = await zoraGraphQLRequest(GET_NFT_SALES_QUERY, {
      collectionAddress: collectionAddress.toLowerCase(),
      limit,
      offset,
    });

    return data.sales.map((sale: any) => ({
      id: sale.id,
      collectionAddress: sale.collection.address,
      tokenId: sale.tokenId,
      salePrice: sale.salePrice,
      currency: sale.currency,
      buyer: sale.buyer,
      seller: sale.seller,
      timestamp: sale.timestamp,
      transactionHash: sale.transactionHash,
    }));
  } catch (error) {
    console.error('Error fetching NFT sales from Zora:', error);
    return [];
  }
}

// Get collection information
export async function getCollectionInfo(collectionAddress: string) {
  try {
    const data = await zoraGraphQLRequest(GET_COLLECTION_INFO_QUERY, {
      address: collectionAddress.toLowerCase(),
    });

    return data.collection;
  } catch (error) {
    console.error('Error fetching collection info from Zora:', error);
    return null;
  }
}

// Get sales for a specific token
export async function getTokenSales(
  collectionAddress: string,
  tokenId: string
): Promise<ZoraNFTSale[]> {
  try {
    const data = await zoraGraphQLRequest(GET_TOKEN_SALES_QUERY, {
      collectionAddress: collectionAddress.toLowerCase(),
      tokenId,
    });

    return data.sales.map((sale: any) => ({
      id: sale.id,
      collectionAddress,
      tokenId: sale.tokenId,
      salePrice: sale.salePrice,
      currency: sale.currency,
      buyer: sale.buyer,
      seller: sale.seller,
      timestamp: sale.timestamp,
      transactionHash: sale.transactionHash,
    }));
  } catch (error) {
    console.error('Error fetching token sales from Zora:', error);
    return [];
  }
}

// Monitor new sales for a collection (polling-based)
export class ZoraSalesMonitor {
  private collectionAddress: string;
  private lastCheckedTimestamp: string;
  private pollingInterval: number;
  private intervalId: NodeJS.Timeout | null = null;
  private onNewSale: (sale: ZoraNFTSale) => void;

  constructor(
    collectionAddress: string,
    onNewSale: (sale: ZoraNFTSale) => void,
    pollingInterval: number = 30000 // 30 seconds
  ) {
    this.collectionAddress = collectionAddress;
    this.onNewSale = onNewSale;
    this.pollingInterval = pollingInterval;
    this.lastCheckedTimestamp = new Date().toISOString();
  }

  start() {
    if (this.intervalId) {
      this.stop();
    }

    this.intervalId = setInterval(async () => {
      await this.checkForNewSales();
    }, this.pollingInterval);

    // Check immediately
    this.checkForNewSales();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async checkForNewSales() {
    try {
      const sales = await getNFTSales(this.collectionAddress, 10, 0);
      
      const newSales = sales.filter(
        sale => new Date(sale.timestamp) > new Date(this.lastCheckedTimestamp)
      );

      for (const sale of newSales) {
        this.onNewSale(sale);
      }

      if (sales.length > 0) {
        this.lastCheckedTimestamp = sales[0].timestamp;
      }
    } catch (error) {
      console.error('Error checking for new sales:', error);
    }
  }
}

// Calculate royalties from a sale
export function calculateRoyalties(
  salePrice: string,
  royaltyBPS: number
): number {
  const price = parseFloat(salePrice);
  return (price * royaltyBPS) / 10000; // BPS = basis points (1/100th of a percent)
}

// Format Zora sale data for display
export function formatZoraSale(sale: ZoraNFTSale) {
  return {
    ...sale,
    formattedPrice: `${parseFloat(sale.salePrice).toFixed(4)} ETH`,
    formattedDate: new Date(sale.timestamp).toLocaleDateString(),
    explorerUrl: `https://basescan.org/tx/${sale.transactionHash}`,
  };
}

// Get recent sales volume for a collection
export async function getCollectionVolume(
  collectionAddress: string,
  days: number = 7
): Promise<{ volume: number; salesCount: number }> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const sales = await getNFTSales(collectionAddress, 1000, 0);
    
    const recentSales = sales.filter(
      sale => new Date(sale.timestamp) >= cutoffDate
    );

    const volume = recentSales.reduce(
      (total, sale) => total + parseFloat(sale.salePrice),
      0
    );

    return {
      volume,
      salesCount: recentSales.length,
    };
  } catch (error) {
    console.error('Error calculating collection volume:', error);
    return { volume: 0, salesCount: 0 };
  }
}

// Validate if an address is a valid Zora collection
export async function isValidZoraCollection(address: string): Promise<boolean> {
  try {
    const collection = await getCollectionInfo(address);
    return collection !== null;
  } catch (error) {
    console.error('Error validating Zora collection:', error);
    return false;
  }
}

// Get top selling tokens in a collection
export async function getTopSellingTokens(
  collectionAddress: string,
  limit: number = 10
): Promise<Array<{ tokenId: string; totalVolume: number; salesCount: number }>> {
  try {
    const sales = await getNFTSales(collectionAddress, 1000, 0);
    
    const tokenStats = sales.reduce((acc, sale) => {
      const tokenId = sale.tokenId;
      if (!acc[tokenId]) {
        acc[tokenId] = { totalVolume: 0, salesCount: 0 };
      }
      acc[tokenId].totalVolume += parseFloat(sale.salePrice);
      acc[tokenId].salesCount += 1;
      return acc;
    }, {} as Record<string, { totalVolume: number; salesCount: number }>);

    return Object.entries(tokenStats)
      .map(([tokenId, stats]) => ({ tokenId, ...stats }))
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting top selling tokens:', error);
    return [];
  }
}

// Export utility functions
export const zoraUtils = {
  formatSale: formatZoraSale,
  calculateRoyalties,
  isValidCollection: isValidZoraCollection,
  getVolume: getCollectionVolume,
  getTopTokens: getTopSellingTokens,
};
