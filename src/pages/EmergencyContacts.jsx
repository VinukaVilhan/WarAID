import React from "react";
import Navbar from "../components/ui/Navbar"; // If you have a Navbar component
import { PhoneCall } from "lucide-react"; // Icons from lucide-react

const EmergencyContacts = () => {
    const contacts = [
        {
            title: "Rescue Services",
            numbers: ["+123 456 7890", "+098 765 4321"],
        },
        { title: "Ambulance", numbers: ["+111 222 3333", "+444 555 6666"] },
        { title: "Fire Department", numbers: ["+777 888 9999"] },
        { title: "Police", numbers: ["+101 102 1030"] },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">
                    Emergency Contacts
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contacts.map((contact, index) => (
                        <div
                            key={index}
                            className="bg-white shadow-lg rounded-lg p-6 transition-transform transform hover:scale-105"
                        >
                            <div className="flex items-center mb-4">
                                <PhoneCall className="text-red-500 h-8 w-8 mr-2" />
                                <h3 className="text-xl font-semibold text-gray-800">
                                    {contact.title}
                                </h3>
                            </div>
                            <ul className="text-gray-700">
                                {contact.numbers.map((number, i) => (
                                    <li key={i} className="mb-2 text-lg">
                                        <a
                                            href={`tel:${number.replace(
                                                /\s+/g,
                                                ""
                                            )}`} // Creates a clickable link
                                            className="text-blue-600 hover:underline"
                                        >
                                            {number}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EmergencyContacts;
