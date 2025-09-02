import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Edit, Trash, User, Lock, Users } from 'lucide-react'
import Link from 'next/link'
import CreatePlan from './CreateSession'

const plans = [
    {
        id: 1,
        title: 'Premium Fitness Bootcamp',
        description: 'High-intensity workout sessions with personalized nutrition guidance.',
        duration: '3 months',
        timeSlots: 'Monday, Wednesday, Friday - 6 PM to 7 PM',
        zoomLink: 'https://zoom.us/j/1234567890',
        isSubscribed: true,
        subscribers: [
            {
                id: 1,
                name: 'John Smith',
                age: 28,
                height: '178 cm',
                weight: '82 kg',
                address: 'WV99+5H6 Central Hospital - New York, New York 10001, USA',
                phone_no: '0771234567',
                profile_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
            },
            {
                id: 2,
                name: 'Emma Wilson',
                age: 32,
                height: '168 cm',
                weight: '66 kg',
                address: 'XV44+8G2 Metro Medical Center - Los Angeles, California 90210, USA',
                phone_no: '0772987654',
                profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
            },
            {
                id: 3,
                name: 'Michael Chen',
                age: 24,
                height: '173 cm',
                weight: '75 kg',
                address: 'ZW22+3J9 City General Hospital - Chicago, Illinois 60601, USA',
                phone_no: '0773456789',
                profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
            }
        ]
    },
    {
        id: 2,
        title: 'Yoga Classes',
        description: 'Weekly yoga classes for all levels.',
        duration: '3 months',
        timeSlots: 'Tuesday, Thursday - 7 AM to 8 AM',
        zoomLink: 'https://zoom.us/j/1234567890',
        isSubscribed: false,
        subscribers: []
    },
    {
        id: 3,
        title: 'Personal Training',
        description: 'One-on-one personal training sessions.',
        duration: '6 months',
        timeSlots: 'Tuesday, Thursday - 5 PM to 6 PM',
        zoomLink: 'https://zoom.us/j/0987654321',
        isSubscribed: false,
        subscribers: []
    },
    {
        id: 4,
        title: 'Strength Training',
        description: 'Build muscle and increase strength with guided workouts.',
        duration: '4 months',
        timeSlots: 'Monday, Wednesday, Friday - 8 AM to 9 AM',
        zoomLink: 'https://zoom.us/j/1122334455',
        isSubscribed: false,
        subscribers: []
    }
]

const Plans = () => {
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [showUserDialog, setShowUserDialog] = useState(false)

    const handleDeletePlan = (planId: number) => {
        // Logic to delete the plan
        console.log(`Deleting plan with ID: ${planId}`);
    }

    const handleUserClick = (user: any) => {
        setSelectedUser(user)
        setShowUserDialog(true)
    }

    const closeUserDialog = () => {
        setShowUserDialog(false)
        setSelectedUser(null)
    }
  return (
    <div className='p-6'>
       <div>
              <div className='flex flex-row justify-between'>
                <h2 className="text-2xl font-semibold mb-4 text-white">Ongoing Sessions</h2>
                <CreatePlan/>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <Card key={plan.id} className={`bg-gray-800 ${plan.isSubscribed ? 'border-green-500 border-2' : ''}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className='text-md text-white'>{plan.title}</CardTitle>
                        {plan.isSubscribed && (
                          <Badge variant="secondary" className="bg-green-600 text-white">
                            <Lock className="h-3 w-3 mr-1" />
                            Subscribed
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className='text-xs text-gray-300'>
                      <p>{plan.description}</p>
                      <p>Duration: {plan.duration}</p>
                      <p>Time Slots: {plan.timeSlots}</p>
                      <p>Zoom Link:<Link className='text-blue-700 underline' href={plan.zoomLink}>{plan.zoomLink} </Link> </p>
                      
                      {/* Subscribers Section */}
                      {plan.isSubscribed && plan.subscribers.length > 0 && (
                        <div className="mt-4 p-3 bg-gray-700 rounded">
                          <div className="flex items-center mb-2">
                            <Users className="h-4 w-4 mr-2 text-green-400" />
                            <span className="text-green-400 font-medium">Subscribers ({plan.subscribers.length})</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {plan.subscribers.map((subscriber) => (
                              <div
                                key={subscriber.id}
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => handleUserClick(subscriber)}
                              >
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={subscriber.profile_image} alt={subscriber.name} />
                                  <AvatarFallback className="bg-blue-600 text-white text-xs">
                                    {subscriber.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className={`text-black ${plan.isSubscribed ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={plan.isSubscribed}
                        >
                          <Edit className="h-4 w-4" /> Edit
                        </Button>
                        <Button 
                          size="sm"  
                          onClick={() => handleDeletePlan(plan.id)}
                          className={plan.isSubscribed ? 'opacity-50 cursor-not-allowed' : ''}
                          disabled={plan.isSubscribed}
                        >
                          <Trash className="h-4 w-4" /> Delete
                        </Button>
                      </div>
                      
                      {plan.isSubscribed && (
                        <p className="text-xs text-yellow-400 mt-2 flex items-center">
                          <Lock className="h-3 w-3 mr-1" />
                          Cannot edit/delete - Active subscribers
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* User Details Dialog */}
              <Dialog open={showUserDialog} onOpenChange={closeUserDialog}>
                <DialogContent className="bg-gray-800 text-white border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={selectedUser?.profile_image} alt={selectedUser?.name} />
                        <AvatarFallback className="bg-blue-600 text-white">
                          {selectedUser?.name?.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold">{selectedUser?.name}</h3>
                      </div>
                    </DialogTitle>
                  </DialogHeader>
                  
                  {selectedUser && (
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-400">Phone</label>
                          <p className="text-white">{selectedUser.phone_no}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-400">Age</label>
                          <p className="text-white">{selectedUser.age} years old</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-400">Height</label>
                          <p className="text-white">{selectedUser.height}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-400">Weight</label>
                          <p className="text-white">{selectedUser.weight}</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-400">Address</label>
                        <p className="text-white">{selectedUser.address}</p>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
    </div>
  )
}

export default Plans
