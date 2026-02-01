'use client';

import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

interface Asset {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  seller: { name: string };
  previews: { url: string; type: string }[];
}

export default function MarketplacePage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filters, setFilters] = useState({ category: '', search: '' });
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth0();

  useEffect(() => {
    fetchAssets();
  }, [filters]);

  const fetchAssets = async () => {
    try {
      const response = await axios.get('/api/assets', { params: filters });
      setAssets(response.data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (assetId: string) => {
    if (!isAuthenticated || !user) {
      alert('Please login to purchase');
      return;
    }

    try {
      // Create order
      const orderResponse = await axios.post('/api/orders', {
        userId: user.sub,
        assetIds: [assetId],
      });

      // Create Stripe checkout session
      const checkoutResponse = await axios.post('/api/payments/create-checkout-session', {
        orderId: orderResponse.data.id,
      });

      // Redirect to Stripe checkout
      window.location.href = checkoutResponse.data.url;
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error processing purchase');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Digital Assets Marketplace</h1>
      
      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search assets..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="px-4 py-2 border rounded-lg flex-1"
        />
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Categories</option>
          <option value="3D Models">3D Models</option>
          <option value="Code Snippets">Code Snippets</option>
          <option value="Notion Templates">Notion Templates</option>
        </select>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset) => (
          <div key={asset.id} className="border rounded-lg p-4 shadow-md">
            {/* Preview */}
            {asset.previews.length > 0 && (
              <div className="mb-4">
                {asset.previews[0].type === 'image' ? (
                  <img
                    src={asset.previews[0].url}
                    alt={asset.title}
                    className="w-full h-48 object-cover rounded"
                  />
                ) : (
                  <video
                    src={asset.previews[0].url}
                    className="w-full h-48 object-cover rounded"
                    controls
                  />
                )}
              </div>
            )}
            
            <h3 className="text-xl font-semibold mb-2">{asset.title}</h3>
            <p className="text-gray-600 mb-2">{asset.description}</p>
            <p className="text-sm text-gray-500 mb-2">by {asset.seller.name}</p>
            <p className="text-lg font-bold mb-4">${(asset.price / 100).toFixed(2)}</p>
            
            <button
              onClick={() => handlePurchase(asset.id)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Purchase
            </button>
          </div>
        ))}
      </div>

      {assets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No assets found</p>
        </div>
      )}
    </div>
  );
}