import React, { useState } from 'react';
import { Layers } from 'lucide-react'; // pastikan lucide-react terinstall

const LayerToggle = ({
  showNDVI,
  setShowNDVI,
  showClassification,
  setShowClassification,
  baseMap,
  setBaseMap,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute top-2 right-2 z-[1000]">
      {/* Icon Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="bg-white shadow-md p-3 rounded-lg hover:bg-gray-100 transition-all"
        title="Toggle Layer"
        style={{
          width: '50px',
          height: '50px',
        }}
      >
        <Layers className="w-6 h-6 text-gray-700 mx-auto" />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white shadow-lg rounded-md z-[1000] p-3 space-y-3">
          <div className="text-xs font-semibold text-gray-500">Basemap</div>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="radio"
              name="basemap"
              checked={baseMap === 'osm'}
              onChange={() => setBaseMap('osm')}
            />
            <span>OpenStreetMap</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="radio"
              name="basemap"
              checked={baseMap === 'satellite'}
              onChange={() => setBaseMap('satellite')}
            />
            <span>Satellite</span>
          </label>

          <div className="pt-2 border-t border-gray-200 text-xs font-semibold text-gray-500">
            Overlay
          </div>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={showNDVI}
              onChange={() => setShowNDVI(!showNDVI)}
            />
            <span>NDVI Layer</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={showClassification}
              onChange={() => setShowClassification(!showClassification)}
            />
            <span>Classification</span>
          </label>
        </div>
      )}
    </div>
  );
};

export default LayerToggle;
