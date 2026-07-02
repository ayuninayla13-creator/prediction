// src/pages/PrediksiPage.js
import React, { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import ChangePrediction from "../components/ChangePrediction";
import Legend from "../components/Legend";
import classColorMap from "../constants/classColorMap";

function PrediksiPage() {
  const [message, setMessage] = useState("");
  const [classifiedUrl, setClassifiedUrl] = useState(null);
  const [areas, setAreas] = useState(null);
  const [predictedYear, setPredictedYear] = useState(null);

  const handlePredict = async () => {
    setMessage("Memproses prediksi...");
    setClassifiedUrl(null);
    setAreas(null);

    try {
      const res = await fetch("http://localhost:5000/prediksi", {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        setPredictedYear(data.predicted_year ?? "Selanjutnya");
        setMessage(`Prediksi ${data.predicted_year} selesai.`);
        setClassifiedUrl(`http://localhost:5000${data.tif_url}`);
        setAreas(data.areas_by_class);
      } else {
        setMessage("Gagal: " + (data.message || data.error));
      }
    } catch (err) {
      console.error(err);
      setMessage("Error saat memanggil server.");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 w-full">
      <h2 className="text-xl font-bold">
        Prediksi Kelas Lahan {predictedYear ? `(${predictedYear})` : ""}
      </h2>

      <button
        onClick={handlePredict}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-fit"
      >
        Jalankan Prediksi
      </button>
      <p>{message}</p>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Peta */}
        <div className="flex-1 border rounded-lg shadow overflow-hidden">
          <MapContainer
            center={[-0.9, 100.35]}
            zoom={11}
            style={{ height: "500px", width: "100%" }}
          >
            <TileLayer
              attribution="© OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {classifiedUrl && (
              <ChangePrediction url={classifiedUrl} classColorMap={classColorMap} />
            )}
          </MapContainer>
        </div>

        {/* Statistik + Legend */}
        <div className="w-full md:w-72 flex flex-col gap-4">
          <div className="border rounded-lg shadow p-3 bg-white">
            <h3 className="text-lg font-semibold mb-2">Statistik Area (ha)</h3>
            {areas ? (
              <ul className="text-sm">
                {Object.entries(classColorMap).map(([classId, { label }]) => (
                  <li key={classId}>
                    <strong>{label}:</strong>{" "}
                    {areas[String(classId)]?.toFixed(2) || 0} ha
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm">Belum ada hasil.</p>
            )}
          </div>

          <div className="border rounded-lg shadow p-3 bg-white">
            <Legend />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrediksiPage;
