import { FC, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useRouter } from 'next/router';

interface MediaFile {
  id: string;
  name: string;
  type: 'JPG' | 'PNG' | 'MP4' | 'Webp';
  dateAdded: string;
  size: string;
  references: string | '-';
}

const mockFiles: MediaFile[] = [
  {
    id: '1',
    name: 'Blue Sapphire',
    type: 'JPG',
    dateAdded: 'April 15, 2025',
    size: '1.2MB',
    references: '1 Product'
  },
  {
    id: '2',
    name: 'Ruby 360° View',
    type: 'PNG',
    dateAdded: 'April 15, 2025',
    size: '4.2MB',
    references: '1 Product'
  },
  {
    id: '3',
    name: 'Blue Sapphire Video',
    type: 'MP4',
    dateAdded: 'April 12, 2025',
    size: '3.2MB',
    references: '-'
  },
  {
    id: '4',
    name: 'Blue Sapphire',
    type: 'PNG',
    dateAdded: 'April 12, 2025',
    size: '1.2MB',
    references: '1 Product'
  },
  {
    id: '5',
    name: 'Blue Sapphire',
    type: 'JPG',
    dateAdded: 'April 11, 2025',
    size: '6.2MB',
    references: '1 Product'
  },
  {
    id: '6',
    name: 'Blue Sapphire',
    type: 'JPG',
    dateAdded: 'April 10, 2025',
    size: '1.2MB',
    references: '-'
  },
  {
    id: '7',
    name: 'Blue Sapphire',
    type: 'Webp',
    dateAdded: 'April 10, 2025',
    size: '600KB',
    references: '1 Product'
  },
  {
    id: '8',
    name: 'Blue Sapphire',
    type: 'JPG',
    dateAdded: 'April 10, 2025',
    size: '1.2MB',
    references: '1 Product'
  }
];

const MediaPage: FC = () => {
  const [activeTab, setActiveTab] = useState<'All' | 'Images' | 'Videos'>('All');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const router = useRouter();

  const getFileIcon = (type: MediaFile['type']) => {
    return (
      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-500">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
          <path d="M13 2v7h7" />
        </svg>
      </div>
    );
  };

  const filteredFiles = mockFiles.filter(file => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Images') return ['JPG', 'PNG', 'Webp'].includes(file.type);
    if (activeTab === 'Videos') return file.type === 'MP4';
    return true;
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
            onClick={() => router.push('/media/notifications')}
            className="p-2 text-gray-700 hover:bg-gray-50 rounded-lg"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button
            onClick={() => router.push('/media/upload')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 4v16m8-8H4" />
            </svg>
            Upload Files
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
              onClick={() => setActiveTab('Images')}
              className={`text-sm font-medium ${
                activeTab === 'Images'
                  ? 'text-gray-900 border-b-2 border-gray-900 -mb-6 pb-6'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Images
            </button>
            <button
              onClick={() => setActiveTab('Videos')}
              className={`text-sm font-medium ${
                activeTab === 'Videos'
                  ? 'text-gray-900 border-b-2 border-gray-900 -mb-6 pb-6'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Videos
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
                        setSelectedFiles(filteredFiles.map(f => f.id));
                      } else {
                        setSelectedFiles([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 font-medium text-left">Name</th>
                <th className="px-6 py-3 font-medium text-left">Date Added</th>
                <th className="px-6 py-3 font-medium text-left">Size</th>
                <th className="px-6 py-3 font-medium text-left">References</th>
                <th className="px-6 py-3 font-medium text-left w-8"></th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr key={file.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedFiles.includes(file.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFiles([...selectedFiles, file.id]);
                        } else {
                          setSelectedFiles(selectedFiles.filter(id => id !== file.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">{file.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{file.dateAdded}</td>
                  <td className="px-6 py-4 text-gray-700">{file.size}</td>
                  <td className="px-6 py-4 text-gray-700">{file.references}</td>
                  <td className="px-6 py-4">
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
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

export default MediaPage; 