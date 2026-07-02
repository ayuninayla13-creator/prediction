from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import os
import rasterio
import numpy as np
import joblib
import geopandas as gpd
import uuid
from rasterio.mask import mask
import mysql.connector
import ee
import re
import json
import glob
from datetime import datetime
from shapely.geometry import shape

try:
    ee.Initialize(project='ayuearth')
except Exception as e:
    ee.Authenticate()
    ee.Initialize(project='ayuearth')

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'build'))

CORS(app)

UPLOAD_FOLDER = "uploads"
PROCESSED_FOLDER = "processed"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)
RIWAYAT_PATH = 'riwayat.json'

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model_mlp.pkl")
MODEL_PATH_PRED = os.path.join("mlp_model.pkl")

model = joblib.load(MODEL_PATH)
RIWAYAT_FILE = "riwayat.json"

colormap = {
    1: (0, 0, 255),       # Air → Biru
    2: (255, 255, 0),     # Sawah → Kuning
    3: (0, 255, 0),       # Vegetasi Non-Mangrove → Hijau     # Mangrove → Hijau tua
    4: (255, 0, 0),       # Terbangun → Merah
}

latest_area_info = {
    "area_ha": None,
    "filename": None
}

labels = ['NoData', 'Sawah', 'Air', 'Non-Mangrove', 'Terbangun']
classes = [0, 1, 2, 3, 4]
pixel_area_ha = 0.01  # 10x10m Sentinel-2 pixel = 0.01 hektar

def calculate_class_areas(classified_map, classes, pixel_area_ha):
    areas = {}
    total_area = 0
    for cls in classes:
        pixel_count = np.sum(classified_map == cls)
        area = pixel_count * pixel_area_ha
        areas[cls] = float("{:.2f}".format(area)) 
        total_area += area
    total_area = float("{:.2f}".format(total_area))
    return areas, total_area

def apply_colormap_to_classified(classified_array):
    # Bentuk (H, W, 3) RGB dari (H, W) label
    height, width = classified_array.shape
    rgb = np.zeros((height, width, 3), dtype=np.uint8)

    for class_value, color in colormap.items():
        mask = classified_array == class_value
        rgb[mask] = color  # Tetapkan RGB

    return rgb.transpose((2, 0, 1))  # Jadi (3, H, W) untuk rasterio

def extract_year_from_filename(filename):
    match = re.search(r'20\d{2}', filename)
    return match.group(0) if match else str(uuid.uuid4())[:8]

def simpan_riwayat(entry):
    data = []
    if os.path.exists(RIWAYAT_FILE):
        with open(RIWAYAT_FILE, "r") as f:
            data = json.load(f)
    
    data.append(entry)
    
    with open(RIWAYAT_FILE, "w") as f:
        json.dump(data, f, indent=2)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')
    
