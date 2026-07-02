import React, { useEffect, useState, useMemo } from "react";
import MapComponent from "../components/MapComponent";
import Legend from "../components/Legend";
import AreaChart from "../components/AreaChart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import classColorMap from "../constants/classColorMap";

function HasilPage() {
  const [maps, setMaps] = useState([]);
  const [areaData, setAreaData] = useState({});

  /* ================= AMBIL FILE ================= */
  useEffect(() => {
    fetch("http://localhost:5000/list_processed")
      .then((res) => res.json())
      .then((files) => {

        const classifiedFiles = files.filter(
          (f) =>
            f.startsWith("classified_") &&
            f.endsWith(".tif")
        );

        const parsed = classifiedFiles.map((file) => {

          const match = file.match(
            /classified_(.+)_Sentinel2_(\d{4})\.tif/
          );

          if (!match) return null;

          return {
            wilayah: match[1],
            year: match[2],
            filename: file,
          };
        });

        setMaps(parsed.filter(Boolean));
      });
  }, []);

  /* ================= AMBIL LUAS ================= */
  useEffect(() => {

    maps.forEach((item) => {

      fetch("http://localhost:5000/hitung_luas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: item.filename,
        }),
      })
        .then((res) => res.json())
        .then((data) => {

          if (data.class_areas) {

            setAreaData((prev) => ({
              ...prev,
              [item.filename]: data.class_areas,
            }));
          }
        });

    });

  }, [maps]);

  /* ================= DATA GRAFIK ================= */

  const lineChartData = useMemo(() => {

    return maps.map((item) => {

      const entry = {
        tahun: item.year,
      };

      if (areaData[item.filename]) {

        Object.entries(classColorMap).forEach(
          ([classId, { label }]) => {

            const value =
              areaData[item.filename]?.[classId];

            entry[label] =
              typeof value === "object"
                ? value.value || 0
                : value || 0;
          }
        );
      }

      return entry;
    });

  }, [maps, areaData]);

  return (
    <div className="flex flex-col gap-6 p-6 w-full">

      <h2 className="text-xl font-bold">
        Visualisasi Multi-Tahun
      </h2>

      {/* ================= PETA ================= */}

      <div className="flex flex-col md:flex-row gap-3">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">

          {maps.map((item, i) => (

            <div
              key={i}
              className="flex flex-col gap-2 border rounded-lg shadow p-3 bg-white"
            >

              <h3 className="text-lg font-semibold text-center">
                {item.wilayah} - {item.year}
              </h3>

              <div className="h-[320px] rounded overflow-hidden">

                <MapComponent
                  year={item.year}
                  wilayah={item.wilayah}
                />

              </div>

              {areaData[item.filename] ? (
                <AreaChart
                  areaByClass={areaData[item.filename]}
                />
              ) : (
                <div className="text-center text-gray-400 text-sm italic py-4">
                  Memuat data...
                </div>
              )}
            </div>

          ))}

        </div>

        {/* ================= LEGENDA ================= */}

        <div className="border rounded-lg shadow h-fit max-w-[150px] text-sm self-start">
          <Legend />
        </div>

      </div>

      {/* ================= GRAFIK ================= */}

      <div className="border rounded-lg shadow p-4 bg-white">

        <h3 className="text-lg font-semibold text-center mb-4">
          Perubahan Luas Kelas per Tahun
        </h3>

        <ResponsiveContainer width="100%" height={450}>

          <LineChart data={lineChartData}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="tahun" />

            <YAxis />

            <Tooltip />

            <RechartsLegend />

            {Object.entries(classColorMap).map(
              ([classId, { label, color }]) => (

                <Line
                  key={classId}
                  type="monotone"
                  dataKey={label}
                  stroke={color}
                  strokeWidth={2}
                />

              )
            )}

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}

export default HasilPage;