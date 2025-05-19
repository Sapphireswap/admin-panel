import { FC, useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import { useContract } from '@/context/ContractContext';
import { getTokenName } from '@/context/ContractContext';
import Image from 'next/image';

interface ContractBid {
  bidder: string;
  amount: string;
  token: string;
  timestamp: number;
  isActive: boolean;
}

interface DisplayBid {
  bidder: string;
  amount: string;
  token: string;
  status: 'Active' | 'Revoked' | 'Cancelled';
}

interface Order {
  saleId: number;
  date: number;
  gem: {
    name: string;
    image: string;
    estimatedValueInUsd: string;
  };
  bids: DisplayBid[];
}

const OrdersPage: FC = () => {
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Revoked'>('All');
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const { activeSales, gems, saleBids, loading, error } = useContract();

  const shortenAddress = (address: string) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const getBidStatus = (bid: ContractBid): DisplayBid['status'] => {
    if (!bid.isActive) return 'Revoked';
    return 'Active';
  };

  const orders: Order[] = useMemo(() => {
    if (!activeSales || !gems || !saleBids) return [];

    return activeSales.map(sale => {
      const gem = gems[sale.gemId];
      const bids = saleBids[sale.saleId] || [];
      
      return {
        saleId: sale.saleId,
        date: sale.endTime * 1000,
        gem: {
          name: gem?.metadata.name || 'Unknown Gem',
          image: gem?.metadata.image || '',
          estimatedValueInUsd: gem?.metadata.estimatedValueInUsd || '0'
        },
        bids: bids.map(bid => ({
          bidder: bid.bidder,
          amount: bid.amount,
          token: bid.token,
          status: getBidStatus(bid)
        }))
      };
    });
  }, [activeSales, gems, saleBids]);

  const getBidStatusClass = (status: DisplayBid['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-50 text-green-700';
      case 'Revoked':
        return 'bg-red-50 text-red-700';
      case 'Cancelled':
        return 'bg-gray-50 text-gray-700';
      default:
        return 'bg-gray-50 text-gray-700';
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

  const totalBidVolume = Object.values(saleBids).reduce((total, bids) => {
    return total + bids.reduce((saleTotal, bid) => saleTotal + parseFloat(bid.amount), 0);
  }, 0);

  const totalOrders = orders.length;
  const totalBids = orders.reduce((total, order) => total + order.bids.length, 0);
  const activeBids = orders.reduce((total, order) => 
    total + order.bids.filter(bid => bid.status === 'Active').length, 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 17h6M9 12h6M9 7h6M5 22h14a2 2 0 002-2V4a2 2 0 00-2-2H5a2 2 0 00-2 2v16a2 2 0 002 2z" />
            </svg>
            <h1 className="text-xl font-semibold text-gray-900">Orders</h1>
          </div>
          <select className="px-4 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
          </select>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">TOTAL BID VOLUME</p>
                <p className="text-xl font-semibold text-gray-900">{totalBidVolume.toFixed(2)} $SFT</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">TOTAL BIDS</p>
                <p className="text-xl font-semibold text-gray-900">{totalBids}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">ACTIVE BIDS</p>
                <p className="text-xl font-semibold text-gray-900">{activeBids}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14v-5.5a2 2 0 00-.586-1.414l-7-7a2 2 0 00-2.828 0l-7 7A2 2 0 002 12.5V19a2 2 0 002 2h16a2 2 0 002-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">TOTAL SALES</p>
                <p className="text-xl font-semibold text-gray-900">{totalOrders}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('All')}
                className={`text-sm font-medium ${
                  activeTab === 'All'
                    ? 'text-gray-900 border-b-2 border-gray-900 -mb-6 pb-6'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All Bids
              </button>
              <button
                onClick={() => setActiveTab('Active')}
                className={`text-sm font-medium ${
                  activeTab === 'Active'
                    ? 'text-gray-900 border-b-2 border-gray-900 -mb-6 pb-6'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setActiveTab('Revoked')}
                className={`text-sm font-medium ${
                  activeTab === 'Revoked'
                    ? 'text-gray-900 border-b-2 border-gray-900 -mb-6 pb-6'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Revoked
              </button>
            </div>
          </div>

          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Search..."
                  className="px-4 py-2 border border-gray-200 rounded-lg w-96 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M3 12h18M3 18h18" />
                  </svg>
                  Filter
                </button>
                <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  Sort by
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-700">
                  <th className="px-4 py-2 font-medium text-left w-8">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrders(orders.map(o => o.saleId));
                        } else {
                          setSelectedOrders([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-2 font-medium text-left w-16">#ID</th>
                  <th className="px-4 py-2 font-medium text-left w-24">End Date</th>
                  <th className="px-4 py-2 font-medium text-left">Gem</th>
                  <th className="px-4 py-2 font-medium text-left w-24">Value</th>
                  <th className="px-4 py-2 font-medium text-left w-24">Bidder</th>
                  <th className="px-4 py-2 font-medium text-left w-32">Bid Value</th>
                  <th className="px-4 py-2 font-medium text-left w-24">Status</th>
                  <th className="px-4 py-2 font-medium text-left w-12"></th>
                </tr>
              </thead>
              <tbody>
                {orders.flatMap(order => 
                  order.bids
                    .filter(bid => {
                      if (activeTab === 'All') return true;
                      if (activeTab === 'Active') return bid.status === 'Active';
                      if (activeTab === 'Revoked') return bid.status === 'Revoked';
                      return true;
                    })
                    .map((bid, bidIndex) => (
                      <tr key={`${order.saleId}-${bidIndex}`} className="border-t border-gray-100 hover:bg-gray-50 text-xs">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={selectedOrders.includes(order.saleId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOrders([...selectedOrders, order.saleId]);
                              } else {
                                setSelectedOrders(selectedOrders.filter(id => id !== order.saleId));
                              }
                            }}
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">#{order.saleId}</td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                          {new Date(order.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={order.gem.image}
                                alt={order.gem.name}
                                width={32}
                                height={32}
                                className="object-cover"
                              />
                            </div>
                            <span className="text-gray-700 truncate max-w-[150px]" title={order.gem.name}>
                              {order.gem.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">${parseFloat(order.gem.estimatedValueInUsd).toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-700 font-mono">{shortenAddress(bid.bidder)}</td>
                        <td className="px-4 py-3 text-gray-700">{parseFloat(bid.amount).toFixed(2)} {getTokenName(bid.token)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBidStatusClass(bid.status)}`}>
                            {bid.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button className="text-gray-400 hover:text-gray-600">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrdersPage; 