import "./Utility.css";
import { useState } from "react";
import reportPDF from "./DMD_BV_PPhase1 (2).pdf";

function Utility() {

  // ✅ ADD STATE HERE (inside function, before return)
  const [showFullReport, setShowFullReport] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="utility-container">

      <h2 className="animate-fade-in">Utility & Design Implementation</h2>
      <p className="subtitle animate-slide-up">
        Technical architecture and implementation details of the LabHour platform
      </p>

      {/* System Architecture */}
      <section className="box architecture-section animate-slide-up">
        <div className="section-header">
          <span className="header-icon"></span>
          <h3>System Architecture</h3>
        </div>
        <p className="desc">
          LabHour is built on a modern, scalable architecture designed for high-performance ML inference and seamless user experience.
        </p>

        <div className="arch-grid">
          <div className="arch-card interactive-card">
            <div className="card-badge">Client</div>
            <h4>Frontend Layer</h4>
            <ul>
              <li>React with Modern Hooks</li>
              <li>Vanilla CSS Design System</li>
              <li>Real-time Data Visualization</li>
              <li>Fluid Responsive Layouts</li>
            </ul>
          </div>

          <div className="arch-card interactive-card">
            <div className="card-badge">Server</div>
            <h4>Backend Engine</h4>
            <ul>
              <li>Python 3.10+ with FastAPI</li>
              <li>JWT-based Secure Auth</li>
              <li>PostgreSQL Research DB</li>
              <li>Asynchronous Task Queues</li>
            </ul>
          </div>

          <div className="arch-card interactive-card">
            <div className="card-badge">Inference</div>
            <h4>ML Pipeline</h4>
            <ul>
              <li>Morphology Regression Models</li>
              <li>Parameter Estimation Nets</li>
              <li>A/B Model Performance Testing</li>
              <li>Automated Drift Detection</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="box features-section animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="section-header">
          <span className="header-icon"></span>
          <h3>Key Features</h3>
        </div>

        <div className="features-container">
          <div className="feature-row interactive-card">
            <div className="feature-icon-box">🔄</div>
            <div className="feature-info">
              <h4>Bidirectional Prediction</h4>
              <p>Predict outcomes and derive parameters from desired outputs with high precision.</p>
            </div>
          </div>

          <div className="feature-row interactive-card">
            <div className="feature-icon-box">🧬</div>
            <div className="feature-info">
              <h4>Ensemble Models</h4>
              <p>Combines CNNs, Random Forests, and GBMs for highly robust scientific predictions.</p>
            </div>
          </div>

          <div className="feature-row interactive-card">
            <div className="feature-icon-box">🔍</div>
            <div className="feature-info">
              <h4>Instant Materials Search</h4>
              <p>Lightning-fast filtering across vast research datasets and material libraries.</p>
            </div>
          </div>

          <div className="feature-row interactive-card">
            <div className="feature-icon-box">📊</div>
            <div className="feature-info">
              <h4>Uncertainty Quantification</h4>
              <p>Every prediction includes detailed confidence scoring and distribution metrics.</p>
            </div>
          </div>
        </div>
      </section>


      {/* Project Report Section */}
      <div className={`box report-box ${showFullReport ? 'unlocked' : 'locked'}`}>
        <div className="report-header">
          <h3>Project Report</h3>
          {showFullReport && (
            <button className="lock-btn" onClick={() => {
              setShowFullReport(false);
              setPassword("");
            }}>
              Lock Report
            </button>
          )}
        </div>

        <p className="desc">
          {showFullReport
            ? "Full access to the LabHour project report is now active."
            : "Preview of the LabHour project report. Full access is restricted to authorized personnel."}
        </p>

        <div className="pdf-container">
          {!showFullReport ? (
            <div className="locked-viewer glass-card">
              <div className="locked-overlay">
                <div className="lock-icon-sphere">
                  <span className="lock-emoji">🔒</span>
                </div>
                <h4>Authorized Personnel Only</h4>
                <p>This report contains sensitive research data protected by LabHour security protocols.</p>

                <div className="password-prompt-premium">
                  <div className="input-group">
                    <input
                      type="password"
                      placeholder="Enter Secure Access Key"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={error ? 'error-input' : ''}
                    />
                    <span className="input-border"></span>
                  </div>
                  <button
                    className="unlock-btn-premium"
                    onClick={() => {
                      if (password === "password") {
                        setShowFullReport(true);
                        setError("");
                      } else {
                        setError("Access Denied: Invalid Authentication Key.");
                      }
                    }}
                  >
                    Decrypt & Open
                  </button>
                </div>
                {error && <p className="error-msg animate-pulse">{error}</p>}
              </div>
            </div>
          ) : (
            <div className="reader-mode">
              <iframe
                src={reportPDF}
                title="Full Report"
                className="pdf-frame full"
              />
            </div>
          )}
        </div>
      </div>
      {/* Security */}
      <section className="box security-section animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="section-header">
          <span className="header-icon">🛡️</span>
          <h3>Security & Reliability</h3>
        </div>

        <div className="arch-grid">
          <div className="arch-card interactive-card">
            <div className="card-header">
              <span className="tiny-icon">🔒</span>
              <h4>Data Security</h4>
            </div>
            <ul>
              <li>End-to-End AIS-256 Encryption</li>
              <li>Role-Based Granular Access Control</li>
              <li>Comprehensive Audit Logging</li>
              <li>Full GDPR & HIPAA Compliance</li>
            </ul>
          </div>

          <div className="arch-card interactive-card">
            <div className="card-header">
              <span className="tiny-icon">📈</span>
              <h4>Reliability</h4>
            </div>
            <ul>
              <li>Enterprise 99.99% Uptime SLA</li>
              <li>Multi-Region Automated Backups</li>
              <li>Isolated Disaster Recovery Cubes</li>
              <li>Immutable Model Versioning</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Implementation */}
      <section className="box implementation-section animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="section-header">
          <span className="header-icon">⚙️</span>
          <h3>Implementation Details</h3>
        </div>

        <div className="impl-content">
          <div className="impl-group">
            <h4>Model Training Pipeline</h4>
            <ul className="premium-list">
              <li>
                <span className="list-dot"></span>
                <p><strong>Stage 1:</strong> Automated Data Synthesis & Cleansing</p>
              </li>
              <li>
                <span className="list-dot"></span>
                <p><strong>Stage 2:</strong> Deep Feature Engineering & selection</p>
              </li>
              <li>
                <span className="list-dot"></span>
                <p><strong>Stage 3:</strong> Bayesian Hyperparameter Optimization</p>
              </li>
              <li>
                <span className="list-dot"></span>
                <p><strong>Stage 4:</strong> N-Fold Stratified Cross-Validation</p>
              </li>
              <li>
                <span className="list-dot"></span>
                <p><strong>Stage 5:</strong> Canary Deployment with A/B Validation</p>
              </li>
            </ul>
          </div>

          <div className="impl-group">
            <h4>Inference Workflow</h4>
            <div className="workflow-diagram">
              <div className="wf-step">Input Validation</div>
              <div className="wf-arrow">→</div>
              <div className="wf-step">Normalization</div>
              <div className="wf-arrow">→</div>
              <div className="wf-step">Prediction</div>
              <div className="wf-arrow">→</div>
              <div className="wf-step">Post-Processing</div>
            </div>
          </div>

          <div className="impl-group">
            <h4>Stack Performance</h4>
            <div className="perf-grid">
              <div className="perf-card">
                <h5>Frontend Engine</h5>
                <ul>
                  <li>Route-based Code Splitting</li>
                  <li>Intelligent Component Memoization</li>
                  <li>WebWorker Data Processing</li>
                </ul>
              </div>

              <div className="perf-card">
                <h5>Backend Core</h5>
                <ul>
                  <li>LRU Model Weights Caching</li>
                  <li>Parallelized Batch Inference</li>
                  <li>Global Edge Distribution</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Utility;