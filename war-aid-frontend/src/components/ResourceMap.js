import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const ResourceMap = () => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    // Fetch location data from the backend Ballerina service
    fetch('http://localhost:8080/locations')
      .then(response => response.json())
      .then(data => setLocations(data));
  }, []);

  return (
    <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((loc, idx) => (
        <Marker key={idx} position={[loc.latitude, loc.longitude]}>
          <Popup>
            Location {idx + 1}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default ResourceMap;
