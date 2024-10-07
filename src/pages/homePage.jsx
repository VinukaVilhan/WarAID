import React from 'react';
import { MapPin, Upload, Info, Newspaper } from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import NewsComponent from '../components/newsComponent';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar/>

      <div className="container mx-auto px-4 py-8">
        {/* About Us Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">About Us</h2>
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Info className="text-blue-500 mr-2" />
              <h3 className="text-xl font-semibold">What We Do</h3>
            </div>
            <p className="text-gray-700">
              Our war aid application provides crucial support in times of conflict. We offer tools for documentation, resource location, and connecting those in need with available aid.
            </p>
          </div>
        </section>

        {/* Documentation Tool Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Documentation Tool</h2>
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Upload className="text-green-500 mr-2" />
              <h3 className="text-xl font-semibold">Upload and Document</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Users can easily upload and document events using various media types:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-100 p-4 rounded">
                <h4 className="font-semibold mb-2">Voice Recordings</h4>
                <p className="text-sm">Capture audio testimonies and reports</p>
              </div>
              <div className="bg-gray-100 p-4 rounded">
                <h4 className="font-semibold mb-2">Images</h4>
                <p className="text-sm">Upload photos for visual documentation</p>
              </div>
              <div className="bg-gray-100 p-4 rounded">
                <h4 className="font-semibold mb-2">Text</h4>
                <p className="text-sm">Submit written accounts and information</p>
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
          <h2 className="text-3xl font-bold mb-4">Resource Locator</h2>
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center mb-4">
              <MapPin className="text-red-500 mr-2" />
              <h3 className="text-xl font-semibold">Find Nearby Resources</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Our real-time map displays crucial resources in your area:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-100 p-4 rounded">
                <h4 className="font-semibold mb-2">Medicine</h4>
                <p className="text-sm">Locate medical supplies and facilities</p>
              </div>
              <div className="bg-gray-100 p-4 rounded">
                <h4 className="font-semibold mb-2">Shelter</h4>
                <p className="text-sm">Find safe places to stay</p>
              </div>
              <div className="bg-gray-100 p-4 rounded">
                <h4 className="font-semibold mb-2">Food</h4>
                <p className="text-sm">Discover food distribution points</p>
              </div>
            </div>
            <div className="mt-6">
            <Link to="/ResourceLocator">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Resource Locator
              </button>
            </Link>
            </div>
          </div>
        </section>

        {/* News Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Latest News</h2>
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Newspaper className="text-blue-500 mr-2" />
              <h3 className="text-xl font-semibold">Conflict Updates</h3>
            </div>
            <NewsComponent />
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;