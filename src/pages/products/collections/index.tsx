import { FC, useState } from 'react';
import Layout from '@/components/layout/Layout';
import Image from 'next/image';
import { useRouter } from 'next/router';

interface Collection {
  id: string;
  name: string;
  icon: string;
  productCount: number;
}

const mockCollections: Collection[] = [
  { id: '1', name: 'Garnet', icon: '💎', productCount: 10 },
  { id: '2', name: 'Blue Sapphire', icon: '💎', productCount: 6 },
  { id: '3', name: 'Ruby', icon: '💎', productCount: 3 },
  { id: '4', name: 'Moonstone', icon: '💎', productCount: 10 },
  { id: '5', name: 'Oval', icon: '💎', productCount: 13 },
  { id: '6', name: 'Cushion', icon: '💎', productCount: 10 },
  { id: '7', name: 'Round', icon: '💎', productCount: 10 },
  { id: '8', name: 'Asscher', icon: '💎', productCount: 10 },
];

const CollectionsPage: FC = () => {
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const router = useRouter();

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
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-700 hover:bg-gray-50 rounded-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14m7-7H5" />
            </svg>
          </button>
          <button 
            onClick={() => router.push('/products/collections/create')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 4v16m8-8H4" />
            </svg>
            Add Collection
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900">Collections</h1>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <p className="text-gray-600 mt-1">Monitor and manage transactions across all your cards.</p>
        </div>

        <div className="p-4 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 border border-gray-200 rounded-lg w-96 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Title</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </div>
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
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              Export As
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
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
                        setSelectedCollections(mockCollections.map(c => c.id));
                      } else {
                        setSelectedCollections([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 font-medium text-left">Title</th>
                <th className="px-6 py-3 font-medium text-right">Products</th>
                <th className="px-6 py-3 font-medium text-left w-8"></th>
              </tr>
            </thead>
            <tbody>
              {mockCollections.map((collection) => (
                <tr key={collection.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedCollections.includes(collection.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCollections([...selectedCollections, collection.id]);
                        } else {
                          setSelectedCollections(selectedCollections.filter(id => id !== collection.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{collection.icon}</span>
                      <span className="font-medium text-gray-900">{collection.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-900">{collection.productCount}</td>
                  <td className="px-6 py-4">
                    <button className="text-gray-500 hover:text-gray-700">
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

export default CollectionsPage; 