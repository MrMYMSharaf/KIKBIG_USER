import React, { useState } from 'react';
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  BookOpen, 
  FileQuestion, 
  Users 
} from 'lucide-react';

const Support = () => {
  const [activeTab, setActiveTab] = useState('faq');

  const supportTabs = [
    { 
      id: 'faq', 
      icon: <FileQuestion className="mr-2" />, 
      label: 'Frequently Asked Questions' 
    },
    { 
      id: 'contact', 
      icon: <MessageCircle className="mr-2" />, 
      label: 'Contact Support' 
    },
    { 
      id: 'guides', 
      icon: <BookOpen className="mr-2" />, 
      label: 'User Guides' 
    }
  ];

  const faqs = [
    {
      question: 'How do I create an account?',
      answer: 'You can create an account by clicking on the "Sign Up" button on the top right corner of the website. Fill in your details and verify your email address.'
    },
    {
      question: 'How can I post an advertisement?',
      answer: 'Navigate to the "Post Ad" section, select your category, fill in the required details, upload images, and submit your listing.'
    },
    {
      question: 'Is my personal information safe?',
      answer: 'We take user privacy seriously. Your personal information is encrypted and protected according to the latest security standards.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept multiple payment methods including credit/debit cards, net banking, and digital wallets.'
    },
    {
      question: 'How long does it take to approve my ad?',
      answer: 'Ad approval typically takes 24-48 hours after submission. You will receive an email notification once your ad is approved.'
    },
    {
      question: 'Can I edit my posted advertisement?',
      answer: 'Yes, you can edit your advertisement from your dashboard. Simply go to "My Ads" and select the ad you wish to modify.'
    },
    {
      question: 'What are the charges for posting an ad?',
      answer: 'Basic listings are free. We offer premium listing options with additional features for a nominal fee.'
    },
    {
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page, enter your registered email, and follow the instructions sent to your email.'
    }
  ];

  const contactMethods = [
    {
      icon: <Mail className="text-blue-600 w-12 h-12" />,
      title: 'Email Support',
      details: 'support@classifiedwebsite.com',
      description: 'Email us for any queries or support requests'
    },
    {
      icon: <Phone className="text-green-600 w-12 h-12" />,
      title: 'Phone Support',
      details: '+91 123-456-7890',
      description: 'Available Monday-Saturday, 9 AM to 6 PM'
    },
    {
      icon: <Users className="text-purple-600 w-12 h-12" />,
      title: 'Community Support',
      details: 'Community Forum',
      description: 'Connect with other users and get help'
    }
  ];

  const renderFAQSection = () => (
    <div className="space-y-4 h-[500px] overflow-y-auto pr-4 custom-scrollbar">
      <h2 className="text-2xl font-bold mb-4 flex items-center sticky top-0 bg-white z-10">
        <HelpCircle className="mr-3 text-blue-600" /> Frequently Asked Questions
      </h2>
      {faqs.map((faq, index) => (
        <div key={index} className="border-b pb-4">
          <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
          <p className="text-gray-600">{faq.answer}</p>
        </div>
      ))}
    </div>
  );

  const renderContactSection = () => (
    <div className="h-[500px] overflow-y-auto custom-scrollbar">
      <h2 className="text-2xl font-bold mb-4 flex items-center sticky top-0 bg-white z-10">
        <MessageCircle className="mr-3 text-green-600" /> Contact Support
      </h2>
      <div className="grid md:grid-cols-3 gap-4">
        {contactMethods.map((method, index) => (
          <div 
            key={index} 
            className="border rounded-lg p-4 text-center hover:shadow-md transition-shadow"
          >
            <div className="flex justify-center mb-3">{method.icon}</div>
            <h3 className="font-semibold text-lg">{method.title}</h3>
            <p className="text-gray-600">{method.details}</p>
            <p className="text-sm text-gray-500 mt-2">{method.description}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGuidesSection = () => (
    <div className="h-[500px] overflow-y-auto custom-scrollbar">
      <h2 className="text-2xl font-bold mb-4 flex items-center sticky top-0 bg-white z-10">
        <BookOpen className="mr-3 text-purple-600" /> User Guides
      </h2>
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Getting Started Guide</h3>
          <p>A comprehensive guide to help you navigate our platform and make the most of its features.</p>
          <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Download Guide
          </button>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Posting Advertisements</h3>
          <p>Step-by-step instructions on how to create and manage your listings effectively.</p>
          <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Download Guide
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div
    className={"grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pb-32"}
    style={{ maxHeight: 'calc(100vh - 150px)' }}
  >
    <div className="container  mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center">Help & Support</h1>
        <p className="text-center text-gray-600 mt-2">
          We're here to help you with any questions or concerns
        </p>
      </div>

      <div className="flex justify-center mb-6">
        {supportTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center px-4 py-2 mx-2 rounded-full transition-colors 
              ${activeTab === tab.id 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 relative">
        {activeTab === 'faq' && renderFAQSection()}
        {activeTab === 'contact' && renderContactSection()}
        {activeTab === 'guides' && renderGuidesSection()}
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
    </div>
  );
};

export default Support;