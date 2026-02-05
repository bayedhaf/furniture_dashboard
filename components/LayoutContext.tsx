
'use client'

import React, { createContext, useContext, ReactNode } from 'react'

interface LayoutContextType {
  isAdminLayout: boolean
}

const LayoutContext = createContext<LayoutContextType>({
  isAdminLayout: false
})

export const useLayout = () => useContext(LayoutContext)

interface LayoutProviderProps {
  children: ReactNode
  isAdminLayout?: boolean
}

export function LayoutProvider({ children, isAdminLayout = false }: LayoutProviderProps) {
  return (
    <LayoutContext.Provider value={{ isAdminLayout }}>
      {children}
    </LayoutContext.Provider>
  )
}