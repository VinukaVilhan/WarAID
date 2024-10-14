import React from "react";
import { MapPin, Upload, Info, Newspaper } from "lucide-react";
import Navbar from "../components/ui/Navbar";
import NewsComponent from "../components/newsComponent";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faExclamationCircle,
    faSearch,
    faLifeRing,
} from "@fortawesome/free-solid-svg-icons";

const HomePage = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            {/* Emergency Buttons Section */}
            <div className="flex justify-center p-4 bg-gray-100 rounded-lg mt-4">
                <div className="flex justify-center space-x-4 p-10 bg-white shadow-md rounded-lg">
                    <Link to="/EmergencyContacts">
                        <button className="flex items-center bg-red-600 hover:bg-red-800 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition duration-300 ease-in-out">
                            <FontAwesomeIcon
                                icon={faExclamationCircle}
                                className="mr-2"
                            />
                            SOS
                        </button>
                    </Link>
                    <Link to="/ResourceLocator">
                        <button className="flex items-center bg-blue-600 hover:bg-blue-800 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition duration-300 ease-in-out">
                            <FontAwesomeIcon icon={faSearch} className="mr-2" />
                            Find Resources
                        </button>
                    </Link>
                    <Link to="/ChatBot">
                        <button className="flex items-center bg-green-600 hover:bg-green-800 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition duration-300 ease-in-out">
                            <FontAwesomeIcon
                                icon={faLifeRing}
                                className="mr-2"
                            />
                            Help
                        </button>
                    </Link>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <section className="mb-12">
                    <div className="bg-white text-black p-6 rounded-lg shadow-md">
                        <div className="flex items-center mb-4">
                            <Newspaper className="text-gray-700 mr-2" />
                            <h2 className="text-4xl font-bold">
                                Latest Conflict Updates
                            </h2>
                        </div>
                        <p className="text-lg mb-6">
                            Stay informed about the latest developments,
                            humanitarian relief efforts, and safety advisories
                            during these difficult times.
                        </p>
                        <NewsComponent />
                    </div>
                </section>

                {/* About Us Section */}
                <section className="mb-12">
                    <h2 className="text-3xl font-bold mb-4">About Us</h2>
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <div className="flex items-center mb-4">
                            <Info className="text-blue-500 mr-2" />
                            <h3 className="text-xl font-semibold">
                                Our Mission
                            </h3>
                        </div>
                        <p className="text-gray-700">
                            Our war aid application is dedicated to providing
                            support to individuals affected by conflict. We help
                            document crucial events, locate essential resources
                            like food and medicine, and connect those in need
                            with lifesaving aid.
                        </p>
                    </div>
                </section>

                {/* Documentation Tool Section */}
                <section className="mb-12">
                    <h2 className="text-3xl font-bold mb-4">
                        Emergency Documentation Tool
                    </h2>
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <div className="flex items-center mb-4">
                            <Upload className="text-green-500 mr-2" />
                            <h3 className="text-xl font-semibold">
                                Document Critical Events
                            </h3>
                        </div>
                        <p className="text-gray-700 mb-4">
                            In times of crisis, it’s important to document
                            what’s happening around you. Our platform allows you
                            to quickly and securely upload evidence of events
                            through:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-100 p-4 rounded">
                                <h4 className="font-semibold mb-2">
                                    Voice Recordings
                                </h4>
                                <p className="text-sm">
                                    Share spoken testimonies to report
                                    situations on the ground.
                                </p>
                            </div>
                            <div className="bg-gray-100 p-4 rounded">
                                <h4 className="font-semibold mb-2">Images</h4>
                                <p className="text-sm">
                                    Upload photos to visually capture important
                                    moments.
                                </p>
                            </div>
                            <div className="bg-gray-100 p-4 rounded">
                                <h4 className="font-semibold mb-2">
                                    Text Reports
                                </h4>
                                <p className="text-sm">
                                    Submit written accounts for detailed
                                    documentation.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6">
                            <Link to="/Documentation">
                                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                    Open Documentation Tool
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Resource Locator Section */}
                <section className="mb-12">
                    <h2 className="text-3xl font-bold mb-4">
                        Emergency Resource Locator
                    </h2>
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <div className="flex items-center mb-4">
                            <MapPin className="text-red-500 mr-2" />
                            <h3 className="text-xl font-semibold">
                                Locate Urgent Resources
                            </h3>
                        </div>
                        <p className="text-gray-700 mb-4">
                            Use our real-time map to find life-saving resources
                            in your area:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-100 p-4 rounded">
                                <h4 className="font-semibold mb-2">
                                    Medical Supplies
                                </h4>
                                <p className="text-sm">
                                    Locate nearby hospitals, first-aid stations,
                                    and medical relief centers.
                                </p>
                            </div>
                            <div className="bg-gray-100 p-4 rounded">
                                <h4 className="font-semibold mb-2">Shelter</h4>
                                <p className="text-sm">
                                    Find safe spaces offering shelter from the
                                    conflict.
                                </p>
                            </div>
                            <div className="bg-gray-100 p-4 rounded">
                                <h4 className="font-semibold mb-2">
                                    Food and Water
                                </h4>
                                <p className="text-sm">
                                    Discover food and water distribution points
                                    near you.
                                </p>
                            </div>
                        </div>
                        <div className="mt-6">
                            <Link to="/ResourceLocator">
                                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                    Open Resource Locator
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HomePage;
