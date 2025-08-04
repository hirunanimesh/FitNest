"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Dumbbell } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Navbar() {
  return (
    <>
      <header className="fixed top-0 z-50 w-full bg-transparent backdrop-blur-md border-b border-white/10">
        <div className="container flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg text-white">FitNest</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-white hover:text-primary px-3 py-2 text-xs font-medium transition-colors">
              HOME
            </Link>
            <Link
              href="/about"
              className="text-white hover:text-primary px-3 py-2 text-xs font-medium transition-colors"
            >
              ABOUT
            </Link>
            <Link
              href="/search"
              className="text-white hover:text-primary px-3 py-2 text-xs font-medium transition-colors"
            >
              LOCATIONS
            </Link>
            <Link
              href="/contact"
              className="text-white hover:text-primary px-3 py-2 text-xs font-medium transition-colors"
            >
              CONTACT
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <div className="hidden md:flex space-x-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-white hover:text-primary hover:bg-white/10 text-xs"
              >
                <Link href="/auth/login">Login</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs">
                    Join Now
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border-border">
                  <DropdownMenuItem asChild>
                    <Link href="/auth/signup?type=user" className="text-black">
                      User
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/auth/signup?type=trainer" className="text-black">
                      Trainer
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/auth/signup?type=gym" className="text-black">
                      Gym
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Navigation */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden text-white hover:bg-white/10">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white border-border">
                <div className="flex flex-col space-y-4 mt-8">
                  <Link href="/" className="text-base font-medium text-black hover:text-primary">
                    HOME
                  </Link>
                  <Link href="/about" className="text-base font-medium text-black hover:text-primary">
                    ABOUT
                  </Link>
                  <Link href="/search" className="text-base font-medium text-black hover:text-primary">
                    LOCATIONS
                  </Link>
                  <Link href="/contact" className="text-base font-medium text-black hover:text-primary">
                    CONTACT
                  </Link>
                  <Link href="/auth/login" className="text-base font-medium text-black hover:text-primary">
                    Login
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="text-base font-medium bg-primary hover:bg-primary/90">Join Now</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-border">
                      <DropdownMenuItem asChild>
                        <Link href="/auth/signup?type=user" className="text-black">
                          User
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/auth/signup?type=trainer" className="text-black">
                          Trainer
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/auth/signup?type=gym" className="text-black">
                          Gym
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  )
}
