// src/components/MLPProgress.js
import React, { useState, useEffect } from "react";
import { Steps, Spin } from "antd";

const { Step } = Steps;

const MLPProgress = ({ currentStep }) => {
  const steps = [
    { title: "Upload Data", description: "NDVI & Klasifikasi tahun terakhir" },
    { title: "Preprocessing", description: "Normalisasi & sinkronisasi data" },
    { title: "Ekstraksi Fitur", description: "Gabung data NDVI + kelas" },
    { title: "Prediksi MLP", description: "Proses klasifikasi" },
    { title: "Tampilkan Hasil", description: "Peta & Statistik" },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Steps current={currentStep} direction="vertical">
        {steps.map((step, index) => (
          <Step
            key={index}
            title={
              index === currentStep ? (
                <span>
                  {step.title} <Spin size="small" style={{ marginLeft: 8 }} />
                </span>
              ) : (
                step.title
              )
            }
            description={step.description}
          />
        ))}
      </Steps>
    </div>
  );
};

export default MLPProgress;
