"use client"

// Add Google Maps types to the Window interface
declare global {
  interface Window {
    google: any
  }
}

import React, { useRef, useEffect, useCallback, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin } from "lucide-react"

interface Location {
  lat: number
  lng: number
  address: string
}

interface GoogleMapPickerProps {
  onLocationSelect: (location: Location) => void
  initialLocation?: Location
  searchPlaceholder?: string
  className?: string
  height?: string
}

const GoogleMapPicker: React.FC<GoogleMapPickerProps> = ({
  onLocationSelect,
  initialLocation,
  searchPlaceholder = "Search for an address...",
  className = "",
  height = "400px"
}) => {
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [searchAddress, setSearchAddress] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null)
  
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const geocoderRef = useRef<any>(null)

  // Google Maps styles
  const mapStyles = [
    {
      featureType: "all",
      elementType: "labels",
      stylers: [{ visibility: "on" }]
    },
    {
      featureType: "landscape",
      elementType: "geometry.fill",
      stylers: [{ color: "#f5f5f2" }]
    },
    {
      featureType: "water",
      elementType: "geometry.fill",
      stylers: [{ color: "#c9d2dc" }]
    },
    {
      featureType: "road",
      elementType: "geometry.fill",
      stylers: [{ color: "#ffffff" }]
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#d4d4d4" }, { weight: 1 }]
    },
    {
      featureType: "road.highway",
      elementType: "geometry.fill",
      stylers: [{ color: "#ffd93d" }]
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#ebc31a" }, { weight: 1 }]
    },
    {
      featureType: "road.arterial",
      elementType: "geometry.fill",
      stylers: [{ color: "#ffffff" }]
    },
    {
      featureType: "poi",
      elementType: "geometry.fill",
      stylers: [{ color: "#ddd2a3" }]
    },
    {
      featureType: "poi.park",
      elementType: "geometry.fill",
      stylers: [{ color: "#c6e8b3" }]
    },
    {
      featureType: "poi.medical",
      elementType: "geometry.fill",
      stylers: [{ color: "#ffa5a5" }]
    },
    {
      featureType: "poi.business",
      elementType: "geometry.fill",
      stylers: [{ color: "#e4e4e4" }]
    },
    {
      featureType: "transit",
      elementType: "geometry.fill",
      stylers: [{ color: "#ddd2a3" }]
    },
    {
      featureType: "administrative",
      elementType: "geometry.stroke",
      stylers: [{ color: "#c9b2a6" }, { weight: 1 }]
    },
    {
      featureType: "all",
      elementType: "labels.text.fill",
      stylers: [{ color: "#666666" }]
    },
    {
      featureType: "all",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#ffffff" }, { weight: 3 }]
    }
  ]

  // Load Google Maps script
  useEffect(() => {
    if (!window.google && !document.querySelector('script[src*="maps.googleapis.com"]')) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.onload = () => setIsMapLoaded(true)
      document.head.appendChild(script)
    } else if (window.google) {
      setIsMapLoaded(true)
    }
  }, [])

  // Initialize map
  const initializeMap = useCallback(() => {
    if (!isMapLoaded || !mapRef.current || !window.google) return

    const defaultLocation = initialLocation || { lat: 6.9271, lng: 79.8612 } // Colombo, Sri Lanka default
    
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: defaultLocation.lat, lng: defaultLocation.lng },
      zoom: 13,
      mapTypeId: 'roadmap',
      styles: mapStyles,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: true
    })

    geocoderRef.current = new window.google.maps.Geocoder()

    // Add click listener to map
    mapInstanceRef.current.addListener('click', (event: any) => {
      const clickedLocation = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      }
      
      // Get address from coordinates
      geocoderRef.current.geocode({
        location: clickedLocation
      }, (results: any[], status: any) => {
        if (status === 'OK' && results[0]) {
          const newLocation = {
            lat: clickedLocation.lat,
            lng: clickedLocation.lng,
            address: results[0].formatted_address
          }
          
          setSelectedLocation(newLocation)
          updateMapMarker(clickedLocation)
          onLocationSelect(newLocation)
        }
      })
    })

    // If initial location is provided, show marker
    if (initialLocation) {
      updateMapMarker({ lat: initialLocation.lat, lng: initialLocation.lng })
    }
  }, [isMapLoaded, initialLocation, onLocationSelect])

  // Update map marker
  const updateMapMarker = (position: { lat: number; lng: number }) => {
    if (markerRef.current) {
      markerRef.current.setMap(null)
    }
    
    markerRef.current = new window.google.maps.Marker({
      position,
      map: mapInstanceRef.current,
      title: 'Selected Location',
      animation: window.google.maps.Animation.DROP,
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        scaledSize: new window.google.maps.Size(32, 32)
      }
    })
  }

  // Search address
  const handleAddressSearch = () => {
    if (!geocoderRef.current || !searchAddress.trim()) return

    geocoderRef.current.geocode({ address: searchAddress }, (results: any[], status: any) => {
      if (status === 'OK' && results[0]) {
        const result = results[0]
        const position = {
          lat: result.geometry.location.lat(),
          lng: result.geometry.location.lng()
        }
        
        const newLocation = {
          lat: position.lat,
          lng: position.lng,
          address: result.formatted_address
        }
        
        setSelectedLocation(newLocation)
        mapInstanceRef.current.setCenter(position)
        updateMapMarker(position)
        onLocationSelect(newLocation)
      } else {
        alert('Address not found. Please try a different search term.')
      }
    })
  }

  // Handle search input key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddressSearch()
    }
  }

  // Initialize map when component mounts and map is loaded
  useEffect(() => {
    if (isMapLoaded) {
      initializeMap()
    }
  }, [isMapLoaded, initializeMap])

  return (
    <div className={`w-full ${className}`}>
      {/* Search Bar */}
      <div className="mb-4 flex gap-2">
        <Input
          placeholder={searchPlaceholder}
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 text-black"
        />
        <Button 
          onClick={handleAddressSearch}
          disabled={!searchAddress.trim()}
          size="sm"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="mb-4 p-3 bg-muted rounded-lg flex items-start gap-2">
          <MapPin className="h-4 w-4 mt-0.5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-black">Selected Location</p>
            <p className="text-xs text-black">{selectedLocation.address}</p>
            <p className="text-xs text-black">
              Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
            </p>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="border rounded-lg overflow-hidden">
        <div 
          ref={mapRef} 
          style={{ height, width: '100%' }}
          className="bg-muted"
        />
      </div>

      {/* Instructions */}
      <p className="text-sm text-muted-foreground mt-2">
        Click on the map to select a location or search for an address above.
      </p>
    </div>
  )
}

export default GoogleMapPicker
