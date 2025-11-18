import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Share2, 
  Heart,
  MessageCircle,
  Filter,
  Grid,
  List,
  Search,
  ChevronDown
} from 'lucide-react';

const dummyShopData = {
  id: 1,
  name: 'Tech Paradise Electronics',
  profilePicture: 'https://picsum.photos/200/200?random=1',
  coverImage: 'https://picsum.photos/1200/400?random=2',
  description: 'Your one-stop shop for all electronic needs. We offer the latest smartphones, laptops, accessories, and home appliances at competitive prices. Quality products with excellent customer service.',
  category: 'Electronics',
  country: 'United States',
  city: 'New York',
  phone: '+1 (555) 123-4567',
  email: 'contact@techparadise.com',
  website: 'www.techparadise.com',
  followers: 15420,
  rating: 4.5,
  isFollowing: false
};

const dummyProducts = [
  {
    id: 1,
    title: 'iPhone 15 Pro Max',
    price: '$1,199',
    image: 'https://picsum.photos/300/300?random=10',
    condition: 'New',
    location: 'New York, USA'
  },
  {
    id: 2,
    title: 'MacBook Air M2',
    price: '$999',
    image: 'https://picsum.photos/300/300?random=11',
    condition: 'New',
    location: 'New York, USA'
  },
  {
    id: 3,
    title: 'Samsung Galaxy Watch',
    price: '$299',
    image: 'https://picsum.photos/300/300?random=12',
    condition: 'Like New',
    location: 'New York, USA'
  },
  {
    id: 4,
    title: 'Sony WH-1000XM5',
    price: '$349',
    image: 'https://picsum.photos/300/300?random=13',
    condition: 'New',
    location: 'New York, USA'
  },
  {
    id: 5,
    title: 'iPad Pro 12.9"',
    price: '$1,099',
    image: 'https://picsum.photos/300/300?random=14',
    condition: 'New',
    location: 'New York, USA'
  },
  {
    id: 6,
    title: 'Dell XPS 15',
    price: '$1,499',
    image: 'https://picsum.photos/300/300?random=15',
    condition: 'New',
    location: 'New York, USA'
  }
];

const ShopPageProfile = () => {
  const [shopData, setShopData] = useState(dummyShopData);
  const [products, setProducts] = useState(dummyProducts);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const handleFollow = () => {
    setShopData({...shopData, isFollowing: !shopData.isFollowing});
  };

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="relative h-80 bg-gray-300">
        <img 
          src={shopData.coverImage} 
          alt="Cover" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40"></div>
      </div>

      {/* Profile Section */}
      <div className="container mx-auto px-6 -mt-32 relative z-10">
        <div className="bg-white rounded-xl shadow-xl p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <img 
                src={shopData.profilePicture} 
                alt={shopData.name}
                className="w-40 h-40 rounded-xl object-cover border-4 border-white shadow-lg"
              />
            </div>

            {/* Shop Info */}
            <div className="flex-grow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{shopData.name}</h1>
                  <div className="flex flex-wrap gap-3 text-gray-600 text-sm mb-3">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {shopData.city}, {shopData.country}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {shopData.category}
                    </span>
                    <span className="flex items-center">
                      ⭐ {shopData.rating} Rating
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 max-w-3xl">{shopData.description}</p>
                  
                  {/* Contact Info */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <a href={`tel:${shopData.phone}`} className="flex items-center hover:text-blue-600">
                      <Phone className="w-4 h-4 mr-1" />
                      {shopData.phone}
                    </a>
                    <a href={`mailto:${shopData.email}`} className="flex items-center hover:text-blue-600">
                      <Mail className="w-4 h-4 mr-1" />
                      {shopData.email}
                    </a>
                    <a href={`https://${shopData.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-blue-600">
                      <Globe className="w-4 h-4 mr-1" />
                      {shopData.website}
                    </a>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={handleFollow}
                    className={`px-6 py-2 rounded-lg font-semibold transition ${
                      shopData.isFollowing 
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {shopData.isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </button>
                  <button className="px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-center">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6 mt-6 pt-6 border-t">
                <div>
                  <div className="text-2xl font-bold text-gray-800">{shopData.followers.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">{products.length}</div>
                  <div className="text-sm text-gray-600">Products</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">{shopData.rating}</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="mt-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Products Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Products & Ads</h2>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg w-64"
                  />
                  <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                </div>

                {/* Sort */}
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>

                {/* View Mode */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${
                      viewMode === 'grid' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${
                      viewMode === 'list' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
            }`}>
              {filteredProducts.map(product => (
                <div 
                  key={product.id}
                  className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  <div className={viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}>
                    <img 
                      src={product.image} 
                      alt={product.title}
                      className={`w-full ${viewMode === 'grid' ? 'h-64' : 'h-full'} object-cover`}
                    />
                  </div>
                  <div className="p-4 flex-grow">
                    <h3 className="font-semibold text-lg text-gray-800 mb-2">{product.title}</h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-blue-600">{product.price}</span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        {product.condition}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      {product.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No products found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPageProfile;