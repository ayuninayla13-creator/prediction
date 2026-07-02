import React, { useRef, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";
import html2canvas from "html2canvas";
import classColorMap from "../constants/classColorMap";

const AreaChart = ({ areaByClass = {} }) => {
  const chartRef = useRef();

  // 🔹 Konversi data objek ke array sesuai classColorMap
  const chartData = useMemo(() => {
    return Object.entries(classColorMap).map(([classId, { label, color }]) => {
      const value =
        typeof areaByClass[Number(classId)] === "object"
          ? areaByClass[Number(classId)]?.value || 0
          : areaByClass[Number(classId)] || 0;

      return {
        class: label,
        value,
        color,
      };
    });
  }, [areaByClass]);

  const handleExport = () => {
    if (!chartRef.current) return;
    html2canvas(chartRef.current, {
      backgroundColor: "#ffffff",
      useCORS: true,
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = "luas_area_per_kelas.jpeg";
      link.href = canvas.toDataURL("image/jpeg", 1.0);
      link.click();
    });
  };

  return (
    <div>
      {/* Bagian chart yang diekspor */}
      <div className="bg-white rounded shadow p-4" ref={chartRef}>
        <h3 className="font-semibold text-sm mb-2">Luas Area per Kelas (ha)</h3>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="class" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(value) => `${value.toLocaleString()} ha`}
                contentStyle={{ fontSize: 10 }}
                itemStyle={{ fontSize: 10 }}
                labelStyle={{ fontSize: 10 }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 italic text-xs">Memuat data...</p>
        )}
      </div>

      {/* Tombol ekspor di luar */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={handleExport}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-10 rounded"
        >
          Ekspor Chart
        </button>
      </div>
    </div>
  );
};

export default AreaChart;
