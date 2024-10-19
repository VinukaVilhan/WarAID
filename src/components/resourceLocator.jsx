import React, { useState, useEffect, useRef } from "react";
import ReactDOMServer from "react-dom/server";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import {
    ChevronUp,
    ChevronDown,
    HomeIcon,
    UtensilsIcon,
    Stethoscope,
    AlertCircle,
    Loader,
    Navigation,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";

function RoutingMachine({ userLocation, selectedLocation, onCloseRoute }) {
    const map = useMap();
    const [minimized, setMinimized] = useState(false);
    const routingControlRef = useRef(null);

    useEffect(() => {
        if (!userLocation || !selectedLocation) return;

        // Add custom CSS for controls
        const styleSheet = document.createElement("style");
        styleSheet.textContent = `
            .routing-controls {
                position: absolute;
                top: 10px;
                right: 10px;
                z-index: 1000;
                background: white;
                border-radius: 4px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                display: flex;
                gap: 4px;
                padding: 4px;
            }
            
            .control-button {
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: none;
                background: white;
                cursor: pointer;
                border-radius: 4px;
                font-size: 16px;
            }
            
            .control-button:hover {
                background: #f0f0f0;
            }
            
            .close-button:hover {
                background: #ff4444;
                color: white;
            }
            
            .leaflet-routing-container {
                transition: transform 0.3s ease;
            }
            
            .leaflet-routing-container.minimized {
                transform: translateY(calc(100% - 40px));
            }
        `;
        document.head.appendChild(styleSheet);

        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(userLocation.latitude, userLocation.longitude),
                L.latLng(selectedLocation.latitude, selectedLocation.longitude),
            ],
            routeWhileDragging: false,
            addWaypoints: false,
            fitSelectedRoutes: true,
            lineOptions: {
                styles: [{ color: "#6366f1", weight: 4 }],
            },
        }).addTo(map);

        routingControlRef.current = routingControl;

        // Create and add controls container
        const controlsDiv = L.DomUtil.create("div", "routing-controls");
        const minimizeButton = L.DomUtil.create(
            "button",
            "control-button minimize-button",
            controlsDiv
        );
        const closeButton = L.DomUtil.create(
            "button",
            "control-button close-button",
            controlsDiv
        );

        minimizeButton.innerHTML = "−";
        closeButton.innerHTML = "×";
        minimizeButton.title = "Minimize";
        closeButton.title = "Close";

        // Handle minimize click
        L.DomEvent.on(minimizeButton, "click", (e) => {
            L.DomEvent.stop(e);
            const container = document.querySelector(
                ".leaflet-routing-container"
            );
            if (container) {
                container.classList.toggle("minimized");
                minimizeButton.innerHTML = container.classList.contains(
                    "minimized"
                )
                    ? "+"
                    : "−";
                setMinimized(!minimized);
            }
        });

        // Handle close click
        L.DomEvent.on(closeButton, "click", (e) => {
            L.DomEvent.stop(e);
            if (routingControlRef.current) {
                map.removeControl(routingControlRef.current);
            }
            if (onCloseRoute) {
                onCloseRoute();
            }
        });

        document
            .querySelector(".leaflet-routing-container")
            .appendChild(controlsDiv);

        return () => {
            if (routingControlRef.current) {
                map.removeControl(routingControlRef.current);
            }
            styleSheet.remove();
        };
    }, [map, userLocation, selectedLocation, onCloseRoute]);

    return null;
}

function MapUpdater({ locations, userLocation }) {
    const map = useMap();

    useEffect(() => {
        const points = [...locations];
        if (userLocation) {
            points.push({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
            });
        }

        if (points.length > 0) {
            const bounds = L.latLngBounds(
                points.map((loc) => [loc.latitude, loc.longitude])
            );
            map.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 15,
                duration: 0.5,
            });
        }
    }, [locations, userLocation, map]);

    return null;
}

