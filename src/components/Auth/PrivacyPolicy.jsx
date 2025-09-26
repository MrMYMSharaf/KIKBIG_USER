import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Database, 
  Eye, 
  FileText, 
  Globe, 
  User 
} from 'lucide-react';

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    {
      id: 'overview',
      title: 'Overview',
      icon: <Shield className="mr-2" />,
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">Privacy Policy Overview</h2>
          <p className="mb-4">
            At our company, we are committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, 
            and safeguard your personal information.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <p className="font-semibold">
              We respect your privacy and are transparent about our data practices.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'data-collection',
      title: 'Data Collection',
      icon: <Database className="mr-2" />,
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">What Information We Collect</h2>
          <ul className="space-y-3 list-disc pl-5">
            <li>Personal Identification Information (Name, Email, Phone Number)</li>
            <li>Demographic Information</li>
            <li>Usage Data and Browsing History</li>
            <li>Device and Location Information</li>
            <li>Communication Preferences</li>
          </ul>
          <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <p>
              We only collect information necessary to provide and improve our services.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'data-usage',
      title: 'Data Usage',
      icon: <Eye className="mr-2" />,
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <Lock className="text-green-500 mr-2" />
              <span>Provide and maintain our service</span>
            </div>
            <div className="flex items-center">
              <Lock className="text-green-500 mr-2" />
              <span>Notify you about changes to our service</span>
            </div>
            <div className="flex items-center">
              <Lock className="text-green-500 mr-2" />
              <span>Allow you to participate in interactive features</span>
            </div>
            <div className="flex items-center">
              <Lock className="text-green-500 mr-2" />
              <span>Provide customer support</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'data-protection',
      title: 'Data Protection',
      icon: <Lock className="mr-2" />,
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">Data Security Measures</h2>
          <p className="mb-4">
            We implement a variety of security measures to maintain the safety of your personal information:
          </p>
          <ul className="space-y-3 list-disc pl-5">
            <li>Encryption of sensitive data</li>
            <li>Regular security audits</li>
            <li>Restricted access to personal information</li>
            <li>Secure data storage systems</li>
            <li>Compliance with industry-standard security protocols</li>
          </ul>
        </div>
      )
    },
    {
      id: 'user-rights',
      title: 'User Rights',
      icon: <User className="mr-2" />,
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Privacy Rights</h2>
          <ul className="space-y-3 list-disc pl-5">
            <li>Right to access your personal data</li>
            <li>Right to request data correction</li>
            <li>Right to request data deletion</li>
            <li>Right to object to data processing</li>
            <li>Right to data portability</li>
          </ul>
          <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4">
            <p className="font-semibold">
              You can exercise these rights by contacting our privacy team.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'contact',
      title: 'Contact Us',
      icon: <FileText className="mr-2" />,
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">Privacy Contact Information</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <div className="space-y-3">
            <p><strong>Email:</strong> privacy@classifiedplatform.com</p>
            <p><strong>Phone:</strong> +91 987-654-3210</p>
            <p><strong>Address:</strong> 456 Privacy Lane, City, Country - 654321</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Privacy Policy
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
          By continuing to use our service, you agree to this Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;