@app.route("/upload-tif", methods=["POST"])
def upload_tif():
    file = request.files["file"]
    if file and file.filename.endswith(".tif"):
        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)

        import re
        match = re.search(r'(\d{4})', file.filename)
        tahun = match.group(1) if match else "Unknown"

        with rasterio.open(filepath) as src:
            image = src.read().astype("float32")
            bands, height, width = image.shape
            flat_pixels = image.reshape(bands, -1).T
            valid_mask = ~np.isnan(flat_pixels).any(axis=1)
            classified = np.full(flat_pixels.shape[0], -1)
            classified[valid_mask] = model.predict(flat_pixels[valid_mask])
            classified = classified.reshape(height, width)

            # Save classification map
            meta = src.meta.copy()
            meta.update({
                "count": 1,
                "dtype": "int16"
            })

            output_path = os.path.join(PROCESSED_FOLDER, f"classified_{file.filename}")
            with rasterio.open(output_path, "w", **meta) as dst:
                dst.write(classified.astype("int16"), 1)

            entry = {
                "input_file": file.filename,
                "ndvi_file": None,
                "klasifikasi_file": f"classified_{file.filename}",
                "tahun": tahun,
                "tanggal": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            simpan_riwayat(entry)

        return jsonify({"message": "success", "tahun": tahun, "filename": f"classified_{file.filename}"})

    return jsonify({"message": "invalid file"}), 400
    
@app.route("/list_processed", methods=["GET"])
def list_processed():
    files = [
        f for f in os.listdir(PROCESSED_FOLDER)
        if f.endswith(".tif")
    ]
    return jsonify(files)

@app.route("/ndvi", methods=["POST"])
def calculate_ndvi():
    files = request.files.getlist("files[]")  # pastikan name di input HTML: files[]
    ndvi_files = []

    for file in files:
        if file and file.filename.endswith(".tif"):
            filename = file.filename
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)

            import re
            match = re.search(r'(\d{4})', file.filename)
            tahun = match.group(1) if match else "Unknown"

            with rasterio.open(filepath) as src:
                red = src.read(3).astype("float32")  # B4
                nir = src.read(4).astype("float32")  # B8

                ndvi = (nir - red) / (nir + red + 1e-6)
                ndvi = np.clip(ndvi, -1, 1)

                meta = src.meta.copy()
                meta.update({"count": 1, "dtype": "float32", "driver": "GTiff"})

                ndvi_filename = f"ndvi_{filename}"
                ndvi_path = os.path.join(PROCESSED_FOLDER, ndvi_filename)

                with rasterio.open(ndvi_path, "w", **meta) as dst:
                    dst.write(ndvi, 1)
                    dst.set_band_description(1, "NDVI")

                entry = {
                    "input_file": filename,
                    "ndvi_file": ndvi_filename,
                    "klasifikasi_file": None,
                    "tahun": tahun,
                    "tanggal": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }
                simpan_riwayat(entry)

                ndvi_files.append(ndvi_filename)

    if ndvi_files:
        return jsonify({"message": "success", "files": ndvi_files})
    return jsonify({"message": "invalid file"}), 400

@app.route("/riwayat-upload", methods=["GET"])
def ambil_riwayat():
    if os.path.exists(RIWAYAT_FILE):
        with open(RIWAYAT_FILE, "r") as f:
            data = json.load(f)
        return jsonify(data)
    return jsonify([])

@app.route('/hitung_luas', methods=['POST'])
def hitung_luas():
    file_path = request.json.get('filename')  # Nama file hasil klasifikasi GeoTIFF

    if not file_path:
        return jsonify({'error': 'Filename is required'}), 400

    try:
        with rasterio.open(f'processed/{file_path}') as src:
            classified_map = src.read(1)  # Ambil band pertama (klasifikasi)
        
        # Hitung area per kelas
        area_by_class, total_area = calculate_class_areas(classified_map, classes, pixel_area_ha)

        # Buat hasil dalam bentuk dict dengan nama label
        result = {
            'total_area': round(total_area, 2),
            'class_areas': [
                {'class': labels[cls], 'value': round(area_by_class[cls], 2)}
                for cls in classes
            ]
        }

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route("/get-total-area", methods=["POST"])
def get_total_area():
    try:
        data = request.json
        filename = data.get("filename")

        if not filename:
            return jsonify({
                "success": False,
                "message": "Filename SHP diperlukan"
            }), 400

        shp_path = os.path.join("uploads", filename)

        if not os.path.exists(shp_path):
            return jsonify({
                "success": False,
                "message": "File SHP tidak ditemukan di server"
            }), 404

        # baca shapefile
        gdf = gpd.read_file(shp_path)

        # ubah ke meter
        gdf = gdf.to_crs(epsg=3857)

        # hitung luas hektar
        total_area = gdf.geometry.area.sum() / 10000

        result = {
            "success": True,
            "filename": filename,
            "total_area_ha": round(total_area, 2)
        }

        return jsonify(result)

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

def load_model_safe():
    if os.path.exists(MODEL_PATH_PRED):
        try:
            return joblib.load(MODEL_PATH_PRED)
        except Exception as e:
            print("Gagal load model:", e)
            return None
    return None

