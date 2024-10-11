import React, { useState, useEffect, useRef } from 'react';
import ReactDOMServer from 'react-dom/server';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { ChevronUp, ChevronDown, HomeIcon, UtensilsIcon, Stethoscope } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

function ResourceLocatorPage() {
    const [locations, setLocations] = useState([]);
    const [filter, setFilter] = useState({ type: '', district: '' });
    const [isFilterVisible, setIsFilterVisible] = useState(true);
    const [error, setError] = useState(null);
    const mapRef = useRef();

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = (url = 'http://localhost:9090/api/locations') => {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data)) {
                    throw new Error('Data is not an array');
                }
                setLocations(data);
                setError(null);
            })
            .catch(error => {
                console.error('Error fetching locations:', error);
                setError(error.message);
                setLocations([]);
            });
    };

    const handleFilterChange = (e) => {
        setFilter({ ...filter, [e.target.name]: e.target.value });
    };

    const applyFilter = () => {
        let url = 'http://localhost:9090/api/locations';

        if (filter.type && filter.district) {
            url = `http://localhost:9090/api/locations/byDistrictAndType?districtName=${filter.district}&locationType=${filter.type}`;
        } else if (filter.type) {
            url = `http://localhost:9090/api/locations/byType?locationType=${filter.type}`;
        } else if (filter.district) {
            url = `http://localhost:9090/api/locations/byDistrict?districtName=${filter.district}`;
        }

        fetchLocations(url);
    };

    useEffect(() => {
        if (locations.length > 0 && mapRef.current) {
            const bounds = L.latLngBounds(locations.map(loc => [loc.latitude, loc.longitude]));
            mapRef.current.fitBounds(bounds);
        }
    }, [locations]);

    const toggleFilterVisibility = () => {
        setIsFilterVisible(!isFilterVisible);
    };

    const getMarkerIcon = (locationType) => {
        const iconSize = [24, 24];
        let bgColor, IconComponent;

        switch (locationType.toLowerCase()) {
            case 'shelter':
                bgColor = '#3b82f6';
                IconComponent = HomeIcon;
                break;
            case 'food':
                bgColor = '#22c55e';
                IconComponent = UtensilsIcon;
                break;
            case 'hospital':
                bgColor = '#ef4444';
                IconComponent = Stethoscope;
                break;
            default:
                bgColor = '#6b7280';
                IconComponent = HomeIcon;
        }

        const iconHtml = ReactDOMServer.renderToString(
            <div style={{
                backgroundColor: bgColor,
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <IconComponent size={16} color="white" />
            </div>
        );

        return L.divIcon({
            html: iconHtml,
            className: '',
            iconSize: iconSize
        });
    };

    return (
        <div className="relative">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Resource Locator Map</h1>

            <div className={`transition-all duration-300 ease-in-out ${isFilterVisible ? 'max-h-96' : 'max-h-0'} overflow-hidden`}>
                <div className="bg-white p-4 shadow-md rounded-md flex items-center space-x-4 mb-6">
                    <select
                        name="type"
                        value={filter.type}
                        onChange={handleFilterChange}
                        className="w-1/3 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Filter by Type</option>
                        <option value="hospital">Hospital</option>
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

                <div className="flex justify-end space-x-4 mb-4">
                    {[
                        { type: 'Shelters', color: 'blue-500', Icon: HomeIcon },
                        { type: 'Food', color: 'green-500', Icon: UtensilsIcon },
                        { type: 'Hospitals', color: 'red-500', Icon: Stethoscope },
                    ].map(({ type, color, Icon }) => (
                        <div key={type} className="flex items-center">
                            <div className={`w-6 h-6 bg-${color} rounded-full flex items-center justify-center mr-2`}>
                                <Icon size={16} color="white" />
                            </div>
                            <span>{type}</span>
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={toggleFilterVisibility}
                className="absolute top-0 right-0 p-2 bg-gray-200 text-gray-600 rounded-full shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
                {isFilterVisible ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            )}

            {locations.length > 0 ? (
                <MapContainer
                    center={[7.8731, 80.7718]} // Center of Sri Lanka
                    zoom={8}
                    style={{ height: '600px', width: '100%' }}
                    ref={mapRef}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    {locations.map((location) => (
                        <Marker
                            key={location.locId}
                            position={[location.latitude, location.longitude]}
                            icon={getMarkerIcon(location.locationType)}
                        >
                            <Popup>
                                <strong>{location.locationType}</strong><br />
                                District: {location.districtName}
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            ) : (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">No locations found.</strong>
                    <span className="block sm:inline"> Please try a different filter combination.</span>
                </div>
            )}
        </div>
    );
}

export default ResourceLocatorPage;