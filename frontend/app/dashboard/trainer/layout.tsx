import React from 'react'
import SideBar from './_components/SideBar'

const Trainerlayout = ({children}:{children:React.ReactNode}) => {
  return (
    <SideBar>
      {children}
    </SideBar>
  )
}

export default Trainerlayout