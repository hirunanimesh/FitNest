"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, User, Dumbbell, Building } from "lucide-react"
import Link from "next/link"

export function SignupDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-red-600 hover:bg-red-700">
          Sign Up
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href="/auth/signup?type=user" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Join as User
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/auth/signup?type=trainer" className="flex items-center">
            <Dumbbell className="mr-2 h-4 w-4" />
            Join as Trainer
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/auth/signup?type=gym" className="flex items-center">
            <Building className="mr-2 h-4 w-4" />
            Join as Gym
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