@app.route('/prediksi', methods=['POST'])
def predict_next_year():
    try:
        # Ambil daftar NDVI dalam folder processed
        ndvi_files = sorted(glob.glob(os.path.join(PROCESSED_FOLDER, "ndvi_*_Sentinel2_*.tif")))

        if len(ndvi_files) < 3:
            return jsonify({
                "success": False,
                "message": "Minimal butuh 3 NDVI tahun berurutan untuk prediksi."
            }), 400

        # Ambil 3 file NDVI terakhir
        ndvi_files = ndvi_files[-3:]
        years = []
        for f in ndvi_files:
            match = re.search(r"(\d{4})", os.path.basename(f))
            if match:
                years.append(int(match.group(1)))

        if len(years) < 3:
            return jsonify({"success": False, "message": "Nama file NDVI tidak memuat tahun yang valid."}), 400

        # Tahun berikutnya otomatis
        next_year = max(years) + 1

        # Baca NDVI
        with rasterio.open(ndvi_files[0]) as s1, rasterio.open(ndvi_files[1]) as s2, rasterio.open(ndvi_files[2]) as s3:
            a1 = s1.read(1).astype(np.float32)
            a2 = s2.read(1).astype(np.float32)
            a3 = s3.read(1).astype(np.float32)
            profile = s1.profile.copy()

        if not (a1.shape == a2.shape == a3.shape):
            return jsonify({"success": False, "message": "Dimensi NDVI berbeda."}), 400

        # Gabung NDVI jadi fitur
        X_pred = np.stack([a1.flatten(), a2.flatten(), a3.flatten()], axis=1)
        valid_mask = ~np.isnan(X_pred).any(axis=1)

        # Load model
        clf = load_model_safe()
        if clf is None:
            return jsonify({"success": False, "message": "Model tidak ditemukan. Jalankan /train-mlp dulu."}), 400

        # Prediksi
        pred_flat = np.full(X_pred.shape[0], -1, dtype=np.int16)
        pred_flat[valid_mask] = clf.predict(X_pred[valid_mask])
        classified_2d = pred_flat.reshape(a1.shape)

        # Simpan hasil prediksi
        classified_name = f"classified_{next_year}_pred.tif"
        classified_path = os.path.join(PROCESSED_FOLDER, classified_name)
        profile.update(dtype=rasterio.int16, count=1)
        with rasterio.open(classified_path, 'w', **profile) as dst:
            dst.write(classified_2d, 1)

        # Hitung luas kelas
        class_areas, total_area = calculate_class_areas(classified_2d, classes, pixel_area_ha)

        return jsonify({
            "success": True,
            "classified_file": classified_name,
            "predicted_year": next_year,
            "areas_by_class": {
                labels[c]: class_areas.get(c, 0)
                for c in classes if c != 0
            },
            "total_area_ha": total_area,
            "tif_url": f"/tif/{classified_name}"
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
import re

@app.route('/last-year', methods=['GET'])
def get_last_year():
    try:
        pattern = os.path.join(PROCESSED_FOLDER, "ndvi_Koto_Tangah_Sentinel2_*.tif")
        files = glob.glob(pattern)
        print("Files ditemukan:", files)

        years = []
        for f in files:
            filename = os.path.basename(f)
            # ambil hanya angka tahun 4 digit di akhir nama file (sebelum .tif)
            match = re.search(r'(\d{4})(?=\.tif$)', filename)
            if match:
                years.append(int(match.group(1)))

        if not years:
            return jsonify({"success": False, "message": "Tidak ada file NDVI ditemukan"})
        
        print("Tahun ditemukan:", years)
        return jsonify({"success": True, "last_year": max(years)})
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})
    
@app.route("/tif/<filename>")
def serve_tif(filename):
    path = os.path.join(PROCESSED_FOLDER, filename)
    return send_file(path, mimetype="image/tiff")

def get_db_connection():
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database='klasifikasi'
    )

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = "SELECT * FROM users WHERE username = %s AND password = %s"
    cursor.execute(query, (username, password))
    user = cursor.fetchone()

    cursor.close()
    conn.close() 

    if user:
        return jsonify({"success": True, "message": "Login berhasil"})
    else:
        return jsonify({"success": False, "message": "Username atau password salah"}), 401

if __name__ == "__main__":
    app.run(debug=True)