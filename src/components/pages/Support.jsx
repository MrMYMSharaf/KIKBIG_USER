import React, { useState } from 'react';
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  BookOpen, 
  FileQuestion, 
  Users,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const Support = () => {
  const [activeTab, setActiveTab] = useState('faq');

  const supportTabs = [
    { 
      id: 'faq', 
      icon: <FileQuestion className="mr-2" />, 
      label: 'FAQ' 
    },
    { 
      id: 'safety', 
      icon: <Shield className="mr-2" />, 
      label: 'Safety' 
    },
    { 
      id: 'contact', 
      icon: <MessageCircle className="mr-2" />, 
      label: 'Contact' 
    },
    { 
      id: 'guides', 
      icon: <BookOpen className="mr-2" />, 
      label: 'Guides' 
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
      details: 'support@kikbig.com',
      description: 'Email us for any queries or support requests'
    },
    {
      icon: <Phone className="text-green-600 w-12 h-12" />,
      title: 'Phone Support',
      details: '011 2 350 350',
      description: '9am-6pm weekdays, 8am-5pm weekends'
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
      
      <div className="mt-8 bg-blue-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-3">Need Help?</h3>
        <div className="space-y-2 text-gray-700">
          <p><strong>Weekdays:</strong> 9am - 6pm</p>
          <p><strong>Weekends & Holidays:</strong> 8am - 5pm</p>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="mb-2"><strong>Call us:</strong> 011 2 350 350</p>
            <p><strong>Email us:</strong> support@kikbig.com</p>
          </div>
        </div>
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

  const renderSafetySection = () => (
    <div className="h-[500px] overflow-y-auto custom-scrollbar pr-4">
      <h2 className="text-2xl font-bold mb-4 flex items-center sticky top-0 bg-white z-10">
        <Shield className="mr-3 text-green-600" /> Stay Safe on kikbig
      </h2>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-4">
          At kikbig, we are 100% committed to making sure that your experience on our platform is as safe as possible. Here's some advice on how to stay safe while trading on kikbig.
        </p>
      </div>

      {/* General Safety Advice */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3 flex items-center">
          <CheckCircle className="mr-2 text-green-600" /> General Safety Advice
        </h3>
        <div className="space-y-3">
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
            <h4 className="font-semibold mb-1">Verify Items in Person</h4>
            <p className="text-gray-700">Always meet the seller and inspect the item thoroughly before proceeding with any payment.</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-semibold mb-1">While Applying for a Job</h4>
            <p className="text-gray-700">Research the job and the employer before you apply. Don't give out personal information before meeting the employer in person. Avoid going to remote locations for an interview.</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
            <h4 className="font-semibold mb-1">Exchange Item and Payment at the Same Time</h4>
            <p className="text-gray-700">Buyers: don't make any payments before receiving an item. Sellers: don't send an item before receiving payment.</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
            <h4 className="font-semibold mb-1">Use Common Sense</h4>
            <p className="text-gray-700">Avoid anything that appears too good to be true, such as unrealistically low prices and promises of quick money.</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
            <h4 className="font-semibold mb-1">Never Give Out Financial Information</h4>
            <p className="text-gray-700">This includes bank account details, eBay/PayPal info, and any other information that could be misused.</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
            <h4 className="font-semibold mb-1">Use kikbig Safe Buy</h4>
            <p className="text-gray-700">Use kikbig Safe Buy for ultimate protection when you're buying electronics. Your money is kept safe until you've confirmed that you have received your item.</p>
          </div>
        </div>
      </div>

      {/* Scams and Frauds */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3 flex items-center">
          <AlertTriangle className="mr-2 text-red-600" /> Scams and Frauds to Watch Out For
        </h3>
        <div className="space-y-3">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-semibold mb-1 text-red-800">Fake Information Requests</h4>
            <p className="text-gray-700">kikbig never sends emails requesting your personal details. If you receive an email asking you to provide your personal details to us, do not open any links. Please report the email and delete it.</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h4 className="font-semibold mb-1 text-orange-800">Money Transfer Services</h4>
            <p className="text-gray-700">Avoid requests to use money transfer services such as Western Union or MoneyGram. These services are not meant for transactions between strangers and many scams are run through them.</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold mb-1 text-yellow-800">⚠️ Caution: No Delivery Options at kikbig</h4>
            <p className="text-gray-700">kikbig no longer offers delivery. Please report any false claims and avoid payment for such services.</p>
          </div>
        </div>
      </div>

      {/* Safety Measures */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3 flex items-center">
          <Shield className="mr-2 text-blue-600" /> Safety Measures Provided by kikbig
        </h3>
        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold">Email Address Protection</h4>
              <p className="text-gray-700">Your email address is not shown on your ad to protect you from spam.</p>
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold">Optional Phone Number Privacy</h4>
              <p className="text-gray-700">You can choose to hide your phone number and still be contacted by interested buyers via chat.</p>
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold">Continuous Improvements</h4>
              <p className="text-gray-700">We make constant improvements to our technology to detect and prevent suspicious or inappropriate activity.</p>
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold">Block Repeat Offenders</h4>
              <p className="text-gray-700">We track reports of suspicious or illegal activity to prevent offenders from using the site again.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reporting */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Reporting a Safety Issue</h3>
        <div className="space-y-3">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="font-semibold mb-1">Victim of a Scam?</h4>
            <p className="text-gray-700">If you feel that you have been the victim of a scam, please report your situation to us immediately. If you have been cheated, we also recommend that you contact your local police department.</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="font-semibold mb-1">Information Sharing</h4>
            <p className="text-gray-700">kikbig is committed to the privacy of our users and does not share user information publicly. However, we take safety seriously and will cooperate with law enforcement if we receive requests regarding fraudulent or other criminal activity.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pb-32"
      style={{ maxHeight: 'calc(100vh - 150px)' }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-center">Help & Support</h1>
          <p className="text-center text-gray-600 mt-2">
            We're here to help you with any questions or concerns
          </p>
        </div>

        <div className="flex flex-wrap justify-center mb-6 gap-2">
          {supportTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center px-4 py-2 rounded-full transition-colors 
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
          {activeTab === 'safety' && renderSafetySection()}
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