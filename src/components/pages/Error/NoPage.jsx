import React from 'react';
import robot from '../../../assets/Error/error-404-not-found .png'
import logo from '../../../assets/logo/Pedlar_logo.png'

const NoPage = () => {
  return (
    <div className="bg-gray-100 h-full p-8">
      <div>
        <img src={logo} alt="Pedlar Logo" className="w-48" />
      </div>
      <div className="flex relative">
        <div className="mr-8">
          <h1 className="text-4xl font-bold text-gray-800">404. That’s an error.</h1>
          <p className="text-lg text-gray-600 mt-2">
            The requested URL was not found on this server. That’s all we know.
          </p>
        </div>
        <div >
          <img src={robot} alt="Robot Image" className="w-96 md:w-64 relative md:absolute md:top-[-10rem]" />
        </div>
      </div>
    </div>
  );
};

export default NoPage;
