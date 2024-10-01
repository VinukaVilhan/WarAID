import React from 'react';
import { MapPin, Upload, Info } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between flex-wrap bg-blue-700 p-6">
        <div className="flex items-center flex-shrink-0 text-white mr-6">
          <svg className="fill-current h-8 w-8 mr-2" width="54" height="54" viewBox="0 0 54 54" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.5 22.1c1.8-7.2 6.3-10.8 13.5-10.8 10.8 0 12.15 8.1 17.55 9.45 3.6.9 6.75-.45 9.45-4.05-1.8 7.2-6.3 10.8-13.5 10.8-10.8 0-12.15-8.1-17.55-9.45-3.6-.9-6.75.45-9.45 4.05zM0 38.3c1.8-7.2 6.3-10.8 13.5-10.8 10.8 0 12.15 8.1 17.55 9.45 3.6.9 6.75-.45 9.45-4.05-1.8 7.2-6.3 10.8-13.5 10.8-10.8 0-12.15-8.1-17.55-9.45-3.6-.9-6.75.45-9.45 4.05z"/>
          </svg>
          <span className="font-semibold text-xl tracking-tight">War Aid App</span>
        </div>
        <div className="block lg:hidden">
          <button className="flex items-center px-3 py-2 border rounded text-blue-200 border-blue-400 hover:text-white hover:border-white">
            <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"/></svg>
          </button>
        </div>
        <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
          <div className="text-sm lg:flex-grow">
            <a href="#" className="block mt-4 lg:inline-block lg:mt-0 text-blue-200 hover:text-white mr-4">
              Homepage
            </a>
            <a href="#" className="block mt-4 lg:inline-block lg:mt-0 text-blue-200 hover:text-white mr-4">
              Resource Locator
            </a>
            <a href="#" className="block mt-4 lg:inline-block lg:mt-0 text-blue-200 hover:text-white mr-4">
              Documentation Tool
            </a>
          </div>
          <div>
            <a href="#" className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-blue-500 hover:bg-white mt-4 lg:mt-0">Login/Signup</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
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
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Open Resource Map
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;