import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { label: "Dashboard", icon: "dashboard", path: "/dashboard" },
    { label: "Upload GeoTIFF", icon: "upload_file", path: "/upload-tif" },
    { label: "Hasil", icon: "assignment", path: "/hasil" },
    { label: "Prediksi", icon: "trending_up", path: "/prediksi" },
    { label: "Riwayat", icon: "history", path: "/riwayat" }, // Tambahan Riwayat
  ];

  return (
    <div className="relative">
      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? "w-56" : "w-16"
        } min-h-screen bg-[#0B1F55] text-white flex flex-col justify-between transition-all duration-300`}
      >
        {/* Header */}
        <div className={`px-3 ${isOpen ? "block" : "hidden"} mt-4 text-center`}>
          <h1 className="text-base font-bold leading-tight">
            PETA KLASIFIKASI LAHAN SAWAH <br />
          </h1>
        </div>

        {/* Menu Items */}
        <nav className="mt-6 space-y-1 px-2 flex-1">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center w-full gap-3 px-2 py-1.5 rounded-md text-sm transition ${
                isActive(item.path)
                  ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white"
                  : "hover:bg-blue-900 text-gray-300"
              }`}
            >
              <div className="p-1.5 bg-blue-900 rounded-md">
                <span className="material-icons text-base text-white">{item.icon}</span>
              </div>
              {isOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-3">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
            className="w-full py-1.5 bg-red-500 hover:bg-red-600 rounded-md text-sm font-semibold text-white"
          >
            {isOpen ? "Logout" : <span className="material-icons text-base">logout</span>}
          </button>
        </div>
      </aside>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-6 -right-3 bg-white text-[#0B1F55] rounded-full p-1 shadow-md z-10"
      >
        <span className="material-icons text-sm">
          {isOpen ? "chevron_left" : "chevron_right"}
        </span>
      </button>
    </div>
  );
};

export default Sidebar;
