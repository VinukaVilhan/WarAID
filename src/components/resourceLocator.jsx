import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { ChevronUp, ChevronDown } from 'lucide-react';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet/dist/leaflet.css';

function ResourceLocatorPage() {
    const [locations, setLocations] = useState([]);
    const [filter, setFilter] = useState({ type: '', district: '' });
    const [isFilterVisible, setIsFilterVisible] = useState(true);
    const mapRef = useRef();

    useEffect(() => {
        fetch('http://localhost:9090/api/locations')
            .then(response => response.json())
            .then(data => setLocations(data))
            .catch(error => console.error('Error fetching locations:', error));
    }, []);

    const handleFilterChange = (e) => {
        setFilter({ ...filter, [e.target.name]: e.target.value });
    };

    const applyFilter = () => {
        let url = 'http://localhost:9090/api/locations';

        if (filter.type) {
            url = `http://localhost:9090/api/locations/byType?locationType=${filter.type}`;
        } else if (filter.district) {
            url = `http://localhost:9090/api/locations/byDistrict?districtName=${filter.district}`;
        }

        fetch(url)
            .then(response => response.json())
            .then(data => setLocations(data))
            .catch(error => console.error('Error applying filter:', error));
    };

    useEffect(() => {
        if (locations.length > 0) {
            const bounds = L.latLngBounds(locations.map(loc => [loc.latitude, loc.longitude]));
            mapRef.current?.fitBounds(bounds);
        }
    }, [locations]);

    const toggleFilterVisibility = () => {
        setIsFilterVisible(!isFilterVisible);
    };

    return (
        <div className="relative">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Resource Locator Map</h1>
            
            {/* Collapsible Filter Section */}
            <div className={`transition-all duration-300 ease-in-out ${isFilterVisible ? 'max-h-96' : 'max-h-0'} overflow-hidden`}>
                <div className="bg-white p-4 shadow-md rounded-md flex items-center space-x-4 mb-6">
                    <select
                        name="type"
                        value={filter.type}
                        onChange={handleFilterChange}
                        className="w-1/3 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Filter by Type</option>
                        <option value="Medical Camp">Medical Camp</option>
                        <option value="shelter">Shelter</option>
                        <option value="food">Food</option>
                    </select>

                    <select
                        name="district"
                        value={filter.district}
                        onChange={handleFilterChange}
                        className="w-1/3 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Filter by District</option>
                        <option value="Colombo">Colombo</option>
                        <option value="Galle">Galle</option>
                    </select>

                    <button
                        onClick={applyFilter}
                        className="p-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Apply Filter
                    </button>
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={toggleFilterVisibility}
                className="absolute top-0 right-0 p-2 bg-gray-200 text-gray-600 rounded-full shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
                {isFilterVisible ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>

            {/* Map rendering */}
            <MapContainer
                center={[51.505, -0.09]}
                zoom={13}
                style={{ height: '600px', width: '100%' }}
                ref={mapRef}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {locations.map((location) => (
                    <Marker key={location.locId} position={[location.latitude, location.longitude]}>
                        <Popup>
                            <strong>{location.locationType}</strong><br />
                            District: {location.districtName}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}

export default ResourceLocatorPage;