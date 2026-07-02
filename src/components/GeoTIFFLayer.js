import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

// Fungsi skema warna NDVI
const ndviPalette = [
  [165, 0, 38],    // -1.0 to -0.2 : merah tua (tanah/gersang)
  [215, 48, 39],
  [244, 109, 67],
  [253, 174, 97],
  [254, 224, 144],
  [171, 221, 164],
  [102, 194, 165],
  [50, 136, 189],  // > 0.8 : hijau tua (vegetasi sehat)
];

const GeoTIFFLayer = ({ url, colormap = "ndvi" }) => {
  const map = useMap();

  useEffect(() => {
    let palette = ndviPalette;  // default NDVI
    let domain = [-1, 1];       // domain NDVI

    // Kalau kamu ingin mendukung colormap lain di masa depan, bisa tambahkan sini
    if (typeof colormap === "object") {
      palette = colormap.scale.map(d => d.color);
      domain = colormap.domain;
    }

    const layer = new L.LeafletGeotiff(url, {
      renderer: new L.LeafletGeotiff.Palette({
        domain,
        palette,
      }),
    });

    layer.addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [url, colormap, map]);

  return null;
};

export default GeoTIFFLayer;
