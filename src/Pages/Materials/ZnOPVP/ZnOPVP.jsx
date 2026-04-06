import MaterialSynthesize from "../../../components/MaterialSynthesize/MaterialSynthesize";
import datasetRaw from "../../../../src/data/ZnOPVP.csv?raw";
import "./ZnOPVP.css";

function ZnOPVP() {
  const data = {
    name: "ZnO + PVP",
    desc: "ZnO/PVP synthesis prediction using the five-parameter diameter model.",
    modelInfo: {
      name: "TiO2+PVP Prediction Model",
      architecture: "Regression-based Deep Neural Network",
      type: "Random Forest, XGBoost Ensemble, and Gradient Boosting",
      training: "1,027 synthesis experiments",
    },
    specs: {
    formula: "(ZnO)n + (C6H9NO)m",
    density: "--",
    structure: "Hexagonal Wurtzite Crystal Structure",
    molecularWeight: "10,000 g/mol (approx)",
    meltingPoint: "200°C"
    },

    paper: {
    title: "Multi-correlation analysis of optimizing the electrospinning parameters for ZnO+PVP nanofiber synthesis using statistical coefficient methods",
    authors: "Harshada Mhetre et. al.",
    journal: "Discover Materials",
    year: "2026",
    doi: "https://doi.org/10.1007/s43939-025-00494-2"
  },
    features: ["ZnO Concentration", "PVP Concentration", "Flow Rate", "Collector-to-drum Distance", "Applied Voltage"],
    metrics: {
  r2: "0.9989",
  mse: "1.15",
  mae: "0.72",
  rmse: "1.073"
},
    intercept: 67.002,
    base: { zno: 0.45, pvp: 11, voltage: 28, flow: 0.3, distance: 24 },
    ranges: {
      zno: [0.1, 1.0],
      pvp: [5, 15],
      voltage: [25, 35],
      flow: [0.1, 0.5],
      distance: [15, 30],
    },
    allowDatasetUpload: true,
    datasetRaw,
    labels: {
      zno: "ZnO Concentration (%)",
      pvp: "PVP Concentration (%)",
      voltage: "Applied Voltage (kV)",
      flow: "Flow Rate (mL/min)",
      distance: "Collector-to-drum distance (cm)",
    },
  };

  return <MaterialSynthesize {...data} />;
}

export default ZnOPVP;
