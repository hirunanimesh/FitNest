"use client"

import { ReactNode } from 'react'

interface PublicRouteProps {
  children: ReactNode
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  // Public routes don't need any authentication checks
  // Users can access them regardless of their auth status
  return <>{children}</>
}
