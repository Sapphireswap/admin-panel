'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { ethers, BigNumber } from 'ethers'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import contractABI from '../../contracts/contractABI.json'

const CONTRACT_ADDRESS = '0x7e60363e3f11Ea80016fbeFe59ae5b7DE8c26b7b'
const ETH_ADDRESS = '0x0000000000000000000000000000000000000000'
const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
const SFT_ADDRESS = '0x196D3B04be42371a5E924C39A14ae0dB8882FD46' // SFT token address from contract

const SALE_ID_OFFSET = 10000 // Sale IDs start from 10001
const GEM_ID_OFFSET = 100 // Gem IDs start from 101

// Token decimal configurations
const TOKEN_DECIMALS = {
  ETH: 18,
  USDT: 6,
  SFT: 9
}

// Add ERC20 ABI for token interactions
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) public returns (bool)',
  'function allowance(address owner, address spender) public view returns (uint256)'
];

// Helper function to get token decimals
export const getTokenDecimals = (token: string | null): number => {
  if (!token) return 18 // Default to ETH decimals
  const normalizedAddress = token.toLowerCase()
  if (normalizedAddress === ETH_ADDRESS.toLowerCase()) return TOKEN_DECIMALS.ETH
  if (normalizedAddress === USDT_ADDRESS.toLowerCase()) return TOKEN_DECIMALS.USDT
  if (normalizedAddress === SFT_ADDRESS.toLowerCase()) return TOKEN_DECIMALS.SFT
  console.log('Unknown token address for decimals:', token) // For debugging
  return 18 // Default to ETH decimals for unknown tokens
}

// Helper function to get token name from address
export const getTokenName = (tokenAddress: string): string => {
  const normalizedAddress = tokenAddress.toLowerCase()
  if (normalizedAddress === ETH_ADDRESS.toLowerCase()) return 'ETH'
  if (normalizedAddress === USDT_ADDRESS.toLowerCase()) return 'USDT'
  if (normalizedAddress === SFT_ADDRESS.toLowerCase()) return 'SFT'
  console.log('Unknown token address:', tokenAddress) // For debugging
  return 'Unknown' // Instead of defaulting to ETH, show Unknown for unrecognized tokens
}

// Helper function to format numbers safely with correct decimals
const formatBigNumber = (value: BigNumber | string, tokenAddress: string | null = null): string => {
  try {
    const decimals = getTokenDecimals(tokenAddress)
    if (typeof value === 'string') {
      // If it's already a string, try to parse it with correct decimals
      return ethers.utils.formatUnits(ethers.utils.parseUnits(value, decimals), decimals)
    }
    // If it's a BigNumber, format it with correct decimals
    return ethers.utils.formatUnits(value, decimals)
  } catch (error) {
    console.error('Error formatting number:', error)
    return '0'
  }
}

// Helper function to parse numbers safely for contract interactions
const parseAmount = (amount: string, token: string): BigNumber => {
  try {
    // Remove any trailing zeros after decimal point
    const trimmedAmount = amount.replace(/\.?0+$/, '')
    const tokenAddress = token === 'ETH' ? ETH_ADDRESS : 
                        token === 'USDT' ? USDT_ADDRESS : 
                        SFT_ADDRESS
    const decimals = getTokenDecimals(tokenAddress)
    return ethers.utils.parseUnits(trimmedAmount, decimals)
  } catch (error) {
    console.error('Error parsing amount:', error)
    return BigNumber.from(0)
  }
}

interface Gem {
  gemId: number
  metadata: {
    name: string
    description: string
    image: string // This will be a URL
    carat: string
    color: string
    clarity: string
    cut: string
    origin: string
    certification: string
    estimatedValueInUsd: string // Changed to string to handle large numbers
  }
  isActive: boolean
}

interface Sale {
  saleId: number
  gemId: number
  endTime: number
  state: number // 0 = Active, 1 = Ended, 2 = Cancelled
  winningBidder: string
  selectedUtility: number
}

interface Bid {
  bidder: string
  token: string
  amount: string
  timestamp: number
  isActive: boolean
}

interface GemMetadata {
  name: string
  description: string
  image: string
  carat: string
  color: string
  clarity: string
  cut: string
  origin: string
  certification: string
  estimatedValueInUsd: string
}

interface ContractContextType {
  activeSales: Sale[]
  gems: { [key: number]: Gem }
  saleBids: { [key: number]: Bid[] }
  createBid: (saleId: number, token: string, amount: string) => Promise<void>
  modifyBid: (saleId: number, token: string, newAmount: string, bidIndex: number) => Promise<void>
  revokeBid: (saleId: number, bidIndex: number) => Promise<void>
  createGem: (metadata: GemMetadata) => Promise<void>
  loading: boolean
  error: string | null
  userAddress: string | null
  contract: ethers.Contract | null
}

const ContractContext = createContext<ContractContextType | null>(null)

export function ContractProvider({ children }: { children: React.ReactNode }) {
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [activeSales, setActiveSales] = useState<Sale[]>([])
  const [gems, setGems] = useState<{ [key: number]: Gem }>({})
  const [saleBids, setSaleBids] = useState<{ [key: number]: Bid[] }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userAddress, setUserAddress] = useState<string | null>(null)

  const parseSaleData = (sale: any, saleId: number): Sale => {
    return {
      saleId,
      gemId: sale.gemId.toNumber(),
      endTime: sale.saleEndTime.toNumber(),
      state: sale.state,
      winningBidder: sale.winningBidder,
      selectedUtility: sale.selectedUtility
    }
  }

  const parseGemData = (gem: any, gemId: number): Gem => {
    return {
      gemId,
      metadata: {
        name: gem.metadata.name,
        description: gem.metadata.description,
        image: gem.metadata.image.startsWith('ipfs://') 
          ? `https://ipfs.io/ipfs/${gem.metadata.image.slice(7)}`
          : gem.metadata.image,
        carat: gem.metadata.carat,
        color: gem.metadata.color,
        clarity: gem.metadata.clarity,
        cut: gem.metadata.cut,
        origin: gem.metadata.origin,
        certification: gem.metadata.certification,
        estimatedValueInUsd: formatBigNumber(gem.metadata.estimatedValueInUsd, USDT_ADDRESS) // Assuming value is in USDT
      },
      isActive: gem.isActive
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        console.log('Initializing contract...')
        if (typeof window === 'undefined' || !window.ethereum) {
          throw new Error('Please install MetaMask')
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum as any)
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        const address = await signer.getAddress()
        setUserAddress(address)
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI as ethers.ContractInterface, signer)
        setContract(contract)

        try {
          await contract.deployed()
          console.log('Contract deployed successfully')

          // Get total number of sales
          const saleCounter = await contract.saleCounter()
          const totalSales = saleCounter.toNumber() - SALE_ID_OFFSET
          console.log('Total sales:', totalSales)
          
          if (totalSales <= 0) {
            console.log('No sales found')
            setLoading(false)
            return
          }

          // Fetch all sales
          const salesPromises = []
          for (let i = 1; i <= totalSales; i++) {
            const actualSaleId = i + SALE_ID_OFFSET
            salesPromises.push(
              contract.sales(actualSaleId)
                .then((sale: any) => parseSaleData(sale, actualSaleId))
                .catch((error: any) => {
                  console.error(`Error fetching sale ${actualSaleId}:`, error)
                  return null
                })
            )
          }
          
          console.log('Fetching sales...')
          const allSales = await Promise.all(salesPromises)
          console.log('All sales:', allSales)
          
          const activeSales = allSales
            .filter((sale): sale is Sale => 
              sale !== null && 
              sale.state === 0 && // Active state
              sale.endTime * 1000 > Date.now() // Not expired
            )

          console.log('Active sales:', activeSales)
          setActiveSales(activeSales)

          // Fetch gems for active sales
          if (activeSales.length > 0) {
            console.log('Fetching gems...')
            const gemPromises = activeSales.map(async (sale: Sale) => {
              try {
                const gem = await contract.gems(sale.gemId)
                return {
                  id: sale.gemId,
                  gem: parseGemData(gem, sale.gemId)
                }
              } catch (error) {
                console.error(`Error fetching gem ${sale.gemId}:`, error)
                return null
              }
            })

            const gemsData = (await Promise.all(gemPromises)).filter(data => data !== null)
            console.log('Gems data:', gemsData)
            
            const gemsMap = gemsData.reduce((acc, data) => {
              if (data && data.gem) {
                acc[data.id] = data.gem
              }
              return acc
            }, {} as { [key: number]: Gem })
            
            setGems(gemsMap)
            console.log('Gems map:', gemsMap)

            // Fetch bids
            console.log('Fetching bids...')
            const bidPromises = activeSales.map(async (sale: Sale) => {
              try {
                const bids = await contract.getSaleBids(sale.saleId)
                console.log('Raw bids for sale', sale.saleId, ':', bids)
                return {
                  id: sale.saleId,
                  bids: bids.map((bid: any) => {
                    console.log('Processing bid:', bid)
                    return {
                      bidder: bid.bidder,
                      token: bid.paymentToken,
                      amount: formatBigNumber(bid.amount, bid.paymentToken),
                      timestamp: Date.now(),
                      isActive: bid.isActive
                    }
                  })
                }
              } catch (error) {
                console.error(`Error fetching bids for sale ${sale.saleId}:`, error)
                return { id: sale.saleId, bids: [] }
              }
            })

            const bidsData = await Promise.all(bidPromises)
            const bidsMap = bidsData.reduce((acc, { id, bids }) => {
              acc[id] = bids
              return acc
            }, {} as { [key: number]: Bid[] })
            
            setSaleBids(bidsMap)
            console.log('Bids map:', bidsMap)
          }

          setLoading(false)
        } catch (error) {
          console.error('Contract error:', error)
          setError('Contract not deployed or inaccessible')
          setLoading(false)
        }
      } catch (error) {
        console.error('Initialization error:', error)
        setError(error instanceof Error ? error.message : 'Failed to initialize contract')
        setLoading(false)
      }
    }

    init()
  }, [])

  const checkAndApproveToken = async (tokenAddress: string, amount: BigNumber): Promise<boolean> => {
    try {
      if (tokenAddress === ETH_ADDRESS) return true; // ETH doesn't need approval

      const provider = new ethers.providers.Web3Provider(window.ethereum as any)
      const signer = provider.getSigner()
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer)
      
      // Get current allowance
      const signerAddress = await signer.getAddress()
      const currentAllowance = await tokenContract.allowance(signerAddress, CONTRACT_ADDRESS)

      // If allowance is insufficient, request approval
      if (currentAllowance.lt(amount)) {
        console.log('Requesting token approval...')
        const approveTx = await tokenContract.approve(CONTRACT_ADDRESS, amount)
        await approveTx.wait()
        console.log('Token approval confirmed')
      }

      return true
    } catch (error) {
      console.error('Error in token approval:', error)
      throw new Error('Failed to approve token spending')
    }
  }

  const createBid = async (saleId: number, token: string, amount: string) => {
    if (!contract) return

    try {
      const tokenAddress = token === 'ETH' ? ETH_ADDRESS : 
                          token === 'USDT' ? USDT_ADDRESS : 
                          SFT_ADDRESS

      const parsedAmount = parseAmount(amount, token)
      const value = token === 'ETH' ? parsedAmount : BigNumber.from(0)

      // Check and handle token approval if needed
      if (token !== 'ETH') {
        await checkAndApproveToken(tokenAddress, parsedAmount)
      }

      console.log('Creating bid with:', {
        saleId,
        tokenAddress,
        parsedAmount: parsedAmount.toString(),
        value: value.toString()
      })

      const tx = await contract.createBid(saleId, tokenAddress, parsedAmount, {
        value
      })
      await tx.wait()

      // Refresh bids for this sale
      const bids = await contract.getSaleBids(saleId)
      const formattedBids = bids.map((bid: any) => ({
        bidder: bid.bidder,
        token: bid.paymentToken,
        amount: formatBigNumber(bid.amount, bid.paymentToken),
        timestamp: Date.now()
      }))
      setSaleBids(prev => ({ ...prev, [saleId]: formattedBids }))
    } catch (err) {
      console.error('Failed to create bid:', err)
      throw new Error(err instanceof Error ? err.message : 'Failed to create bid')
    }
  }

  const modifyBid = async (saleId: number, token: string, newAmount: string, bidIndex: number) => {
    if (!contract) return

    try {
      const tokenAddress = token === 'ETH' ? ETH_ADDRESS : 
                          token === 'USDT' ? USDT_ADDRESS : 
                          SFT_ADDRESS

      const parsedAmount = parseAmount(newAmount, token)
      const value = token === 'ETH' ? parsedAmount : BigNumber.from(0)

      // Check and handle token approval if needed
      if (token !== 'ETH') {
        await checkAndApproveToken(tokenAddress, parsedAmount)
      }

      console.log('Modifying bid with:', {
        saleId,
        bidIndex,
        tokenAddress,
        parsedAmount: parsedAmount.toString(),
        value: value.toString()
      })

      const tx = await contract.modifyBid(saleId, bidIndex, parsedAmount, {
        value
      })
      await tx.wait()

      // Refresh bids for this sale
      const bids = await contract.getSaleBids(saleId)
      const formattedBids = bids.map((bid: any) => ({
        bidder: bid.bidder,
        token: bid.paymentToken,
        amount: formatBigNumber(bid.amount, bid.paymentToken),
        timestamp: Date.now()
      }))
      setSaleBids(prev => ({ ...prev, [saleId]: formattedBids }))
    } catch (err) {
      console.error('Failed to modify bid:', err)
      throw new Error(err instanceof Error ? err.message : 'Failed to modify bid')
    }
  }

  const revokeBid = async (saleId: number, bidIndex: number) => {
    if (!contract) return

    try {
      console.log('Revoking bid for sale:', saleId, 'at index:', bidIndex)
      const tx = await contract.revokeBid(saleId, bidIndex)
      await tx.wait()

      // Refresh bids for this sale
      const bids = await contract.getSaleBids(saleId)
      const formattedBids = bids.map((bid: any) => ({
        bidder: bid.bidder,
        token: bid.paymentToken,
        amount: formatBigNumber(bid.amount, bid.paymentToken),
        timestamp: Date.now()
      }))
      setSaleBids(prev => ({ ...prev, [saleId]: formattedBids }))
    } catch (err) {
      console.error('Failed to revoke bid:', err)
      throw new Error(err instanceof Error ? err.message : 'Failed to revoke bid')
    }
  }

  const createGem = async (metadata: GemMetadata) => {
    if (!contract) return;

    try {
      const tx = await contract.createGem(metadata);
      await tx.wait();
      // Refresh gems after creation
      const gemCounter = await contract.gemCounter();
      const newGemId = gemCounter.toNumber();
      const newGem = await contract.gems(newGemId);
      setGems(prev => ({
        ...prev,
        [newGemId]: parseGemData(newGem, newGemId)
      }));
    } catch (err) {
      console.error('Failed to create gem:', err);
      throw new Error(err instanceof Error ? err.message : 'Failed to create gem');
    }
  };

  return (
    <ContractContext.Provider value={{
      activeSales,
      gems,
      saleBids,
      createBid,
      modifyBid,
      revokeBid,
      createGem,
      loading,
      error,
      userAddress,
      contract
    }}>
      {children}
    </ContractContext.Provider>
  )
}

export function useContract() {
  const context = useContext(ContractContext)
  if (!context) {
    throw new Error('useContract must be used within a ContractProvider')
  }
  return context
} 