import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaLeaf, FaMapMarkedAlt, FaClipboardList } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [totalArea, setTotalArea] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const wilayah = localStorage.getItem("wilayah");
  
    if (!wilayah) return;
  
    axios
      .post("http://localhost:5000/get-total-area", {
        filename: `${wilayah}.shp`,
      })
      .then((res) => setTotalArea(res.data.total_area_ha))
      .catch((err) => console.error("Gagal mengambil total area:", err));
  }, []);

  const handleMenuClick = (label) => {
    switch (label) {
      case "Mulai Proses NDVI":
        navigate("/upload-tif");
        break;
      case "Lihat Peta":
        navigate("/hasil");
        break;
      case "Lihat Hasil Klasifikasi":
        const uploaded = localStorage.getItem("shp_uploaded");
        if (uploaded === "true") {
          navigate("/hasil");
        } else {
          navigate("/upload-tif");
        }
        break;
      default:
        break;
    }
  };

  const menuItems = [
    {
      label: "Mulai Proses NDVI",
      icon: <FaLeaf size={28} className="text-green-600" />,
      bg: "bg-green-100",
    },
    {
      label: "Lihat Peta",
      icon: <FaMapMarkedAlt size={28} className="text-blue-600" />,
      bg: "bg-blue-100",
    },
    {
      label: "Lihat Hasil Klasifikasi",
      icon: <FaClipboardList size={28} className="text-purple-600" />,
      bg: "bg-purple-100",
    },
  ];

  return (
    <div className="flex-1 p-6 md:p-10 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-1">Selamat Datang di</h1>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Sistem Klasifikasi Lahan</h2>

        {/* Total Area Box */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-10 w-full max-w-sm">
          <div className="text-gray-600 mb-2">Total Area Diproses</div>
          <div className="text-2xl font-bold text-blue-700">
            {totalArea !== null ? `${totalArea.toLocaleString()} ha` : "Memuat..."}
          </div>
        </div>

        {/* Menu Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => handleMenuClick(item.label)}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 flex flex-col items-center justify-center cursor-pointer hover:-translate-y-1"
            >
              <div className={`w-16 h-16 flex items-center justify-center rounded-full mb-4 ${item.bg}`}>
                {item.icon}
              </div>
              <div className="text-center font-medium text-gray-800">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
