import FacilitiesTable from '@/components/dashboard/facilities-table'
import React from 'react'

export default function page() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Health Facilities</h1>
      <FacilitiesTable />
    </div>
  )
}
