import React from 'react';
import OfferSlider from '../shared/card/OfferSlider';
import OfferCard from '../shared/card/OfferCard';

const Offers = () => {
  return (
      <div
          className={"grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pb-32"}
          style={{ maxHeight: 'calc(100vh - 150px)' }}
        >
                  <div className="flex flex-row">
                  <OfferSlider />
                </div>
        <div className='p-8'>
          <div className='m-4'>
          <h1 className="text-2xl font-bold">View All Offer</h1>
          </div>
          <div className=" gap-9 mx-4">
            <OfferCard />
            <OfferCard />
            <OfferCard />
            <OfferCard />
            <OfferCard />
            <OfferCard />
          </div>
        </div>
    </div>
  );
};

export default Offers;