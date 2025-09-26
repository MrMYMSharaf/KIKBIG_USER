import React, { useState } from 'react';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  PlusCircle, 
  Filter, 
  Search 
} from 'lucide-react';

const dummyAdsData = [
  {
    id: 1,
    title: 'Vintage Mountain Bike',
    price: '$250',
    views: 453,
    date: 'May 15, 2024',
    status: 'Active',
    image: 'https://picsum.photos/200/300?1'
  },
  {
    id: 2,
    title: 'Modern Studio Sofa',
    price: '$450',
    views: 267,
    date: 'April 22, 2024',
    status: 'Pending',
    image: 'https://picsum.photos/200/300?2'
  },
  {
    id: 3,
    title: 'Gaming Laptop',
    price: '$1200',
    views: 612,
    date: 'June 5, 2024',
    status: 'Active',
    image: 'https://picsum.photos/200/300?3'
  },
  {
    id: 4,
    title: 'Gaming Laptop',
    price: '$1200',
    views: 612,
    date: 'June 5, 2024',
    status: 'Active',
    image: 'https://picsum.photos/200/300?3'
  }
];

const Myads = () => {
  const [ads, setAds] = useState(dummyAdsData);
  const [selectedAd, setSelectedAd] = useState(null);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Advertisements</h1>
          <button className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
            <PlusCircle className="mr-2" />
            Create New Ad
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex justify-between mb-6">
          <div className="flex space-x-4">
            <button className="flex items-center bg-white border rounded-lg px-4 py-2 hover:bg-gray-100">
              <Filter className="mr-2" />
              Filters
            </button>
            <select className="bg-white border rounded-lg px-4 py-2">
              <option>All Status</option>
              <option>Active</option>
              <option>Pending</option>
            </select>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search ads..." 
              className="pl-10 pr-4 py-2 border rounded-lg w-64"
            />
            <Search className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Ads Grid */}
        <div
          className={"grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pb-32"}
          style={{ maxHeight: 'calc(100vh - 150px)' }}
        >

        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div 
              key={ad.id} 
              className="bg-white rounded-xl shadow-lg overflow-hidden transform transition hover:scale-105 hover:shadow-xl"
            >
              {/* Ad Image */}
              <div className="relative">
                <img 
                  src={ad.image} 
                  alt={ad.title} 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <button 
                    onClick={() => setSelectedAd(ad)}
                    className="bg-white/70 p-2 rounded-full hover:bg-white/90"
                  >
                    <MoreVertical className="text-gray-700" />
                  </button>
                </div>
              </div>

              {/* Ad Details */}
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2">{ad.title}</h2>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-semibold text-blue-600">{ad.price}</span>
                  <span 
                    className={`px-3 py-1 rounded-full text-sm ${getStatusColor(ad.status)}`}
                  >
                    {ad.status}
                  </span>
                </div>
                <div className="mt-4 flex justify-between text-gray-500 text-sm">
                  <span>Posted: {ad.date}</span>
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" /> {ad.views}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
        {/* Action Modal (if an ad is selected) */}
        {selectedAd && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 w-96">
              <h3 className="text-xl font-bold mb-4">{selectedAd.title}</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center py-2 hover:bg-gray-100 rounded">
                  <Edit className="mr-2" /> Edit Ad
                </button>
                <button className="w-full flex items-center justify-center py-2 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="mr-2" /> Delete Ad
                </button>
                <button 
                  onClick={() => setSelectedAd(null)}
                  className="w-full py-2 border mt-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Myads;