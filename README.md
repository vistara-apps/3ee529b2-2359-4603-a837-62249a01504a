# CreatorChain - X402 Payment Integration

A collaborative revenue sharing platform for creators with integrated X402 payment flow on Base network.

## Features

- 🎨 **Project Management**: Create and manage collaborative creative projects
- 💰 **Revenue Distribution**: Automatically distribute revenue to contributors based on their share percentages
- 🔗 **X402 Integration**: Secure on-chain payments using X402 protocol
- 💳 **Multi-Token Support**: Support for ETH and USDC payments on Base
- ✅ **Payment Verification**: Automatic transaction verification and confirmation
- 📊 **Payment History**: Track all payments and distributions
- 🔐 **Wallet Integration**: Connect with Coinbase Wallet and other Web3 wallets

## X402 Payment Flow Implementation

This implementation includes:

### ✅ Completed Tasks

- [x] **X402-Axios Integration**: Installed and configured x402-axios package
- [x] **Wagmi useWalletClient**: Integrated with wagmi for wallet interactions
- [x] **USDC on Base**: Full support for USDC payments on Base network
- [x] **Transaction Confirmations**: Wait for 2 confirmations for security
- [x] **Error Handling**: Comprehensive error handling for payment failures

### Key Components

1. **useX402Payment Hook** (`lib/hooks/useX402Payment.ts`)
   - Handles payment processing with X402 protocol
   - Supports both ETH and USDC transactions
   - Includes gas estimation and payment verification
   - Comprehensive error handling

2. **X402PaymentModal** (`components/X402PaymentModal.tsx`)
   - User-friendly payment interface
   - Real-time gas estimation
   - Transaction status tracking
   - Payment verification display

3. **X402TestComponent** (`components/X402TestComponent.tsx`)
   - End-to-end testing interface
   - Test ETH and USDC payments
   - Gas estimation testing
   - Payment verification testing

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Copy `.env.example` to `.env.local` and configure:
   ```bash
   cp .env.example .env.local
   ```

   Required environment variables:
   - `NEXT_PUBLIC_ONCHAINKIT_API_KEY`: Your OnChainKit API key
   - `NEXT_PUBLIC_X402_API_KEY`: Your X402 API key
   - `NEXT_PUBLIC_X402_API_URL`: X402 API endpoint (defaults to https://api.x402.com)

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## X402 Payment Flow

### Payment Process

1. **Initialize Payment**: User selects amount, token (ETH/USDC), and recipient
2. **Gas Estimation**: Automatically estimate transaction gas costs
3. **X402 Session**: Create payment session with X402 protocol
4. **Execute Transaction**: Send transaction via wagmi wallet client
5. **Wait for Confirmation**: Wait for 2 block confirmations
6. **Verify Payment**: Verify payment status through X402
7. **Update State**: Update application state with payment results

### Supported Tokens

- **ETH**: Native Ethereum on Base network
- **USDC**: USD Coin on Base network (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)

### Error Handling

The implementation includes comprehensive error handling for:
- Wallet connection issues
- Insufficient funds
- Network errors
- Transaction failures
- Verification failures

## Testing

### Manual Testing

1. Connect your wallet to the application
2. Navigate to the X402 Test Component (visible on dashboard)
3. Run individual tests:
   - ETH Payment Test
   - USDC Payment Test
   - Gas Estimation Test

### Test Results

Each test provides:
- Success/failure status
- Transaction hash (if successful)
- Error messages (if failed)
- Payment verification status
- Links to BaseScan for transaction details

## Revenue Distribution

The platform automatically distributes revenue to project contributors using X402:

1. **Create Project**: Set up project with contributors and their share percentages
2. **Add Revenue**: Input revenue amount to distribute
3. **Automatic Distribution**: System calculates individual payouts (minus 2% platform fee)
4. **X402 Payments**: Each contributor receives payment via X402 protocol
5. **Verification**: All payments are verified and tracked

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   X402 Protocol  │    │   Base Network  │
│   (Next.js)     │◄──►│   Integration    │◄──►│   (ETH/USDC)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Wagmi Client  │    │   Payment        │    │   Transaction   │
│   (Wallet)      │    │   Verification   │    │   Confirmation  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Security Features

- **2-Block Confirmations**: Wait for transaction confirmations before marking as complete
- **Payment Verification**: Verify all payments through X402 protocol
- **Error Recovery**: Graceful handling of failed payments
- **Gas Estimation**: Prevent failed transactions due to insufficient gas
- **Wallet Validation**: Validate wallet addresses before processing payments

## Development

### Key Files

- `lib/hooks/useX402Payment.ts`: Core X402 payment logic
- `components/X402PaymentModal.tsx`: Payment interface
- `components/X402TestComponent.tsx`: Testing interface
- `lib/constants.ts`: Token configurations and constants
- `app/page.tsx`: Main application with integrated payment flow

### Adding New Tokens

To add support for new tokens:

1. Update `SUPPORTED_TOKENS` in `lib/constants.ts`
2. Add token configuration with address and decimals
3. Update type definitions in `lib/hooks/useX402Payment.ts`

## Deployment

The application is configured for deployment on Base mainnet. Ensure all environment variables are properly set in your deployment environment.

## Support

For issues related to:
- X402 integration: Check X402 documentation
- Base network: Check Base network status
- Wallet connections: Ensure wallet is connected to Base network
- Token transfers: Verify sufficient balance and token approvals
