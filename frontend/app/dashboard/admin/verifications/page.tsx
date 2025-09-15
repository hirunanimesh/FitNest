import React from 'react'
import VerificationRequests  from '../components/verification-requests'

function VerificationsPage() {
  return (
    <div className="space-y-6 px-4 sm:px-6">
        <div className="border-b border-gray-700 pb-6 px-2 sm:px-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Verification Management</h1>
          <p className="text-gray-400 text-base sm:text-lg">Review and approve pending verification requests</p>
        </div>

        <VerificationRequests />
      </div>
  )
}

export default VerificationsPage