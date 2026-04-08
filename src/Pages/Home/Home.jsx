import "./Home.css";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { SearchContext } from "../../context/SearchContext";

function Home() {
  const [showModal, setShowModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const navigate = useNavigate();
  const { searchQuery } = useContext(SearchContext);

  const [formData, setFormData] = useState({
    temperature: "",
    pressure: "",
    substrate: "",
    gasFlow: "",
    time: "",
  });

  const [prediction, setPrediction] = useState("");

  // ✅ UPDATED: structured data per tile
  const allMaterials = [
    {
      name: "Nylon-6",
      category: "Nanofiber",
      desc: "Electrospun nanofiber with high strength and flexibility.",
      formula: "C6H11NO",
      accuracy: "99%",
    },
    {
      name: "PAN (Polyacrylonitrile)",
      category: "Nanofiber",
      desc: "Widely used precursor for carbon nanofibers.",
      formula: "(C3H3N)n",
      accuracy: "99%",
    },
    {
      name: "PES (Polyethersulfone)",
      category: "Polymer",
      desc: "Thermally stable engineering polymer for membranes.",
      formula: "C12H8O3S",
      accuracy: "99%",
    },
    {
      name: "TiO2+PVP",
      category: "Composite",
      desc: "Used in photocatalysis and electrospinning applications.",
      formula: "TiO2 + PVP",
      accuracy: "99%",
    },
    {
      name: "ZnO+PVP",
      category: "Composite",
      desc: "Semiconducting nanofiber composite with optical properties.",
      formula: "ZnO + PVP",
      accuracy: "99%",
    },
  ];

  // ✅ Filter based on search
  const filteredMaterials = allMaterials.filter((mat) =>
    mat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNavigateToMaterial = (material) => {
    const map = {
      "Nylon-6": "nylon-6",
      "PAN (Polyacrylonitrile)": "pan",
      "PES (Polyethersulfone)": "pes",
      "TiO2+PVP": "tio2-pvp",
      "ZnO+PVP": "zno-pvp",
    };
    const slug = map[material] || material.toLowerCase();
    navigate(`/dashboard/materials/${slug}`);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePrediction = () => {
    const result = `Predicted Nanofiber Diameter: ${Math.floor(
      Math.random() * 200
    )} nm`;
    setPrediction(result);
  };

  return (
    <div className="home-container">
      <h2 className="page-title">Material Catalog</h2>
      <p className="page-subtitle">Select a material to view specifications and synthesis predictions</p>

      <div className="dashboard-catalog-grid">
        {filteredMaterials.length > 0 ? (
          filteredMaterials.map((mat, index) => (
            <div 
              className="material-card" 
              key={index}
              style={{ "--stagger-delay": `${index * 100}ms` }}
            >
              <div className="category">{mat.category}</div>
              <h3>{mat.name}</h3>
              <p className="desc">{mat.desc}</p>
              
              <div className="card-meta">
                <p><span className="label">Formula</span> <span>{mat.formula}</span></p>
                <p><span className="label">Accuracy</span> <span className="accuracy">{mat.accuracy}</span></p>
              </div>

              <button onClick={() => handleNavigateToMaterial(mat.name)}>
                Synthesize Material
              </button>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No materials found matching "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Prediction Options</h3>
              <span onClick={handleClose} className="close-btn">
                ✖
              </span>
            </div>

            <p className="material-name">{selectedMaterial}</p>

            <h4>Predict Morphology Using Parameters</h4>

            <div className="form-box">
              <h5>Synthesis Parameters</h5>

              <div className="form-grid">
                <input name="temperature" placeholder="Enter temperature" onChange={handleChange} />
                <input name="pressure" placeholder="Enter pressure" onChange={handleChange} />
                <input name="substrate" placeholder="Enter substrate" onChange={handleChange} />
                <input name="gasFlow" placeholder="Enter gas flow rate" onChange={handleChange} />
                <input name="time" placeholder="Enter time" onChange={handleChange} />
              </div>
            </div>

            <button className="run-btn" onClick={handlePrediction}>
              Run Prediction
            </button>

            {prediction && (
              <div className="result-box">
                <h4>Predicted Result</h4>
                <p>{prediction}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;