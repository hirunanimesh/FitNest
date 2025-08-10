"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Dumbbell } from "lucide-react"
import Link from "next/link"
//import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Navbar() {
  return (
    <>
      <header className="fixed top-0 z-50 w-full bg-black shadow-lg border-b-2 border-[#FB4141]">
        <div className="container flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-[#FB4141] rounded-lg group-hover:bg-[#e63636] transition-colors">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-white">FitNest</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-white hover:text-[#FB4141] px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-all duration-200 relative group">
              HOME
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FB4141] group-hover:w-full transition-all duration-200"></span>
            </Link>
            <Link
              href="/about"
              className="text-white hover:text-[#FB4141] px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-all duration-200 relative group"
            >
              ABOUT
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FB4141] group-hover:w-full transition-all duration-200"></span>
            </Link>
            <Link
              href="/gym"
              className="text-white hover:text-[#FB4141] px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-all duration-200 relative group"
            >
              GYM
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FB4141] group-hover:w-full transition-all duration-200"></span>
            </Link>
            <Link
              href="/contact"
              className="text-white hover:text-[#FB4141] px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-all duration-200 relative group"
            >
              CONTACT
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FB4141] group-hover:w-full transition-all duration-200"></span>
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex space-x-3">
              <Button
                asChild
                variant="outline"
                size="default"
                className="border-2 border-[#FB4141] text-[#FB4141] bg-transparent hover:bg-[#FB4141] hover:text-white font-semibold px-6 py-2 transition-all duration-200"
              >
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button
                asChild
                size="default"
                className="bg-[#FB4141] hover:bg-[#e63636] text-white font-semibold px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Link href="/auth/signup">Join Now</Link>
              </Button>
            </div>

            {/* Mobile Navigation */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden text-white hover:bg-[#FB4141]/20 hover:text-[#FB4141] p-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-black border-l-2 border-[#FB4141] w-80">
                <div className="flex flex-col space-y-6 mt-8">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="p-2 bg-[#FB4141] rounded-lg">
                      <Dumbbell className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-bold text-2xl text-white">FitNest</span>
                  </div>
                  
                  <Link href="/" className="text-lg font-semibold text-white hover:text-[#FB4141] py-3 px-4 rounded-lg hover:bg-white/5 transition-all duration-200">
                    HOME
                  </Link>
                  <Link href="/about" className="text-lg font-semibold text-white hover:text-[#FB4141] py-3 px-4 rounded-lg hover:bg-white/5 transition-all duration-200">
                    ABOUT
                  </Link>
                  <Link href="/gym" className="text-lg font-semibold text-white hover:text-[#FB4141] py-3 px-4 rounded-lg hover:bg-white/5 transition-all duration-200">
                    GYM
                  </Link>
                  <Link href="/contact" className="text-lg font-semibold text-white hover:text-[#FB4141] py-3 px-4 rounded-lg hover:bg-white/5 transition-all duration-200">
                    CONTACT
                  </Link>
                  
                  <div className="flex flex-col space-y-3 mt-8">
                    <Button asChild variant="outline" className="border-2 border-[#FB4141] text-[#FB4141] bg-transparent hover:bg-[#FB4141] hover:text-white font-semibold py-3">
                      <Link href="/auth/login">Login</Link>
                    </Button>
                    <Button asChild className="bg-[#FB4141] hover:bg-[#e63636] text-white font-semibold py-3 shadow-lg">
                      <Link href="/auth/signup">Join Now</Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  )
}