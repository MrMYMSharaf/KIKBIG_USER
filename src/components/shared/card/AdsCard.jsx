import { Link } from "react-router-dom";
import React  from 'react';

const AdsCard = ({ layout,title ,description,image ,id}) => {
  
  const cardClass = layout === 'grid'
    ? 'relative flex flex-col sm:flex-col md:flex-col lg:flex-col xl:flex-col bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700'
    : 'relative flex flex-col sm:flex-row bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700';

  const imgClass = layout === 'grid'
    ? 'object-cover w-full h-48 sm:h-48 md:h-48 lg:h-48 xl:h-48 rounded-t-lg sm:rounded-t-lg md:rounded-t-lg lg:rounded-t-lg xl:rounded-t-lg'
    : 'object-cover w-full h-48 sm:w-48 sm:h-full md:h-full md:w-48 lg:h-full lg:w-48 xl:h-full xl:w-48 rounded-t-lg sm:rounded-none sm:rounded-l-lg md:rounded-none md:rounded-l-lg lg:rounded-none lg:rounded-l-lg xl:rounded-none xl:rounded-l-lg';

  return (
    <div className={cardClass}>
      <div className="relative">
        <a href="#" className="flex-shrink-0">
          <img className={imgClass} src={image} alt="Ad" />
        </a>
        {/* Heart icon button */}
        <button className="absolute top-2 right-2 bg-white bg-opacity-50 text-gray-700 rounded-full p-1 hover:text-red-500 hover:bg-gray-100 transition-all">
          <i className="fa-regular fa-heart"></i>
        </button>
      </div>
      <div className="p-5 flex flex-col justify-between leading-normal">
        <a href="#">
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {title.length > 52 ? title.slice(0, 52) + '...' : title}
            </h5>
        </a>
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
        {description.length > 100 ? description.slice(0, 100) + '...' : description}
          </p>
        <Link to={`/AdDetailPage/${id}`} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
          Read more
          <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default AdsCard;
