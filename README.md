# CreatorChain - Transparent Revenue Sharing

A production-ready Next.js Base Mini App for transparent revenue sharing among collaborative creators within the Farcaster ecosystem.

## 🚀 Features

### Core Functionality
- **Automated Split Tracking & Payouts**: Define revenue splits among collaborators with automated, trustless execution via smart contracts
- **Project-Based Revenue Pools**: Create isolated revenue streams for specific collaborative projects
- **Contributor Onboarding & Agreements**: Streamlined process to invite collaborators and set revenue share percentages
- **Real-time Payout Auditing**: Immutable and transparent ledger of all transactions via Base Scan/Etherscan

### Technical Features
- **Farcaster Integration**: Native authentication and user management via Privy
- **Base Network**: Built on Base for fast, low-cost transactions
- **Zora Integration**: Automatic detection of NFT sales and royalties
- **Smart Contract Automation**: Trustless revenue distribution
- **Real-time Updates**: Live transaction monitoring and notifications

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Authentication**: Privy (Wallet + Farcaster)
- **Database**: Supabase
- **Blockchain**: Base Network, Viem, Ethers.js
- **APIs**: Zora GraphQL, Base RPC, Etherscan
- **UI Components**: Radix UI, Lucide Icons
- **Styling**: Tailwind CSS with custom design system

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Privy account and app ID
- Supabase project
- Base network access
- (Optional) Etherscan API key for enhanced transaction details

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd creatorchain
npm install
```

### 2. Environment Setup

Copy the example environment file and configure:

```bash
cp .env.example .env.local
```

Configure the following required variables:

```env
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Base Network Configuration
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Contract Addresses
NEXT_PUBLIC_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
```

### 3. Database Setup

Run the Supabase migrations to set up your database schema:

```sql
-- Create projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name TEXT NOT NULL,
  creator_wallet_address TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  total_revenue DECIMAL(18,6) DEFAULT 0,
  total_distributed DECIMAL(18,6) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contributors table
CREATE TABLE contributors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  share_percentage DECIMAL(5,2) NOT NULL CHECK (share_percentage > 0 AND share_percentage <= 100),
  role TEXT NOT NULL,
  farcaster_username TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  onboarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create revenue_pools table
CREATE TABLE revenue_pools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('zora', 'direct', 'other')),
  total_amount DECIMAL(18,6) NOT NULL,
  distributed_amount DECIMAL(18,6) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'distributing', 'completed', 'failed')),
  transaction_hash TEXT,
  source_metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payouts table
CREATE TABLE payouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pool_id UUID REFERENCES revenue_pools(id) ON DELETE CASCADE,
  contributor_id UUID REFERENCES contributors(id) ON DELETE CASCADE,
  amount DECIMAL(18,6) NOT NULL,
  transaction_hash TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  gas_used INTEGER,
  gas_price TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  farcaster_username TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_projects_creator ON projects(creator_wallet_address);
CREATE INDEX idx_contributors_project ON contributors(project_id);
CREATE INDEX idx_contributors_wallet ON contributors(wallet_address);
CREATE INDEX idx_revenue_pools_project ON revenue_pools(project_id);
CREATE INDEX idx_payouts_pool ON payouts(pool_id);
CREATE INDEX idx_payouts_contributor ON payouts(contributor_id);
CREATE INDEX idx_user_profiles_wallet ON user_profiles(wallet_address);
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🏗 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout with Privy provider
│   └── page.tsx           # Homepage with login/dashboard
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── supabase.ts      # Database operations
│   ├── blockchain.ts    # Blockchain interactions
│   ├── zora.ts          # Zora API integration
│   └── utils.ts         # Helper functions
├── types/               # TypeScript type definitions
└── contracts/           # Smart contract ABIs
```

## 🎨 Design System

The app uses a comprehensive design system with:

### Colors
- **Primary**: `hsl(210, 90%, 45%)` - Main brand color
- **Secondary**: `hsl(170, 70%, 50%)` - Accent color
- **Accent**: `hsl(40, 95%, 55%)` - Highlight color
- **Background**: `hsl(220, 20%, 98%)` - Main background
- **Surface**: `hsl(220, 20%, 100%)` - Card backgrounds

### Typography
- **Display**: 2rem, bold - Page titles
- **Heading**: 1.25rem, semibold - Section headers
- **Body**: 1rem, normal - Main content
- **Caption**: 0.875rem, medium - Secondary text

### Components
- **FrameContainer**: Main layout wrapper
- **ProjectCard**: Project display with stats
- **ContributorRow**: Contributor information
- **Button**: Multiple variants (primary, secondary, outline, etc.)
- **Card**: Content containers with header/footer

## 🔗 API Integration

### Privy Authentication
- Wallet connection (MetaMask, WalletConnect, etc.)
- Farcaster account linking
- Embedded wallet creation
- Session management

### Supabase Database
- Real-time subscriptions
- Type-safe queries
- Row-level security
- Automatic migrations

### Base Network
- Smart contract interactions
- Transaction monitoring
- Gas estimation
- Event listening

### Zora API
- NFT sales tracking
- Collection monitoring
- Royalty calculations
- Real-time notifications

## 🔐 Security Features

- **Wallet Authentication**: Secure wallet-based login
- **Smart Contract Auditing**: All transactions on-chain
- **Input Validation**: Comprehensive form validation
- **Error Handling**: Graceful error management
- **Rate Limiting**: API request throttling
- **HTTPS Only**: Secure communication

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables for Production

Ensure all environment variables are configured in your production environment:

- `NEXT_PUBLIC_PRIVY_APP_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_BASE_RPC_URL`
- `NEXT_PUBLIC_ETHERSCAN_API_KEY`
- `NEXT_PUBLIC_USDC_ADDRESS`

## 📊 Usage Examples

### Creating a Project

```typescript
const project = await createProject({
  projectName: "My NFT Collection",
  description: "Collaborative art project",
  contributors: [
    {
      walletAddress: "0x...",
      sharePercentage: 50,
      role: "Artist",
      farcasterUsername: "artist"
    },
    {
      walletAddress: "0x...",
      sharePercentage: 30,
      role: "Developer",
      farcasterUsername: "dev"
    }
  ]
});
```

### Monitoring Zora Sales

```typescript
const monitor = new ZoraSalesMonitor(
  "0x...", // collection address
  (sale) => {
    console.log("New sale detected:", sale);
    // Trigger revenue distribution
  }
);

monitor.start();
```

### Distributing Revenue

```typescript
const txHash = await releasePayment(
  contractAddress,
  payeeAddress,
  usdcAddress,
  signer
);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Community**: Join our Discord for discussions

## 🔮 Roadmap

- [ ] Multi-token support (ETH, other ERC-20s)
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Integration with more NFT platforms
- [ ] DAO governance features
- [ ] Advanced smart contract templates

---

Built with ❤️ for the creator economy on Base.
