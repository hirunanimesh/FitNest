"use client"

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Shield, Users, Lock, Eye, Mail, Clock, Database, Globe } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-red-500/20 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="flex items-center space-x-3 text-white hover:text-red-400 transition-colors group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to FitNest</span>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl">
                Fit<span className="text-red-500">Nest</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 lg:py-16">
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full mb-6">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Your privacy and data security are our top priorities. This policy explains how FitNest collects, uses, and protects your information.
          </p>
          <div className="mt-6 text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Content Grid */}
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Google OAuth & Calendar Section */}
          <section className="bg-gradient-to-r from-red-500/10 to-rose-600/10 border border-red-500/20 rounded-2xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Globe className="h-6 w-6 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Google Services Integration</h2>
            </div>
            
            <div className="space-y-6 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Users className="h-5 w-5 text-red-400 mr-2" />
                  Google OAuth Authentication
                </h3>
                <p className="leading-relaxed">
                  FitNest uses Google OAuth 2.0 to provide secure and convenient sign-in functionality. When you choose to sign in with Google, we receive basic profile information including your name, email address, and profile picture. This information is used solely for account creation and authentication purposes.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Clock className="h-5 w-5 text-red-400 mr-2" />
                  Google Calendar Access
                </h3>
                <p className="leading-relaxed mb-4">
                  With your explicit consent, FitNest may access your Google Calendar to provide enhanced scheduling features for your fitness activities. This includes:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Creating calendar events for your gym sessions and personal training appointments</li>
                  <li>Reading your calendar to suggest optimal workout times based on your availability</li>
                  <li>Updating or canceling fitness-related events when you modify your bookings</li>
                  <li>Displaying your upcoming fitness schedule within the FitNest application</li>
                </ul>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-red-300 mb-2">Important: Limited Access</h4>
                <p className="text-sm">
                  FitNest only accesses calendar data that you explicitly grant permission for. We do not access personal events, private appointments, or any calendar information unrelated to your fitness activities. You can revoke calendar access at any time through your Google Account settings.
                </p>
              </div>
            </div>
          </section>

          {/* Data Collection Section */}
          <section className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Database className="h-6 w-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Information We Collect</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Account Information</h3>
                <ul className="space-y-2 text-sm list-disc list-inside">
                  <li>Name and email address</li>
                  <li>Profile picture (if provided)</li>
                  <li>User role (gym member, trainer, gym owner)</li>
                  <li>Account preferences and settings</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Fitness Data</h3>
                <ul className="space-y-2 text-sm list-disc list-inside">
                  <li>Workout schedules and appointments</li>
                  <li>Gym memberships and preferences</li>
                  <li>Training session details</li>
                  <li>Progress tracking information</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Protection Section */}
          <section className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Lock className="h-6 w-6 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">How We Protect Your Data</h2>
            </div>
            
            <div className="space-y-6 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Security Measures</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>End-to-end encryption for sensitive data transmission</li>
                  <li>Secure database storage with access controls</li>
                  <li>Regular security audits and updates</li>
                  <li>Multi-factor authentication options</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Data Access</h3>
                <p className="leading-relaxed">
                  Access to your personal information is strictly limited to authorized personnel who need it to provide our services. All team members with access to user data undergo background checks and sign confidentiality agreements.
                </p>
              </div>
            </div>
          </section>

          {/* Data Sharing Section */}
          <section className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Eye className="h-6 w-6 text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Data Sharing Policy</h2>
            </div>
            
            <div className="space-y-6 text-gray-300">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-300 mb-3">We Do NOT Share Your Data</h3>
                <p className="leading-relaxed">
                  FitNest does not sell, rent, or share your personal information with third parties for marketing or commercial purposes. Your data remains private and is used exclusively to provide you with our fitness platform services.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Limited Exceptions</h3>
                <p className="leading-relaxed mb-3">
                  We may share information only in the following limited circumstances:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>With your explicit consent for specific features or integrations</li>
                  <li>To comply with legal obligations or court orders</li>
                  <li>To protect the safety and security of our users and platform</li>
                  <li>In connection with a business transfer (with prior notice to users)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* User Rights Section */}
          <section className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Your Rights & Control</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Data Control</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Access your personal data</li>
                  <li>Update or correct information</li>
                  <li>Delete your account and data</li>
                  <li>Export your data</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Privacy Settings</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Manage notification preferences</li>
                  <li>Control profile visibility</li>
                  <li>Revoke third-party permissions</li>
                  <li>Adjust data sharing settings</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-gradient-to-r from-red-500/10 to-pink-600/10 border border-red-500/20 rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Mail className="h-6 w-6 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Contact Us</h2>
            </div>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              If you have any questions about this Privacy Policy, your data, or how we handle your information, please don't hesitate to contact us.
            </p>
            
            <div className="bg-black/30 rounded-lg p-6 inline-block">
              <div className="flex items-center justify-center space-x-2 text-red-400">
                <Mail className="h-5 w-5" />
                <a 
                  href="mailto:nimeshhiruna@gmail.com" 
                  className="text-lg font-semibold hover:text-red-300 transition-colors"
                >
                  nimeshhiruna@gmail.com
                </a>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Privacy Officer & Support Team
              </p>
            </div>
          </section>

          {/* Updates Section */}
          <section className="bg-gray-800/30 border border-gray-700/30 rounded-2xl p-6 text-center">
            <h2 className="text-xl font-bold text-white mb-3">Policy Updates</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. 
              We will notify you of significant changes via email or through prominent notices on our platform. 
              Your continued use of FitNest after any changes indicates your acceptance of the updated policy.
            </p>
          </section>

        </div>
      </main>
    </div>
  )
}