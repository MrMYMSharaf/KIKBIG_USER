import React, { useState } from 'react';
import { 
  MapPin, 
  DollarSign, 
  User, 
  Calendar, 
  MessageCircle, 
  Share2, 
  Heart,
  ArrowRight
} from 'lucide-react';

const AdDetailPage = () => {
  // Mock listing data (typically would come from API/backend)
  const [listing] = useState({
    id: 'AD-12345',
    title: 'Vintage Leather Sofa - Excellent Condition',
    description: 'Beautiful vintage leather sofa in perfect condition. Professionally cleaned and maintained. Comes from a smoke-free, pet-free home. Measurements: 84" wide x 36" deep x 32" high. Minor wear consistent with age, but no significant damage. Perfect for a classic living room or study.',
    price: 650,
    location: 'Seattle, WA',
    seller: {
      name: 'Emily Johnson',
      joinDate: 'March 2022',
      totalListings: 16
    },
    category: 'Furniture',
    postedDate: 'December 15, 2024',
    images: [
      'https://i.ikman-st.com/apple-iphone-12-california-used-for-sale-colombo-45/3fbc2bba-d582-4046-9c6a-49c1fb3f8c7a/620/466/fitted.jpg',
      'https://i.ikman-st.com/apple-iphone-12-california-used-for-sale-colombo-45/c4975d9f-7638-4a65-bafc-72c8ba4b7042/620/466/fitted.jpg',
      'https://i.ikman-st.com/apple-iphone-12-california-used-for-sale-colombo-45/2049201b-81a6-41f3-b204-06355cd9fac2/620/466/fitted.jpg',
      'https://i.ikman-st.com/apple-iphone-12-california-used-for-sale-colombo-45/21bf8e96-9472-4ece-ac5d-1692f6161876/620/466/fitted.jpg'
    ],
    contactEmail: 'emily.furniture@example.com'
  });

  // Similar Ads Mock Data
  const [similarAds] = useState([
    {
      id: 'AD-12346',
      title: 'Modern Leather Armchair',
      price: 350,
      image: 'https://i.ikman-st.com/aiwa-75led-smart-4k-tv-for-sale-nuwara-eliya/f6de25ee-fefd-4164-b192-ecaf5b9dc4e9/620/466/fitted.jpg'
    },
    {
      id: 'AD-12347',
      title: 'Vintage Coffee Table',
      price: 250,
      image: 'https://i.ikman-st.com/used-abans-55-smart-led-uhd-tv-55a6100f-for-sale-nuwara-eliya/e1f3d521-0720-40a9-81ef-21a4b6153c4c/620/466/fitted.jpg'
    },
    {
      id: 'AD-12348',
      title: 'Antique Wooden Desk',
      price: 450,
      image: 'https://i.ikman-st.com/anker-soundcore-life-q30-upgraded-anc-bluetooth-headphones-for-sale-colombo-3/dd0b8003-5c3a-409d-886a-d67d07e7f04b/780/585/fitted.jpg'
    },
    {
      id: 'AD-12349',
      title: 'Mid-Century Bookshelf',
      price: 200,
      image: 'https://i.ikman-st.com/hp-e27-g4-fhd-27-inch-freamless-monitor-for-sale-colombo/6bb7678f-b28f-4f52-beeb-f1903d494cc7/620/466/fitted.jpg'
    }
  ]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      (prev + 1) % listing.images.length
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? listing.images.length - 1 : prev - 1
    );
  };

  const handleContactSeller = () => {
    window.location.href = `mailto:${listing.contactEmail}`;
  };

  return (
    <div
    className={"grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pb-32"}
    style={{ maxHeight: 'calc(100vh - 150px)' }}
  >
    <div className="container mx-auto px-4 py-8">
       
        <div className="grid md:grid-cols-2 gap-8">
        {/* Main Content - 2 Columns */}
        <div className="md:col-span-2 space-y-8">
          {/* Listing Details Section */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="relative">
              <div className="overflow-hidden rounded-lg shadow-lg">
                <img 
                  src={listing.images[currentImageIndex]} 
                  alt={`Listing image ${currentImageIndex + 1}`}
                  className="w-full h-[500px] object-cover"
                />
              </div>
              
              {/* Image Navigation */}
              <div className="flex justify-between absolute top-1/2 w-full px-4">
                <button 
                  onClick={handlePrevImage}
                  className="bg-white/50 p-2 rounded-full"
                >
                  ←
                </button>
                <button 
                  onClick={handleNextImage}
                  className="bg-white/50 p-2 rounded-full"
                >
                  →
                </button>
              </div>

              {/* Thumbnail Preview */}
              <div className="flex space-x-2 mt-4 justify-center">
                {listing.images.map((img, index) => (
                  <img 
                    key={index}
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`
                      w-16 h-16 object-cover rounded-lg cursor-pointer
                      ${index === currentImageIndex ? 'border-2 border-blue-500' : 'opacity-60'}
                    `}
                  />
                ))}
              </div>
            </div>

            {/* Listing Information */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">{listing.title}</h1>
                <button 
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`
                    p-2 rounded-full transition-colors
                    ${isFavorite 
                      ? 'bg-red-100 text-red-500' 
                      : 'bg-gray-100 text-gray-500'}
                  `}
                >
                  <Heart 
                    className={`
                      ${isFavorite ? 'fill-current' : ''}
                    `} 
                  />
                </button>
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="text-green-500" />
                  <span className="text-2xl font-semibold">{listing.price.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="text-red-500" />
                  <span>{listing.location}</span>
                </div>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <h3 className="font-semibold mb-2">Description</h3>
                <p>{listing.description}</p>
              </div>

              {/* Seller Information */}
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold mb-2 flex items-center">
                  <User className="mr-2 text-blue-500" />
                  Seller Details
                </h3>
                <div className="space-y-2">
                  <p className="flex items-center">
                    <span className="font-medium mr-2">Name:</span> 
                    {listing.seller.name}
                  </p>
                  <p className="flex items-center">
                    <Calendar className="mr-2 text-gray-500" />
                    Joined: {listing.seller.joinDate}
                  </p>
                  <p>
                    Total Listings: {listing.seller.totalListings}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button 
                  onClick={handleContactSeller}
                  className="flex-grow bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                >
                  <MessageCircle className="mr-2" />
                  Contact Seller
                </button>
                <button 
                  className="bg-gray-200 p-3 rounded-lg"
                  onClick={() => {/* Share functionality */}}
                >
                  <Share2 />
                </button>
              </div>
            </div>
          </div>

          {/* Google Ads Section */}
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
            <ins 
              className="adsbygoogle"
              style={{display: 'block'}}
              data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
              data-ad-slot="XXXXXXXXXX"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
            <script>
              (adsbygoogle = window.adsbygoogle || []).push({});
            </script>
          </div>
        </div>

        {/* Sidebar - Similar Ads and Additional Content */}
        <div className="md:col-span-1 space-y-6">
  <div className="bg-white shadow-md rounded-lg p-4">
    <h2 className="text-xl font-semibold mb-4 flex items-center">
      Similar Ads 
      <ArrowRight className="ml-2 text-blue-500" />
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {similarAds.map((ad) => (
        <div 
          key={ad.id} 
          className="flex flex-col items-center space-y-4 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <img 
            src={ad.image} 
            alt={ad.title} 
            className="w-32 h-32 object-cover rounded-lg"
          />
          <div>
            <h3 className="font-medium">{ad.title}</h3>
            <p className="text-green-600 font-semibold">
              ${ad.price.toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Additional Google Ads */}
  <div className="bg-gray-100 p-4 rounded-lg text-center">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
    <ins 
      className="adsbygoogle"
      style={{display: 'block'}}
      data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
      data-ad-slot="XXXXXXXXXX"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
    <script>
      (adsbygoogle = window.adsbygoogle || []).push({});
    </script>
  </div>
</div>

      </div>
        </div>
     
    </div>
  );
};

export default AdDetailPage;