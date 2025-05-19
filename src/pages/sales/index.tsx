import React, { FC, useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import { useRouter } from 'next/router';
import { useContract } from '@/context/ContractContext';
import Image from 'next/image';
import { getTokenName } from '@/context/ContractContext';
import { useForm } from 'react-hook-form';

interface Bid {
  bidder: string;
  amount: string;
  token: string;
  isActive: boolean;
}

interface SaleWithDetails {
  saleId: number;
  gemId: number;
  endTime: number;
  state: number; // 0 = Active, 1 = Ended, 2 = Cancelled
  winningBidder: string;
  selectedUtility: number;
  gem?: {
    name: string;
    image: string;
    estimatedValueInUsd: string;
  };
  highestBid?: {
    amount: string;
    token: string;
    bidder: string;
  };
  totalBids: number;
}

interface CreateSaleForm {
  gemId: string;
  durationInDays: string;
}

const SalesPage: FC = () => {
  const router = useRouter();
  const { activeSales, gems, saleBids, loading, error, contract } = useContract();
  const [activeTab, setActiveTab] = useState<'active' | 'previous'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateSaleForm>();

  const sales: SaleWithDetails[] = useMemo(() => {
    if (!activeSales || !gems || !saleBids) return [];

    return activeSales.map(sale => {
      const gem = gems[sale.gemId];
      const bids = saleBids[sale.saleId] || [];
      const activeBids = bids.filter(bid => bid.isActive);
      
      // Find highest bid
      const highestBid = activeBids.reduce<Bid | null>((highest, current) => {
        if (!highest || parseFloat(current.amount) > parseFloat(highest.amount)) {
          return current;
        }
        return highest;
      }, null);

      return {
        ...sale,
        gem: gem ? {
          name: gem.metadata.name,
          image: gem.metadata.image,
          estimatedValueInUsd: gem.metadata.estimatedValueInUsd
        } : undefined,
        highestBid: highestBid ? {
          amount: highestBid.amount,
          token: highestBid.token,
          bidder: highestBid.bidder
        } : undefined,
        totalBids: bids.length
      };
    });
  }, [activeSales, gems, saleBids]);

  const filteredSales = useMemo(() => {
    const filtered = sales.filter(sale => {
      const isActive = sale.state === 0 && sale.endTime * 1000 > Date.now();
      return activeTab === 'active' ? isActive : !isActive;
    });

    if (!searchTerm) return filtered;

    return filtered.filter(sale => 
      sale.gem?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.saleId.toString().includes(searchTerm)
    );
  }, [sales, activeTab, searchTerm]);

  const formatTimeLeft = (endTime: number): string => {
    const now = Date.now();
    const timeLeft = endTime * 1000 - now;
    
    if (timeLeft <= 0) return 'Ended';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const getStatusBadge = (sale: SaleWithDetails) => {
    const isActive = sale.state === 0 && sale.endTime * 1000 > Date.now();
    
    if (sale.state === 2) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Cancelled
        </span>
      );
    }
    
    if (!isActive) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Completed
        </span>
      );
    }
    
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    );
  };

  const onCreateSale = async (data: CreateSaleForm) => {
    if (!contract) return;

    try {
      setIsSubmitting(true);
      setCreateError(null);

      const gemId = parseInt(data.gemId);
      const durationInDays = parseInt(data.durationInDays);
      const durationInSeconds = durationInDays * 24 * 60 * 60;

      const tx = await contract.createSale(gemId, durationInSeconds);
      await tx.wait();

      setIsCreateModalOpen(false);
      reset();
      // The sales list will update automatically through the contract events
    } catch (err) {
      console.error('Failed to create sale:', err);
      setCreateError(err instanceof Error ? err.message : 'Failed to create sale');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-red-600">Error: {error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
            <p className="mt-2 text-gray-600">Manage and monitor all gem sales</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Sale
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between p-6">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'active'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Active Sales
                </button>
                <button
                  onClick={() => setActiveTab('previous')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'previous'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Previous Sales
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or sale ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <svg
                  className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredSales.map((sale) => (
              <div
                key={sale.saleId}
                className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="relative h-48 rounded-t-lg overflow-hidden bg-gray-100">
                  {sale.gem?.image ? (
                    <Image
                      src={sale.gem.image}
                      alt={sale.gem.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {getStatusBadge(sale)}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {sale.gem?.name || `Gem #${sale.gemId}`}
                      </h3>
                      <p className="text-sm text-gray-500">Sale #{sale.saleId}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Estimated Value:</span>
                      <span className="text-gray-900">${sale.gem?.estimatedValueInUsd || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Highest Bid:</span>
                      <span className="text-gray-900">
                        {sale.highestBid 
                          ? `${sale.highestBid.amount} ${getTokenName(sale.highestBid.token)}`
                          : 'No bids yet'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Bids:</span>
                      <span className="text-gray-900">{sale.totalBids}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Time Left:</span>
                      <span className="text-gray-900">{formatTimeLeft(sale.endTime)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSales.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No sales found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeTab === 'active'
                  ? 'There are no active sales at the moment.'
                  : 'No previous sales found.'}
              </p>
            </div>
          )}
        </div>

        {/* Create Sale Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Create New Sale</h2>
                <button
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setCreateError(null);
                    reset();
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit(onCreateSale)} className="p-6">
                {createError && (
                  <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{createError}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gem ID
                    </label>
                    <input
                      type="number"
                      {...register('gemId', { 
                        required: 'Gem ID is required',
                        min: { value: 101, message: 'Gem ID must be 101 or greater' }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter gem ID (e.g., 101)"
                    />
                    {errors.gemId && (
                      <p className="mt-1 text-sm text-red-600">{errors.gemId.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (Days)
                    </label>
                    <input
                      type="number"
                      {...register('durationInDays', { 
                        required: 'Duration is required',
                        min: { value: 1, message: 'Duration must be at least 1 day' },
                        max: { value: 30, message: 'Duration cannot exceed 30 days' }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter duration in days (1-30)"
                    />
                    {errors.durationInDays && (
                      <p className="mt-1 text-sm text-red-600">{errors.durationInDays.message}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setCreateError(null);
                      reset();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      'Create Sale'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SalesPage; 