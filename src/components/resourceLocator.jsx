import React, { useState, useEffect, useRef } from 'react';
import ReactDOMServer from 'react-dom/server';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ChevronUp, ChevronDown, HomeIcon, UtensilsIcon, Stethoscope, AlertCircle, Loader } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

function ResourceLocatorPage() {
    const [locations, setLocations] = useState([]);
    const [filter, setFilter] = useState({ type: '', district: '' });
    const [isFilterVisible, setIsFilterVisible] = useState(true);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const mapRef = useRef();

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = (url = 'http://localhost:9090/api/locations') => {
        setLoading(true);
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
            })
            .finally(() => {
                setLoading(false);
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

    const toggleFilterVisibility = () => {
        setIsFilterVisible(!isFilterVisible);
    };

    const getMarkerIcon = (locationType) => {
        const iconSize = [32, 32];
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
            case 'medical camp':
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
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
                <IconComponent size={20} color="white" />
            </div>
        );

        return L.divIcon({
            html: iconHtml,
            className: '',
            iconSize: iconSize
        });
    };

    // New component to handle map updates
    function MapUpdater({ locations }) {
        const map = useMap();
    
        useEffect(() => {
            if (locations.length > 0) {
                const bounds = L.latLngBounds(locations.map(loc => [loc.latitude, loc.longitude]));
                map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 15, duration: 0.5 });
            }
        }, [locations, map]);
    
        return null;
    }

    return (
        <div className="relative p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Resource Locator Map</h1>

            <div className={`transition-all duration-300 ease-in-out ${isFilterVisible ? 'max-h-96' : 'max-h-0'} overflow-hidden`}>
                <div className="bg-white p-6 shadow-lg rounded-lg flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                    <select
                        name="type"
                        value={filter.type}
                        onChange={handleFilterChange}
                        className="w-full sm:w-1/3 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
                    >
                        <option value="">Filter by Type</option>
                        <option value="medical camp">Medical Camp</option>
                        <option value="shelter">Shelter</option>
                        <option value="food">Food</option>
                    </select>

                    <select
                        name="district"
                        value={filter.district}
                        onChange={handleFilterChange}
                        className="w-full sm:w-1/3 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
                    >
                        <option value="">Filter by District</option>
                        <option value="Colombo">Colombo</option>
                        <option value="Galle">Galle</option>
                    </select>

                    <button
                        onClick={applyFilter}
                        className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                    >
                        Apply Filter
                    </button>
                </div>

                <div className="flex flex-wrap justify-center sm:justify-end space-x-4 mb-4">
                    {[
                        { type: 'Shelters', color: 'blue-500', Icon: HomeIcon },
                        { type: 'Food', color: 'green-500', Icon: UtensilsIcon },
                        { type: 'Medical Camps', color: 'red-500', Icon: Stethoscope },
                    ].map(({ type, color, Icon }) => (
                        <div key={type} className="flex items-center bg-white px-3 py-2 rounded-full shadow-md">
                            <div className={`w-8 h-8 bg-${color} rounded-full flex items-center justify-center mr-2`}>
                                <Icon size={20} color="white" />
                            </div>
                            <span className="text-sm font-medium">{type}</span>
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={toggleFilterVisibility}
                className="absolute top-6 right-6 p-2 bg-white text-gray-600 rounded-full shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out"
                aria-label={isFilterVisible ? "Hide filters" : "Show filters"}
            >
                {isFilterVisible ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md mb-6" role="alert">
                    <div className="flex items-center">
                        <AlertCircle className="mr-2" size={24} />
                        <div>
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-96">
                    <Loader className="animate-spin text-blue-500" size={48} />
                </div>
            ) : locations.length > 0 ? (
                <div className="bg-white p-4 rounded-lg shadow-lg">
                    <MapContainer
                        center={[7.8731, 80.7718]} // Center of Sri Lanka
                        zoom={8}
                        style={{ height: '600px', width: '100%' }}
                        ref={mapRef}
                        className="rounded-lg shadow-inner"
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <MapUpdater locations={locations} />
                        {locations.map((location) => (
                            <Marker
                                key={location.locId}
                                position={[location.latitude, location.longitude]}
                                icon={getMarkerIcon(location.locationType)}
                            >
                                <Popup>
                                    <div className="font-sans">
                                        <h3 className="font-bold text-lg mb-2">{location.locationType}</h3>
                                        <p className="text-gray-600">District: {location.districtName}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            ) : (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow-md mb-6" role="alert">
                    <div className="flex items-center">
                        <AlertCircle className="mr-2" size={24} />
                        <div>
                            <p className="font-bold">No locations found</p>
                            <p>Please try a different filter combination.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ResourceLocatorPage;