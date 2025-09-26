import React from 'react';

const Choose = ({ handleChoose, handleClose }) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-2xl font-bold">Choose what you want to post</h2>
      <div className="flex space-x-4">
        <button
          className="px-6 py-3 bg-green-400 rounded-lg text-white font-semibold"
          onClick={() => handleChoose('Ads')}
        >
          Ads
        </button>
        <button
          className="px-6 py-3 bg-blue-400 rounded-lg text-white font-semibold"
          onClick={() => handleChoose('Need')}
        >
          Need
        </button>
        <button
          className="px-6 py-3 bg-purple-400 rounded-lg text-white font-semibold"
          onClick={() => handleChoose('Offer')}
        >
          Offer
        </button>
      </div>
      <button className="mt-6 text-gray-600 underline" onClick={handleClose}>
        Cancel
      </button>
    </div>
  );
};

export default Choose;
