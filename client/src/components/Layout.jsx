import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="relative min-h-screen bg-[#ECECEC] dark:bg-[#0A0A0B] text-fg transition-colors duration-300 flex flex-col justify-between">
      {/* Decorative global grid overlay with low opacity */}
      <div className="absolute inset-0 grid-bg opacity-[0.05] pointer-events-none -z-10" />

      <div>
        <Navbar />
        <main className="relative">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;