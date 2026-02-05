// components/Footer.tsx
'use client'

import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { useLayout } from './LayoutContext'

export default function Footer() {
  const { isAdminLayout } = useLayout()
  
  return (
    <footer className={`bg-gradient-to-b from-[#1B3A57] to-[#0A1E2F] text-white py-12  w-full ${isAdminLayout ? 'md:pl-64 lg:pl-72' : ''}`}>
      <div className={`${isAdminLayout ? 'px-6' : 'mx-auto max-w-7xl px-6'}`}>
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#007B7F] to-[#FFD166] flex items-center justify-center text-white font-bold">
                A
              </div>
              <div className="text-xl font-bold text-white">A.W.G Furniture</div>
            </div>
            <p className="text-white/70">Crafting beautiful spaces since 2010</p>
          </div>

          {['Quick Links', 'Services', 'Contact Info'].map((title, idx) => (
            <div key={title}>
              <h3 className="font-bold text-white mb-4">{title}</h3>
              <ul className="space-y-2">
                {['Home', 'Products', 'Office Solutions', 'Contact Us'].map((link, linkIdx) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-white/70 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                    >
                      <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10">
          <div className="text-white/50 text-sm mb-4 md:mb-0">
            © 2024 A.W.G Furniture. All rights reserved.
          </div>

          <div className="flex gap-4">
            {['Instagram', 'Facebook', 'Twitter', 'LinkedIn'].map((social) => (
              <a
                key={social}
                href="#"
                className="text-white/70 hover:text-white transition-colors duration-300 hover:scale-110"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}