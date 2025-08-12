"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function ImageBackground() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Array of image paths from assets folder
  const images = [
    '/assets/img1.jpg',
    '/assets/img2.webp', 
    '/assets/img3.jpg',
    '/assets/img4.jpg'
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % images.length
      )
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [images.length])

  return (
    <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={image}
            alt={`Background ${index + 1}`}
            fill
            className="object-cover brightness-90 contrast-100"
            priority={index === 0} // Prioritize loading the first image
            quality={90}
          />
        </div>
      ))}
    </div>
  )
}