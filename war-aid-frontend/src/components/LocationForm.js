import React, { useState } from 'react';

const LocationForm = () => {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const locationData = { latitude, longitude };

    // Make an API call to the backend Ballerina service
    fetch('http://localhost:8080/location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(locationData),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Location saved:', data);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Latitude:</label>
        <input type="text" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
      </div>
      <div>
        <label>Longitude:</label>
        <input type="text" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
      </div>
      <button type="submit">Save Location</button>
    </form>
  );
};

export default LocationForm;
