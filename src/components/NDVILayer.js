// NDVILayer.js
import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import GeoRasterLayer from 'georaster-layer-for-leaflet';
import parseGeoraster from 'georaster';

// Fungsi untuk menerapkan colormap viridis manual
const getViridisColor = (val) => {
  if (val === null || isNaN(val)) return null;

  const min = -0.2;
  const max = 0.8;
  const normalized = Math.min(Math.max((val - min) / (max - min), 0), 1);

  // Warna dasar viridis (diambil dari palet viridis)
  const viridisColors = [
    [68, 1, 84],
    [72, 35, 116],
    [64, 67, 135],
    [52, 94, 141],
    [41, 120, 142],
    [32, 144, 140],
    [34, 167, 132],
    [68, 190, 112],
    [121, 209, 81],
    [189, 223, 38],
    [253, 231, 37],
  ];

  const idx = Math.floor(normalized * (viridisColors.length - 1));
  const [r, g, b] = viridisColors[idx];
  return `rgba(${r},${g},${b},0.8)`;
};

const NDVILayer = ({ url, visible }) => {
  const map = useMap();
  const [ndviLayer, setNdviLayer] = useState(null);

  useEffect(() => {
    // Fetch dan parsing GeoTIFF
    fetch(url)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => parseGeoraster(arrayBuffer))
      .then(georaster => {
        const layer = new GeoRasterLayer({
          georaster,
          opacity: 0.8,
          resolution: 256,
          pixelValuesToColorFn: values => getViridisColor(values[0])
        });
      
        setNdviLayer(layer);
        map.fitBounds(layer.getBounds()); // <- tambahkan di sini
      })      
      .catch(error => {
        console.error('Gagal memuat NDVI GeoTIFF:', error);
      });
  }, [url, map]);

  useEffect(() => {
    if (!ndviLayer) return;

    if (visible) {
      ndviLayer.addTo(map);
    } else {
      map.removeLayer(ndviLayer);
    }    

    // Cleanup saat komponen unmount atau layer diganti
    return () => {
      if (map && ndviLayer) {
        map.removeLayer(ndviLayer);
      }
    };
  }, [visible, ndviLayer, map]);

  return null;
};

export default NDVILayer;
