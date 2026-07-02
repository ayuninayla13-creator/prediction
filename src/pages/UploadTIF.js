import React, { useState } from "react";
import axios from "axios";
import { Upload, FileText } from "lucide-react";

const UploadTIF = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setStatus("");
  };

  const handleClassify = async () => {
    if (!selectedFile) return;

    setStatus("Memproses klasifikasi...");
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await axios.post("http://localhost:5000/upload-tif", formData);
      setStatus("✅ Klasifikasi berhasil diproses!");
    } catch (error) {
      console.error("Error klasifikasi:", error);
      setStatus("❌ Gagal memproses klasifikasi.");
    }
  };

  const handleNDVI = async () => {
    if (!selectedFile) return;

    setStatus("Memproses NDVI...");
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await axios.post("http://localhost:5000/ndvi", formData);
      setStatus("✅ Perhitungan NDVI berhasil diproses!");
    } catch (error) {
      console.error("Error NDVI:", error);
      setStatus("❌ Gagal memproses NDVI.");
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setStatus("");
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold mb-4 text-gray-800 text-center">
        Upload File GeoTIFF
      </h2>
      <p className="text-gray-600 mb-6 text-center max-w-xl">
        Unggah file berekstensi <strong>.tif</strong> atau <strong>.tiff</strong> untuk diproses klasifikasi atau NDVI.
      </p>

      <div className="w-full max-w-2xl border-4 border-dashed border-green-400 bg-green-100 p-6 rounded-lg text-center">
        <label className="block cursor-pointer">
          <input
            type="file"
            accept=".tif,.tiff"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className="w-16 h-16 text-green-600 opacity-70" />
            <p className="text-lg font-semibold text-green-700">Pilih File</p>
            <p className="text-sm text-green-600">atau seret file ke sini</p>
          </div>
        </label>

        {selectedFile && (
          <p className="mt-4 text-sm text-gray-700 flex items-center justify-center">
            <FileText className="w-4 h-4 mr-2" />
            {selectedFile.name}
          </p>
        )}

        <div className="flex justify-center space-x-4 mt-6">
          <button
            onClick={handleClassify}
            disabled={!selectedFile}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:bg-gray-400"
          >
            Klasifikasi
          </button>
          <button
            onClick={handleNDVI}
            disabled={!selectedFile}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded disabled:bg-gray-400"
          >
            Hitung NDVI
          </button>
        </div>
      </div>

      {status && (
        <div className="mt-4 flex flex-col items-center space-y-2">
          <p className="text-center font-medium text-green-800">{status}</p>
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

export default UploadTIF;
