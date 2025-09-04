import React from 'react'
import VerificationRequests  from '../components/verification-requests'

function VerificationsPage() {
  return (
    <div className="space-y-6">
        <div className="border-b border-gray-700 pb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Verification Management</h1>
          <p className="text-gray-400 text-lg">Review and approve pending verification requests</p>
        </div>

        <VerificationRequests />
      </div>
  )
}

export default VerificationsPage