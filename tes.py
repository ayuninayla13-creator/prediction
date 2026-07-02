import rasterio
import numpy as np
import pandas as pd

# Baca NDVI tiap tahun
with rasterio.open("processed/ndvi_Koto_Tangah_Sentinel2_2022.tif") as src:
    ndvi_2022 = src.read(1)

with rasterio.open("processed/ndvi_Koto_Tangah_Sentinel2_2023.tif") as src:
    ndvi_2023 = src.read(1)

with rasterio.open("processed/ndvi_Koto_Tangah_Sentinel2_2024.tif") as src:
    ndvi_2024 = src.read(1)

# Baca label (hasil klasifikasi / ground truth)
with rasterio.open("processed/classified_Koto_Tangah_Sentinel2_2024.tif") as src:
    labels = src.read(1)

# Masking data kosong
mask = (
    (ndvi_2022 != src.nodata) &
    (ndvi_2023 != src.nodata) &
    (ndvi_2024 != src.nodata) &
    (labels != src.nodata)
)

# Ambil data yang valid
data = {
    "NDVI_2022": ndvi_2022[mask],
    "NDVI_2023": ndvi_2023[mask],
    "NDVI_2024": ndvi_2024[mask],
    "label": labels[mask]
}

df = pd.DataFrame(data)
df.to_csv("ndvi_training_data.csv", index=False)
 
print("Dataset training tersimpan sebagai ndvi_training_data.csv")
