import { useContract } from '@/context/ContractContext';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Layout from '@/components/layout/Layout';
import Image from 'next/image';

interface GemForm {
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
}

export default function AddProductPage() {
  const router = useRouter();
  const { createGem } = useContract();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [imageError, setImageError] = useState<string>('');
  const [isImageLoading, setIsImageLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, touchedFields },
  } = useForm<GemForm>({
    mode: 'onBlur' // Only show errors after field is blurred
  });

  // Watch the image URL to update preview
  const imageUrl = watch('image');

  // Update preview image with debounce
  useEffect(() => {
    if (!imageUrl) {
      setPreviewImage('');
      setImageError('');
      return;
    }

    const timer = setTimeout(() => {
      setIsImageLoading(true);
      setImageError('');

      // Test if URL is valid
      const img = document.createElement('img');
      img.onload = () => {
        setPreviewImage(imageUrl);
        setImageError('');
        setIsImageLoading(false);
      };
      img.onerror = () => {
        setPreviewImage('');
        setImageError('Please enter a valid image URL');
        setIsImageLoading(false);
      };
      img.src = imageUrl;
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [imageUrl]);

  const onSubmit = async (data: GemForm) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await createGem(data);
      router.push('/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create gem');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Gem</h1>
            <p className="mt-2 text-gray-600">Create a new gem in the marketplace</p>
          </div>
          <button
            onClick={() => router.push('/products')}
            className="flex items-center px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Products
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Basic Info */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 pb-4 border-b">Basic Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter gem name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    {...register('description', { required: 'Description is required' })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter detailed description"
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Value (USD)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      {...register('estimatedValueInUsd', { required: 'Estimated value is required' })}
                      className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.estimatedValueInUsd && <p className="mt-1 text-sm text-red-600">{errors.estimatedValueInUsd.message}</p>}
                </div>
              </div>

              {/* Right Column - Gem Details & Image */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 pb-4 border-b">Gem Details & Image</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Carat</label>
                    <input
                      type="text"
                      {...register('carat', { required: 'Carat is required' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., 1.5"
                    />
                    {errors.carat && <p className="mt-1 text-sm text-red-600">{errors.carat.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                    <input
                      type="text"
                      {...register('color', { required: 'Color is required' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., D"
                    />
                    {errors.color && <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Clarity</label>
                    <input
                      type="text"
                      {...register('clarity', { required: 'Clarity is required' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., VS1"
                    />
                    {errors.clarity && <p className="mt-1 text-sm text-red-600">{errors.clarity.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cut</label>
                    <input
                      type="text"
                      {...register('cut', { required: 'Cut is required' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., Excellent"
                    />
                    {errors.cut && <p className="mt-1 text-sm text-red-600">{errors.cut.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Origin</label>
                  <input
                    type="text"
                    {...register('origin', { required: 'Origin is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., South Africa"
                  />
                  {errors.origin && <p className="mt-1 text-sm text-red-600">{errors.origin.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <div className="space-y-2">
                    <input
                      type="url"
                      {...register('image', { 
                        required: 'Image URL is required',
                        pattern: {
                          value: /^https?:\/\/.+/i,
                          message: 'Please enter a valid URL starting with http:// or https://'
                        }
                      })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        (touchedFields.image && errors.image) || imageError ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="https://ipfs.io/ipfs/..."
                    />
                    {touchedFields.image && errors.image && (
                      <p className="text-sm text-red-600">{errors.image.message}</p>
                    )}
                    {imageError && (
                      <p className="text-sm text-red-600">{imageError}</p>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                      {isImageLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      ) : previewImage ? (
                        <Image
                          src={previewImage}
                          alt="Gem preview"
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
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Certification URL</label>
                  <input
                    type="url"
                    {...register('certification', { required: 'Certification URL is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://..."
                  />
                  {errors.certification && <p className="mt-1 text-sm text-red-600">{errors.certification.message}</p>}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.push('/products')}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
                    'Create Gem'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}