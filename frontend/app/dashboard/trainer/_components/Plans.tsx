import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit, Trash } from 'lucide-react'
import Link from 'next/link'
import CreatePlan from './CreateSession'

const plans = [
    {
        id: 1,
        title: 'Yoga Classes',
        description: 'Weekly yoga classes for all levels.',
        duration: '3 months',
        timeSlots: 'Monday, Wednesday, Friday - 6 PM to 7 PM',
        zoomLink: 'https://zoom.us/j/1234567890',
    },
    {
        id: 2,
        title: 'Personal Training',
        description: 'One-on-one personal training sessions.',
        duration: '6 months',
        timeSlots: 'Tuesday, Thursday - 5 PM to 6 PM',
        zoomLink: 'https://zoom.us/j/0987654321',
    },
    {
      id: 3,
      title: 'Personal Training',
      description: 'One-on-one personal training sessions.',
      duration: '6 months',
      timeSlots: 'Tuesday, Thursday - 5 PM to 6 PM',
      zoomLink: 'https://zoom.us/j/0987654321',
  },
  
]

const Plans = () => {

    const handleDeletePlan = (planId: number) => {
        // Logic to delete the plan
        console.log(`Deleting plan with ID: ${planId}`);
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
                  <Card key={plan.id} className='bg-gray-800'>
                    <CardHeader>
                      <CardTitle className='text-md text-white'>{plan.title}</CardTitle>
                    </CardHeader>
                    <CardContent className='text-xs text-gray-300'>
                      <p>{plan.description}</p>
                      <p>Duration: {plan.duration}</p>
                      <p>Time Slots: {plan.timeSlots}</p>
                      <p>Zoom Link:<Link className='text-blue-700 underline' href={plan.zoomLink}>{plan.zoomLink} </Link> </p>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" className='text-black'>
                          <Edit className="h-4 w-4" /> Edit
                        </Button>
                        <Button size="sm"  onClick={() => handleDeletePlan(plan.id)}>
                          <Trash className="h-4 w-4" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
    </div>
  )
}

export default Plans
