import React, { useState } from 'react';
import { 
  ImagePlus, 
  Type, 
  DollarSign, 
  MapPin, 
  Tag, 
  List, 
  Info, 
  Save 
} from 'lucide-react';

const PostAdd = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    location: '',
    contactEmail: '',
    images: []
  });

  const categories = [
    'Electronics', 
    'Furniture', 
    'Vehicles', 
    'Real Estate', 
    'Services', 
    'Fashion', 
    'Pets', 
    'Jobs', 
    'Books', 
    'Sports & Hobbies',
    'Mobile Phones',
    'Computers',
    'Home Appliances',
    'Musical Instruments',
    'Collectibles',
    'Antiques',
    'Art',
    'Garden',
    'Tools',
    'Toys & Games'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted Form Data:', formData);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Post Your Listing
      </h1>

      <div className="flex gap-6">
        {/* Scrollable Sidebar Categories */}
        <div className="w-1/4 bg-gray-100 rounded-lg p-4 max-h-[600px] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Tag className="mr-2 text-blue-500" />
            Categories
          </h2>
          <nav className="space-y-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFormData(prev => ({...prev, category}))}
                className={`
                  w-full text-left p-2 rounded-lg transition-colors 
                  ${formData.category === category 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-gray-200'}
                `}
              >
                {category}
              </button>
            ))}
          </nav>
        </div>

        {/* Scrollable Form Content */}
        <form 
          onSubmit={handleSubmit} 
          className="w-3/4 bg-white shadow-md rounded-lg p-8 max-h-[600px] overflow-y-auto"
        >
          {/* Title Section */}
          <div className="mb-6">
            <label className="flex items-center mb-2 font-semibold text-gray-700">
              <Type className="mr-2 text-blue-500" />
              Listing Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter a clear, descriptive title"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Selected Category Display */}
          {formData.category && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-3">
              <p className="flex items-center">
                <Tag className="mr-2 text-green-500" />
                Selected Category: <strong className="ml-2">{formData.category}</strong>
              </p>
            </div>
          )}

          {/* Description Section */}
          <div className="mb-6">
            <label className="flex items-center mb-2 font-semibold text-gray-700">
              <Info className="mr-2 text-purple-500" />
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Provide detailed information about your listing"
              rows="4"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Price Section */}
          <div className="mb-6">
            <label className="flex items-center mb-2 font-semibold text-gray-700">
              <DollarSign className="mr-2 text-green-600" />
              Price
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Enter price"
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Location Section */}
          <div className="mb-6">
            <label className="flex items-center mb-2 font-semibold text-gray-700">
              <MapPin className="mr-2 text-red-500" />
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="City, State/Province"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Image Upload Section */}
          <div className="mb-6">
            <label className="flex items-center mb-2 font-semibold text-gray-700">
              <ImagePlus className="mr-2 text-indigo-500" />
              Upload Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-4 py-2 border rounded-lg"
            />
            
            {/* Image Preview */}
            {formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-4">
                {formData.images.map((imageUrl, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={imageUrl} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="mb-6">
            <label className="flex items-center mb-2 font-semibold text-gray-700">
              <List className="mr-2 text-orange-500" />
              Contact Email
            </label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleInputChange}
              placeholder="Email for potential buyers to contact you"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition-colors flex items-center mx-auto"
            >
              <Save className="mr-2" />
              Post Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostAdd;