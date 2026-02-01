'use client';

import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

interface Order {
  id: string;
  status: string;
  createdAt: string;
  items: {
    asset: {
      id: string;
      title: string;
      description: string;
      previews: { url: string; type: string }[];
    };
    price: number;
  }[];
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`/api/orders/user/${user?.sub}`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (assetId: string) => {
    try {
      const response = await axios.post(`/api/assets/${assetId}/download`, {
        userId: user?.sub,
      });
      
      // Open download URL in new tab
      window.open(response.data.downloadUrl, '_blank');
    } catch (error) {
      console.error('Error getting download link:', error);
      alert('Error accessing download');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Please login to view your dashboard</p>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Purchase History</h2>
        
        {orders.length === 0 ? (
          <p className="text-gray-500">No purchases yet</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    order.status === 'PAID' 
                      ? 'bg-green-100 text-green-800' 
                      : order.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.asset.id} className="flex items-center gap-4">
                      {item.asset.previews.length > 0 && (
                        <img
                          src={item.asset.previews[0].url}
                          alt={item.asset.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.asset.title}</h3>
                        <p className="text-gray-600 text-sm">{item.asset.description}</p>
                        <p className="font-bold">${(item.price / 100).toFixed(2)}</p>
                      </div>
                      
                      {order.status === 'PAID' && (
                        <button
                          onClick={() => handleDownload(item.asset.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Download
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}