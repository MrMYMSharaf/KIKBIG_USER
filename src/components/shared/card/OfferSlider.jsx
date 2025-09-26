import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const offerData = [
  {
    title: 'Summer Mega Sale',
    description: 'Get up to 50% off on selected items!',
    discount: '50%',
    imageUrl: 'https://www.shutterstock.com/image-vector/summer-mega-sale-background-abstract-260nw-1347161726.jpg'  // Using placeholder for demo
  },
  {
    title: 'Holiday Special',
    description: 'Exclusive deals for the festive season',
    discount: '40%',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZA6y82WSrBBbxRR3ToQDSJMy_xOWKyKRxhg&s'
  },
  {
    title: 'New Arrivals Bonanza',
    description: 'Fresh collections with amazing discounts',
    discount: '30%',
    imageUrl: 'https://global.bonanzasatrangi.com/cdn/shop/collections/new-arrivals_1_d4c146bd-4a1a-4907-b9cb-7881392d803a.jpg?v=1604457494'
  },
  {
    title: 'Clearance Sale',
    description: 'Crazy deals you cant miss!',
    discount: '60%',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7n-xJ77CjWHJiOa228EhB4IDmCL3ntJSA5w&s'
  },
  {
    title: 'Weekend Specials',
    description: 'Limited time offers just for you',
    discount: '25%',
    imageUrl: 'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/weekend-specials-restaurant-menu-design-template-94e91e288d3d04052cab5fbaced9f0f5_screen.jpg?ts=1585796702'
  }
];

const OfferSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef(null);

  const handleNext = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % offerData.length);
      setTimeout(() => setIsTransitioning(false), 100);
    }
  };

  const handlePrev = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prevIndex) => (prevIndex - 1 + offerData.length) % offerData.length);
      setTimeout(() => setIsTransitioning(false), 100);
    }
  };

  useEffect(() => {
    if (!isHovered) {
      intervalRef.current = setInterval(handleNext, 1000); // Increased interval for better readability
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovered]);

  const getSlideStyle = (offer) => {
    const isActive = offer === offerData[currentIndex];
    return {
      opacity: isActive ? 1 : 0,
      transition: 'opacity 0.4s ease-in-out',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1), rgba(0, 0, 0, 0.2)), 
                       url(${offer.imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      padding: '2rem',
    };
  };

  return (
    <div 
      className="relative w-full py-12 bg-gradient-to-r from-blue-50 to-indigo-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="relative group">
          <div className="rounded-2xl shadow-lg overflow-hidden relative h-[500px] bg-white">
            {offerData.map((offer, index) => (
              <div
                key={index}
                style={getSlideStyle(offer)}
                className="rounded-2xl"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 max-w-xl shadow-lg">
                  <div className="flex items-center mb-2">
                    <Star className="w-6 h-6 text-yellow-500 mr-2" fill="currentColor" />
                    <h2 className="text-3xl font-bold tracking-tight text-gray-800">
                      {offer.title}
                    </h2>
                  </div>
                  <p className="text-xl mb-4 text-gray-600">
                    {offer.description}
                  </p>
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-3 rounded-full inline-block text-lg font-bold shadow-md">
                    Up to {offer.discount} Off
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={handlePrev}
            disabled={isTransitioning}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 
              bg-white hover:bg-gray-50 
              rounded-full p-3 shadow-lg transition-all duration-300 
              opacity-0 group-hover:opacity-100 disabled:opacity-50"
          >
            <ChevronLeft className="text-gray-800 w-8 h-8" />
          </button>
          
          <button 
            onClick={handleNext}
            disabled={isTransitioning}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 
              bg-white hover:bg-gray-50
              rounded-full p-3 shadow-lg transition-all duration-300 
              opacity-0 group-hover:opacity-100 disabled:opacity-50"
          >
            <ChevronRight className="text-gray-800 w-8 h-8" />
          </button>

          <div className="flex justify-center mt-4 space-x-2">
            {offerData.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isTransitioning) {
                    setIsTransitioning(true);
                    setCurrentIndex(index);
                    setTimeout(() => setIsTransitioning(false), 400);
                  }
                }}
                disabled={isTransitioning}
                className={`h-3 rounded-full transition-all duration-300 
                  ${index === currentIndex 
                    ? 'bg-blue-500 w-8' 
                    : 'bg-blue-200 w-3 hover:bg-blue-300'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferSlider;