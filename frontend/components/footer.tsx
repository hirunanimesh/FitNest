import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dumbbell, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Dumbbell className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl text-white">FitNest</span>
            </Link>
            <p className="text-gray-300">
              Connecting fitness enthusiasts with the best trainers and gyms worldwide. Transform your body, transform
              your life.
            </p>
            <div className="flex space-x-2">
              <Button
                size="icon"
                variant="outline"
                className="border-gray-600 hover:border-primary bg-transparent text-white hover:text-primary"
              >
                <Facebook className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="border-gray-600 hover:border-primary bg-transparent text-white hover:text-primary"
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="border-gray-600 hover:border-primary bg-transparent text-white hover:text-primary"
              >
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/about" className="block text-gray-300 hover:text-primary">
                About Us
              </Link>
              <Link href="/search" className="block text-gray-300 hover:text-primary">
                Find Gyms
              </Link>
              <Link href="/trainers" className="block text-gray-300 hover:text-primary">
                Find Trainers
              </Link>
              <Link href="/contact" className="block text-gray-300 hover:text-primary">
                Contact Us
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Contact</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4" />
                <span>support@fitnest.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="h-4 w-4" />
                <span>123 Fitness St, Health City</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Stay Updated</h3>
            <p className="text-gray-300 text-sm">Subscribe to get the latest fitness tips and exclusive offers.</p>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter your email"
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
              />
              <Button className="bg-primary hover:bg-primary/90">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2025 FitNest. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/terms" className="text-gray-400 hover:text-primary text-sm">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-primary text-sm">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
