import React, { useState, useEffect } from 'react';
import { Map, Marker } from 'pigeon-maps';
import { MapPin, Globe } from 'lucide-react';

const LocationSelect = ({ 
  countries = [], 
  locationOptions = {},
  locationValues = {},
  onChange 
}) => {
  // Default position: Sri Lanka
  const [selectedPosition, setSelectedPosition] = useState([7.8731, 80.7718]);
  const [zoom, setZoom] = useState(7);

  // 🔥 FIX: Update marker and zoom when dropdown selection changes
  // Remove locationOptions from dependencies to prevent infinite loop
  useEffect(() => {
    const levels = [
      'region', 'state', 'province', 'district', 'county',
      'subDistrict', 'localAdministrativeUnit', 'municipality', 'town', 'village'
    ];

    for (const level of levels) {
      const options = locationOptions[level + 's'] || [];
      const selected = options.find(o => o._id === locationValues[level]);
      if (selected && selected.Latitude && selected.Longitude) {
        setSelectedPosition([selected.Latitude, selected.Longitude]);
        setZoom(12); // Zoom in when a location is selected
        return;
      }
    }

    // If nothing selected, reset to default
    setSelectedPosition([7.8731, 80.7718]);
    setZoom(7);
  }, [
    // 🔥 FIX: Only depend on the actual values, not the entire locationOptions object
    locationValues.region,
    locationValues.state,
    locationValues.province,
    locationValues.district,
    locationValues.county,
    locationValues.subDistrict,
    locationValues.localAdministrativeUnit,
    locationValues.municipality,
    locationValues.town,
    locationValues.village,
  ]); // 🔥 Removed locationOptions from dependencies

  // Map click handler
  const handleMapClick = ({ lat, lng }) => {
    setSelectedPosition([lat, lng]);
    onChange({
      target: { name: 'mapClick', value: { Latitude: lat, Longitude: lng } }
    });
  };

  // Get location name based on level
  const getLocationName = (location, level) => {
    if (!location) return "Unnamed Location";
    const fieldMap = {
      region: 'region_name',
      state: 'states', 
      province: 'provinces',
      district: 'districts',
      county: 'counties',
      subDistrict: 'sub_districts',
      localAdministrativeUnit: 'local_administrative_units',
      municipality: 'municipalities', 
      town: 'towns',
      village: 'villages'
    };
    const fieldName = fieldMap[level];
    return location[fieldName] || location.name || "Unnamed Location";
  };

  // Define location levels
  const locationLevels = [
    { key: 'region', label: 'Region', optionsKey: 'regions' },
    { key: 'state', label: 'State', optionsKey: 'states' },
    { key: 'province', label: 'Province', optionsKey: 'provinces' },
    { key: 'district', label: 'District', optionsKey: 'districts' },
    { key: 'county', label: 'County', optionsKey: 'counties' },
    { key: 'subDistrict', label: 'Sub District', optionsKey: 'subDistricts' },
    { key: 'localAdministrativeUnit', label: 'Local Administrative Unit', optionsKey: 'localAdministrativeUnits' },
    { key: 'municipality', label: 'Municipality', optionsKey: 'municipalities' },
    { key: 'town', label: 'Town', optionsKey: 'towns' },
    { key: 'village', label: 'Village', optionsKey: 'villages' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-3xl">
      {/* Left Side - Dropdowns */}
      <div className="space-y-4 order-2 lg:order-1">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-600" />
            Select Location
          </h2>
          <p className="text-sm text-gray-600">Choose your location from the dropdowns or click on the map</p>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {/* Country */}
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-800">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                <Globe className="w-4 h-4 text-white" />
              </div>
              Country <span className="text-red-500">*</span>
            </label>
            <select
              name="country"
              value={locationValues.country || ''}
              onChange={onChange}
              className="w-full px-4 py-3.5 text-sm bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-gray-900 cursor-pointer hover:border-blue-300 hover:shadow-md shadow-sm font-medium"
            >
              <option value="">Select Country</option>
              {countries.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name || "Unnamed Country"}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic location dropdowns */}
          {locationLevels.map(level => {
            const options = locationOptions[level.optionsKey] || [];
            if (!options || options.length === 0) return null;

            return (
              <div key={level.key} className="group animate-fadeIn">
                <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-800">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  {level.label}
                </label>
                <select
                  name={level.key}
                  value={locationValues[level.key] || ''}
                  onChange={onChange}
                  className="w-full px-4 py-3.5 text-sm bg-white border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 text-gray-900 cursor-pointer hover:border-purple-300 hover:shadow-md shadow-sm font-medium"
                >
                  <option value="">Select {level.label}</option>
                  {options.map(item => (
                    <option key={item._id} value={item._id}>
                      {getLocationName(item, level.key)}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Side - Map */}
      <div className="relative order-1 lg:order-2">
        <div className="sticky top-6">
          <div className="absolute -top-4 -left-4 w-20 h-20 bg-blue-200 rounded-full blur-3xl opacity-60 animate-pulse"></div>
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-purple-200 rounded-full blur-3xl opacity-60 animate-pulse" style={{animationDelay: '1s'}}></div>
          
          <div className="relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-sm font-bold rounded-full shadow-2xl z-10 flex items-center gap-2 animate-bounce">
              <MapPin className="w-4 h-4" />
              Interactive Map
            </div>
            
            <div className="h-[600px] w-full rounded-3xl shadow-2xl overflow-hidden border-4 border-white ring-4 ring-blue-100 transition-all duration-500 hover:ring-purple-200 hover:shadow-blue-200/50">
              <Map
                height={600}
                center={selectedPosition}
                zoom={zoom} 
                onClick={handleMapClick}
                metaWheelZoom={false}
                metaWheelLabel={false}
              >
                <Marker width={50} anchor={selectedPosition} />
              </Map>
            </div>
            
            <div className="mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold">Tip:</span>
                <span>Click anywhere on the map to set a precise location</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LocationSelect;