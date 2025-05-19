import { FC, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useForm } from 'react-hook-form';

interface CollectionForm {
  title: string;
  description: string;
  products: string[];
}

const CreateCollectionPage: FC = () => {
  const { register, handleSubmit } = useForm<CollectionForm>();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const mockProducts = [
    { id: '1', name: 'Blue Sapphire', icon: '💎' },
    { id: '2', name: 'Ruby', icon: '💎' },
    { id: '3', name: 'Gewda', icon: '💎' },
    { id: '4', name: 'Blue Sapphire', icon: '💎' },
  ];

  const onSubmit = (data: CollectionForm) => {
    console.log({ ...data, products: selectedProducts });
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 4v16m8-8H4" />
          </svg>
          <h1 className="text-xl font-semibold text-gray-900">Create collection</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Title<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('title', { required: true })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="Blue Sapphire"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Description <span className="text-gray-500">(Optional)</span>
                </label>
                <textarea
                  {...register('description')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                  rows={4}
                  placeholder="Describe yourself..."
                />
                <div className="flex justify-end items-center gap-1 mt-1">
                  <span className="text-sm text-gray-500">0</span>
                  <span className="text-sm text-gray-400">/</span>
                  <span className="text-sm text-gray-500">200</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  <svg className="inline-block w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  It will be displayed on your product page
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Products</h2>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                />
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Browse
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                Sort by
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {mockProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts([...selectedProducts, product.id]);
                      } else {
                        setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{product.icon}</span>
                    <span className="font-medium text-gray-900">{product.name}</span>
                  </div>
                  <button
                    type="button"
                    className="ml-auto text-gray-400 hover:text-gray-600"
                    onClick={() => {
                      setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Thumbnail</h2>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse File
              </button>
            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 mb-2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                <p className="font-medium text-gray-900">Choose a file or drag & drop it here.</p>
                <p className="text-sm text-gray-500 mt-1">JPEG, PNG, PDF, and MP4 formats, up to 50 MB.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Last Updated
              <span className="text-gray-900">Feb 20, 2023 at 19:32</span>
            </div>

            <div className="flex items-center gap-4">
              <select
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Publish
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateCollectionPage; 