import React from 'react'
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Session {
    id: number;
    title: string;
    trainer: string;
    date: string;
    time: string;
    amount: string;
    description: string;
    image?: string;
  }

const TodaySessions = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
  return (
    <div>
      <Card>
              <CardHeader>
                <CardTitle>Today's Sessions</CardTitle>
                <CardDescription>Your scheduled workout sessions for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sessions.slice(0, 2).map((session) => (
                    <Card key={session.id} className="border-l-4 border-l-primary">
                      <CardHeader className="pb-2">
                        <img 
                          src={session.image || "/placeholder.svg"} 
                          alt={session.title}
                          className="w-full h-24 object-cover rounded-md mb-2"
                        />
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        <CardDescription>with {session.trainer}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Date:</span>
                            <Badge variant="outline">{session.date}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Time:</span>
                            <Badge variant="outline">{session.time}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Amount:</span>
                            <Badge variant="default" className="bg-green-500">{session.amount}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">{session.description}</p>
                          <Button size="sm" className="w-full mt-3">
                            Join Session
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
    </div>
  )
}

export default TodaySessions
