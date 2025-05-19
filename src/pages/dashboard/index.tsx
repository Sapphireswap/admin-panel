import React, { FC, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import { useRouter } from 'next/router';
import ConnectButton from '@/components/ConnectButton';
import { useContract } from '@/context/ContractContext';
import { ethers } from 'ethers';

interface MetricCard {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  bgColor: string;
  iconColor: string;
}

const DashboardPage: FC = () => {
  const router = useRouter();
  const { activeSales, gems, saleBids, loading, error, userAddress } = useContract();

  // Calculate metrics from contract data
  const metrics = useMemo(() => {
    const totalProducts = Object.keys(gems).length;
    const totalSales = activeSales.length;
    
    // Calculate total bid amount across all sales
    const totalBidAmount = Object.values(saleBids).reduce((total, bids) => {
      return total + bids.reduce((saleTotal, bid) => {
        if (bid.isActive) {
          const amount = parseFloat(bid.amount);
          return saleTotal + (isNaN(amount) ? 0 : amount);
        }
        return saleTotal;
      }, 0);
    }, 0);

    // Find highest bid
    let highestBid = 0;
    Object.values(saleBids).forEach(bids => {
      bids.forEach(bid => {
        if (bid.isActive) {
          const amount = parseFloat(bid.amount);
          if (!isNaN(amount) && amount > highestBid) {
            highestBid = amount;
          }
        }
      });
    });

    // Count unique users (bidders)
    const uniqueUsers = new Set();
    Object.values(saleBids).forEach(bids => {
      bids.forEach(bid => {
        if (bid.isActive) {
          uniqueUsers.add(bid.bidder);
        }
      });
    });

    // Calculate active sales (sales with bids)
    const salesWithBids = Object.entries(saleBids).filter(([_, bids]) => 
      bids.some(bid => bid.isActive)
    ).length;

    return [
      {
        title: 'Total Products',
        value: totalProducts,
        icon: (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        ),
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600'
      },
      {
        title: 'Total Sales',
        value: totalSales,
        icon: (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        bgColor: 'bg-purple-50',
        iconColor: 'text-purple-600'
      },
      {
        title: 'Active Sales',
        value: salesWithBids,
        icon: (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
        trend: {
          value: `${salesWithBids} With Bids`,
          isPositive: true
        },
        bgColor: 'bg-green-50',
        iconColor: 'text-green-600'
      },
      {
        title: 'Total Bid Volume',
        value: `$${totalBidAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
        icon: (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        bgColor: 'bg-yellow-50',
        iconColor: 'text-yellow-600'
      },
      {
        title: 'Highest Bid',
        value: `$${highestBid.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
        icon: (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        ),
        bgColor: 'bg-indigo-50',
        iconColor: 'text-indigo-600'
      },
      {
        title: 'Total Users',
        value: uniqueUsers.size,
        icon: (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
        bgColor: 'bg-rose-50',
        iconColor: 'text-rose-600'
      }
    ];
  }, [gems, activeSales, saleBids]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with Connect Wallet */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
            <p className="mt-1 text-sm text-gray-500">
              {userAddress ? 
                `Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 
                'Connect your wallet to interact with the marketplace'}
            </p>
          </div>
          <ConnectButton />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-6">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className={`${metric.bgColor} ${metric.iconColor} p-3 rounded-lg`}>
                  {metric.icon}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">{metric.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
                    {metric.trend && (
                      <span 
                        className={`text-sm font-medium ${
                          metric.trend.isPositive ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {metric.trend.value}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
          </div>
          <div className="space-y-4">
            {Object.entries(saleBids).slice(0, 5).map(([saleId, bids]) => (
              bids.map((bid, index) => (
                <div key={`${saleId}-${index}`} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        New bid on Gem #{gems[activeSales.find(s => s.saleId === parseInt(saleId))?.gemId || 0]?.metadata.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        by {bid.bidder.slice(0, 6)}...{bid.bidder.slice(-4)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">${parseFloat(bid.amount).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{bid.token}</p>
                  </div>
                </div>
              ))
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage; 