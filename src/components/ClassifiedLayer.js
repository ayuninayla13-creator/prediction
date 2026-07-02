import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import GeoRasterLayer from 'georaster-layer-for-leaflet';
import parseGeoraster from 'georaster';
import classColorMap from "../constants/classColorMap"; // gunakan map

const ClassificationLayer = ({ url, visible }) => {
  const map = useMap();
  const [layerInstance, setLayerInstance] = useState(null);

  useEffect(() => {
    fetch(url)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => parseGeoraster(arrayBuffer))
      .then(georaster => {
        const layer = new GeoRasterLayer({
          georaster,
          opacity: 0.8,
          resolution: 256,
          pixelValuesToColorFn: values => {
            const val = values[0];
            return classColorMap[val]?.color || null;
          },
        });

        setLayerInstance(layer);
      })
      .catch(err => {
        console.error('Gagal memuat layer klasifikasi:', err);
      });
  }, [url]);

  useEffect(() => {
    if (!layerInstance) return;

    if (visible) {
      layerInstance.addTo(map);
      map.fitBounds(layerInstance.getBounds());
    } else {
      map.removeLayer(layerInstance);
    }

    return () => {
      if (map && layerInstance) {
        map.removeLayer(layerInstance);
      }
    };
  }, [visible, layerInstance, map]);

  return null;
};

export default ClassificationLayer;
