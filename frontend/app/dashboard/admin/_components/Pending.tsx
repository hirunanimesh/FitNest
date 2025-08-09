import React from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from 'lucide-react'

const pendingVerifications = [
    {
      id: 1,
      name: "FitZone Premium",
      type: "Gym",
      owner: "John Smith",
      submittedDate: "2024-01-15",
      documents: 5,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      type: "Trainer",
      specialization: "Weight Loss",
      submittedDate: "2024-01-14",
      documents: 3,
    },
  ]
  
const Pending = () => {
  return (
    <div>
        <Card>
              <CardHeader>
                <CardTitle>Pending Verifications</CardTitle>
                <CardDescription>Review and approve gym and trainer applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingVerifications.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>{item.type === "Gym" ? "🏋️" : "👨‍💼"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.type} • {item.type === "Gym" ? `Owner: ${item.owner}` : item.specialization}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Submitted: {item.submittedDate} • {item.documents} documents
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                        <Button size="sm">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive">
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
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

export default Pending
