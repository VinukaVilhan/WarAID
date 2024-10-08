import React from 'react';
import Navbar from '../components/ui/Navbar'; // If you have a Navbar component
import { PhoneCall } from 'lucide-react'; // Icons from lucide-react

const EmergencyContacts = () => {
  const contacts = [
    { title: 'Rescue Services', numbers: ['+123 456 7890', '+098 765 4321'] },
    { title: 'Ambulance', numbers: ['+111 222 3333', '+444 555 6666'] },
    { title: 'Fire Department', numbers: ['+777 888 9999'] },
    { title: 'Police', numbers: ['+101 102 1030'] },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-4">Emergency Contacts</h2>

        {contacts.map((contact, index) => (
          <div key={index} className="bg-white shadow-md rounded-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <PhoneCall className="text-red-500 mr-2" />
              <h3 className="text-xl font-semibold">{contact.title}</h3>
            </div>
            <ul className="text-gray-700">
              {contact.numbers.map((number, i) => (
                <li key={i} className="mb-2">
                  {number}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmergencyContacts;