function ResourceLocatorComponent() {
    const [locations, setLocations] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [filter, setFilter] = useState({
        type: "",
        district: "",
        country: "",
    });
    const [isFilterVisible, setIsFilterVisible] = useState(true);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mapKey, setMapKey] = useState(0);
    const [districts, setDistricts] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const mapRef = useRef();

    useEffect(() => {
        fetchLocations();
        getUserLocation();
    }, []);

    useEffect(() => {
        applyFilter();
    }, [filter]);

    useEffect(() => {
        if (filter.country) {
            fetchDistricts(filter.country);
        } else {
            setDistricts([]);
            setFilter((prev) => ({ ...prev, district: "" }));
        }
    }, [filter.country]);

    const getUserLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setError(
                        "Unable to get your location. Please enable location services."
                    );
                }
            );
        } else {
            setError("Geolocation is not supported by your browser.");
        }
    };

    const fetchDistricts = (country) => {
        fetch(
            `http://localhost:9090/api/districts/byCountry?countryName=${country}`
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                setDistricts(data);
                setFilter((prev) => ({ ...prev, district: "" }));
            })
            .catch((error) => {
                console.error("Error fetching districts:", error);
                setError(error.message);
                setDistricts([]);
            });
    };

    const handleLocationSelect = (location) => {
        setSelectedLocation(location);
    };

    const fetchLocations = (url = "http://localhost:9090/api/locations") => {
        setLoading(true);
        fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                if (!Array.isArray(data)) {
                    throw new Error("Data is not an array");
                }
                setLocations(data);
                setFilteredLocations(data);
                setError(null);
                setMapKey((prevKey) => prevKey + 1);
            })
            .catch((error) => {
                console.error("Error fetching locations:", error);
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

    const handleCloseRoute = () => {
        setSelectedLocation(null);
    };

    const applyFilter = () => {
        let url = "http://localhost:9090/api/locations";

        if (filter.country && filter.district && filter.type) {
            url = `${url}/byCountryAndDistrictAndType?countryName=${filter.country}&districtName=${filter.district}&locationType=${filter.type}`;
        } else if (filter.country && filter.district) {
            url = `${url}/byCountryAndDistrict?countryName=${filter.country}&districtName=${filter.district}`;
        } else if (filter.country && filter.type) {
            url = `${url}/byCountryAndType?countryName=${filter.country}&locationType=${filter.type}`;
        } else if (filter.district && filter.type) {
            url = `${url}/byDistrictAndType?districtName=${filter.district}&locationType=${filter.type}`;
        } else if (filter.country) {
            url = `${url}/byCountry?countryName=${filter.country}`;
        } else if (filter.district) {
            url = `${url}/byDistrict?districtName=${filter.district}`;
        } else if (filter.type) {
            url = `${url}/byType?locationType=${filter.type}`;
        }

        fetchLocations(url);
    };

    const toggleFilterVisibility = () => {
        setIsFilterVisible(!isFilterVisible);
    };

    const getMarkerIcon = (locationType, isUserLocation) => {
        const iconSize = [32, 32];
        let bgColor, IconComponent;

        if (isUserLocation) {
            bgColor = "#8b5cf6";
            IconComponent = Navigation;
        } else {
            switch (locationType.toLowerCase()) {
                case "shelter":
                    bgColor = "#3b82f6";
                    IconComponent = HomeIcon;
                    break;
                case "food":
                    bgColor = "#22c55e";
                    IconComponent = UtensilsIcon;
                    break;
                case "medical camp":
                    bgColor = "#ef4444";
                    IconComponent = Stethoscope;
                    break;
                default:
                    bgColor = "#6b7280";
                    IconComponent = HomeIcon;
            }
        }

        const iconHtml = ReactDOMServer.renderToString(
            <div
                style={{
                    backgroundColor: bgColor,
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                }}
            >
                <IconComponent size={20} color="white" />
            </div>
        );

        return L.divIcon({
            html: iconHtml,
            className: "",
            iconSize: iconSize,
        });
    };

    return (
        <div className="relative p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
                Resource Locator Map
            </h1>

            <div
                className={`transition-all duration-300 ease-in-out ${
                    isFilterVisible ? "max-h-96" : "max-h-0"
                } overflow-hidden`}
            >
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
                        name="country"
                        value={filter.country}
                        onChange={handleFilterChange}
                        className="w-full sm:w-1/3 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
                    >
                        <option value="">Filter by Country</option>
                        <option value="Israel">Israel</option>
                        <option value="Palestine">Palestine</option>
                    </select>

                    <select
                        name="district"
                        value={filter.district}
                        onChange={handleFilterChange}
                        disabled={!filter.country}
                        className="w-full sm:w-1/3 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
                    >
                        <option value="">Filter by District</option>
                        {districts.map((district) => (
                            <option key={district} value={district}>
                                {district}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-wrap justify-center sm:justify-end space-x-4 mb-4">
                    {[
                        { type: "Shelters", color: "blue-500", Icon: HomeIcon },
                        {
                            type: "Food",
                            color: "green-500",
                            Icon: UtensilsIcon,
                        },
                        {
                            type: "Medical Camps",
                            color: "red-500",
                            Icon: Stethoscope,
                        },
                    ].map(({ type, color, Icon }) => (
                        <div
                            key={type}
                            className="flex items-center bg-white px-3 py-2 rounded-full shadow-md"
                        >
                            <div
                                className={`w-8 h-8 bg-${color} rounded-full flex items-center justify-center mr-2`}
                            >
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
                {isFilterVisible ? (
                    <ChevronUp size={24} />
                ) : (
                    <ChevronDown size={24} />
                )}
            </button>

            {error && (
                <div
                    className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md mb-6"
                    role="alert"
                >
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
                        style={{ height: "600px", width: "100%", zIndex: 1 }}
                        ref={mapRef}
                        className="rounded-lg shadow-inner"
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <MapUpdater
                            locations={filteredLocations}
                            userLocation={userLocation}
                        />

                        {userLocation && selectedLocation && (
                            <RoutingMachine
                                userLocation={userLocation}
                                selectedLocation={selectedLocation}
                                onCloseRoute={handleCloseRoute}
                            />
                        )}

                        {userLocation && (
                            <Marker
                                position={[
                                    userLocation.latitude,
                                    userLocation.longitude,
                                ]}
                                icon={getMarkerIcon("user", true)}
                            >
                                <Popup>
                                    <div className="font-sans">
                                        <h3 className="font-bold text-lg mb-2">
                                            Your Location
                                        </h3>
                                    </div>
                                </Popup>
                            </Marker>
                        )}

                        {filteredLocations.map((location) => (
                            <Marker
                                key={location.locId}
                                position={[
                                    location.latitude,
                                    location.longitude,
                                ]}
                                icon={getMarkerIcon(location.locationType)}
                            >
                                <Popup>
                                    <div className="font-sans">
                                        <h3 className="font-bold text-lg mb-2">
                                            {location.locationType}
                                        </h3>
                                        <p className="text-gray-600">
                                            District: {location.districtName}
                                        </p>
                                        <p className="text-gray-600">
                                            Country: {location.countryName}
                                        </p>
                                        {userLocation && (
                                            <button
                                                onClick={() =>
                                                    handleLocationSelect(
                                                        location
                                                    )
                                                }
                                                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                            >
                                                Show Route
                                            </button>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            ) : (
                <div
                    className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow-md mb-6"
                    role="alert"
                >
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

export default ResourceLocatorComponent;
