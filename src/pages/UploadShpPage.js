import React, { useState, useEffect } from "react";
import axios from "axios";

const UploadShpPage = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    // Reset semuanya saat halaman dibuka
    localStorage.removeItem("uploadStatus");
    setFile(null);
    setStatus("");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setStatus("Mengunggah...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:5000/upload-shp", formData);
      if (res.data.success) {
        setStatus("✅ File berhasil diproses!");
        localStorage.setItem("uploadStatus", "✅ File berhasil diproses!");
      } else {
        setStatus("❌ Gagal memproses file.");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Terjadi kesalahan saat mengunggah.");
    }
  };

  const handleReset = () => {
    setFile(null);
    setStatus("");
    localStorage.removeItem("uploadStatus");
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold mb-4 text-gray-800 text-center">
        Upload File SHP (ZIP)
      </h2>
      <p className="text-gray-600 mb-6 text-center max-w-xl">
        Upload shapefile dalam format <strong>.zip</strong>. Sistem akan memproses file dan menghasilkan citra GeoTIFF multiband.
      </p>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl border-4 border-dashed border-blue-400 bg-blue-100 p-6 rounded-lg text-center"
      >
        <label className="block cursor-pointer">
          <input
            type="file"
            accept=".zip"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center space-y-2">
            <img
              src="https://img.icons8.com/ios-filled/100/ffffff/upload.png"
              alt="upload"
              className="w-16 h-16 opacity-70"
            />
            <p className="text-lg font-semibold text-blue-700">Pilih File</p>
            <p className="text-sm text-blue-600">atau seret file ke sini</p>
          </div>
        </label>

        {file && (
          <p className="mt-4 text-sm text-gray-700">File dipilih: {file.name}</p>
        )}

        <button
          type="submit"
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow"
        >
          Unggah & Proses
        </button>
      </form>

      {status && (
        <p className="mt-4 text-center font-medium text-blue-800">{status}</p>
      )}

      {status.includes("berhasil") && (
        <div className="mt-4 flex items-center justify-center">
          <button
            onClick={handleReset}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Mulai Lagi
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadShpPage;
