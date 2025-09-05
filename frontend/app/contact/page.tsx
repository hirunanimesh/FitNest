import { Mail, Phone, MapPin, Clock, MessageSquare, Send } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {Navbar} from "@/components/navbar"
import { PublicRoute } from "@/components/PublicRoute"

export default function ContactPage() {
  const contactMethods = [
    {
      icon: <Mail className="w-8 h-8" />,
      title: "Email Us",
      description: "Get in touch with our support team",
      contact: "support@fitconnect.com",
      action: "Send Email",
    },
    {
      icon: <Phone className="w-8 h-8" />,
      title: "Call Us",
      description: "Speak directly with our team",
      contact: "+1 (555) 123-4567",
      action: "Call Now",
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Live Chat",
      description: "Chat with us in real-time",
      contact: "Available 24/7",
      action: "Start Chat",
    },
  ]

  const officeHours = [
    { day: "Monday - Friday", hours: "8:00 AM - 8:00 PM" },
    { day: "Saturday", hours: "9:00 AM - 6:00 PM" },
    { day: "Sunday", hours: "10:00 AM - 4:00 PM" },
  ]

  return (
    <PublicRoute>
      <div className="min-h-screen bg-gray-900 text-white pt-16">
        <Navbar />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Contact Us
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              We're here to help you on your fitness journey. Reach out to us anytime!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Get In Touch</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Choose the way that works best for you to connect with our team
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <Card
                key={index}
                className="bg-gray-800 border-gray-700 hover:border-orange-500/50 transition-all hover:scale-105"
              >
                <CardContent className="p-8 text-center">
                  <div className="text-orange-500 mb-6 flex justify-center">{method.icon}</div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{method.title}</h3>
                  <p className="text-gray-400 mb-4">{method.description}</p>
                  <p className="text-lg font-semibold text-orange-400 mb-6">{method.contact}</p>
                  <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-colors">
                    {method.action}
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Send Us a Message</h2>
            <p className="text-lg text-gray-400">Fill out the form below and we'll get back to you within 24 hours</p>
          </div>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">First Name *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Last Name *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address *</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors"
                    placeholder="Enter your email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Subject *</label>
                  <select className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none transition-colors">
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="membership">Membership Questions</option>
                    <option value="trainer">Trainer Inquiries</option>
                    <option value="gym">Gym Partnership</option>
                    <option value="billing">Billing Support</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Message *</label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none transition-colors resize-none"
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Office Hours & Location */}
      <section className="py-20 bg-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Office Hours */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="w-8 h-8 text-orange-500" />
                  <h3 className="text-2xl font-bold text-white">Support Hours</h3>
                </div>
                <p className="text-gray-400 mb-6">
                  Our support team is available during these hours to assist you with any questions or concerns.
                </p>
                <div className="space-y-4">
                  {officeHours.map((schedule, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0"
                    >
                      <span className="text-gray-300 font-medium">{schedule.day}</span>
                      <span className="text-orange-400 font-semibold">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <p className="text-sm text-orange-300">
                    <strong>Emergency Support:</strong> For urgent technical issues, our 24/7 chat support is always
                    available.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-8 h-8 text-red-500" />
                  <h3 className="text-2xl font-bold text-white">Our Location</h3>
                </div>
                <p className="text-gray-400 mb-6">Visit our headquarters or send us mail at the address below.</p>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">FitConnect Headquarters</h4>
                    <p className="text-gray-300">
                      123 Fitness Avenue
                      <br />
                      Suite 456
                      <br />
                      Health City, HC 12345
                      <br />
                      United States
                    </p>
                  </div>
                  <div className="pt-4 border-t border-gray-700">
                    <h4 className="text-lg font-semibold text-white mb-2">Mailing Address</h4>
                    <p className="text-gray-300">
                      P.O. Box 789
                      <br />
                      Health City, HC 12345
                      <br />
                      United States
                    </p>
                  </div>
                </div>
                {/* <button className="mt-6 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-600 hover:to-orange-600 transition-colors">
                  Get Directions
                </button> */}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Preview
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Frequently Asked Questions</h2>
          <p className="text-lg text-gray-400 mb-8">
            Can't find what you're looking for? Check out our comprehensive FAQ section for quick answers.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700 text-left">
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold text-white mb-2">How do I cancel my membership?</h4>
                <p className="text-gray-400 text-sm">
                  You can cancel your membership anytime from your account settings or by contacting our support team.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700 text-left">
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold text-white mb-2">Can I use multiple gyms?</h4>
                <p className="text-gray-400 text-sm">
                  Yes! With FitConnect, you can subscribe to multiple gym memberships and access them all through one
                  platform.
                </p>
              </CardContent>
            </Card>
          </div>
          <button className="mt-8 border-2 border-orange-500 text-orange-500 px-8 py-3 rounded-lg font-semibold hover:bg-orange-500 hover:text-white transition-colors">
            View All FAQs
          </button>
        </div>
      </section> */}
    </div>
    </PublicRoute>
  )
}
