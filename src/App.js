import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import HasilPage from "./pages/HasilPage";
import UploadGeoTIFF from "./components/UploadGeoTIFF";
import LoginPage from "./pages/Login";
import RiwayatPage from "./pages/RiwayatPage";
import ProtectedRoute from "./components/ProtectedRoute";
//import PrediksiPage from "./pages/PrediksiPage";
import ChangePrediction from "./components/ChangePrediction";
import Home from "./pages/HalamanUtama";
import GuestHasil from "./pages/GuestView";

function App() {
  return (
    <Routes>
      {/* Public Route (tanpa Sidebar) */}
      <Route path="/" element={<GuestHasil />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected Routes (dengan Sidebar) */}
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <div className="flex">
              <Sidebar />
              <div className="flex-1">
                <Routes>
                  <Route path="/home" element={<Home />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route
                    path="/upload-tif"
                    element={<UploadGeoTIFF onUploadComplete={() => console.log("Upload selesai")} />}
                  />
                  <Route path="/hasil" element={<HasilPage />} />
                  <Route path="/prediksi" element={<ChangePrediction />} />
                  <Route path="/riwayat" element={<RiwayatPage />} />
                </Routes>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  ); 
}

export default App;
