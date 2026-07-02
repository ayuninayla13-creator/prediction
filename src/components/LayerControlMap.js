import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, LayersControl, ImageOverlay, GeoJSON } from 'react-leaflet';


// Pastikan untuk mengimpor CSS Leaflet
import 'leaflet/dist/leaflet.css';

const { BaseLayer, Overlay } = LayersControl;

const LayerControlMap = ({ ndviLayer, aoilayerGeoJSON, rgbLayer }) => {
  const [ndviImageUrl, setNdviImageUrl] = useState(null);
  const [rgbImageUrl, setRgbImageUrl] = useState(null);

  // Memuat file NDVI dan RGB (dari GeoTIFF atau sumber lain)
  useEffect(() => {
    if (ndviLayer) {
      setNdviImageUrl(ndviLayer); // Sesuaikan jika NDVI datang dari sumber tertentu
    }

    if (rgbLayer) {
      setRgbImageUrl(rgbLayer); // Sama dengan NDVI, sesuaikan untuk file RGB
    }
  }, [ndviLayer, rgbLayer]);

  return (
    <MapContainer center={[0, 0]} zoom={4} style={{ height: '100vh', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <LayersControl position="topright">
        {/* Base Layer */}
        <BaseLayer checked name="OpenStreetMap">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        </BaseLayer>

        {/* Overlay Layers */}
        <Overlay checked name="NDVI">
          {ndviImageUrl && <ImageOverlay url={ndviImageUrl} bounds={[[90, -180], [-90, 180]]} />}
        </Overlay>

        <Overlay name="AOI Shapefile">
          {aoilayerGeoJSON && <GeoJSON data={aoilayerGeoJSON} />}
        </Overlay>

        <Overlay name="RGB/True Color">
          {rgbImageUrl && <ImageOverlay url={rgbImageUrl} bounds={[[90, -180], [-90, 180]]} />}
        </Overlay>
      </LayersControl>
    </MapContainer>
  );
};

export default LayerControlMap;
