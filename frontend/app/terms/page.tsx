"use client"

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, Users, Dumbbell, AlertTriangle, Mail, Scale, Shield, Clock, CheckCircle } from 'lucide-react'

export default function TermsOfServicePage() {
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
                <FileText className="h-5 w-5 text-white" />
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
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Welcome to FitNest! These terms govern your use of our fitness platform connecting gym members, trainers, and gym owners.
          </p>
          <div className="mt-6 text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Content Grid */}
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Agreement Section */}
          <section className="bg-gradient-to-r from-red-500/10 to-rose-600/10 border border-red-500/20 rounded-2xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Acceptance of Terms</h2>
            </div>
            
            <div className="space-y-4 text-gray-300">
              <p className="leading-relaxed">
                By accessing and using FitNest, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-sm font-medium text-red-300">
                  These terms may change from time to time. Users are responsible for reviewing these terms periodically 
                  and must comply with all current rules and regulations.
                </p>
              </div>
            </div>
          </section>

          {/* Platform Overview Section */}
          <section className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Dumbbell className="h-6 w-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">About FitNest Platform</h2>
            </div>
            
            <div className="space-y-6 text-gray-300">
              <p className="leading-relaxed">
                FitNest is a comprehensive fitness platform designed to connect gym members, personal trainers, and gym owners. 
                Our platform facilitates fitness journey management, scheduling, and community building within the fitness ecosystem.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Users className="h-5 w-5 text-red-400" />
                    <h3 className="font-semibold text-white">Gym Members</h3>
                  </div>
                  <p className="text-sm">
                    Find gyms, book sessions, track progress, and connect with trainers for your fitness goals.
                  </p>
                </div>
                
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Dumbbell className="h-5 w-5 text-orange-400" />
                    <h3 className="font-semibold text-white">Personal Trainers</h3>
                  </div>
                  <p className="text-sm">
                    Offer training services, manage schedules, build client base, and grow your fitness business.
                  </p>
                </div>
                
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Scale className="h-5 w-5 text-green-400" />
                    <h3 className="font-semibold text-white">Gym Owners</h3>
                  </div>
                  <p className="text-sm">
                    Manage facilities, memberships, staff, and grow your gym business through our platform.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* User Responsibilities Section */}
          <section className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">User Responsibilities</h2>
            </div>
            
            <div className="space-y-6 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Account Management</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Provide accurate and up-to-date information</li>
                  <li>Maintain the confidentiality of your account credentials</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Platform Usage</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Use the platform for lawful purposes only</li>
                  <li>Respect other users and maintain professional conduct</li>
                  <li>Provide honest reviews and feedback</li>
                  <li>Report inappropriate behavior or content</li>
                  <li>Honor booking commitments and cancellation policies</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Prohibited Activities Section */}
          <section className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-2xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Prohibited Activities</h2>
            </div>
            
            <div className="space-y-4 text-gray-300">
              <p className="leading-relaxed">
                The following activities are strictly prohibited on the FitNest platform:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Content & Conduct</h3>
                  <ul className="space-y-2 list-disc list-inside text-sm">
                    <li>Posting false, misleading, or fraudulent information</li>
                    <li>Harassment, bullying, or threatening behavior</li>
                    <li>Sharing inappropriate or offensive content</li>
                    <li>Impersonating other users or entities</li>
                    <li>Spamming or unsolicited promotional activities</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Technical & Legal</h3>
                  <ul className="space-y-2 list-disc list-inside text-sm">
                    <li>Attempting to hack or disrupt the platform</li>
                    <li>Using automated systems or bots</li>
                    <li>Violating intellectual property rights</li>
                    <li>Circumventing security measures</li>
                    <li>Commercial use without proper authorization</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Service Availability Section */}
          <section className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <Clock className="h-6 w-6 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Service Availability & Modifications</h2>
            </div>
            
            <div className="space-y-6 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Platform Availability</h3>
                <p className="leading-relaxed">
                  While we strive to maintain 24/7 availability, FitNest may experience downtime for maintenance, 
                  updates, or unforeseen technical issues. We do not guarantee uninterrupted access and are not 
                  liable for any disruptions to service.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Service Modifications</h3>
                <p className="leading-relaxed">
                  FitNest reserves the right to modify, suspend, or discontinue any aspect of the service at any time. 
                  We will provide reasonable notice for significant changes that may affect your use of the platform.
                </p>
              </div>
            </div>
          </section>

          {/* Disclaimers Section */}
          <section className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Important Disclaimers</h2>
            </div>
            
            <div className="space-y-6 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Fitness & Health Disclaimer</h3>
                <p className="leading-relaxed">
                  FitNest is a platform that connects users with fitness services. We do not provide medical advice, 
                  and fitness activities carry inherent risks. Users should consult healthcare professionals before 
                  beginning any fitness program and exercise at their own risk.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Third-Party Services</h3>
                <p className="leading-relaxed">
                  The platform connects users with independent trainers and gym facilities. FitNest acts as a marketplace 
                  and is not responsible for the quality, safety, or outcomes of services provided by third parties. 
                  Users enter into direct relationships with service providers.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Content Accuracy</h3>
                <p className="leading-relaxed">
                  While we strive for accuracy, information on the platform is provided "as is" without warranties. 
                  Users should verify important details directly with service providers before making commitments.
                </p>
              </div>
            </div>
          </section>

          {/* Liability Section */}
          <section className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Shield className="h-6 w-6 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Limitation of Liability</h2>
            </div>
            
            <div className="space-y-4 text-gray-300">
              <p className="leading-relaxed">
                FitNest's liability is limited to the maximum extent permitted by law. We are not liable for:
              </p>
              
              <ul className="space-y-2 list-disc list-inside">
                <li>Indirect, incidental, special, or consequential damages</li>
                <li>Loss of profits, data, or business opportunities</li>
                <li>Actions or omissions of third-party service providers</li>
                <li>Injuries or damages resulting from fitness activities</li>
                <li>Technical issues or service interruptions</li>
              </ul>
              
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mt-6">
                <p className="text-sm font-medium text-red-300">
                  Our total liability for any claims arising from your use of FitNest shall not exceed 
                  the amount you paid for our services in the 12 months preceding the claim.
                </p>
              </div>
            </div>
          </section>

          {/* Termination Section */}
          <section className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Account Termination</h2>
            </div>
            
            <div className="space-y-6 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">User Termination</h3>
                <p className="leading-relaxed">
                  You may terminate your account at any time by following the account deletion process in your settings. 
                  Upon termination, your access to the platform will cease, though some information may be retained 
                  for legal or business purposes.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Platform Termination</h3>
                <p className="leading-relaxed">
                  FitNest reserves the right to suspend or terminate accounts that violate these terms or engage in 
                  harmful activities. We will provide notice when possible, but may take immediate action for serious violations.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-gradient-to-r from-red-500/10 to-pink-600/10 border border-red-500/20 rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Mail className="h-6 w-6 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Questions or Support</h2>
            </div>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              If you have any questions about these Terms of Service or need support with your FitNest account, 
              our team is here to help.
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
                Support Team & Legal Inquiries
              </p>
            </div>
          </section>

          {/* Legal Information */}
          <section className="bg-gray-800/30 border border-gray-700/30 rounded-2xl p-6 text-center">
            <h2 className="text-xl font-bold text-white mb-3">Governing Law</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              These Terms of Service are governed by and construed in accordance with applicable laws. 
              Any disputes arising from these terms or your use of FitNest will be resolved through appropriate legal channels. 
              By using our platform, you consent to the jurisdiction of competent courts for any legal proceedings.
            </p>
          </section>

        </div>
      </main>
    </div>
  )
}