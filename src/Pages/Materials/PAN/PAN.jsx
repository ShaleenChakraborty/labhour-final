import { useMemo } from "react";
import MaterialSynthesize from "../../../components/MaterialSynthesize/MaterialSynthesize";
import datasetRaw from "../../../../src/data/PAN.csv?raw";
import "./PAN.css";

function PAN() {
  const data = useMemo(() => ({
    name: "PAN (Polyacrylonitrile)",
    desc: "PAN nanofiber synthesis prediction using a four-parameter linear regression model.",
    modelInfo: {
      name: "PAN Prediction Model",
      architecture: "Regression-based Neural Network",
      type: "Artificial Neural Network",
      training: "2,701 synthesis experiments",
    },
    specs: {
      formula: "(C3H3N)n",
      density: "1.18 -- 1.20 g/cm³",
      structure: "Semi-crystalline structure",
      molecularWeight: "150,000 g/mol (approx)",
      meltingPoint: "220-300°C"
    },
    paper: {
      title: "Electro spun PAN Nanofiber with optimized diameter",
      authors: "Yuvraj V. Thorat et. al.",
      journal: "Journal of Algebraic Statistics",
      year: "2022",
      doi: "https://doi.org/10.52783/jas.v13i2.309"
    },
    features: ["Concentration", "Flow Rate", "Collector-to-drum Distance", "Applied Voltage"],
    metrics: {
      r2: "0.9996",
      mse: "11.4244",
      mae: "2.02",
      rmse: "3.38"
    },
    intercept: 1117.0,
    base: { distance: 10, flow: 0.2, voltage: 16, concentration: 10 },
    ranges: {
      distance: [5, 20],
      flow: [0.1, 2.0],
      voltage: [10, 25],
      concentration: [1, 20],
    },
    allowDatasetUpload: true,
    datasetRaw,
    labels: {
      distance: "Collector-to-drum Distance (cm)",
      flow: "Flow Rate (mL/min)",
      voltage: "Applied Voltage (kV)",
      concentration: "Concentration (%)",
    },
  }), []);

  return <MaterialSynthesize {...data} />;
}

export default PAN;
