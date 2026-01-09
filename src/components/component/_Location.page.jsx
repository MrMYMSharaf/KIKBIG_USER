import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';

const LocationSelect = ({ 
  geoLocations, 
  selectedLocation, 
  onChange,
  className = "" 
}) => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [selectedSubDistrict, setSelectedSubDistrict] = useState(null);
  const [selectedLocalUnit, setSelectedLocalUnit] = useState(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState(null);
  const [selectedTown, setSelectedTown] = useState(null);

  // Available options for each level
  const [regions, setRegions] = useState([]);
  const [states, setStates] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [counties, setCounties] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  const [localUnits, setLocalUnits] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [towns, setTowns] = useState([]);
  const [villages, setVillages] = useState([]);

  // Reset all child selections
  const resetChildSelections = (fromLevel) => {
    const levels = [
      'region', 'state', 'province', 'district', 'county', 
      'subDistrict', 'localUnit', 'municipality', 'town', 'village'
    ];
    const fromIndex = levels.indexOf(fromLevel);
    
    if (fromIndex >= 0) {
      if (fromIndex <= levels.indexOf('region')) {
        setSelectedRegion(null);
        setStates([]);
      }
      if (fromIndex <= levels.indexOf('state')) {
        setSelectedState(null);
        setProvinces([]);
      }
      if (fromIndex <= levels.indexOf('province')) {
        setSelectedProvince(null);
        setDistricts([]);
      }
      if (fromIndex <= levels.indexOf('district')) {
        setSelectedDistrict(null);
        setCounties([]);
      }
      if (fromIndex <= levels.indexOf('county')) {
        setSelectedCounty(null);
        setSubDistricts([]);
      }
      if (fromIndex <= levels.indexOf('subDistrict')) {
        setSelectedSubDistrict(null);
        setLocalUnits([]);
      }
      if (fromIndex <= levels.indexOf('localUnit')) {
        setSelectedLocalUnit(null);
        setMunicipalities([]);
      }
      if (fromIndex <= levels.indexOf('municipality')) {
        setSelectedMunicipality(null);
        setTowns([]);
      }
      if (fromIndex <= levels.indexOf('town')) {
        setSelectedTown(null);
        setVillages([]);
      }
    }
  };

  // Handle country selection
  const handleCountryChange = (e) => {
    const countryId = e.target.value;
    const country = geoLocations?.find(c => c._id === countryId);
    
    setSelectedCountry(country);
    resetChildSelections('region');
    
    if (country?.children) {
      setRegions(country.children);
    } else {
      setRegions([]);
    }

    // ✅ FIX: Send null for all unselected fields instead of undefined
    onChange({
      country: countryId || null,
      countryName: country?.name || null,
      region: null,
      regionName: null,
      state: null,
      stateName: null,
      province: null,
      provinceName: null,
      district: null,
      districtName: null,
      county: null,
      countyName: null,
      subDistrict: null,
      subDistrictName: null,
      localUnit: null,
      localUnitName: null,
      municipality: null,
      municipalityName: null,
      town: null,
      townName: null,
      village: null,
      villageName: null,
    });
  };

  // Handle region selection
  const handleRegionChange = (e) => {
    const regionId = e.target.value;
    const region = regions.find(r => r._id === regionId);
    
    setSelectedRegion(region);
    resetChildSelections('state');
    
    if (region?.children) {
      setStates(region.children);
    } else {
      setStates([]);
    }

    onChange({
      country: selectedCountry?._id || null,
      countryName: selectedCountry?.name || null,
      region: regionId || null,
      regionName: region?.region_name || null,
      state: null,
      stateName: null,
      province: null,
      provinceName: null,
      district: null,
      districtName: null,
      county: null,
      countyName: null,
      subDistrict: null,
      subDistrictName: null,
      localUnit: null,
      localUnitName: null,
      municipality: null,
      municipalityName: null,
      town: null,
      townName: null,
      village: null,
      villageName: null,
    });
  };

  // Handle state selection
  const handleStateChange = (e) => {
    const stateId = e.target.value;
    const state = states.find(s => s._id === stateId);
    
    setSelectedState(state);
    resetChildSelections('province');
    
    if (state?.children) {
      setProvinces(state.children);
    } else {
      setProvinces([]);
    }

    onChange({
      country: selectedCountry?._id || null,
      countryName: selectedCountry?.name || null,
      region: selectedRegion?._id || null,
      regionName: selectedRegion?.region_name || null,
      state: stateId || null,
      stateName: state?.states || null,
      province: null,
      provinceName: null,
      district: null,
      districtName: null,
      county: null,
      countyName: null,
      subDistrict: null,
      subDistrictName: null,
      localUnit: null,
      localUnitName: null,
      municipality: null,
      municipalityName: null,
      town: null,
      townName: null,
      village: null,
      villageName: null,
    });
  };

  // Handle province selection
  const handleProvinceChange = (e) => {
    const provinceId = e.target.value;
    const province = provinces.find(p => p._id === provinceId);
    
    setSelectedProvince(province);
    resetChildSelections('district');
    
    if (province?.children) {
      setDistricts(province.children);
    } else {
      setDistricts([]);
    }

    onChange({
      country: selectedCountry?._id || null,
      countryName: selectedCountry?.name || null,
      region: selectedRegion?._id || null,
      regionName: selectedRegion?.region_name || null,
      state: selectedState?._id || null,
      stateName: selectedState?.states || null,
      province: provinceId || null,
      provinceName: province?.provinces || null,
      district: null,
      districtName: null,
      county: null,
      countyName: null,
      subDistrict: null,
      subDistrictName: null,
      localUnit: null,
      localUnitName: null,
      municipality: null,
      municipalityName: null,
      town: null,
      townName: null,
      village: null,
      villageName: null,
    });
  };

  // Handle district selection
  const handleDistrictChange = (e) => {
    const districtId = e.target.value;
    const district = districts.find(d => d._id === districtId);
    
    setSelectedDistrict(district);
    resetChildSelections('county');
    
    if (district?.children) {
      setCounties(district.children);
    } else {
      setCounties([]);
    }

    onChange({
      country: selectedCountry?._id || null,
      countryName: selectedCountry?.name || null,
      region: selectedRegion?._id || null,
      regionName: selectedRegion?.region_name || null,
      state: selectedState?._id || null,
      stateName: selectedState?.states || null,
      province: selectedProvince?._id || null,
      provinceName: selectedProvince?.provinces || null,
      district: districtId || null,
      districtName: district?.districts || null,
      county: null,
      countyName: null,
      subDistrict: null,
      subDistrictName: null,
      localUnit: null,
      localUnitName: null,
      municipality: null,
      municipalityName: null,
      town: null,
      townName: null,
      village: null,
      villageName: null,
    });
  };

  // Handle county selection
  const handleCountyChange = (e) => {
    const countyId = e.target.value;
    const county = counties.find(c => c._id === countyId);
    
    setSelectedCounty(county);
    resetChildSelections('subDistrict');
    
    if (county?.children) {
      setSubDistricts(county.children);
    } else {
      setSubDistricts([]);
    }

    onChange({
      country: selectedCountry?._id || null,
      countryName: selectedCountry?.name || null,
      region: selectedRegion?._id || null,
      regionName: selectedRegion?.region_name || null,
      state: selectedState?._id || null,
      stateName: selectedState?.states || null,
      province: selectedProvince?._id || null,
      provinceName: selectedProvince?.provinces || null,
      district: selectedDistrict?._id || null,
      districtName: selectedDistrict?.districts || null,
      county: countyId || null,
      countyName: county?.counties || null,
      subDistrict: null,
      subDistrictName: null,
      localUnit: null,
      localUnitName: null,
      municipality: null,
      municipalityName: null,
      town: null,
      townName: null,
      village: null,
      villageName: null,
    });
  };

  // Handle sub-district selection
  const handleSubDistrictChange = (e) => {
    const subDistrictId = e.target.value;
    const subDistrict = subDistricts.find(sd => sd._id === subDistrictId);
    
    setSelectedSubDistrict(subDistrict);
    resetChildSelections('localUnit');
    
    if (subDistrict?.children) {
      setLocalUnits(subDistrict.children);
    } else {
      setLocalUnits([]);
    }

    onChange({
      country: selectedCountry?._id || null,
      countryName: selectedCountry?.name || null,
      region: selectedRegion?._id || null,
      regionName: selectedRegion?.region_name || null,
      state: selectedState?._id || null,
      stateName: selectedState?.states || null,
      province: selectedProvince?._id || null,
      provinceName: selectedProvince?.provinces || null,
      district: selectedDistrict?._id || null,
      districtName: selectedDistrict?.districts || null,
      county: selectedCounty?._id || null,
      countyName: selectedCounty?.counties || null,
      subDistrict: subDistrictId || null,
      subDistrictName: subDistrict?.sub_districts || null,
      localUnit: null,
      localUnitName: null,
      municipality: null,
      municipalityName: null,
      town: null,
      townName: null,
      village: null,
      villageName: null,
    });
  };

  // Handle local administrative unit selection
  const handleLocalUnitChange = (e) => {
    const localUnitId = e.target.value;
    const localUnit = localUnits.find(lu => lu._id === localUnitId);
    
    setSelectedLocalUnit(localUnit);
    resetChildSelections('municipality');
    
    if (localUnit?.children) {
      setMunicipalities(localUnit.children);
    } else {
      setMunicipalities([]);
    }

    onChange({
      country: selectedCountry?._id || null,
      countryName: selectedCountry?.name || null,
      region: selectedRegion?._id || null,
      regionName: selectedRegion?.region_name || null,
      state: selectedState?._id || null,
      stateName: selectedState?.states || null,
      province: selectedProvince?._id || null,
      provinceName: selectedProvince?.provinces || null,
      district: selectedDistrict?._id || null,
      districtName: selectedDistrict?.districts || null,
      county: selectedCounty?._id || null,
      countyName: selectedCounty?.counties || null,
      subDistrict: selectedSubDistrict?._id || null,
      subDistrictName: selectedSubDistrict?.sub_districts || null,
      localUnit: localUnitId || null,
      localUnitName: localUnit?.local_administrative_units || null,
      municipality: null,
      municipalityName: null,
      town: null,
      townName: null,
      village: null,
      villageName: null,
    });
  };

  // Handle municipality selection
  const handleMunicipalityChange = (e) => {
    const municipalityId = e.target.value;
    const municipality = municipalities.find(m => m._id === municipalityId);
    
    setSelectedMunicipality(municipality);
    resetChildSelections('town');
    
    if (municipality?.children) {
      setTowns(municipality.children);
    } else {
      setTowns([]);
    }

    onChange({
      country: selectedCountry?._id || null,
      countryName: selectedCountry?.name || null,
      region: selectedRegion?._id || null,
      regionName: selectedRegion?.region_name || null,
      state: selectedState?._id || null,
      stateName: selectedState?.states || null,
      province: selectedProvince?._id || null,
      provinceName: selectedProvince?.provinces || null,
      district: selectedDistrict?._id || null,
      districtName: selectedDistrict?.districts || null,
      county: selectedCounty?._id || null,
      countyName: selectedCounty?.counties || null,
      subDistrict: selectedSubDistrict?._id || null,
      subDistrictName: selectedSubDistrict?.sub_districts || null,
      localUnit: selectedLocalUnit?._id || null,
      localUnitName: selectedLocalUnit?.local_administrative_units || null,
      municipality: municipalityId || null,
      municipalityName: municipality?.municipalities || null,
      town: null,
      townName: null,
      village: null,
      villageName: null,
    });
  };

  // Handle town selection
  const handleTownChange = (e) => {
    const townId = e.target.value;
    const town = towns.find(t => t._id === townId);
    
    setSelectedTown(town);
    resetChildSelections('village');
    
    if (town?.children) {
      setVillages(town.children);
    } else {
      setVillages([]);
    }

    onChange({
      country: selectedCountry?._id || null,
      countryName: selectedCountry?.name || null,
      region: selectedRegion?._id || null,
      regionName: selectedRegion?.region_name || null,
      state: selectedState?._id || null,
      stateName: selectedState?.states || null,
      province: selectedProvince?._id || null,
      provinceName: selectedProvince?.provinces || null,
      district: selectedDistrict?._id || null,
      districtName: selectedDistrict?.districts || null,
      county: selectedCounty?._id || null,
      countyName: selectedCounty?.counties || null,
      subDistrict: selectedSubDistrict?._id || null,
      subDistrictName: selectedSubDistrict?.sub_districts || null,
      localUnit: selectedLocalUnit?._id || null,
      localUnitName: selectedLocalUnit?.local_administrative_units || null,
      municipality: selectedMunicipality?._id || null,
      municipalityName: selectedMunicipality?.municipalities || null,
      town: townId || null,
      townName: town?.towns || null,
      village: null,
      villageName: null,
    });
  };

  // Handle village selection
  const handleVillageChange = (e) => {
    const villageId = e.target.value;
    const village = villages.find(v => v._id === villageId);

    onChange({
      country: selectedCountry?._id || null,
      countryName: selectedCountry?.name || null,
      region: selectedRegion?._id || null,
      regionName: selectedRegion?.region_name || null,
      state: selectedState?._id || null,
      stateName: selectedState?.states || null,
      province: selectedProvince?._id || null,
      provinceName: selectedProvince?.provinces || null,
      district: selectedDistrict?._id || null,
      districtName: selectedDistrict?.districts || null,
      county: selectedCounty?._id || null,
      countyName: selectedCounty?.counties || null,
      subDistrict: selectedSubDistrict?._id || null,
      subDistrictName: selectedSubDistrict?.sub_districts || null,
      localUnit: selectedLocalUnit?._id || null,
      localUnitName: selectedLocalUnit?.local_administrative_units || null,
      municipality: selectedMunicipality?._id || null,
      municipalityName: selectedMunicipality?.municipalities || null,
      town: selectedTown?._id || null,
      townName: selectedTown?.towns || null,
      village: villageId || null,
      villageName: village?.villages || null,
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Country Selection */}
      <div>
        <label className="block text-gray-900 font-semibold mb-2">
          <MapPin className="w-4 h-4 inline mr-2" />
          Country
        </label>
        <select
          value={selectedCountry?._id || ''}
          onChange={handleCountryChange}
          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
        >
          <option value="">Select Country</option>
          {geoLocations?.map((country) => (
            <option key={country._id} value={country._id}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      {/* Region Selection */}
      {regions.length > 0 && (
        <div>
          <label className="block text-gray-900 font-semibold mb-2">Region</label>
          <select
            value={selectedRegion?._id || ''}
            onChange={handleRegionChange}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
          >
            <option value="">Select Region</option>
            {regions.map((region) => (
              <option key={region._id} value={region._id}>
                {region.region_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* State Selection */}
      {states.length > 0 && (
        <div>
          <label className="block text-gray-900 font-semibold mb-2">State</label>
          <select
            value={selectedState?._id || ''}
            onChange={handleStateChange}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state._id} value={state._id}>
                {state.states}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Province Selection */}
      {provinces.length > 0 && (
        <div>
          <label className="block text-gray-900 font-semibold mb-2">Province</label>
          <select
            value={selectedProvince?._id || ''}
            onChange={handleProvinceChange}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
          >
            <option value="">Select Province</option>
            {provinces.map((province) => (
              <option key={province._id} value={province._id}>
                {province.provinces}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* District Selection */}
      {districts.length > 0 && (
        <div>
          <label className="block text-gray-900 font-semibold mb-2">District</label>
          <select
            value={selectedDistrict?._id || ''}
            onChange={handleDistrictChange}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
          >
            <option value="">Select District</option>
            {districts.map((district) => (
              <option key={district._id} value={district._id}>
                {district.districts}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* County Selection */}
      {counties.length > 0 && (
        <div>
          <label className="block text-gray-900 font-semibold mb-2">County</label>
          <select
            value={selectedCounty?._id || ''}
            onChange={handleCountyChange}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
          >
            <option value="">Select County</option>
            {counties.map((county) => (
              <option key={county._id} value={county._id}>
                {county.counties}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Sub-District Selection */}
      {subDistricts.length > 0 && (
        <div>
          <label className="block text-gray-900 font-semibold mb-2">Sub-District</label>
          <select
            value={selectedSubDistrict?._id || ''}
            onChange={handleSubDistrictChange}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
          >
            <option value="">Select Sub-District</option>
            {subDistricts.map((subDistrict) => (
              <option key={subDistrict._id} value={subDistrict._id}>
                {subDistrict.sub_districts}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Local Administrative Unit Selection */}
      {localUnits.length > 0 && (
        <div>
          <label className="block text-gray-900 font-semibold mb-2">Local Admin Unit</label>
          <select
            value={selectedLocalUnit?._id || ''}
            onChange={handleLocalUnitChange}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
          >
            <option value="">Select Local Admin Unit</option>
            {localUnits.map((localUnit) => (
              <option key={localUnit._id} value={localUnit._id}>
                {localUnit.local_administrative_units}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Municipality Selection */}
      {municipalities.length > 0 && (
        <div>
          <label className="block text-gray-900 font-semibold mb-2">Municipality</label>
          <select
            value={selectedMunicipality?._id || ''}
            onChange={handleMunicipalityChange}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
          >
            <option value="">Select Municipality</option>
            {municipalities.map((municipality) => (
              <option key={municipality._id} value={municipality._id}>
                {municipality.municipalities}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Town Selection */}
      {towns.length > 0 && (
        <div>
          <label className="block text-gray-900 font-semibold mb-2">Town</label>
          <select
            value={selectedTown?._id || ''}
            onChange={handleTownChange}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
          >
            <option value="">Select Town</option>
            {towns.map((town) => (
              <option key={town._id} value={town._id}>
                {town.towns}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Village Selection */}
      {villages.length > 0 && (
        <div>
          <label className="block text-gray-900 font-semibold mb-2">Village</label>
          <select
            value={selectedLocation?.village || ''}
            onChange={handleVillageChange}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:border-[#00008F] transition-all"
          >
            <option value="">Select Village</option>
            {villages.map((village) => (
              <option key={village._id} value={village._id}>
                {village.villages}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default LocationSelect;