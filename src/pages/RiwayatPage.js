import React, { useEffect, useState } from "react";
import axios from "axios";

const RiwayatUpload = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const itemsPerPage = 10;

  useEffect(() => {
    axios
      .get("http://localhost:5000/riwayat-upload")
      .then((res) => {
        const sortedData = res.data.sort(
          (a, b) => new Date(b.tanggal) - new Date(a.tanggal)
        );
        setHistory(sortedData);
        setFilteredHistory(sortedData);
      })
      .catch((err) => console.error("Gagal memuat riwayat:", err));
  }, []);

  const handleFilter = () => {
    if (!startDate && !endDate) {
      setFilteredHistory(history);
      return;
    }
    const filtered = history.filter((item) => {
      const itemDate = new Date(item.tanggal);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      return (
        (!start || itemDate >= start) &&
        (!end || itemDate <= new Date(end.setHours(23, 59, 59, 999)))
      );
    });
    setFilteredHistory(filtered);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setFilteredHistory(history);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentData = filteredHistory.slice(startIdx, startIdx + itemsPerPage);

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="bg-white shadow-sm rounded-xl p-4 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2 flex items-center gap-2">
          📜 Riwayat Upload
        </h2>

        {/* Filter Section */}
        <div className="flex flex-wrap items-center gap-2 mb-3 text-sm">
          <div className="flex items-center gap-1">
            <label className="text-gray-700">Dari:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-blue-400"
            />
          </div>

          <div className="flex items-center gap-1">
            <label className="text-gray-700">Sampai:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-blue-400"
            />
          </div>

          <button
            onClick={handleFilter}
            className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition text-sm"
          >
            Filter
          </button>

          <button
            onClick={handleReset}
            className="bg-gray-300 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-400 transition text-sm"
          >
            Tampilkan Semua
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-xs text-left">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-2 py-1 text-center w-10">No</th>
                <th className="px-3 py-1">Input File</th>
                <th className="px-3 py-1">NDVI</th>
                <th className="px-3 py-1">Klasifikasi</th>
                <th className="px-3 py-1 text-center w-40">Tanggal</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {currentData.length > 0 ? (
                currentData.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b hover:bg-blue-50 transition duration-100"
                  >
                    <td className="px-2 py-1 text-center text-gray-700 font-medium">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="px-3 py-1">
                      <a
                        href={`http://localhost:5000/upload-tif/${item.input_file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:text-blue-900 underline"
                      >
                        {item.input_file}
                      </a>
                    </td>
                    <td className="px-3 py-1">
                      <a
                        href={`http://localhost:5000/ndvi/${item.ndvi_file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-700 hover:text-green-900 underline"
                      >
                        {item.ndvi_file}
                      </a>
                    </td>
                    <td className="px-3 py-1">
                      <a
                        href={`http://localhost:5000/upload-tif/${item.klasifikasi_file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-700 hover:text-purple-900 underline"
                      >
                        {item.klasifikasi_file}
                      </a>
                    </td>
                    <td className="px-3 py-1 text-center text-gray-600">
                      {new Date(item.tanggal).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-2 text-gray-500">
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredHistory.length > itemsPerPage && (
          <div className="flex justify-between items-center mt-3 text-xs text-gray-600">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md font-medium ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              ← Prev
            </button>

            <span>
              Halaman {currentPage} dari {totalPages}
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md font-medium ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiwayatUpload;
