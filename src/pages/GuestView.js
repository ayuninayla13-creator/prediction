import React, { useState, useEffect } from "react";
import HasilPage from "./HasilPage";
import { Map, Layers, BarChart3 } from "lucide-react";

export default function GuestView() {
  const [showMap, setShowMap] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      const fiturPos = document.getElementById("fitur")?.offsetTop || 0;
      const scrollY = window.scrollY + 200;

      setActiveSection(scrollY >= fiturPos ? "fitur" : "home");
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-50 scroll-smooth">
      {/* HEADER */}
      <header className="w-full bg-white/80 backdrop-blur-md shadow fixed top-0 left-0 z-50 transition">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          {/* LOGO */}
          <h1 className="text-xl font-bold text-blue-700">
            Kota Padang <span className="text-gray-700">LandCover</span>
          </h1>

          {/* NAVBAR */}
          <nav className="hidden md:flex gap-8 items-center text-gray-700 font-medium">
            {/* MENU */}
            <a
              href="#home"
              onClick={() => setActiveSection("home")}
              className={`relative pb-1 transition ${
                activeSection === "home"
                  ? "text-blue-600 font-semibold"
                  : "hover:text-blue-600"
              }`}
            >
              Beranda
              {activeSection === "home" && (
                <span className="absolute left-0 bottom-0 w-full h-[2px] bg-blue-600 rounded-full"></span>
              )}
            </a>

            <a
              href="#fitur"
              onClick={() => setActiveSection("fitur")}
              className={`relative pb-1 transition ${
                activeSection === "fitur"
                  ? "text-blue-600 font-semibold"
                  : "hover:text-blue-600"
              }`}
            >
              Fitur
              {activeSection === "fitur" && (
                <span className="absolute left-0 bottom-0 w-full h-[2px] bg-blue-600 rounded-full"></span>
              )}
            </a>

            {/* 🔥 LOGIN BUTTON */}
            <a
              href="/login"
              className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
            >
              Login
            </a>
          </nav>

          {/* MOBILE LOGIN BUTTON */}
          <a
            href="/login"
            className="md:hidden bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
          >
            Login
          </a>
        </div>
      </header>

      <div className="h-20"></div>

      {/* HERO SECTION */}
      <section
        id="home"
        className="relative w-full bg-cover bg-center bg-fixed min-h-screen flex items-center justify-center"
        style={{
          backgroundImage:
            "url('https://www.hiti.or.id/storage/2025/04/sawah_2.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative text-center px-6 max-w-3xl mx-auto animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-2xl leading-tight">
            Klasifikasi Lahan Sawah
          </h1>
          <p className="text-white text-lg md:text-xl mt-5 opacity-90">
            Platform untuk menampilkan hasil klasifikasi tutupan lahan sawah
            secara visual dan interaktif.
          </p>

          <div className="mt-12 animate-bounce">
            <a href="#fitur" className="text-white text-3xl opacity-70 hover:opacity-100">
              ▼
            </a>
          </div>
        </div>
      </section>

      {/* FITUR SECTION */}
      <section id="fitur" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Menu Informasi & Visualisasi
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          <FeatureCard
            icon={<Map size={48} className="text-blue-600" />}
            title="Peta Klasifikasi Lahan"
            desc="Melihat hasil klasifikasi tutupan lahan secara interaktif."
            onClick={() => {
              setShowMap(true);
              document.getElementById("hasil").scrollIntoView({ behavior: "smooth" });
            }}
          />

          <FeatureCard
            icon={<Layers size={48} className="text-purple-600" />}
            title="Detail Luas Kelas Lahan"
            desc="Melihat luasan setiap kelas lahan berdasarkan hasil klasifikasi."
            onClick={() => {
              setShowMap(true);
              document.getElementById("hasil").scrollIntoView({ behavior: "smooth" });
            }}
          />

          <FeatureCard
            icon={<BarChart3 size={48} className="text-green-600" />}
            title="Perubahan Kelas per Tahun"
            desc="Melihat perubahan luas lahan per tahun serta prediksi."
            onClick={() => {
              setShowMap(true);
              document.getElementById("hasil").scrollIntoView({ behavior: "smooth" });
            }}
          />
        </div>
      </section>

      {/* HASIL MAP */}
      <section id="hasil" className="max-w-6xl mx-auto px-6 pb-20">
        {showMap && (
          <div className="bg-white p-6 shadow-xl rounded-xl border animate-fadeIn">
            <HasilPage />
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-800 text-white text-center py-6 mt-10">
        <p>© 2025 Klasifikasi Lahan Sawah</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-6 shadow-md border hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer"
    >
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-center">{title}</h3>
      <p className="text-gray-600 text-center mt-2">{desc}</p>
      <button className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg transition">
        Lihat
      </button>
    </div>
  );
}
