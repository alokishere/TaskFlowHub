import React, { createContext, useEffect, useState } from 'react'
import { getLocalstorage, setLocalStorage } from '../utils/LocalStorage'

export const AuthContext = createContext()
// localStorage.clear()
const ContextProvider = ({children}) => {
    
  const [userData, setUserData] = useState(null)

useEffect(() => {
  setLocalStorage()
const {employees,admin} = getLocalstorage()
  setUserData({employees,admin})

}, [])

  return (
    <div>
    <AuthContext.Provider value={userData}>
      {children}
    </AuthContext.Provider>
    </div>
  )
}

export default ContextProvider