import React, { useState } from 'react';
import { 
  Info, 
  Database, 
  ShieldCheck, 
  Users, 
  List, 
  ClipboardList 
} from 'lucide-react';

const NoticeAtCollection = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    {
      id: 'overview',
      title: 'Overview',
      icon: <Info className="mr-2" />,
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">Notice at Collection</h2>
          <p className="mb-4">
            This Notice at Collection is provided to inform you about the personal information 
            we collect and how it will be used, in compliance with California Consumer Privacy Act (CCPA).
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <p className="font-semibold">
              We are committed to transparency about our data collection practices.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'categories',
      title: 'Categories of Information',
      icon: <Database className="mr-2" />,
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">Categories of Personal Information Collected</h2>
          <ul className="space-y-3 list-disc pl-5">
            <li>
              <strong>Identifiers:</strong> Name, email address, phone number, account username
            </li>
            <li>
              <strong>Personal Records:</strong> Contact information, education, employment history
            </li>
            <li>
              <strong>Protected Classifications:</strong> Age, gender (where applicable)
            </li>
            <li>
              <strong>Commercial Information:</strong> Transaction history, purchase preferences
            </li>
            <li>
              <strong>Online Activity:</strong> Browsing history, interaction with our website
            </li>
            <li>
              <strong>Geolocation Data:</strong> IP address, general location information
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'purposes',
      title: 'Purpose of Collection',
      icon: <ClipboardList className="mr-2" />,
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">Purposes of Information Collection</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <ShieldCheck className="text-green-500 mr-2" />
              <span>Provide and maintain our services</span>
            </div>
            <div className="flex items-center">
              <ShieldCheck className="text-green-500 mr-2" />
              <span>Process transactions and payments</span>
            </div>
            <div className="flex items-center">
              <ShieldCheck className="text-green-500 mr-2" />
              <span>Communicate with you about our services</span>
            </div>
            <div className="flex items-center">
              <ShieldCheck className="text-green-500 mr-2" />
              <span>Improve user experience</span>
            </div>
            <div className="flex items-center">
              <ShieldCheck className="text-green-500 mr-2" />
              <span>Detect and prevent fraud</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'rights',
      title: 'Your Rights',
      icon: <Users className="mr-2" />,
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Privacy Rights</h2>
          <ul className="space-y-3 list-disc pl-5">
            <li>
              <strong>Right to Know:</strong> Request details of personal information collected
            </li>
            <li>
              <strong>Right to Delete:</strong> Request deletion of your personal information
            </li>
            <li>
              <strong>Right to Opt-Out:</strong> Opt-out of sale or sharing of personal information
            </li>
            <li>
              <strong>Right to Non-Discrimination:</strong> Exercise these rights without discrimination
            </li>
            <li>
              <strong>Right to Correct:</strong> Request correction of inaccurate personal information
            </li>
          </ul>
          <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <p className="font-semibold">
              To exercise these rights, please contact our privacy team.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'sources',
      title: 'Sources of Information',
      icon: <List className="mr-2" />,
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">Sources of Personal Information</h2>
          <ul className="space-y-3 list-disc pl-5">
            <li>Directly from you when you create an account or use our services</li>
            <li>Automatically through your interactions with our website or app</li>
            <li>From third-party service providers</li>
            <li>Public databases and social media platforms (with your consent)</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </div>
      )
    },
    {
      id: 'contact',
      title: 'Contact Information',
      icon: <ShieldCheck className="mr-2" />,
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">Contact Our Privacy Team</h2>
          <div className="space-y-3">
            <p><strong>Privacy Contact Email:</strong> privacy@classifiedplatform.com</p>
            <p><strong>Phone:</strong> +1 (555) 123-4567</p>
            <p><strong>Mailing Address:</strong> Privacy Compliance Department, 
              123 Data Protection Way, Privacy City, ST 12345</p>
            <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="font-semibold">
                We are available to address any privacy-related questions or concerns.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Notice at Collection
      </h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="md:w-1/4 bg-gray-100 rounded-lg p-4 h-fit">
          <nav className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  w-full flex items-center p-3 rounded-lg transition-colors 
                  ${activeSection === section.id 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-gray-200'}
                `}
              >
                {section.icon}
                {section.title}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Section */}
        <div className="md:w-3/4 bg-white shadow-md rounded-lg p-6">
          {sections.find(section => section.id === activeSection)?.content}
        </div>
      </div>

      {/* Final Acknowledgement */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Last Updated: December 2024
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Effective Date of Current Notice: December 17, 2024
        </p>
      </div>
    </div>
  );
};

export default NoticeAtCollection;