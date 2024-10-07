import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from "../components/ui/Navbar";
import { MapPin, AlertTriangle } from 'lucide-react';

const ManageCard = ({ title, description, icon, link }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div className="flex items-center mb-4">
      {icon}
      <h3 className="text-xl font-semibold ml-2">{title}</h3>
    </div>
    <p className="text-gray-600 mb-4">{description}</p>
    <Link to={link} className="text-blue-500 hover:text-blue-700 font-medium">
      Go to page &rarr;
    </Link>
  </div>
);

function ManagePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Admin Management</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <ManageCard
            title="Resource Location"
            description="Add and manage locations such as medical camps, shelter camps, and food supplies."
            icon={<MapPin className="w-6 h-6 text-green-500" />}
            link="/AdminResourceLocator"
          />
          <ManageCard
            title="Alert Management"
            description="Create, update, and delete alerts for emergency situations."
            icon={<AlertTriangle className="w-6 h-6 text-red-500" />}
            link="/AdminAlert"
          />
        </div>
      </main>
    </div>
  );
}

export default ManagePage;