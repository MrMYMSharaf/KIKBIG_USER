import React from "react";

const LocationSelect = ({
  formData,
  locationOptions,
  countries,
  getLocationName,
  onChange,
}) => {
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-lg">Location</h3>

      {/* Country */}
      <div>
        <label className="block text-sm font-medium mb-1">Country</label>
        <select
          name="country"
          value={formData.country}
          onChange={onChange}
          className="border p-2 rounded w-full"
        >
          <option value="">Select Country</option>
          {countries.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Region */}
      {locationOptions.regions.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">Region</label>
          <select
            name="region"
            value={formData.region}
            onChange={onChange}
            className="border p-2 rounded w-full"
          >
            <option value="">Select Region</option>
            {locationOptions.regions.map((region) => (
              <option key={region._id} value={region._id}>
                {getLocationName(region, "region_name")}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* State */}
      {locationOptions.states.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">State</label>
          <select
            name="state"
            value={formData.state}
            onChange={onChange}
            className="border p-2 rounded w-full"
          >
            <option value="">Select State</option>
            {locationOptions.states.map((state) => (
              <option key={state._id} value={state._id}>
                {getLocationName(state, "states")}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Continue with province, district, county, etc. same pattern... */}
    </div>
  );
};

export default LocationSelect;
