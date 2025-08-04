"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

const galleryImages = [
  {
    id: 1,
    src: "/images/gallery-1.png",
    alt: "Modern gym equipment",
    category: "Equipment",
  },
  {
    id: 2,
    src: "/images/gallery-2.png",
    alt: "Group fitness class",
    category: "Classes",
  },
  {
    id: 3,
    src: "/images/gallery-3.png",
    alt: "Personal training session",
    category: "Training",
  },
  {
    id: 4,
    src: "/images/gallery-4.png",
    alt: "Yoga and stretching area",
    category: "Wellness",
  },
  {
    id: 5,
    src: "/images/gallery-5.png",
    alt: "Cardio equipment zone",
    category: "Cardio",
  },
  {
    id: 6,
    src: "/images/gallery-6.png",
    alt: "Strength training area",
    category: "Strength",
  },
]

export function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<(typeof galleryImages)[0] | null>(null)

  return (
    <>
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-black">Fitness Gallery</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Explore our world-class facilities, equipment, and the vibrant fitness community that makes FitNest special.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((image) => (
              <Card
                key={image.id}
                className="overflow-hidden cursor-pointer group bg-white border-border hover:border-primary/50 transition-all duration-300"
                onClick={() => setSelectedImage(image)}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                      {image.category}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh]">
            <Button
              variant="outline"
              size="icon"
              className="absolute -top-12 right-0 bg-transparent border-white text-white hover:bg-white hover:text-black"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            <img
              src={selectedImage.src || "/placeholder.svg"}
              alt={selectedImage.alt}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg">
              <div className="font-semibold">{selectedImage.category}</div>
              <div className="text-sm text-gray-300">{selectedImage.alt}</div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
