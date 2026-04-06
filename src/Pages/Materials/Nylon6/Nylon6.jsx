import MaterialSynthesize from "../../../components/MaterialSynthesize/MaterialSynthesize";
import datasetRaw from "../../../../src/data/N6_Copy.csv?raw";
import "./Nylon6.css";

function Nylon6() {
  const data = {
    name: "Nylon-6",
    desc: "Single-layer synthesis and ML-assisted prediction information for Nylon-6 (sample data).",
    modelInfo: {
      name: "Nylon-6 Prediction Model",
      architecture: "Regression-based Deep Neural Network",
      type: "Artificial Neural Network",
      training: "3,521 synthesis experiments",
    },
    specs: {
    formula: "C6H11NO",
    density: "1.14 -- 1.16 g/cm³",
    structure: "Gamma-crystalline structure",
    molecularWeight: "30,000 g/mol (approx)",
    meltingPoint: "258-276°C"
    },

    paper: {
    title: "Analysis of Variance—Electrospinning of Nylon 6 Nanofibers with Optimum Diameter",
    authors: "Sachin Chavan et. al.",
    journal: "Journal of Computational and Theoretical nanoscience",
    year: "April 2016",
    doi: "https://doi.org/10.1166/asl.2016.6983"
  },
    features: ["Concentration", "Flow Rate", "Collector-to-drum Distance", "Applied Voltage"],
    metrics: {
  r2: "0.9987",
  mse: "2.3969",
  mae: "0.82",
  rmse: "1.548"
},
    // Coefficients map to the input fields in MaterialSynthesize:
    // concentration -> CONC, flow -> FR, distance -> DIST, voltage -> V
    coeffs: {
      concentration: 20.9,
      flow: 136,
      distance: 87.1,
      voltage: 0.5,
    },
    intercept: 1340,
    base: { concentration: 15, flow: 1.0, distance: 15, voltage: 15 },
    allowDatasetUpload: true,
    datasetRaw,
  };

  return <MaterialSynthesize {...data} />;
}

export default Nylon6;
