import React, { useState } from "react";
import axios from "axios";
import { UploadCloud, FileImage } from "lucide-react";

function UploadGeoTIFF({ onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [loadingNDVI, setLoadingNDVI] = useState(false);
  const [loadingClassify, setLoadingClassify] = useState(false);
  const [mode, setMode] = useState("ndvi"); // "ndvi" | "classify"
  const [modal, setModal] = useState(null); // { type, message }

  /* ================= HELPERS ================= */

  const showModal = (type, message) => {
    setModal({ type, message });
  };

  const closeModal = () => setModal(null);

  const resetFiles = () => setFiles([]);

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  /* ================= NDVI ================= */

  const handleUploadNDVI = async () => {
    if (files.length !== 3) {
      return showModal(
        "error",
        "Untuk NDVI, pilih tepat 3 file GeoTIFF."
      );
    }

    setLoadingNDVI(true);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files[]", file));

      await axios.post("http://localhost:5000/ndvi", formData);

      showModal(
        "success",
        "NDVI berhasil dihitung. Hasil tersimpan dan tampil di menu Hasil. Silakan upload ulang file untuk klasifikasi."
      );

      resetFiles();           // kosongkan preview
      setMode("classify");    // lanjut ke tahap klasifikasi
    } catch (err) {
      console.error(err);
      showModal("error", "Gagal menghitung NDVI.");
    } finally {
      setLoadingNDVI(false);
    }
  };

  /* ================= KLASIFIKASI ================= */

  const handleUploadClassify = async () => {
    if (files.length !== 1) {
      return showModal(
        "error",
        "Untuk klasifikasi, pilih tepat 1 file GeoTIFF."
      );
    }

    setLoadingClassify(true);

    try {
      const formData = new FormData();
      formData.append("file", files[0]);

      const res = await axios.post(
        "http://localhost:5000/upload-tif",
        formData
      );

      const wilayah = files[0].name
        .replace(".tif", "")
        .replace(/_Sentinel2_\d{4}/, "");

      localStorage.setItem("wilayah", wilayah);

      console.log("Wilayah disimpan:", wilayah);

      showModal(
        "success",
        "Klasifikasi berhasil. Hasil tersimpan dan tampil di menu Hasil."
      );

      onUploadComplete && onUploadComplete(res.data.files);
      resetFiles();
    } catch (err) {
      console.error(err);
      showModal(
        "error",
        "Upload gagal. Pastikan file sesuai dan memiliki band lengkap."
      );
    } finally {
      setLoadingClassify(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="p-4 relative">
      {/* ================= MODAL ================= */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div
            className={`bg-white rounded-xl p-6 max-w-sm w-full shadow-lg border-2 flex flex-col items-center gap-4
              ${
                modal.type === "success"
                  ? "border-green-500"
                  : "border-red-500"
              }`}
          >
            <div className="text-4xl">
              {modal.type === "success" ? "✅" : "⚠️"}
            </div>

            <h3
              className={`text-lg font-bold ${
                modal.type === "success"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {modal.type === "success" ? "Berhasil!" : "Gagal!"}
            </h3>

            <p className="text-center text-sm">{modal.message}</p>

            <button
              onClick={closeModal}
              className={`px-6 py-2 rounded-lg text-white font-medium ${
                modal.type === "success"
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* ================= CARD ================= */}
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">Upload GeoTIFF</h2>

          {/* Tombol Dapatkan File .tif jika belum ada file */}
          {files.length === 0 && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg text-center">
              <p className="mb-2 text-sm text-yellow-800">
                File GeoTIFF belum tersedia? Silakan unduh terlebih dahulu:
              </p>
              <a
                href="https://drive.google.com/drive/folders/1xKw4Zrs1-F_xWdTnnQgIxR9WjuwAz_LV?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
              >
                Dapatkan File .tif
              </a>
            </div>
          )}

          {/* STEP INFO */}
          <p className="text-sm text-center font-medium text-gray-600 mb-4">
            {mode === "ndvi"
              ? "🟢 Tahap 1: Hitung NDVI (3 file)"
              : "🔵 Tahap 2: Klasifikasi (1 file)"}
          </p>

          {/* DRAG & DROP */}
          <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
            <UploadCloud className="w-10 h-10 text-blue-500 mb-2" />
            <span className="text-sm text-gray-600">
              Klik atau seret file GeoTIFF ke sini
            </span>
            <input
              type="file"
              multiple
              accept=".tif"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* FILE PREVIEW */}
          {files.length > 0 && (
            <div className="mt-4 text-sm">
              <p className="font-medium mb-2">File dipilih:</p>
              <ul className="space-y-1">
                {files.map((file, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 bg-gray-50 p-2 rounded"
                  >
                    <FileImage className="w-4 h-4 text-green-600" />
                    {file.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* BUTTONS */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleUploadNDVI}
              disabled={loadingNDVI || mode !== "ndvi"}
              className={`flex-1 py-2 rounded-lg text-white font-medium ${
                loadingNDVI || mode !== "ndvi"
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loadingNDVI ? "⏳ Menghitung..." : "Hitung NDVI"}
            </button>

            <button
              onClick={handleUploadClassify}
              disabled={loadingClassify || mode !== "classify"}
              className={`flex-1 py-2 rounded-lg text-white font-medium ${
                loadingClassify || mode !== "classify"
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loadingClassify ? "⏳ Memproses..." : "Klasifikasi"}
            </button>
          </div>

          {/* LOADING INFO */}
          {(loadingNDVI || loadingClassify) && (
            <p className="text-center text-xs text-gray-500 mt-3 italic">
              ⏳ Mohon tunggu, proses sedang berjalan...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadGeoTIFF;
