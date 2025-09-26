import React, { useState } from 'react';
import { 
  BookOpen, 
  Shield, 
  Globe, 
  Lock, 
  FileText, 
  Info, 
  CheckCircle 
} from 'lucide-react';

const TermsOfService = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    {
      id: 'overview',
      title: 'Overview',
      icon: <BookOpen className="mr-2" />,
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">Welcome to Our Platform</h2>
          <p className="mb-4">
            These Terms of Service ("Terms") govern your use of our website and services. 
            By accessing or using our platform, you agree to be bound by these Terms.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <p className="font-semibold">
              Please read these Terms carefully before using our services.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'user-rights',
      title: 'User Rights',
      icon: <Shield className="mr-2" />,
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">User Rights and Responsibilities</h2>
          <ul className="space-y-3 list-disc pl-5">
            <li>You must be at least 18 years old to use our platform</li>
            <li>You agree to provide accurate and current information</li>
            <li>You are responsible for maintaining the confidentiality of your account</li>
            <li>You have the right to terminate your account at any time</li>
            <li>You agree to use the platform for lawful purposes only</li>
          </ul>
        </div>
      )
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: <Lock className="mr-2" />,
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">Privacy and Data Protection</h2>
          <p className="mb-4">
            We are committed to protecting your personal information. Our Privacy Policy 
            outlines how we collect, use, and safeguard your data.
          </p>
          <div className="space-y-3">
            <div className="flex items-center">
              <CheckCircle className="text-green-500 mr-2" />
              <span>We collect only necessary information</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="text-green-500 mr-2" />
              <span>Your data is encrypted and securely stored</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="text-green-500 mr-2" />
              <span>We never sell your personal information</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'limitations',
      title: 'Limitations of Liability',
      icon: <Info className="mr-2" />,
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">Limitations of Liability</h2>
          <p className="mb-4">
            Our platform is provided "as is" and we do not guarantee uninterrupted or 
            error-free service. We are not liable for:
          </p>
          <ul className="space-y-3 list-disc pl-5">
            <li>Any loss of data or business interruption</li>
            <li>Indirect or consequential damages</li>
            <li>Loss of profits or revenue</li>
            <li>Any third-party content or services</li>
          </ul>
        </div>
      )
    },
    {
      id: 'compliance',
      title: 'Legal Compliance',
      icon: <Globe className="mr-2" />,
      content: (
        <div>
          <h2 className="text-2xl font-bold mb-4">Legal Compliance</h2>
          <p className="mb-4">
            Our platform adheres to local and international laws. Users are expected to 
            comply with all applicable regulations.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
            <p className="font-semibold">
              Violation of terms may result in account suspension or termination.
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
          <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
          <p className="mb-4">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <div className="space-y-3">
            <p><strong>Email:</strong> legal@classifiedplatform.com</p>
            <p><strong>Phone:</strong> +91 123-456-7890</p>
            <p><strong>Address:</strong> 123 Legal Street, City, Country - 123456</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Terms of Service
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

      {/* Final Agreement */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          By using our platform, you acknowledge that you have read, understood, 
          and agree to these Terms of Service.
        </p>
        <div className="flex justify-center mt-4">
          <button className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition-colors">
            Accept Terms
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;