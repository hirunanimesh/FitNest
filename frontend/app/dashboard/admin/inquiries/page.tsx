import React from 'react'
import UserInquiries from '../components/user-inquiries'

function InquiriesPage() {
  return (
    <div className="space-y-6 px-4 sm:px-6">
        <div className="border-b border-border pb-6 px-2 sm:px-0 pt-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">User Inquiries</h1>
          <p className="text-muted-foreground text-base sm:text-lg">Manage user reports and inquiries</p>
        </div>

        <UserInquiries />
      </div>
  )
}

export default InquiriesPage
