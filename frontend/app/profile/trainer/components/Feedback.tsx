"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { useTrainerData } from '../context/TrainerContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger  } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/AuthContext"

export default function Feedback() {
  const { trainerData, isLoading, error } = useTrainerData();
  const { userRole } = useAuth()
  const feedbacks = trainerData?.feedbacks || [];
  
  const isTrainer = userRole === 'trainer'
  if (isLoading) {
    return (
      <section id="feedbacks" className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Client Success Stories</h3>
            <div className="text-gray-300">Loading feedback...</div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="feedbacks" className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Client Success Stories</h3>
            <div className="text-red-400">Error loading feedback: {error}</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="feedbacks" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-4">Client Success Stories</h3>
          <p className="text-lg text-gray-300">Real transformations from real people</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {feedbacks.map((feedback: any) => (
            <Card key={feedback.id} className="text-center bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                {isTrainer ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <img
                        src={feedback.customer?.profile_img || "/placeholder.svg"}
                        alt={`${feedback.customer?.first_name || ""} ${feedback.customer?.last_name || ""}`}
                        className="w-24 h-24 rounded-full mx-auto mb-4 cursor-pointer hover:ring-2 hover:ring-red-500 transition-all duration-200"
                        title="Click to view customer profile"
                      />
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-black border-gray-800 text-white">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white">
                          {feedback.customer?.first_name} {feedback.customer?.last_name} - Profile
                        </DialogTitle>
                      </DialogHeader>
                      <iframe
                        src={`/profile/user?id=${feedback.customer?.id || ''}&name=${encodeURIComponent(`${feedback.customer?.first_name || ''} ${feedback.customer?.last_name || ''}`)}`}
                        className="w-full h-[80vh] border-0 rounded-lg bg-white"
                        title={`${feedback.customer?.first_name} ${feedback.customer?.last_name} Profile`}
                      />
                    </DialogContent>
                  </Dialog>
                ) : (
                  <img
                    src={feedback.customer?.profile_img || "/placeholder.svg"}
                    alt={`${feedback.customer?.first_name || ""} ${feedback.customer?.last_name || ""}`}
                    className="w-24 h-24 rounded-full mx-auto mb-4"
                  />
                )}
                
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">"{feedback.feedback}"</p>
                <div>
                  <div className="font-semibold text-white">
                    {feedback.customer?.first_name} {feedback.customer?.last_name}
                  </div>
                  {isTrainer && (
                    <p className="text-xs text-gray-400 mt-1">
                      Click profile image to view details
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}