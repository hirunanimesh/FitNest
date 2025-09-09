"use client"
import React from 'react'
import Plans from '../_components/Plans'
import WorkoutAndDietPlans from '../_components/WorkoutPlans'
import GymPlans from '../_components/GymPlans'
const page = () => {
  return (
  <div className="min-h-screen bg-transparent">
      <div className="container mx-auto px-4 py-8">
        <Plans />
        <div className="mt-8">
          <WorkoutAndDietPlans />
        </div>
        <div className="mt-8">
          <GymPlans />
        </div>
      </div>
    </div>
  )
}

export default page
