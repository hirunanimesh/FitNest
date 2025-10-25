"use client"
import { Card, CardContent } from "@/components/ui/card"
import { useTrainerData } from '../context/TrainerContext';

export default function Feedback() {
  const { trainerData, isLoading, error } = useTrainerData();
  const feedbacks = trainerData?.feedbacks || [];

  const cardBackgrounds = [
    'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900',
    'bg-gradient-to-br from-gray-800 via-slate-800 to-gray-900',
    'bg-gradient-to-br from-gray-800 via-stone-800 to-gray-900'
  ];

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
    <section id="feedbacks" className="py-20 bg-gradient-to-br from-gray-800 to-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-5xl font-bold mb-4"><span className="bg-gradient-to-r from-red-400 via-rose-400 to-pink-400 bg-clip-text text-transparent text-3xl md:text-5xl font-extrabold transform transition-transform duration-500 ease-out hover:-translate-y-1 hover:scale-105 text-bold">Client Success Stories</span></h3>
          <p className="text-lg text-gray-300">Real transformations from real people</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {feedbacks.map((feedback: any, i: number) => (
            <Card
              key={feedback.id}
              className={`text-center ${cardBackgrounds[i % cardBackgrounds.length]} border-gray-800 transition-transform duration-300 hover:scale-105 hover:shadow-2xl group`}
            >
              <CardContent className="p-6">
                <img
                  src={feedback.customer?.profile_img || "/placeholder.svg"}
                  alt={`${feedback.customer?.first_name || ""} ${feedback.customer?.last_name || ""}`}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-gray-700"
                />
                
                <p className="text-gray-300 mb-4 italic">"{feedback.feedback}"</p>
                <div>
                  <div className="font-semibold text-white">
                    {feedback.customer?.first_name} {feedback.customer?.last_name}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}