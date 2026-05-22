"use client";

import Navbar from './Navbar'
import Footer from './Footer'

const Layout = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-[#F2F2F2] text-[#0D0D0D] dark:bg-[#0D0D0D] dark:text-[#F2F2F2] transition-colors duration-300 ease-[cubic-bezier(0.2,0,0,1)]">
      {/* Atmospheric blur shapes — global ambient depth */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 h-[40rem] w-[40rem] rounded-full bg-[#BFBFBF]/25 blur-3xl dark:bg-[#404040]/40" />
        <div className="absolute top-1/3 -right-40 h-[36rem] w-[36rem] rounded-full bg-[#8C8C8C]/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-[30rem] w-[30rem] rounded-full bg-[#0D0D0D]/10 blur-3xl dark:bg-[#F2F2F2]/5" />
      </div>

      <Navbar />
      <main className="relative">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout
