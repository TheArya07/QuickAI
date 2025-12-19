import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { Menu, X } from "lucide-react";
import Sidebar from "../component/Sidebar";
import { SignIn, useUser } from "@clerk/clerk-react";

const Layout = () => {
  const navigate = useNavigate();
  const [sidebar, setSidebar] = useState(false);
  const { user } = useUser();

  return user ? (
    <div className="flex flex-col h-screen">

      {/* NAVBAR */}
      <nav className="w-full px-8 min-h-14 flex items-center justify-between border-b border-gray-200">
        
        <img
          src={assets.logo}
          alt="logo"
          className="h-10 cursor-pointer w-32 sm:w-44"
          onClick={() => navigate("/")}
        />

        {/* MOBILE MENU */}
        {sidebar ? (
          <X
            onClick={() => setSidebar(false)}
            className="w-6 h-6 text-gray-600 sm:hidden cursor-pointer"
          />
        ) : (
          <Menu
            onClick={() => setSidebar(true)}
            className="w-6 h-6 text-gray-600 sm:hidden cursor-pointer"
          />
        )}
      </nav>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 w-full h-[calc(100vh-64px)]">

        {/* SIDEBAR */}
        <Sidebar sidebar={sidebar} setSidebar={setSidebar} />

        {/* RIGHT CONTENT */}
        <div className="flex-1 bg-[#F4F7FB] p-4 overflow-auto mt-14">
          <Outlet />
        </div>

      </div>

    </div>
  ) : (
    <div className="flex items-center justify-center h-screen">
      <SignIn /> {/* FIXED */}
    </div>
  );
};

export default Layout;
