import React, { useState, useEffect } from 'react';
import { MapPin, Trash2 } from 'lucide-react';

function AdminResourceComponent() {
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [locationType, setLocationType] = useState('');
  const [districtName, setDistrictName] = useState('');
  const [countryName, setCountryName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [locations, setLocations] = useState([]);

  // District mappings by country
  const districtsByCountry = {
    'Israel': [
      'Tel Aviv',
      'Jerusalem',
      'Haifa',
      'Beersheba',
      'Netanya'
    ],
    'Palestine': [
      'Gaza',
      'Ramallah',
      'Nablus',
      'Hebron',
      'Bethlehem',
      'Jericho'
    ]
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Reset district when country changes
  useEffect(() => {
    setDistrictName('');
  }, [countryName]);

  const fetchLocations = async () => {
    try {
      const response = await fetch('http://localhost:9090/api/locations');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError('Failed to fetch locations. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const resourceData = {
      longitude: parseFloat(longitude),
      latitude: parseFloat(latitude),
      locationType,
      districtName,
      countryName
    };

    try {
      const response = await fetch('http://localhost:9090/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(resourceData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Resource added:', result);
      setMessage('Resource added successfully!');
      
      // Reset form after submission
      setLongitude('');
      setLatitude('');
      setLocationType('');
      setDistrictName('');
      setCountryName('');
      
      // Refresh the locations list
      fetchLocations();
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error adding resource:', error);
      setError('Failed to add resource. Please try again.');
    }
  };

  const handleDelete = async (locId) => {
    try {
      const response = await fetch(`http://localhost:9090/api/locations/${locId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setMessage('Location deleted successfully!');
      fetchLocations();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting location:', error);
      setError('Failed to delete location. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center mb-6">
              <MapPin className="w-6 h-6 text-blue-500 mr-2" />
              Add Resource Location
            </h1>
            {message && (
              <div className="mb-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
                {message}
              </div>
            )}
            {error && (
              <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  id="latitude"
                  name="latitude"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  id="longitude"
                  name="longitude"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="location type" className="block text-sm font-medium text-gray-700">
                  Location Type
                </label>
                <select
                  id="locationType"
                  name="locationType"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value)}
                  required
                >
                  <option value="">Select the location type</option>
                  <option value="Medical camp">Medical Camp</option>
                  <option value="Shelter">Shelter</option>
                  <option value="Food">Food</option>
                </select>
              </div>

              <div>
                <label htmlFor="countryName" className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <select
                  id="countryName"
                  name="countryName"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={countryName}
                  onChange={(e) => setCountryName(e.target.value)}
                  required
                >
                  <option value="">Select the Country</option>
                  <option value="Israel">Israel</option>
                  <option value="Palestine">Palestine</option>
                </select>
              </div>

              <div>
                <label htmlFor="district name" className="block text-sm font-medium text-gray-700">
                  District 
                </label>
                <select
                  id="districtName"
                  name="districtName"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={districtName}
                  onChange={(e) => setDistrictName(e.target.value)}
                  required
                  disabled={!countryName}
                >
                  <option value="">Select the district name</option>
                  {countryName && districtsByCountry[countryName].map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Resource
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Existing Locations</h2>
            {locations.length > 0 ? (
              <div className="space-y-4">
                {locations.map((location) => (
                  <div key={location.locId} className="flex justify-between items-center border-b border-gray-200 pb-4">
                    <div>
                      <p className="text-lg font-medium text-gray-900">{location.locationType} in {location.districtName}</p>
                      <p className="text-sm text-gray-600">Longitude: {location.longitude}, Latitude: {location.latitude}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(location.locId)}
                      className="flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No locations found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminResourceComponent;