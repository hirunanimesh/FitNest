import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const recentFeedback = [
    {
      id: 1,
      user: "Mike Chen",
      rating: 5,
      comment: "Great platform! Found an amazing trainer.",
      date: "2024-01-15",
      type: "Positive",
    },
    {
      id: 2,
      user: "Emily Rodriguez",
      rating: 2,
      comment: "Had issues with gym booking system.",
      date: "2024-01-14",
      type: "Issue",
    },
  ]
  
const Feedback = () => {
  return (
    <div>
       <Card>
              <CardHeader>
                <CardTitle>Recent User Feedback</CardTitle>
                <CardDescription>Monitor user satisfaction and address concerns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentFeedback.map((feedback) => (
                    <div key={feedback.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{feedback.user[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">{feedback.user}</p>
                            <p className="text-xs text-muted-foreground">{feedback.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={feedback.type === "Positive" ? "default" : "destructive"}>
                            {feedback.type}
                          </Badge>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-sm ${i < feedback.rating ? "text-yellow-400" : "text-gray-300"}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{feedback.comment}</p>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          View User Profile
                        </Button>
                        <Button size="sm" variant="outline">
                          Respond
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
    </div>
  )
}

export default Feedback
