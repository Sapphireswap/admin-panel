import { FC, useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import Image from 'next/image';
import Link from 'next/link';
import { useContract } from '@/context/ContractContext';

interface Product {
  gemId: number;
  metadata: {
    name: string;
    description: string;
    image: string;
    carat: string;
    color: string;
    clarity: string;
    cut: string;
    origin: string;
    certification: string;
    estimatedValueInUsd: string;
  };
  isActive: boolean;
  currentBid?: string;
  saleId?: number;
}

const ProductsPage: FC = () => {
  const [activeTab, setActiveTab] = useState<'All' | 'On Sale'>('All');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const { gems, activeSales, saleBids, loading, error } = useContract();

  // Transform contract data into products
  const products = useMemo(() => {
    const productList: Product[] = [];
    
    Object.entries(gems).forEach(([gemId, gem]) => {
      // Find associated sale if any
      const sale = activeSales.find(s => s.gemId === parseInt(gemId));
      
      // Get highest bid for this gem if it's in a sale
      let highestBid = '0';
      if (sale) {
        const bids = saleBids[sale.saleId] || [];
        highestBid = bids.reduce((max, bid) => {
          const amount = parseFloat(bid.amount);
          return amount > parseFloat(max) ? bid.amount : max;
        }, '0');
      }

      productList.push({
        gemId: parseInt(gemId),
        metadata: gem.metadata,
        isActive: gem.isActive,
        currentBid: highestBid,
        saleId: sale?.saleId
      });
    });

    return productList;
  }, [gems, activeSales, saleBids]);

  // Filter products based on active tab
  const filteredProducts = useMemo(() => {
    switch (activeTab) {
      case 'On Sale':
        return products.filter(p => p.saleId !== undefined);
      default:
        return products;
    }
  }, [products, activeTab]);

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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search gems..."
            className="px-4 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Link
          href="/products/add"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex items-center gap-6 px-6 py-3">
            <button
              className={`text-sm ${activeTab === 'All' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'} pb-3 px-1`}
              onClick={() => setActiveTab('All')}
            >
              All
            </button>
            <button
              className={`text-sm ${activeTab === 'On Sale' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'} pb-3 px-1`}
              onClick={() => setActiveTab('On Sale')}
            >
              On Sale
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="flex items-center gap-4 p-4">
            <input
              type="text"
              placeholder="Search by name, origin, or certification..."
              className="px-4 py-2 border border-gray-200 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
              Filter
            </button>
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-2">
              Sort by
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-y border-gray-200 text-sm text-gray-500">
                <th className="px-6 py-3 font-medium text-left">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts(filteredProducts.map(p => p.gemId));
                      } else {
                        setSelectedProducts([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 font-medium text-left">Product</th>
                <th className="px-6 py-3 font-medium text-left">Origin</th>
                <th className="px-6 py-3 font-medium text-left">Carat</th>
                <th className="px-6 py-3 font-medium text-left">Color</th>
                <th className="px-6 py-3 font-medium text-left">Clarity</th>
                <th className="px-6 py-3 font-medium text-left">Cut</th>
                <th className="px-6 py-3 font-medium text-left">Est. Value</th>
                <th className="px-6 py-3 font-medium text-left">Current Bid</th>
                <th className="px-6 py-3 font-medium text-left">Status</th>
                <th className="px-6 py-3 font-medium text-left"></th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.gemId} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedProducts.includes(product.gemId)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts([...selectedProducts, product.gemId]);
                        } else {
                          setSelectedProducts(selectedProducts.filter(id => id !== product.gemId));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                        <Image
                          src={product.metadata.image || '/sapphire-placeholder.jpg'}
                          alt={product.metadata.name}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <span className="font-medium block">{product.metadata.name}</span>
                        <span className="text-sm text-gray-500">#{product.gemId}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{product.metadata.origin}</td>
                  <td className="px-6 py-4 text-gray-600">{product.metadata.carat}</td>
                  <td className="px-6 py-4 text-gray-600">{product.metadata.color}</td>
                  <td className="px-6 py-4 text-gray-600">{product.metadata.clarity}</td>
                  <td className="px-6 py-4 text-gray-600">{product.metadata.cut}</td>
                  <td className="px-6 py-4 text-gray-600">${parseFloat(product.metadata.estimatedValueInUsd).toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {product.currentBid && parseFloat(product.currentBid) > 0 
                      ? `$${parseFloat(product.currentBid).toLocaleString()}`
                      : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 ${product.saleId ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'} rounded-full text-sm`}>
                      {product.saleId ? 'On Sale' : 'Listed'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                      </svg>
                    </button>
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

export default ProductsPage; 