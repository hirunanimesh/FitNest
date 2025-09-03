"use client"

import React, { useRef, useEffect, useCallback, useState } from 'react'
import { Button } from "@/components/ui/button"
import { X, MapPin, Phone, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

// Add Google Maps types to the Window interface
declare global {
  interface Window {
    google: any
  }
}

interface Gym {
  gym_id: number;
  gym_name: string;
  profile_img?: string | null;
  description?: string | null;
  address: string;
  location: string; // JSON string with lat/lng
  contact_no?: string | null;
  verified?: boolean;
  owner_name?: string;
  operating_Hours?: string;
}

// New types for the API response structure
interface PlanGym {
  plan_id: string;
  gym_id: number;
  price: number;
  description: string;
  title: string;
  duration: string;
  created_at: string;
  product_id_stripe: string;
  price_id_stripe: string;
  gym: {
    gym_id: number;
    location: string; // JSON string with lat/lng
    profile_img?: string | null;
    gym_name?: string;
    address?: string;
    contact_no?: string | null;
  };
}

interface MapGymData {
  gym: PlanGym['gym'];
  planType: 'oneDay' | 'other';
}

interface GymsMapViewProps {
  mapGymsData?: MapGymData[];
  gyms?: Gym[]; // Keep for backward compatibility
  onClose: () => void
  userLocation?: { lat: number; lng: number } | null
}

const GymsMapView: React.FC<GymsMapViewProps> = ({
  gyms = [],
  mapGymsData = [],
  onClose,
  userLocation
}) => {
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null)
  
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const infoWindowRef = useRef<any>(null)

  // Map styles for dark theme
  const mapStyles = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }]
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }]
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }]
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }]
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }]
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }]
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }]
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }]
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }]
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }]
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }]
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }]
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }]
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }]
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }]
    }
  ]

  // Load Google Maps script
  useEffect(() => {
    if (!window.google && !document.querySelector('script[src*="maps.googleapis.com"]')) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.onload = () => setIsMapLoaded(true)
      script.onerror = (error) => {
        console.error('Error loading Google Maps API:', error)
        // You could show a user-friendly error message here
      }
      document.head.appendChild(script)
    } else if (window.google) {
      setIsMapLoaded(true)
    }
  }, [])

  // Parse location string to coordinates
  const parseLocation = (locationString: string): { lat: number; lng: number } | null => {
    try {
      const location = JSON.parse(locationString)
      return {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng)
      }
    } catch (error) {
      console.error('Error parsing location:', error)
      return null
    }
  }

  // Get user's current location
  const getCurrentLocation = useCallback(() => {
    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      if (userLocation) {
        resolve(userLocation)
        return
      }

      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          // Handle geolocation error properly
          let errorMessage = 'Unknown error occurred'
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out'
              break
          }
          console.warn('Geolocation error:', errorMessage)
          // Default to Colombo, Sri Lanka
          resolve({ lat: 6.9271, lng: 79.8612 })
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000
        }
      )
    })
  }, [userLocation])

  // Initialize map
  const initializeMap = useCallback(async () => {
    if (!isMapLoaded || !mapRef.current || !window.google) return

    try {
      const centerLocation = await getCurrentLocation()
      
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: centerLocation,
        zoom: 12,
        mapTypeId: 'roadmap',
        styles: mapStyles,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true
      })

      // Add user location marker
      new window.google.maps.Marker({
        position: centerLocation,
        map: mapInstanceRef.current,
        title: 'Your Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" fill="#ffffff"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 24),
          anchor: new window.google.maps.Point(12, 12)
        }
      })

      // Create info window
      infoWindowRef.current = new window.google.maps.InfoWindow()

      // Add gym markers
      addGymMarkers()
    } catch (error) {
      console.error('Error initializing map:', error)
      // You could show a user-friendly error message here if needed
    }
  }, [isMapLoaded, getCurrentLocation])

  // Add gym markers to the map
  const addGymMarkers = () => {
    if (!mapInstanceRef.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    // Use mapGymsData if available, otherwise fall back to gyms
    if (mapGymsData && mapGymsData.length > 0) {
      // Handle new API data with different colored markers
      mapGymsData.forEach(gymData => {
        const location = parseLocation(gymData.gym.location)
        if (!location) return

        // Determine marker color based on plan type
        const markerColor = gymData.planType === 'oneDay' ? '#3b82f6' : '#ef4444' // Blue for one day, Red for others
        const markerIcon = gymData.planType === 'oneDay' ? 'calendar' : 'dumbbell'

        const marker = new window.google.maps.Marker({
          position: location,
          map: mapInstanceRef.current,
          title: gymData.gym.gym_name || `Gym ${gymData.gym.gym_id}`,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="${markerColor}" stroke="#ffffff" stroke-width="2"/>
                ${gymData.planType === 'oneDay' 
                  ? `<rect x="10" y="10" width="12" height="8" rx="1" fill="#ffffff"/>
                     <line x1="12" y1="13" x2="20" y2="13" stroke="${markerColor}" stroke-width="1"/>
                     <line x1="12" y1="15" x2="20" y2="15" stroke="${markerColor}" stroke-width="1"/>`
                  : `<path d="M12 14h8v4h-8v-4z" fill="#ffffff"/>
                     <circle cx="10" cy="16" r="2" fill="#ffffff"/>
                     <circle cx="22" cy="16" r="2" fill="#ffffff"/>`
                }
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 16)
          }
        })

        // Add click listener to marker
        marker.addListener('click', () => {
          const content = `
            <div style="max-width: 250px; color: #000;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${gymData.gym.gym_name || `Gym ${gymData.gym.gym_id}`}</h3>
              <span style="display: inline-block; padding: 2px 8px; font-size: 12px; border-radius: 4px; margin-bottom: 8px; background-color: ${markerColor}; color: white;">
                ${gymData.planType === 'oneDay' ? 'One Day Plans Available' : 'Other Plans Available'}
              </span>
              ${gymData.gym.profile_img ? `<img src="${gymData.gym.profile_img}" alt="${gymData.gym.gym_name || 'Gym'}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">` : ''}
              ${gymData.gym.address ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Address:</strong> ${gymData.gym.address}</p>` : ''}
              ${gymData.gym.contact_no ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Contact:</strong> ${gymData.gym.contact_no}</p>` : ''}
            </div>
          `
          
          infoWindowRef.current.setContent(content)
          infoWindowRef.current.open(mapInstanceRef.current, marker)
        })

        markersRef.current.push(marker)
      })
    } else if (gyms && gyms.length > 0) {
      // Handle legacy gym data
      gyms.forEach(gym => {
        const location = parseLocation(gym.location)
        if (!location) return

        const marker = new window.google.maps.Marker({
          position: location,
          map: mapInstanceRef.current,
          title: gym.gym_name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="#ef4444" stroke="#ffffff" stroke-width="2"/>
                <path d="M12 14h8v4h-8v-4z" fill="#ffffff"/>
                <circle cx="10" cy="16" r="2" fill="#ffffff"/>
                <circle cx="22" cy="16" r="2" fill="#ffffff"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 16)
          }
        })

        // Add click listener to marker
        marker.addListener('click', () => {
          setSelectedGym(gym)
          
          const content = `
            <div style="max-width: 250px; color: #000;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${gym.gym_name}</h3>
              ${gym.profile_img ? `<img src="${gym.profile_img}" alt="${gym.gym_name}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">` : ''}
              <p style="margin: 4px 0; font-size: 14px;"><strong>Address:</strong> ${gym.address}</p>
              ${gym.contact_no ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Contact:</strong> ${gym.contact_no}</p>` : ''}
              ${gym.description ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Description:</strong> ${gym.description}</p>` : ''}
              ${gym.operating_Hours ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Hours:</strong> ${gym.operating_Hours}</p>` : ''}
              ${gym.verified ? '<span style="color: #10b981; font-size: 12px;">✓ Verified</span>' : ''}
            </div>
          `
          
          infoWindowRef.current.setContent(content)
          infoWindowRef.current.open(mapInstanceRef.current, marker)
        })

        markersRef.current.push(marker)
      })
    }

    // Adjust map bounds to show all markers
    const allLocations: { lat: number; lng: number }[] = []
    if (mapGymsData && mapGymsData.length > 0) {
      mapGymsData.forEach(gymData => {
        const location = parseLocation(gymData.gym.location)
        if (location) allLocations.push(location)
      })
    } else if (gyms && gyms.length > 0) {
      gyms.forEach(gym => {
        const location = parseLocation(gym.location)
        if (location) allLocations.push(location)
      })
    }

    if (allLocations.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      
      allLocations.forEach(location => {
        bounds.extend(new window.google.maps.LatLng(location.lat, location.lng))
      })

      // Include user location in bounds
      getCurrentLocation().then(userLoc => {
        bounds.extend(new window.google.maps.LatLng(userLoc.lat, userLoc.lng))
        mapInstanceRef.current.fitBounds(bounds)
        
        // Set max zoom level
        const maxZoomListener = window.google.maps.event.addListener(mapInstanceRef.current, 'bounds_changed', () => {
          if (mapInstanceRef.current.getZoom() > 15) {
            mapInstanceRef.current.setZoom(15)
          }
          window.google.maps.event.removeListener(maxZoomListener)
        })
      })
    }
  }

  // Initialize map when component mounts and map is loaded
  useEffect(() => {
    if (isMapLoaded) {
      initializeMap()
    }
  }, [isMapLoaded, initializeMap])

  // Update markers when gyms change
  useEffect(() => {
    if (isMapLoaded && mapInstanceRef.current) {
      addGymMarkers()
    }
  }, [gyms, mapGymsData, isMapLoaded])

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-black">Gyms Near You</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-black hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <div 
            ref={mapRef} 
            className="w-full h-full"
            style={{ minHeight: '400px' }}
          />
          
          {/* Loading Overlay */}
          {!isMapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Your Location</span>
            </div>
            {mapGymsData && mapGymsData.length > 0 ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>One Day Plans</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Other Plans</span>
                </div>
                <span className="ml-auto">Found {mapGymsData.length} gym{mapGymsData.length !== 1 ? 's' : ''}</span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Gyms</span>
                </div>
                <span className="ml-auto">Found {gyms?.length || 0} gym{(gyms?.length || 0) !== 1 ? 's' : ''}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GymsMapView
