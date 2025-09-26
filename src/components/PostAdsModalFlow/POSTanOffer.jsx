import React from 'react'

const POSTanOffer = ({ onBack, onNext }) => {
  return (
    <div className="flex flex-col space-y-4 w-full max-w-md">
        <h2 className="text-xl font-bold">Post an Offer</h2>
        <input
          type="text"
          placeholder="Offer Title"
          className="border p-2 rounded"
        />
        <textarea placeholder="Offer Description" className="border p-2 rounded" />
        <div className="flex justify-between">
          <button onClick={onBack} className="px-4 py-2 bg-gray-300 rounded">
            Back
          </button>
          <button
            onClick={onNext}
            className="px-4 py-2 bg-green-400 text-white rounded"
          >
            Next
          </button>
        </div>
      </div>
  )
}

export default POSTanOffer
