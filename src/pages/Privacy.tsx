import React from 'react';
import { Shield, Lock, Eye, UserCheck, Database, Globe } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Privacy Policy
        </h1>
        <p className="text-gray-600 text-lg">
          Your privacy is important to us. This policy explains how we collect, use, and protect your information.
        </p>
        <div className="text-sm text-gray-500 mt-4">
          Last updated: January 8, 2025
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">Quick Navigation</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          <a href="#information-we-collect" className="text-blue-600 hover:text-blue-700 underline">Information We Collect</a>
          <a href="#how-we-use" className="text-blue-600 hover:text-blue-700 underline">How We Use Information</a>
          <a href="#information-sharing" className="text-blue-600 hover:text-blue-700 underline">Information Sharing</a>
          <a href="#data-security" className="text-blue-600 hover:text-blue-700 underline">Data Security</a>
          <a href="#your-rights" className="text-blue-600 hover:text-blue-700 underline">Your Rights</a>
          <a href="#contact-us" className="text-blue-600 hover:text-blue-700 underline">Contact Us</a>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-8 space-y-12">
          {/* Introduction */}
          <section>
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Our Commitment to Privacy</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Rush Working ("we," "our," or "us") is committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy outlines our practices regarding the collection, use, and disclosure of your information when you use our job search and recruitment platform.
            </p>
          </section>

          {/* Information We Collect */}
          <section id="information-we-collect">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
            </div>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-200 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Information You Provide</h3>
                <ul className="text-gray-700 space-y-1 list-disc list-inside">
                  <li>Account information (name, email, phone number, password)</li>
                  <li>Profile information (gender, veteran status, citizenship, education, criminal background)</li>
                  <li>Resume and work experience</li>
                  <li>Job application data</li>
                  <li>Communication preferences</li>
                </ul>
              </div>
              <div className="border-l-4 border-green-200 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Automatically Collected Information</h3>
                <ul className="text-gray-700 space-y-1 list-disc list-inside">
                  <li>Device information (IP address, browser type, operating system)</li>
                  <li>Usage data (pages visited, time spent, clicks)</li>
                  <li>Location data (if permitted)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
              <div className="border-l-4 border-purple-200 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Information from Third Parties</h3>
                <ul className="text-gray-700 space-y-1 list-disc list-inside">
                  <li>Social media profiles (if you choose to connect them)</li>
                  <li>Background check information (with your consent)</li>
                  <li>Public professional information</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section id="how-we-use">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Core Platform Services</h3>
                <ul className="text-gray-700 text-sm space-y-1 list-disc list-inside">
                  <li>Create and manage your account</li>
                  <li>Match you with relevant job opportunities</li>
                  <li>Process job applications</li>
                  <li>Manage our point system</li>
                  <li>Enable communication between users and employers</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Platform Improvement</h3>
                <ul className="text-gray-700 text-sm space-y-1 list-disc list-inside">
                  <li>Analyze usage patterns and preferences</li>
                  <li>Develop new features and services</li>
                  <li>Improve our matching algorithms</li>
                  <li>Conduct research and analytics</li>
                  <li>Personalize your experience</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Communication</h3>
                <ul className="text-gray-700 text-sm space-y-1 list-disc list-inside">
                  <li>Send important account notifications</li>
                  <li>Provide customer support</li>
                  <li>Share relevant job recommendations</li>
                  <li>Send marketing communications (with consent)</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Legal and Security</h3>
                <ul className="text-gray-700 text-sm space-y-1 list-disc list-inside">
                  <li>Comply with legal obligations</li>
                  <li>Protect against fraud and abuse</li>
                  <li>Enforce our terms of service</li>
                  <li>Resolve disputes</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Information Sharing */}
          <section id="information-sharing">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-2 rounded-lg mr-3">
                <Globe className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Information Sharing and Disclosure</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">🔒 We do not sell your personal information</h3>
                <p className="text-yellow-700 text-sm">
                  Your privacy is paramount. We never sell, rent, or trade your personal information to third parties for their marketing purposes.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">We may share information in these situations:</h3>
                <ul className="text-gray-700 space-y-2">
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                    <span><strong>With Employers:</strong> When you apply for a job, we share relevant profile information with the employer</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                    <span><strong>Service Providers:</strong> With trusted third parties who help us operate our platform (payment processors, email services, etc.)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                    <span><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</span>
                    <span><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales (with notice to you)</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section id="data-security">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-2 rounded-lg mr-3">
                <Lock className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement comprehensive security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Lock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Encryption</h3>
                <p className="text-gray-600 text-sm">All data transmission is encrypted using industry-standard SSL/TLS</p>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Access Control</h3>
                <p className="text-gray-600 text-sm">Strict access controls and authentication for our systems</p>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Database className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Regular Audits</h3>
                <p className="text-gray-600 text-sm">Regular security audits and monitoring for threats</p>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section id="your-rights">
            <div className="flex items-center mb-4">
              <div className="bg-orange-100 p-2 rounded-lg mr-3">
                <UserCheck className="h-6 w-6 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Your Privacy Rights</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have several rights regarding your personal information. You can exercise these rights by contacting us or using your account settings.
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">✓ Access Your Data</h3>
                  <p className="text-gray-600 text-sm">Request a copy of the personal information we have about you</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">✓ Correct Information</h3>
                  <p className="text-gray-600 text-sm">Update or correct any inaccurate personal information</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">✓ Delete Your Data</h3>
                  <p className="text-gray-600 text-sm">Request deletion of your personal information (with some exceptions)</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">✓ Data Portability</h3>
                  <p className="text-gray-600 text-sm">Receive your data in a structured, commonly used format</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">✓ Restrict Processing</h3>
                  <p className="text-gray-600 text-sm">Limit how we use your personal information in certain circumstances</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">✓ Opt-Out</h3>
                  <p className="text-gray-600 text-sm">Unsubscribe from marketing communications at any time</p>
                </div>
              </div>
            </div>
          </section>

          {/* Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. 
              You can control cookie settings through your browser preferences.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> Some cookies are essential for the platform to function properly. 
                Disabling these may affect your ability to use certain features of our service.
              </p>
            </div>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our platform is not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16. 
              If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
            </p>
          </section>

          {/* Updates to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. 
              We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. 
              We encourage you to review this policy periodically.
            </p>
          </section>

          {/* Contact Information */}
          <section id="contact-us">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us About Privacy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our privacy practices, please don't hesitate to contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> privacy@rushworking.com</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p><strong>Address:</strong> 123 Innovation Drive, Tech Valley, CA 94041</p>
              </div>
              <div className="mt-4">
                <a 
                  href="/contact" 
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Contact Our Privacy Team
                </a>
              </div>
            </div>
          </section>

          {/* Effective Date */}
          <section className="text-center text-gray-500 text-sm border-t border-gray-200 pt-6">
            <p>This Privacy Policy is effective as of January 8, 2025</p>
            <p>Version 1.0 | Rush Working Privacy Policy</p>
          </section>
        </div>
      </div>
    </div>
  );
}