import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import 'leaflet-geotiff';
import 'leaflet-geotiff/dist/leaflet-geotiff.min.js';

const PredictionLayer = ({ url, visible }) => {
  const map = useMap();

  useEffect(() => {
    if (!visible || !url) return;

    const layer = new window.L.GeotiffLayer({
      source: {
        url: url,
      },
      renderer: new window.L.LeafletGeotiff.Plotty({
        colorScale: 'viridis',
        clampLow: false,
        clampHigh: true,
      }),
    });

    layer.addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [map, url, visible]);

  return null;
};

export default PredictionLayer;
