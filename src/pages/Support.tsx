import React, { useState } from 'react';
import { Search, MessageCircle, Book, HelpCircle, ChevronRight, Mail, Phone } from 'lucide-react';

export default function Support() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqCategories = [
    { id: 'all', name: 'All Topics', count: 24 },
    { id: 'points', name: 'Points System', count: 8 },
    { id: 'applications', name: 'Applications', count: 6 },
    { id: 'account', name: 'Account', count: 5 },
    { id: 'billing', name: 'Billing', count: 3 },
    { id: 'technical', name: 'Technical', count: 2 },
  ];

  const faqs = [
    {
      category: 'points',
      question: 'How do I earn points on Rush Working?',
      answer: 'You can earn points by applying to jobs (each application typically earns 5-10 points) or by purchasing points directly. Starting members receive 50 points when they complete their profile.'
    },
    {
      category: 'points',
      question: 'What are points used for?',
      answer: 'Points are used to apply for jobs and increase your visibility to employers. Jobs with higher point requirements typically offer better salaries or are from premium companies.'
    },
    {
      category: 'applications',
      question: 'What happens if I don\'t have enough points to apply?',
      answer: 'If you don\'t have enough points for a job, you can either apply to other jobs to earn more points, or purchase points directly from your tracker page.'
    },
    {
      category: 'applications',
      question: 'How do employers see my application?',
      answer: 'Employers see up to 50 random applicants and 50 point-based applicants. Using more points increases your chances of being in the priority pool.'
    },
    {
      category: 'account',
      question: 'How do I update my profile information?',
      answer: 'Go to your Profile page and click "Edit Profile". You can update your personal information, add skills, and upload a new resume.'
    },
    {
      category: 'billing',
      question: 'How much does it cost to post a job?',
      answer: 'Each job posting costs $1 and stays active for 30 days. This includes access to both random applicants and priority point-based applicants.'
    },
    {
      category: 'technical',
      question: 'I\'m having trouble uploading my resume',
      answer: 'Make sure your resume is in PDF, DOC, or DOCX format and under 10MB. Clear your browser cache and try again. If the issue persists, contact our support team.'
    },
    {
      category: 'account',
      question: 'How do I verify my company for job posting?',
      answer: 'Go to the Hire page and click "Verify Company". You\'ll need to provide your company name, business ID, and location. Verification usually takes 1-2 business days.'
    },
  ];

  const filteredFaqs = faqs.filter(faq => 
    (selectedCategory === 'all' || faq.category === selectedCategory) &&
    (searchQuery === '' || 
     faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
     faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          How can we help you?
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Find answers to common questions or get in touch with our support team
        </p>
        
        {/* Search */}
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for help articles..."
            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <MessageCircle className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Live Chat</h3>
          <p className="text-gray-600 mb-4">
            Get instant help from our support team
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Start Chat
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Email Support</h3>
          <p className="text-gray-600 mb-4">
            Send us a detailed message about your issue
          </p>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Send Email
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Phone className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Phone Support</h3>
          <p className="text-gray-600 mb-4">
            Call us during business hours
          </p>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            Call Now
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
        </div>
        
        <div className="flex flex-col lg:flex-row">
          {/* Categories Sidebar */}
          <div className="lg:w-1/4 p-6 border-b lg:border-b-0 lg:border-r border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
            <div className="space-y-2">
              {faqCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span>{category.name}</span>
                  <span className="text-sm bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:w-3/4 p-6">
            <div className="space-y-4">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, index) => (
                  <details key={index} className="border border-gray-200 rounded-lg">
                    <summary className="px-4 py-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between">
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </summary>
                    <div className="px-4 pb-4">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  </details>
                ))
              ) : (
                <div className="text-center py-12">
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600">
                    Try adjusting your search or browse different categories
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Resources */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
        <div className="text-center">
          <Book className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Still need help?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help you with any questions or issues you might have.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
              Contact Support
            </button>
            <button className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-semibold">
              Browse Documentation
            </button>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="mt-8 text-center text-gray-600">
        <p className="mb-2">
          <strong>Business Hours:</strong> Monday - Friday, 9AM - 6PM EST
        </p>
        <p>
          <strong>Response Time:</strong> We typically respond within 2-4 hours during business hours
        </p>
      </div>
    </div>
  );
}