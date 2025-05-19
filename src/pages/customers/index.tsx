import React, { FC, useState, useMemo, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useContract } from '@/context/ContractContext';
import { getTokenName } from '@/context/ContractContext';

interface Bid {
  bidder: string;
  amount: string;
  token: string;
  isActive: boolean;
}

interface Customer {
  address: string;
  totalBids: number;
  auctionsWon: number;
  totalSpent: string;
  isBanned: boolean;
}

const CustomersPage: FC = () => {
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Banned'>('All');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const router = useRouter();
  const { activeSales, gems, saleBids, loading, error, contract } = useContract();

  const customers: Customer[] = useMemo(() => {
    if (!activeSales || !gems || !saleBids || !contract) return [];

    // Get unique bidders from all sales
    const uniqueBidders = new Set<string>();
    Object.values(saleBids).forEach(bids => {
      bids.forEach(bid => uniqueBidders.add(bid.bidder));
    });

    // Create customer data for each unique bidder
    return Array.from(uniqueBidders).map(address => {
      const customerBids = Object.values(saleBids).flatMap(bids => 
        bids.filter(bid => bid.bidder === address)
      );

      const wonAuctions = Object.entries(saleBids).filter(([_, bids]) => {
        const activeBids = bids.filter(bid => bid.isActive);
        const highestBid = activeBids.reduce<Bid | null>((highest, current) => {
          if (!highest || parseFloat(current.amount) > parseFloat(highest.amount)) {
            return current;
          }
          return highest;
        }, null);
        return highestBid?.bidder === address;
      }).length;

      const totalSpent = customerBids.reduce((total, bid) => total + parseFloat(bid.amount), 0);

      return {
        address,
        totalBids: customerBids.length,
        auctionsWon: wonAuctions,
        totalSpent: `${totalSpent.toFixed(2)} $SFT`,
        isBanned: false // Will be updated in useEffect
      };
    });
  }, [activeSales, gems, saleBids, contract]);

  // Load ban status for all customers
  useEffect(() => {
    if (!contract || !customers.length) return;

    const loadBanStatus = async () => {
      try {
        const banStatuses = await Promise.all(
          customers.map(customer => contract.bannedUsers(customer.address))
        );
        
        setCustomerList(
          customers.map((customer, index) => ({
            ...customer,
            isBanned: banStatuses[index]
          }))
        );
      } catch (err) {
        console.error('Failed to load ban statuses:', err);
      }
    };

    loadBanStatus();
  }, [contract, customers]);

  const handleToggleBan = async (address: string) => {
    if (!contract) return;

    try {
      const tx = await contract.toggleBanUser(address);
      await tx.wait();
      
      // Update the local state after successful ban toggle
      setCustomerList(prevCustomers => 
        prevCustomers.map(customer => 
          customer.address === address 
            ? { ...customer, isBanned: !customer.isBanned }
            : customer
        )
      );
    } catch (err) {
      console.error('Failed to toggle ban status:', err);
    }
  };

  const getStatusClass = (isBanned: boolean) => {
    return isBanned ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700';
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

  const filteredCustomers = customerList.filter(customer => {
    if (activeTab === 'All') return true;
    return activeTab === 'Banned' ? customer.isBanned : !customer.isBanned;
  });

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search..."
            className="px-4 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/customers/notifications')}
            className="p-2 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button
            onClick={() => router.push('/customers/add')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 4v16m8-8H4" />
            </svg>
            Add Customer
          </button>
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
              All
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
              onClick={() => setActiveTab('Banned')}
              className={`text-sm font-medium ${
                activeTab === 'Banned'
                  ? 'text-gray-900 border-b-2 border-gray-900 -mb-6 pb-6'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Banned
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
          <table className="w-full">
            <thead>
              <tr className="text-sm text-gray-700">
                <th className="px-6 py-3 font-medium text-left w-8">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCustomers(filteredCustomers.map(c => c.address));
                      } else {
                        setSelectedCustomers([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 font-medium text-left">User Address</th>
                <th className="px-6 py-3 font-medium text-left">Total Bids</th>
                <th className="px-6 py-3 font-medium text-left">Auctions Won</th>
                <th className="px-6 py-3 font-medium text-left">Total Spent</th>
                <th className="px-6 py-3 font-medium text-left">Status</th>
                <th className="px-6 py-3 font-medium text-left w-8"></th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.address} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedCustomers.includes(customer.address)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCustomers([...selectedCustomers, customer.address]);
                        } else {
                          setSelectedCustomers(selectedCustomers.filter(id => id !== customer.address));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-mono">{customer.address}</td>
                  <td className="px-6 py-4 text-gray-700">{customer.totalBids}</td>
                  <td className="px-6 py-4 text-gray-700">{customer.auctionsWon}</td>
                  <td className="px-6 py-4 text-gray-700">{customer.totalSpent}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(customer.isBanned)}`}>
                      {customer.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative group">
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                        <button
                          onClick={() => handleToggleBan(customer.address)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {customer.isBanned ? 'Unban User' : 'Ban User'}
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default CustomersPage; 