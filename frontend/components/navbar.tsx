"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "@/components/ui/sheet"
import { Menu, Dumbbell, X } from "lucide-react"
import Link from "next/link"

export function Navbar() {
  return (
    <>
      <header className="fixed top-0 z-50 w-full bg-gradient-to-r from-black via-gray-900 to-black backdrop-blur-md border-b border-red-500/20 shadow-2xl">
        <div className="container flex h-20 items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl group-hover:from-red-400 group-hover:to-red-500 transition-all duration-300 shadow-lg group-hover:shadow-red-500/25 group-hover:scale-105">
              <Dumbbell className="h-7 w-7 text-white" />
              <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div>
              <span className="font-black text-2xl lg:text-3xl text-white tracking-tight">
                Fit<span className="text-red-500">Nest</span>
              </span>
              <div className="h-0.5 w-0 bg-gradient-to-r from-red-500 to-red-400 group-hover:w-full transition-all duration-300"></div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {[
              { href: "/", label: "HOME" },
              { href: "/about", label: "ABOUT" },
              { href: "/auth/login", label: "DASHBOARD" },
              { href: "/contact", label: "CONTACT" }
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-6 py-3 text-sm font-bold text-white/90 hover:text-white uppercase tracking-wider transition-all duration-300 group"
              >
                {item.label}
                <span className="absolute inset-0 bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100"></span>
                <span className="absolute bottom-1 left-1/2 w-0 h-0.5 bg-gradient-to-r from-red-500 to-red-400 group-hover:w-4/5 transform -translate-x-1/2 transition-all duration-300"></span>
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-red-500/80 text-red-500 bg-transparent hover:bg-red-500 hover:text-white font-bold px-8 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 hover:scale-105 backdrop-blur-sm"
            >
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
            >
              <Link href="/auth/signup">
                <span className="relative z-10">Join Now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="lg" 
                className="lg:hidden text-white hover:bg-red-500/20 hover:text-red-400 p-3 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            
            <SheetContent 
              side="right" 
              className="bg-gradient-to-b from-black via-gray-900 to-black border-l-2 border-red-500/30 w-full sm:w-96 backdrop-blur-xl"
            >
              {/* Hidden title for accessibility */}
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              
              {/* Mobile Menu Header with Close Button */}
              <div className="flex items-center justify-between mb-12 pt-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                    <Dumbbell className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-black text-2xl text-white">
                    Fit<span className="text-red-500">Nest</span>
                  </span>
                </div>
                
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:text-red-400 hover:bg-red-500/20 p-3 rounded-xl transition-all duration-300 hover:scale-105 -mr-3"
                  >
                    <X className="h-6 w-6" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </SheetClose>
              </div>
              
              {/* Mobile Navigation Links */}
              <div className="flex flex-col space-y-2">
                {[
                  { href: "/", label: "HOME" },
                  { href: "/about", label: "ABOUT" },
                  { href: "/auth/login", label: "DASHBOARD" },
                  { href: "/contact", label: "CONTACT" }
                ].map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link 
                      href={item.href} 
                      className="group relative text-lg font-bold text-white/90 hover:text-white py-4 px-6 rounded-xl hover:bg-red-500/10 transition-all duration-300 border border-transparent hover:border-red-500/20 backdrop-blur-sm"
                    >
                      <span className="relative z-10 tracking-wide">{item.label}</span>
                      <div className="absolute left-0 top-1/2 w-1 h-0 bg-gradient-to-b from-red-500 to-red-400 group-hover:h-8 transform -translate-y-1/2 transition-all duration-300 rounded-r-full"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                    </Link>
                  </SheetClose>
                ))}
              </div>
              
              {/* Mobile Auth Buttons */}
              <div className="flex flex-col space-y-4 mt-12 pt-8 border-t border-red-500/20">
                <SheetClose asChild>
                  <Button 
                    asChild 
                    variant="outline" 
                    size="lg"
                    className="border-2 border-red-500/80 text-red-500 bg-transparent hover:bg-red-500 hover:text-white font-bold py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 backdrop-blur-sm"
                  >
                    <Link href="/auth/login">Login</Link>
                  </Button>
                </SheetClose>
                
                <SheetClose asChild>
                  <Button 
                    asChild 
                    size="lg"
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 relative overflow-hidden group"
                  >
                    <Link href="/auth/signup">
                      <span className="relative z-10">Join Now</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Link>
                  </Button>
                </SheetClose>
              </div>
              
              {/* Mobile Menu Footer */}
              <div className="absolute bottom-8 left-6 right-6">
                <div className="text-center text-sm text-white/50 font-medium">
                  Transform Your Fitness Journey
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent mt-4"></div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  )
}