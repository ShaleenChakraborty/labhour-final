import MaterialSynthesize from "../../../components/MaterialSynthesize/MaterialSynthesize";
import datasetRaw from "../../../../src/data/PES.csv?raw";
import "./PES.css";

function PES() {
  const data = {
    name: "PES (Polyethersulfone)",
    desc: "Overview and synthesis guidance for PES (sample content).",
    modelInfo: {
      name: "PES Prediction Model",
      architecture: "Regression-based Neural Network",
      type: "Average of KNN, XGBoost, and Random Forest",
      training: "2,501 synthesis experiments",
    },
    specs: {
    formula: "(C12H8O3S)n",
    density: "1.37 g/cm³",
    structure: "(Amorphopus) Weak crystalline structure",
    molecularWeight: "65,800 g/mol (approx)",
    meltingPoint: "225-230°C"
    },

    paper: {
    title: " Parametrization Study of Electrospun Nanofiber Including LiCl Using Response Surface Methodology (RSM) for Water Treatment Application",
    authors: "Jiyeol Bae et. al.",
    journal: "Applied Sciences",
    year: "2020",
    doi: "https://doi.org/10.3390/app10207295"
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
    intercept: 137.7312,
    base: { concentration: 30, flow: 0.35, distance: 25, voltage: 0.0109 },
    allowDatasetUpload: true,
    datasetRaw,
    labels: {
      concentration: 'Concentration of PES (%)',
      voltage: 'Concentration of LiCl (%)',
      flow: 'Flow Rate (cm)',
      distance: 'Collector-to-drum distance (cm)'
    },
  };

  return <MaterialSynthesize {...data} />;
}

export default PES;
