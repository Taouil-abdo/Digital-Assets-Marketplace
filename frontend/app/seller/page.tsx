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
  status: string;
  previews: { url: string; type: string }[];
  orderItems: { order: { status: string }; price: number }[];
}

export default function SellerDashboard() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth0();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '3D Models',
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSellerAssets();
    }
  }, [isAuthenticated, user]);

  const fetchSellerAssets = async () => {
    try {
      const response = await axios.get(`/api/assets/seller/${user?.sub}`);
      setAssets(response.data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await axios.post('/api/assets', {
        ...formData,
        price: parseInt(formData.price) * 100, // Convert to cents
        sellerId: user?.sub,
        privateFileKey: `assets/${Date.now()}-${formData.title}`, // Placeholder
      });
      
      setFormData({ title: '', description: '', price: '', category: '3D Models' });
      setShowUploadForm(false);
      fetchSellerAssets();
    } catch (error) {
      console.error('Error creating asset:', error);
      alert('Error creating asset');
    }
  };

  const toggleAssetStatus = async (assetId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    
    try {
      await axios.put(`/api/assets/${assetId}`, { status: newStatus });
      fetchSellerAssets();
    } catch (error) {
      console.error('Error updating asset:', error);
    }
  };

  const calculateRevenue = () => {
    return assets.reduce((total, asset) => {
      const assetRevenue = asset.orderItems
        .filter(item => item.order.status === 'PAID')
        .reduce((sum, item) => sum + item.price, 0);
      return total + assetRevenue;
    }, 0);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Please login to access seller dashboard</p>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {showUploadForm ? 'Cancel' : 'Upload New Asset'}
        </button>
      </div>

      {/* Revenue Summary */}
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-2">Revenue Summary</h2>
        <p className="text-3xl font-bold text-blue-600">
          ${(calculateRevenue() / 100).toFixed(2)}
        </p>
        <p className="text-gray-600">Total earnings from {assets.length} assets</p>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-white border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload New Asset</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg h-24"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price ($)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  min="1"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="3D Models">3D Models</option>
                  <option value="Code Snippets">Code Snippets</option>
                  <option value="Notion Templates">Notion Templates</option>
                </select>
              </div>
            </div>
            
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Create Asset
            </button>
          </form>
        </div>
      )}

      {/* Assets List */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">My Assets</h2>
        
        {assets.length === 0 ? (
          <p className="text-gray-500">No assets uploaded yet</p>
        ) : (
          <div className="grid gap-6">
            {assets.map((asset) => (
              <div key={asset.id} className="border rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{asset.title}</h3>
                    <p className="text-gray-600 mb-2">{asset.description}</p>
                    <p className="text-lg font-bold">${(asset.price / 100).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Category: {asset.category}</p>
                    
                    <div className="mt-2">
                      <span className="text-sm text-gray-600">
                        Sales: {asset.orderItems.filter(item => item.order.status === 'PAID').length}
                      </span>
                      <span className="ml-4 text-sm text-gray-600">
                        Revenue: ${(asset.orderItems
                          .filter(item => item.order.status === 'PAID')
                          .reduce((sum, item) => sum + item.price, 0) / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      asset.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {asset.status}
                    </span>
                    
                    <button
                      onClick={() => toggleAssetStatus(asset.id, asset.status)}
                      className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                    >
                      {asset.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}