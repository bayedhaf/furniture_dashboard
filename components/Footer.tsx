import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="mx-auto max-w-7xl px-6 py-6 text-center text-sm text-[#6C757D]">
        © {new Date().getFullYear()} A.W.G Furniture. All rights reserved.
      </div>
    </footer>
  )
}
