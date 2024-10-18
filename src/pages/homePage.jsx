import React from "react";
import { MapPin, Upload, Info, Newspaper, AlertTriangle } from "lucide-react";
import Navbar from "../components/ui/Navbar";
import NewsComponent from "../components/newsComponent";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faExclamationCircle,
    faSearch,
    faLifeRing,
    faMicrophone,
    faCamera,
    faFileAlt,
    faMedkit,
    faHome,
    faUtensils,
    faFirstAid,
    faNewspaper,
    faMapMarkedAlt,
    faFolderOpen,
    faHeart,
} from "@fortawesome/free-solid-svg-icons";

const HomePage = () => {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <header className="flex justify-center p-4 bg-white rounded-lg mt-4">
                <div className="flex justify-center space-x-4 bg-white rounded-lg">
                    <Link
                        to="/EmergencyContacts"
                        aria-label="Emergency Contacts"
                    >
                        <button className="flex items-center bg-red-600 hover:bg-red-800 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition duration-300 ease-in-out">
                            <FontAwesomeIcon
                                icon={faExclamationCircle}
                                className="mr-2"
                            />
                            SOS
                        </button>
                    </Link>
                    <Link to="/ResourceLocator" aria-label="Find Resources">
                        <button className="flex items-center bg-blue-600 hover:bg-blue-800 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition duration-300 ease-in-out">
                            <FontAwesomeIcon icon={faSearch} className="mr-2" />
                            Find Resources
                        </button>
                    </Link>
                </div>
            </header>

            <main className="px-4">
                {/* Latest Conflict Updates Section */}
                <section className="mb-12 bg-white w-full text-black p-6">
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
                </section>

                {/* Emergency Documentation Tool Section */}
                <section className="mb-16 bg-gray-100 w-full text-center py-12">
                    <h2 className="text-4xl font-extrabold text-gray-800 mb-6">
                        Emergency Documentation Tool
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                        In times of crisis, it’s vital to document the events
                        around you. Our platform allows you to quickly and
                        securely upload evidence through various methods:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Voice Recordings */}
                        <div className="p-6">
                            <div className="flex items-center justify-center mb-4">
                                <FontAwesomeIcon
                                    icon={faMicrophone}
                                    className="text-green-500 h-6 w-6 mr-3"
                                />
                                <h4 className="text-xl font-semibold text-gray-800">
                                    Voice Recordings
                                </h4>
                            </div>
                            <p className="text-gray-600">
                                Share spoken testimonies to report situations on
                                the ground with ease.
                            </p>
                        </div>
                        {/* Images */}
                        <div className="p-6">
                            <div className="flex items-center justify-center mb-4">
                                <FontAwesomeIcon
                                    icon={faCamera}
                                    className="text-blue-500 h-6 w-6 mr-3"
                                />
                                <h4 className="text-xl font-semibold text-gray-800">
                                    Images
                                </h4>
                            </div>
                            <p className="text-gray-600">
                                Upload photos to visually capture important
                                moments and evidence.
                            </p>
                        </div>
                        {/* Text Reports */}
                        <div className="p-6">
                            <div className="flex items-center justify-center mb-4">
                                <FontAwesomeIcon
                                    icon={faFileAlt}
                                    className="text-yellow-500 h-6 w-6 mr-3"
                                />
                                <h4 className="text-xl font-semibold text-gray-800">
                                    Text Reports
                                </h4>
                            </div>
                            <p className="text-gray-600">
                                Submit detailed written accounts for accurate
                                and thorough documentation.
                            </p>
                        </div>
                    </div>
                    <div className="mt-10">
                        <Link
                            to="/Documentation"
                            aria-label="Open Documentation Tool"
                        >
                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105">
                                Open Documentation Tool
                            </button>
                        </Link>
                    </div>
                </section>

                {/* Emergency Resource Locator Section */}
                <section className="mb-16 bg-white w-full text-center py-12">
                    <h2 className="text-4xl font-extrabold text-gray-800 mb-6">
                        Emergency Resource Locator
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                        Our platform connects you with essential resources
                        during emergencies. Access vital information regarding:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Medical Help */}
                        <div className="p-6">
                            <div className="flex items-center justify-center mb-4">
                                <FontAwesomeIcon
                                    icon={faMedkit}
                                    className="text-red-500 h-6 w-6 mr-3"
                                />
                                <h4 className="text-xl font-semibold text-gray-800">
                                    Medical Help
                                </h4>
                            </div>
                            <p className="text-gray-600">
                                Locate hospitals, clinics, and medical
                                assistance near you.
                            </p>
                        </div>
                        {/* Food Sources */}
                        <div className="p-6">
                            <div className="flex items-center justify-center mb-4">
                                <FontAwesomeIcon
                                    icon={faUtensils}
                                    className="text-orange-500 h-6 w-6 mr-3"
                                />
                                <h4 className="text-xl font-semibold text-gray-800">
                                    Food Sources
                                </h4>
                            </div>
                            <p className="text-gray-600">
                                Find food distribution centers and essential
                                supplies nearby.
                            </p>
                        </div>
                        {/* Shelters */}
                        <div className="p-6">
                            <div className="flex items-center justify-center mb-4">
                                <FontAwesomeIcon
                                    icon={faHome}
                                    className="text-purple-500 h-6 w-6 mr-3"
                                />
                                <h4 className="text-xl font-semibold text-gray-800">
                                    Shelters
                                </h4>
                            </div>
                            <p className="text-gray-600">
                                Identify safe shelter locations for you and your
                                loved ones.
                            </p>
                        </div>
                    </div>
                    <div className="mt-10">
                        <Link
                            to="/ResourceLocator"
                            aria-label="Open Resource Locator"
                        >
                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105">
                                Open Resource Locator
                            </button>
                        </Link>
                    </div>
                </section>

                <section className="bg-gray-100 py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                            How to Prepare for Emergencies
                        </h2>
                        <p className="text-lg text-gray-600 mb-12 text-center">
                            Stay safe during conflicts by being prepared. Follow
                            these steps to ensure your safety and your family's
                            well-being.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {/* Card 1 */}
                            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
                                <div className="flex items-center space-x-4 mb-4">
                                    <FontAwesomeIcon
                                        icon={faFirstAid}
                                        className="h-12 w-12 text-blue-600"
                                    />
                                    <h3 className="text-xl font-semibold text-blue-600">
                                        Pack an Emergency Kit
                                    </h3>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Prepare a kit with essential items such as
                                    water, food, first aid, and batteries.
                                </p>
                            </div>

                            {/* Card 2 */}
                            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
                                <div className="flex items-center space-x-4 mb-4">
                                    <FontAwesomeIcon
                                        icon={faHome}
                                        className="h-12 w-12 text-blue-600"
                                    />
                                    <h3 className="text-xl font-semibold text-blue-600">
                                        Know Safe Shelters
                                    </h3>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Identify the nearest shelters or safe areas
                                    in case of emergency.
                                </p>
                            </div>

                            {/* Card 3 */}
                            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
                                <div className="flex items-center space-x-4 mb-4">
                                    <FontAwesomeIcon
                                        icon={faNewspaper}
                                        className="h-12 w-12 text-blue-600"
                                    />
                                    <h3 className="text-xl font-semibold text-blue-600">
                                        Stay Informed
                                    </h3>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Stay updated through apps, radios, or news
                                    about the situation.
                                </p>
                            </div>

                            {/* Card 4 */}
                            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
                                <div className="flex items-center space-x-4 mb-4">
                                    <FontAwesomeIcon
                                        icon={faMapMarkedAlt}
                                        className="h-12 w-12 text-blue-600"
                                    />
                                    <h3 className="text-xl font-semibold text-blue-600">
                                        Have an Evacuation Plan
                                    </h3>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Create a plan for quick evacuation and
                                    ensure family knows the meeting point.
                                </p>
                            </div>

                            {/* Card 5 */}
                            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
                                <div className="flex items-center space-x-4 mb-4">
                                    <FontAwesomeIcon
                                        icon={faFolderOpen}
                                        className="h-12 w-12 text-blue-600"
                                    />
                                    <h3 className="text-xl font-semibold text-blue-600">
                                        Protect Important Documents
                                    </h3>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Keep IDs, medical records, and documents in
                                    a waterproof, portable bag.
                                </p>
                            </div>

                            {/* Card 6 */}
                            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
                                <div className="flex items-center space-x-4 mb-4">
                                    <FontAwesomeIcon
                                        icon={faHeart}
                                        className="h-12 w-12 text-blue-600"
                                    />
                                    <h3 className="text-xl font-semibold text-blue-600">
                                        Mental Health Support
                                    </h3>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Know where to find emotional and mental
                                    health support services.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-gray-800 text-white py-8 text-center">
                <p>&copy; 2024 WarAID. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default HomePage;
