// src/components/ChangePrediction.js
import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-geotiff";
import "leaflet-geotiff/leaflet-geotiff-plotty";
import classColorMap from "../constants/classColorMap";
import { LabelList } from "recharts";
import { Steps, Spin } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const { Step } = Steps;

/* ================= GEO TIFF ================= */
function GeoTIFFLayer({ url }) {
  const map = useMap();

  useEffect(() => {
    if (!url || !map) return;

    let geoTiffLayer;

    try {
      geoTiffLayer = L.leafletGeotiff(url, {
        band: 0,
        name: "Prediksi",
        renderer: L.LeafletGeotiff.plotty({
          colorScale: "viridis",
          displayMin: 0,
          displayMax: 5,
          clampLow: false,
          clampHigh: false,
        }),
        opacity: 0.7,
      });

      geoTiffLayer.addTo(map);
    } catch (err) {
      console.error("Gagal load GeoTIFF:", err);
    }

    return () => {
      if (geoTiffLayer) map.removeLayer(geoTiffLayer);
    };
  }, [url, map]);

  return null;
}

/* ================= MAIN ================= */
export default function ChangePrediction() {
  /* ================= STATE DENGAN PERSIST ================= */

  const [message, setMessage] = useState(
    localStorage.getItem("pred_message") || ""
  );

  const [classifiedUrl, setClassifiedUrl] = useState(
    localStorage.getItem("pred_url") || null
  );

  const [areas, setAreas] = useState(() => {
    const saved = localStorage.getItem("pred_areas");
    return saved ? JSON.parse(saved) : null;
  });

  const [lastYearAreas, setLastYearAreas] = useState(() => {
    const saved = localStorage.getItem("pred_last_areas");
    return saved ? JSON.parse(saved) : null;
  });

  const [currentStep, setCurrentStep] = useState(
    Number(localStorage.getItem("pred_step")) || 0
  );

  const [nextYear, setNextYear] = useState(
    Number(localStorage.getItem("pred_next_year")) || null
  );

  const steps = [
    { title: "Upload Data", description: "NDVI & Klasifikasi terakhir" },
    { title: "Preprocessing", description: "Normalisasi & sinkronisasi data" },
    { title: "Ekstraksi Fitur", description: "Gabungkan NDVI + kelas" },
    { title: "Prediksi MLP", description: "Proses klasifikasi" },
    { title: "Tampilkan Hasil", description: "Peta & Statistik" },
  ];

  /* ================= SIMPAN KE LOCAL STORAGE ================= */
  useEffect(() => {
    localStorage.setItem("pred_message", message || "");
    localStorage.setItem("pred_url", classifiedUrl || "");
    localStorage.setItem("pred_areas", JSON.stringify(areas));
    localStorage.setItem("pred_last_areas", JSON.stringify(lastYearAreas));
    localStorage.setItem("pred_step", currentStep);
    localStorage.setItem("pred_next_year", nextYear);
  }, [message, classifiedUrl, areas, lastYearAreas, currentStep, nextYear]);

  /* ================= FETCH LAST YEAR (HANYA SEKALI) ================= */
  useEffect(() => {
    if (nextYear) return; // Jangan fetch ulang kalau sudah ada

    async function fetchLastYear() {
      try {
        const res = await fetch("http://localhost:5000/last-year");
        const data = await res.json();

        if (data.success && data.last_year) {
          const lastYear = data.last_year;
          setNextYear(lastYear + 1);

          const luasRes = await fetch(
            "http://localhost:5000/hitung_luas",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                filename: `classified_*_Sentinel2_${lastYear}.tif`,
              }),
            }
          );

          const luasData = await luasRes.json();
          if (luasData.class_areas) {
            setLastYearAreas(luasData.class_areas);
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }

    fetchLastYear();
  }, [nextYear]);

  /* ================= HANDLE PREDIKSI ================= */
  const handlePredictNextYear = async () => {
    if (!nextYear) return;

    setMessage(`Memproses prediksi ${nextYear}...`);
    setCurrentStep(0);
    setAreas(null);
    setClassifiedUrl(null);

    try {
      // Simulasi step animasi
      for (let i = 0; i < steps.length - 1; i++) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setCurrentStep(i + 1);
      }

      const res = await fetch("http://localhost:5000/prediksi", {
        method: "POST",
      });

      const data = await res.json();

      if (data.success) {
        const fullUrl = `http://localhost:5000${data.tif_url}`;

        setMessage(`Prediksi ${nextYear} selesai.`);
        setClassifiedUrl(fullUrl);
        setAreas(data.areas_by_class);
        setCurrentStep(4);
      } else {
        setMessage("Prediksi gagal.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error server.");
    }
  };

  /* ================= DATA CHART ================= */
  const comparisonData = useMemo(() => {
    if (!areas || !lastYearAreas || !nextYear) return null;
  
    return Object.entries(classColorMap).map(
      ([classId, { label }]) => {
        const last = lastYearAreas[classId]?.value || 0;
        const pred = areas[label] || 0;
  
        let percentChange = 0;
        if (last !== 0) {
          percentChange = ((pred - last) / last) * 100;
        }
  
        return {
          name: label,
          last,
          pred,
          percentChange: Number(percentChange.toFixed(1)),
        };
      }
    );
  }, [areas, lastYearAreas, nextYear]);  

  const maxValue =
  comparisonData && comparisonData.length
    ? Math.max(
        ...comparisonData.map((d) => Math.max(d.last, d.pred))
      )
    : 0;

const roundedMax = Math.ceil(maxValue / 1000) * 1000;

const yTicks = [];
for (let i = 0; i <= roundedMax; i += 1000) {
  yTicks.push(i);
}

  /* ================= RENDER ================= */
  return (
    <div style={{ padding: 20 }}>
      <h2>
        Prediksi Kelas Lahan{" "}
        {nextYear && (
          <span style={{ color: "#2563eb" }}>{nextYear}</span>
        )}
      </h2>

      <button
        onClick={handlePredictNextYear}
        className="px-3 py-1 bg-blue-600 text-white rounded"
      >
        Prediksi
      </button>

      <p style={{ marginTop: 10 }}>{message}</p>

      {/* ================= STEPPER ================= */}
      <div style={{ marginTop: 20, overflowX: "auto" }}>
        <Steps current={currentStep} size="small">
          {steps.map((step, index) => (
            <Step
              key={index}
              title={
                index === currentStep &&
                index !== steps.length - 1 ? (
                  <span>
                    {step.title}
                    <Spin size="small" style={{ marginLeft: 8 }} />
                  </span>
                ) : (
                  step.title
                )
              }
              description={step.description}
            />
          ))}
        </Steps>
      </div>

      {/* ================= MAP + STATISTIK ================= */}
      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <div style={{ flex: 1, height: 400 }}>
          <MapContainer
            center={[-0.9471, 100.4172]}
            zoom={11}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {classifiedUrl && <GeoTIFFLayer url={classifiedUrl} />}
          </MapContainer>
        </div>

        <div style={{ width: 320 }}>
          <h3>Statistik Area (ha)</h3>
          {areas ? (
            <ul>
              {Object.entries(areas).map(([label, val]) => (
                <li key={label}>
                  <strong>{label}:</strong> {val} ha
                </li>
              ))}
            </ul>
          ) : (
            <p>Belum ada hasil.</p>
          )}
        </div>
      </div>

      {/* ================= DIAGRAM PERBANDINGAN ================= */}
      {comparisonData && (
        <div
          style={{
            marginTop: 50,
            padding: "28px",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
            border: "1px solid #e5e7eb",
          }}
        >
          <h3
            style={{
              fontWeight: 700,
              fontSize: "22px",
              marginBottom: "20px",
              color: "#111827",
              letterSpacing: "0.5px",
            }}
          >
            📊 Perbandingan Tutupan Lahan{" "}
            <span style={{ color: "#2563eb" }}>{nextYear - 1}</span>{" "}
            vs{" "}
            <span style={{ color: "#f97316" }}>{nextYear}</span>
          </h3>
        
          <ResponsiveContainer width="100%" height={500}>
            <BarChart
              data={comparisonData}
              margin={{ top: 40, right: 20, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
        
              <XAxis
                dataKey="name"
                tick={{ fontSize: 13 }}
              />
        
              <YAxis
                type="number"
                domain={[0, roundedMax]}
                ticks={yTicks}
                interval={0}
                allowDecimals={false}
                tickFormatter={(value) => value.toLocaleString("id-ID")}
                width={70}
              />
        
              <Tooltip
                formatter={(v) => `${Number(v).toLocaleString("id-ID")} ha`}
              />
        
              <Legend wrapperStyle={{ marginBottom: 10 }} />
        
              <Bar
                dataKey="last"
                name={`${nextYear - 1} (Klasifikasi)`}
                fill="#1f77b4"
                radius={[6, 6, 0, 0]}
              />
        
              <Bar
                dataKey="pred"
                name={`${nextYear} (Prediksi)`}
                fill="#ff7f0e"
                radius={[6, 6, 0, 0]}
              >
                <LabelList
                  dataKey="percentChange"
                  position="top"
                  content={(props) => {
                    const { x, y, width, value } = props;
                    if (value === undefined || value === null) return null;
        
                    const percent = Number(value);
                    const sign = percent > 0 ? "+" : "";
        
                    return (
                      <text
                        x={x + width / 2}
                        y={y - 8}
                        textAnchor="middle"
                        fontSize="13"
                        fontWeight="bold"
                        fill={percent >= 0 ? "#16a34a" : "#dc2626"}
                      >
                        {sign}{percent}%
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>      
      )}
    </div>
  );
}
