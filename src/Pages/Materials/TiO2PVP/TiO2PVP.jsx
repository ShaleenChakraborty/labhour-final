import { useMemo } from "react";
import MaterialSynthesize from "../../../components/MaterialSynthesize/MaterialSynthesize";
import "./TiO2PVP.css";

function TiO2PVP() {
  const data = useMemo(() => ({
    name: "TiO2 + PVP",
    desc: "TiO2/PVP synthesis prediction using the five-parameter diameter model.",
    modelInfo: {
      name: "TiO2+PVP Prediction Model",
      architecture: "Regression-based Deep Neural Network",
      type: "Regression, Random Forest, and XGBoost Ensemble",
      training: "1,171 synthesis experiments",
    },
    specs: {
      formula: "(TiO2)n + (C6H9NO)m",
      density: "1.5 -- 2.5 g/cm³",
      structure: "Tetragonal anatase TiO2 with PVP polymer chains",
      molecularWeight: "1,300,000 g/mol (approx)",
      meltingPoint: "180°C"
    },
    paper: {
      title: "Data Driven modeling of TiO2 PVP nanofiber diameter using LSTM and regression for enhanced functional performance",
      authors: "Harshada Mhetre et. al.",
      journal: "Applied Sciences",
      year: "January 2025",
      doi: "https://doi.org/10.1007/s42452-025-06823-7"
    },
    features: ["TTIP Concentration", "PVP Concentration", "Flow Rate", "Collector-to-drum Distance", "Applied Voltage"],
    metrics: {
      r2: "0.9996",
      mse: "0.69",
      mae: "0.53",
      rmse: "0.83"
    },
    coeffs: {
      concentration: 20.9,
      flow: 136,
      distance: 87.1,
      voltage: 0.5,
    },
    intercept: 107.0,
    base: { ttip: 0.6, pvp: 0.262, voltage: 10, flow: 0.4, distance: 15 },
    ranges: {
      ttip: [0.1, 5],
      pvp: [0.1, 5],
      voltage: [1, 25],
      flow: [0.1, 10],
      distance: [5, 40],
    },
    allowDatasetUpload: false,
    labels: {
      ttip: "TTIP Concentration (%)",
      pvp: "PVP Concentration (%)",
      voltage: "Applied Voltage (kV)",
      flow: "Flow Rate (mL/hr)",
      distance: "Collector-to-drum distance (cm)",
    },
  }), []);

  return <MaterialSynthesize {...data} />;
}

export default TiO2PVP;
