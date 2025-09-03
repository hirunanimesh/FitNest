import React from 'react'
import UserInquiries from '../components/user-inquiries'

function InquiriesPage() {
  return (
    <div className="space-y-1">
        <div className="border-b border-border pb-6">
          <h1 className="text-3xl font-bold text-white mb-2">User Inquiries</h1>
          <p className="text-muted-foreground text-lg">Manage user reports and inquiries</p>
        </div>

        <UserInquiries />
      </div>
  )
}

export default InquiriesPage
