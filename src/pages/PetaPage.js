import React, { useState } from "react";
import UploadFile from "../components/UploadGeoTIFF";
import MapComponent from "../components/MapComponent";

function PetaPage() {
  const [files, setFiles] = useState({
    geoTiffUrl: "",
    classificationUrl: "",
    rgbUrl: "",
    ndviUrl: "",
  });

  const handleFileUpload = (fileUrls) => {
    setFiles(fileUrls);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-2xl font-bold">Peta NDVI</h2>
      <UploadFile onFileUpload={handleFileUpload} />
      
      {files.ndviUrl && (
        <MapComponent
          geoTiffUrl={files.geoTiffUrl}
          classificationUrl={files.classificationUrl}
          rgbUrl={files.rgbUrl}
          ndviUrl={files.ndviUrl}
        />
      )}
    </div>
  );
}

export default PetaPage;
