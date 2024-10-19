import React, { useState, useEffect, useRef } from 'react';
import ReactDOMServer from 'react-dom/server';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { HomeIcon, UtensilsIcon, Stethoscope, AlertCircle, Loader, Filter, Search } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

function ResourceLocatorPage() {
    const [locations, setLocations] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [filter, setFilter] = useState({ type: '', district: '', country: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mapKey, setMapKey] = useState(0);
    const mapRef = useRef();

    useEffect(() => {
        fetchLocations();
    }, []);

    useEffect(() => {
        applyFilterAndSearch();
    }, [filter, searchTerm]);

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
                setFilteredLocations(data);
                setError(null);
                setMapKey(prevKey => prevKey + 1);
            })
            .catch(error => {
                console.error('Error fetching locations:', error);
                setError(error.message);
                setLocations([]);
                setFilteredLocations([]);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleFilterChange = (e) => {
        setFilter({ ...filter, [e.target.name]: e.target.value });
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const applyFilterAndSearch = () => {
        let filteredResults = locations;

        // Apply filters
        if (filter.type) {
            filteredResults = filteredResults.filter(location => 
                location.locationType.toLowerCase() === filter.type.toLowerCase()
            );
        }
        if (filter.district) {
            filteredResults = filteredResults.filter(location => 
                location.districtName.toLowerCase() === filter.district.toLowerCase()
            );
        }
        if (filter.country) {
            filteredResults = filteredResults.filter(location => 
                location.countryName.toLowerCase() === filter.country.toLowerCase()
            );
        }

        // Apply search
        if (searchTerm) {
            filteredResults = filteredResults.filter(location =>
                location.locationType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                location.districtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                location.countryName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredLocations(filteredResults);
        setMapKey(prevKey => prevKey + 1);
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

    function MapUpdater({ locations }) {
        const map = useMap();

        useEffect(() => {
            if (locations.length > 0) {
                const bounds = L.latLngBounds(locations.map(loc => [loc.latitude, loc.longitude]));
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, duration: 0.5 });
            }
        }, [locations, map]);

        return null;
    }

    return (
        <div className="relative p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Resource Locator Map</h1>
                <div className="flex items-center space-x-4">
                    {[
                        { type: 'Shelters', color: 'bg-blue-500', Icon: HomeIcon },
                        { type: 'Food', color: 'bg-green-500', Icon: UtensilsIcon },
                        { type: 'Medical Camps', color: 'bg-red-500', Icon: Stethoscope },
                    ].map(({ type, color, Icon }) => (
                        <div key={type} className="flex items-center bg-white px-2 py-1 rounded-full shadow-md">
                            <div className={`w-6 h-6 ${color} rounded-full flex items-center justify-center mr-2`}>
                                <Icon size={16} color="white" />
                            </div>
                            <span className="text-xs font-medium">{type}</span>
                        </div>
                    ))}
                    <button
                        onClick={toggleFilterVisibility}
                        className="p-2 bg-white text-gray-600 rounded-full shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out"
                        aria-label={isFilterVisible ? "Hide filters" : "Show filters"}
                    >
                        <Filter size={24} />
                    </button>
                </div>
            </div>

            <div className={`bg-white p-6 shadow-lg rounded-lg mb-6 ${isFilterVisible ? '' : 'hidden'}`}>
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="relative w-full sm:w-1/3">
                        <input
                            type="text"
                            placeholder="Search locations..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full p-3 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
                        />
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    </div>
                    <select
                        name="type"
                        value={filter.type}
                        onChange={handleFilterChange}
                        className="w-full sm:w-1/5 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
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
                        className="w-full sm:w-1/5 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
                    >
                        <option value="">Filter by District</option>
                        <option value="Tel Aviv">Tel Aviv</option>
                        <option value="Jerusalem">Jerusalem</option>
                        <option value="Haifa">Haifa</option>
                        <option value="Nazareth">Nazareth</option>
                        <option value="Beersheba">Beersheba</option>
                        <option value="Netanya">Netanya</option>
                    </select>
                    <select
                        name="country"
                        value={filter.country}
                        onChange={handleFilterChange}
                        className="w-full sm:w-1/5 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
                    >
                        <option value="">Filter by Country</option>
                        <option value="Israel">Israel</option>
                        <option value="Palestine">Palestine</option>
                    </select>
                </div>
            </div>

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
            ) : filteredLocations.length > 0 ? (
                <div className="bg-white p-4 rounded-lg shadow-lg ">
                    <MapContainer
                        key={mapKey}
                        center={[31.7683, 35.2137]} // Center of Israel
                        zoom={8}
                        style={{ height: '600px', width: '100%', zIndex: 1 }}
                        ref={mapRef}
                        className="rounded-lg shadow-inner"
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <MapUpdater locations={filteredLocations} />
                        {filteredLocations.map((location) => (
                            <Marker
                                key={location.locId}
                                position={[location.latitude, location.longitude]}
                                icon={getMarkerIcon(location.locationType)}
                            >
                                <Popup>
                                    <div className="font-sans">
                                        <h3 className="font-bold text-lg mb-2">{location.locationType}</h3>
                                        <p className="text-gray-600">District: {location.districtName}</p>
                                        <p className="text-gray-600">Country: {location.countryName}</p>
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
                            <p>Please try a different search or filter combination.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ResourceLocatorPage;