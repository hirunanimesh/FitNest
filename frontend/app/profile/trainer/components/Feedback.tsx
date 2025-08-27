"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";


export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchFeedbacks = async () => {
      const trainerId = searchParams.get("id"); // Updated to fetch "id" from the URL
      console.log("Fetching feedbacks for trainerId:", trainerId);

      if (!trainerId) {
        console.error("Trainer ID is missing in the URL");
        return;
      }

      try {
        
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/trainer/getfeedbackbytrainerid/${trainerId}`
        );
        console.log("Fetched feedbacks:", response.data);
        if (response.data ) {
          setFeedbacks(response.data.trainer);
        } else {
          console.error("Unexpected response format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    };

    fetchFeedbacks();
  }, [searchParams]);

  return (
    <section id="feedbacks" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-4">Client Success Stories</h3>
          <p className="text-lg text-gray-300">Real transformations from real people</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {feedbacks.map((feedback) => (
            <Card key={feedback.id} className="text-center bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <img
                  src={feedback.customer?.profile_img || "/placeholder.svg"}
                  alt={`${feedback.customer?.first_name || ""} ${feedback.customer?.last_name || ""}`}
                  className="w-24 h-24 rounded-full mx-auto mb-4"
                />
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )}