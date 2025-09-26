import React, { useState } from 'react';
import { 
  PlusCircle, 
  Search, 
  Users, 
  Grid, 
  List, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2 
} from 'lucide-react';

const dummyPagesData = [
  {
    id: 1,
    name: 'Tech Innovations',
    followers: 5432,
    category: 'Technology',
    image: 'https://picsum.photos/200/300?1',
    isOwn: true,
    isFollowing: true
  },
  {
    id: 2,
    name: 'Foodie Adventures',
    followers: 2345,
    category: 'Food & Dining',
    image: 'https://picsum.photos/200/300?2',
    isOwn: false,
    isFollowing: false
  },
  {
    id: 3,
    name: 'Travel Explorers',
    followers: 7890,
    category: 'Travel',
    image: 'https://picsum.photos/200/300?3',
    isOwn: false,
    isFollowing: true
  }
];

const Page = () => {
  const [activeTab, setActiveTab] = useState('my');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPage, setSelectedPage] = useState(null);

  const filteredPages = dummyPagesData.filter(page => {
    const matchesSearch = page.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (activeTab) {
      case 'my':
        return page.isOwn && matchesSearch;
      case 'following':
        return page.isFollowing && matchesSearch;
      default:
        return matchesSearch;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Pages</h1>
          <button className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
            <PlusCircle className="mr-2" />
            Create New Page
          </button>
        </div>

        {/* Tabs and View Options */}
        <div className="flex justify-between mb-6">
          {/* Tabs */}
          <div className="flex space-x-4">
            <button 
              onClick={() => setActiveTab('my')}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === 'my' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              My Pages
            </button>
           
            <button 
              onClick={() => setActiveTab('following')}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === 'following' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Following Pages
            </button>
          </div>

          {/* Search and View Mode */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search pages..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-64"
              />
              <Search className="absolute left-3 top-3 text-gray-400" />
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${
                  viewMode === 'grid' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Grid />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <List />
              </button>
            </div>
          </div>
        </div>

        {/* Pages Grid/List */}
        <div className={`${viewMode === 'grid' ? 'grid md:grid-cols-3 gap-6' : 'space-y-4'}`}>
          {filteredPages.length > 0 ? (
            filteredPages.map((page) => (
              <div 
                key={page.id} 
                className={`bg-white rounded-xl shadow-lg overflow-hidden 
                  transform transition hover:scale-105 hover:shadow-xl 
                  ${viewMode === 'list' ? 'flex items-center' : ''}`}
              >
                {/* Page Image */}
                <div className={viewMode === 'grid' ? '' : 'w-48 flex-shrink-0'}>
                  <img 
                    src={page.image} 
                    alt={page.name} 
                    className={`w-full ${viewMode === 'grid' ? 'h-48' : 'h-full'} object-cover`}
                  />
                </div>

                {/* Page Details */}
                <div className={`p-4 ${viewMode === 'list' ? 'flex-grow flex items-center justify-between' : ''}`}>
                  <div>
                    <h2 className="text-xl font-bold mb-2">{page.name}</h2>
                    <div className="flex items-center space-x-2 text-gray-500 text-sm">
                      <Users className="w-4 h-4" />
                      <span>{page.followers} Followers</span>
                    </div>
                    <div className="text-gray-500 text-sm mt-1">
                      {page.category}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setSelectedPage(page)}
                      className="text-gray-500 hover:text-blue-500"
                    >
                      <MoreVertical />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              No pages found
            </div>
          )}
        </div>

        {/* Action Modal */}
        {selectedPage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 w-96">
              <h3 className="text-xl font-bold mb-4">{selectedPage.name}</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center py-2 hover:bg-gray-100 rounded">
                  <Eye className="mr-2" /> View Page
                </button>
                <button className="w-full flex items-center justify-center py-2 hover:bg-gray-100 rounded">
                  <Edit className="mr-2" /> Edit Page
                </button>
                <button className="w-full flex items-center justify-center py-2 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="mr-2" /> Delete Page
                </button>
                <button 
                  onClick={() => setSelectedPage(null)}
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

export default Page;