import { createAppKit } from '@reown/appkit/react'
import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5'
import { mainnet, arbitrum } from '@reown/appkit/networks'

// Project ID from Reown Cloud
const projectId = 'ede44b376fb0caa28f89eca27f9f1220'

// Metadata configuration
const metadata = {
  name: 'Sapphire Swap',
  description: 'Sapphire Gem NFT Marketplace',
  url: 'https://sapphireswap.com',
  icons: ['https://assets.reown.com/reown-profile-pic.png']
}

// Create AppKit instance
createAppKit({
  adapters: [new Ethers5Adapter()],
  metadata,
  networks: [mainnet, arbitrum],
  projectId,
  features: {
    analytics: true
  }
})

interface AppKitProps {
  children: React.ReactNode;
}

export function AppKit({ children }: AppKitProps) {
  return <>{children}</>
} 