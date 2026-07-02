import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1600&q=80')", // 🌾 Gambar sawah (unsplash)
      }}
    >
      {/* Overlay gelap agar teks kontras */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Konten utama */}
      <div className="relative z-10 text-center text-white px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
          Selamat Datang di Sistem Klasifikasi Perubahan Lahan Sawah
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-10">
          Pantau dan analisis perubahan lahan sawah dengan mudah.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition duration-300 shadow-lg"
          >
            🌍 Buka Dashboard
          </button>

          <button
            onClick={() => navigate("/riwayat")}
            className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition duration-300 shadow-lg"
          >
            📊 Lihat Riwayat
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
