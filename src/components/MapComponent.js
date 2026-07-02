import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import NDVILayer from './NDVILayer';
import ClassificationLayer from './ClassifiedLayer';
import LayerToggle from './LayerToggle';

const MapComponent = ({ year, wilayah }) => {
  const [showNDVI, setShowNDVI] = useState(true);
  const [showClassification, setShowClassification] = useState(true);
  const mapRef = useRef(null);
  const [baseMap, setBaseMap] = useState("osm");

  useEffect(() => {
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 300);
  }, []);

  return (
    <div className="relative w-full h-screen">
      <MapContainer
        center={[-0.9, 100.35]}
        zoom={11}
        style={{ height: '100vh', width: '100%' }}
      >
        {baseMap === 'osm' ? (
          <TileLayer
            attribution="© OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        ) : (
          <TileLayer
            attribution="Tiles © Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        <NDVILayer
          url={`http://localhost:5000/tif/ndvi_${wilayah}_Sentinel2_${year}.tif`}
          visible={showNDVI}
        />

        <ClassificationLayer
          url={`http://localhost:5000/tif/classified_${wilayah}_Sentinel2_${year}.tif`}
          visible={showClassification}
        />
      </MapContainer>

      <div className="absolute top-1 right-1 z-[1000]">
        <LayerToggle
          showNDVI={showNDVI}
          setShowNDVI={setShowNDVI}
          showClassification={showClassification}
          setShowClassification={setShowClassification}
          baseMap={baseMap}
          setBaseMap={setBaseMap}
        />
      </div>
    </div>
  );
};

export default MapComponent;