import React, { Suspense } from 'react'
import UserInquiries from '../components/user-inquiries'
import { Skeleton } from '@/components/ui/skeleton'

// function InquiriesLoadingSkeleton() {
//   return (
//     <div className="space-y-6 px-4 sm:px-6">
//       <div className="border-b border-border pb-6 px-2 sm:px-0 pt-2">
//         <Skeleton className="h-8 w-48 mb-2" />
//         <Skeleton className="h-6 w-64" />
//       </div>

//       {/* Search and Filter Skeleton */}
//       <div className="flex flex-col sm:flex-row gap-4 mb-6">
//         <Skeleton className="h-10 flex-1" />
//         <Skeleton className="h-10 w-32" />
//         <Skeleton className="h-10 w-32" />
//       </div>

//       {/* Inquiries List Skeleton */}
//       <div className="space-y-4">
//         {[1, 2, 3, 4, 5].map((i) => (
//           <div key={i} className="border border-border rounded-lg p-6 space-y-4">
//             <div className="flex items-start justify-between">
//               <div className="flex items-center gap-3 flex-1">
//                 <Skeleton className="h-12 w-12 rounded-full" />
//                 <div className="flex-1 space-y-2">
//                   <Skeleton className="h-5 w-48" />
//                   <Skeleton className="h-4 w-32" />
//                 </div>
//               </div>
//               <Skeleton className="h-6 w-20" />
//             </div>
//             <div className="space-y-2">
//               <Skeleton className="h-4 w-full" />
//               <Skeleton className="h-4 w-3/4" />
//             </div>
//             <div className="flex gap-2">
//               <Skeleton className="h-8 w-24" />
//               <Skeleton className="h-8 w-24" />
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

function InquiriesPage() {
  return (
    <div className="space-y-6 px-4 sm:px-6">
        <div className="border-b border-border pb-6 px-2 sm:px-0 pt-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">User Inquiries</h1>
          <p className="text-muted-foreground text-base sm:text-lg">Manage user reports and inquiries</p>
        </div>

        {/* <Suspense fallback={<InquiriesLoadingSkeleton />}>
          <UserInquiries />
        </Suspense> */}
        <UserInquiries />
      </div>
  )
}

export default InquiriesPage
