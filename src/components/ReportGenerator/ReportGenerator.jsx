import React from 'react';
import './ReportGenerator.css';

const ReportGenerator = React.forwardRef(({
  materialName,
  specs,
  paper,
  modelInfo,
  params,
  mode,
  diameterResult,
  inputsResult,
  predictions,
  timestamp
}, ref) => {
  return (
    <div className="report-container-wrapper" style={{ position: 'absolute', top: -9999, left: -9999 }}>
      <div className="report-canvas" ref={ref} id="pdf-report-template">
        {/* Header section */}
        <div className="report-header">
          <div className="header-logos">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/Bharati_Vidyapeeth_Logo.svg/150px-Bharati_Vidyapeeth_Logo.svg.png" 
              alt="Bharati Vidyapeeth Logo" 
              className="uni-logo"
            />
            <div className="header-titles">
              <h1 className="report-main-title">LabHour Synthesis Report</h1>
              <h2 className="report-sub-title">Department of Nanomaterial Research</h2>
              <p className="report-timestamp">Generated on: {timestamp}</p>
            </div>
          </div>
          <div className="report-divider"></div>
        </div>

        {/* Payload / Primary Meta */}
        <div className="report-body">
          <div className="report-section">
            <h3>1. Material Profile</h3>
            <table className="report-table">
              <tbody>
                <tr>
                  <td className="table-label">Material Name</td>
                  <td className="table-value bold-text">{materialName || "Unknown"}</td>
                </tr>
                <tr>
                  <td className="table-label">Chemical Formula</td>
                  <td className="table-value">{specs?.formula || "N/A"}</td>
                </tr>
                <tr>
                  <td className="table-label">Crystal Structure</td>
                  <td className="table-value">{specs?.structure || "N/A"}</td>
                </tr>
                <tr>
                  <td className="table-label">Reference Paper</td>
                  <td className="table-value italic-text">{paper?.title || "N/A"} ({paper?.year || ""})</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="report-section">
            <h3>2. Predictive Engine Profile</h3>
            <table className="report-table">
              <tbody>
                <tr>
                  <td className="table-label">Algorithm Architecture</td>
                  <td className="table-value">{modelInfo?.architecture || "CNN-LSTM Hybrid"}</td>
                </tr>
                <tr>
                  <td className="table-label">Model Designation</td>
                  <td className="table-value">{modelInfo?.name || "GrapheneNet v2.1"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="report-section results-highlight">
            <h3>3. Synthesis Simulation Results</h3>
            {mode === "morphology" ? (
              <div className="simulation-block">
                <h4>Forward Prediction Mode (Morphology Estimation)</h4>
                <div className="params-box">
                  <p><strong>Concentration:</strong> {params.concentration || 0} %</p>
                  <p><strong>Flow Rate:</strong> {params.flow || 0} mL/hr</p>
                  <p><strong>Distance:</strong> {params.distance || 0} cm</p>
                  <p><strong>Voltage:</strong> {params.voltage || 0} kV</p>
                </div>
                <div className="final-result-box highlighted-blue">
                  <h4>Predicted Diameter</h4>
                  <h2>{diameterResult !== null ? `${diameterResult} nm` : "N/A"}</h2>
                </div>
              </div>
            ) : (
              <div className="simulation-block">
                <h4>Inverse Prediction Mode (Parameter Estimation)</h4>
                <div className="final-result-box highlighted-purple">
                  <h4>Target Morphology (Diameter)</h4>
                  <h2>{params.targetDiameter || "N/A"} nm</h2>
                </div>
                <h4>Estimated Ideal Synthesizer Parameters</h4>
                
                {predictions && predictions.length > 0 ? (
                  <table className="report-table results-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Conc. (%)</th>
                        <th>Flow (ml/hr)</th>
                        <th>Dist. (cm)</th>
                        <th>Volt. (kV)</th>
                        <th>Error (nm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictions.map((p, i) => (
                        <tr key={i} className={i === 0 ? 'best-row' : ''}>
                          <td>#{i + 1}</td>
                          <td>{p.CONC}</td>
                          <td>{p.FR}</td>
                          <td>{p.DIST}</td>
                          <td>{p.V}</td>
                          <td className="error-cell">{p.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="params-box detailed-params">
                    {inputsResult ? Object.entries(inputsResult).map(([key, value]) => (
                      <div className="param-item" key={key}>
                        <span className="param-key">{String(key).toUpperCase()}</span>
                        <span className="param-val">{value}</span>
                      </div>
                    )) : <p>No parameters computed.</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="report-footer">
          <p>LabHour is an AI-powered nanomaterials database capable of computational predictions.</p>
          <p className="confidential-text">Simulation data generated using approximated modeling coefficients. Real-world physical variations may apply.</p>
        </div>
      </div>
    </div>
  );
});

export default ReportGenerator;
