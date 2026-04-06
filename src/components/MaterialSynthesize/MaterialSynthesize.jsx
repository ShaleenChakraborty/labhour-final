import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./MaterialSynthesize.css";
import defaultDatasetRaw from "../../data/N6_Copy.csv?raw";
import FiberVisualizer from "../FiberVisualizer/FiberVisualizer";
import ElectrospinningSetup from "../ElectrospinningSetup/ElectrospinningSetup";
import ReportGenerator from "../ReportGenerator/ReportGenerator";
import ErrorBoundary from "../ErrorBoundary/ErrorBoundary";

function MaterialSynthesize({
  name,
  desc,
  modelInfo,
  features = [],
  metrics = {},
  specs = {},
  paper = {},
  coeffs,
  base,
  ranges,
  intercept,
  allowDatasetUpload,
  datasetRaw,
  labels,
}) {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("choose");
  const [activeVisualizer, setActiveVisualizer] = useState("fesem");
  const COEFFS = coeffs || {
    concentration: 2.5,
    flow: 3.0,
    distance: 1.2,
    voltage: 1.8,
  };

  const [params, setParams] = useState(() => {
    const p = {};
    Object.keys(COEFFS).forEach((k) => (p[k] = ""));
    return p;
  });
  const [diameter, setDiameter] = useState(null);
  const [target, setTarget] = useState("");
  const [computedParams, setComputedParams] = useState(null);
  const [uploadedData, setUploadedData] = useState(null);
  const [models, setModels] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [fileName, setFileName] = useState("");
  const [parsingError, setParsingError] = useState("");
  const [recommendedParams, setRecommendedParams] = useState(null);
  const [topN, setTopN] = useState(4);
  const [concStep, setConcStep] = useState(1);
  const [tolerance, setTolerance] = useState(50);
  const [showResults, setShowResults] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const reportRef = useRef(null);
  const resultsRef = useRef(null);

  // Sync params state when COEFFS changes (e.g., when navigating between materials)
  useEffect(() => {
    const p = {};
    Object.keys(COEFFS).forEach((k) => (p[k] = params[k] || ""));
    setParams(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coeffs]); // We only want this to run when the MATERIAL (coeffs) actually changes

  // DIAGNOSTIC LOGGING for re-renders
  const renderCount = useRef(0);
  useEffect(() => {
    renderCount.current += 1;
    if (renderCount.current > 50) {
      console.warn("MATERIAL SYNTHESIZE: High render count detected!", renderCount.current);
    }
    console.info(`MATERIAL SYNTHESIZE RENDER: #${renderCount.current} (Mode: ${mode}, ShowResults: ${showResults})`);
  });

  const INTERCEPT = typeof intercept !== "undefined" ? intercept : 50;
  const BASE = base || {};
  const RANGES =
    ranges ||
    ({
      concentration: [0.1, 30],
      flow: [0.01, 10],
      distance: [1, 40],
      voltage: [1, 50],
    });

  const labelFor = (key, def) => (labels && labels[key]) || def;
  const inputStep = (key) => {
    if (key === "flow") return "0.01";
    if (key === "ttip" || key === "pvp") return "0.001";
    return "0.1";
  };

  const handleParamChange = (e) => {
    setParams({ ...params, [e.target.name]: e.target.value });
  };

  const calcDiameter = () => {
    let sum = INTERCEPT;
    Object.keys(COEFFS).forEach((key) => {
      const val = parseFloat(params[key]) || 0;
      sum += (COEFFS[key] || 0) * val;
    });

    const result = Number(sum.toFixed(2));
    if (isNaN(result)) {
      setDiameter(0);
    } else {
      setDiameter(result);
    }

    setComputedParams(null);
    setRecommendedParams(null);
    setPredictions([]);
    setShowResults(true);
    setModalOpen(false);
    
    // Smooth scroll to results
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  const calcInputsFromTarget = () => {
    const t = parseFloat(target);
    if (!t && t !== 0) {
      setComputedParams(null);
      return;
    }

    // If dataset upload is enabled and models exist, try the group-based predictor first
    if (allowDatasetUpload && models && models.length > 0) {
      const results = predictFromModels(t, models, { topN, concStep, tolerance });
      if (results && results.length > 0) {
        setPredictions(results);
        setComputedParams(null);
        setRecommendedParams(null);
        setDiameter(null);
        setParsingError("");
        setShowResults(true);
        setModalOpen(false);
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        return;
      }
      // No matches found in dataset; clear predictions and fall back to analytic inverse
      setPredictions([]);
      setParsingError("No dataset matches found; using analytic fallback.");
      // continue to analytic fallback
    }

    // Fallback: analytic minimal-norm inverse (least-squares) around BASE
    const d0 =
      INTERCEPT +
      Object.keys(COEFFS).reduce((sum, key) => {
        return sum + (COEFFS[key] || 0) * (BASE[key] || 0);
      }, 0);

    const delta = t - d0;
    const coeffVals = Object.keys(COEFFS).map((k) => COEFFS[k]);
    const denom = coeffVals.reduce((s, c) => s + c * c, 0) || 1e-12;

    const newParams = {};
    const recommended = {};
    Object.keys(COEFFS).forEach((key) => {
      const ci = COEFFS[key];
      const dx = (ci * delta) / denom; // minimal-norm change satisfying c·Δx = delta
      const unquant = BASE[key] + dx;
      recommended[key] = Number(unquant.toFixed(6));

      let xi = unquant;
      const [min, max] = RANGES[key] || [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY];
      // Quantize concentration to concStep if provided
      if (key === "concentration" && concStep && concStep > 0) {
        xi = Math.round(xi / concStep) * concStep;
      }
      if (xi < min) xi = min;
      if (xi > max) xi = max;
      newParams[key] = Number(xi.toFixed(3));
    });

    setComputedParams(newParams);
    setRecommendedParams(recommended);
    setDiameter(null);
    setShowResults(true);
    setModalOpen(false);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // ===============================
  // CSV parsing + model building
  // ===============================
  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    if (!lines.length) return [];

    // detect delimiter
    let delimiter = ",";
    const first = lines[0];
    if (first.indexOf(";") > -1 && first.split(";").length > first.split(",").length) delimiter = ";";
    if (first.indexOf("\t") > -1 && first.split("\t").length > first.split(",").length) delimiter = "\t";

    const headers = lines[0].split(delimiter).map((h) => h.trim());
    const mapHeader = (h) => {
      const clean = h.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
      if (clean.includes("DIST")) return "DIST";
      // allow LICL (LiCl) to map to V so we can reuse grouping logic
      if (clean === "V" || clean.includes("VOLT") || clean.includes("LICL") || clean === "LICL") return "V";
      if (clean.includes("FR") || clean.includes("FLOW")) return "FR";
      // PES, PVP or CONC headers -> CONC
      if (clean.includes("CONC") || clean.includes("PES") || clean === "PVP") return "CONC";
      // LiCl sometimes abbreviated LIO? handle LI variations
      if (clean.includes("LICL") || clean.includes("LCL") || clean.includes("LIC")) return "V";
      // NM or DIAM or D as diameter
      if (clean.includes("DIAM") || clean === "D" || clean === "NM" || clean.includes("NM")) return "D";
      return clean;
    };

    const headMap = headers.map(mapHeader);

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(delimiter).map((p) => p.trim());
      if (parts.length < headMap.length) continue;
      const row = {};
      for (let j = 0; j < headMap.length; j++) {
        const key = headMap[j];
        if (!key) continue;
        const raw = parts[j] || "";
        const num = parseFloat(raw.replace(/,/g, "."));
        row[key] = isNaN(num) ? raw : num;
      }
      // require minimum columns
      if (typeof row.D === "undefined" || typeof row.CONC === "undefined") continue;
      if (typeof row.DIST === "undefined" || typeof row.FR === "undefined" || typeof row.V === "undefined") continue;
      rows.push(row);
    }

    return rows;
  };

  const groupData = (data) => {
    const groups = {};
    data.forEach((row) => {
      const dist = Number(row.DIST);
      const fr = Number(row.FR);
      const v = Number(row.V);
      const conc = Number(row.CONC);
      const D = Number(row.D);
      if (!isFinite(dist) || !isFinite(fr) || !isFinite(v) || !isFinite(conc) || !isFinite(D)) return;
      const key = `${dist}_${fr}_${v}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    });
    return groups;
  };

  const fitLinear = (group) => {
    const n = group.length;
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumX2 = 0;
    group.forEach((r) => {
      const x = r.CONC;
      const y = r.D;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    });
    const denom = n * sumX2 - sumX * sumX;
    if (Math.abs(denom) < 1e-12) return null;
    const a = (n * sumXY - sumX * sumY) / denom;
    const b = (sumY - a * sumX) / n;
    return { a, b };
  };

  const buildModels = (data) => {
    const groups = groupData(data);
    const models = [];
    for (const key in groups) {
      const parts = key.split("_").map(Number);
      const DIST = parts[0];
      const FR = parts[1];
      const V = parts[2];
      const group = groups[key];
      const fitted = fitLinear(group);
      if (!fitted) continue;
      const concValues = group.map((r) => Number(r.CONC));
      const minConc = Math.min(...concValues);
      const maxConc = Math.max(...concValues);
      // collect extras (numeric columns other than CONC,D,DIST,FR,V)
      const extras = {};
      const first = group[0] || {};
      Object.keys(first).forEach((k) => {
        const up = String(k).toUpperCase();
        if (up === "CONC" || up === "D" || up === "DIST" || up === "FR" || up === "V") return;
        // compute mean for this key
        const vals = group.map((r) => Number(r[k])).filter((x) => isFinite(x));
        if (vals.length > 0) {
          const mean = vals.reduce((s, x) => s + x, 0) / vals.length;
          extras[k.toLowerCase()] = mean;
        }
      });
      models.push({ DIST, FR, V, a: fitted.a, b: fitted.b, minConc, maxConc, extras });
    }
    return models;
  };

  const predictFromModels = (D_input, modelsArr, options = {}) => {
    const { topN: tN = 4, concStep: step = 1, tolerance: tol = 50 } = options;
    const results = [];
    modelsArr.forEach((m) => {
      if (!isFinite(m.a) || Math.abs(m.a) < 1e-12) return;
      const conc = (D_input - m.b) / m.a;
      if (!isFinite(conc)) return;
      if (conc < m.minConc || conc > m.maxConc) return;
      const concRounded = Math.round(conc / step) * step;
      const D_pred = m.a * concRounded + m.b;
      const error = Math.abs(D_input - D_pred);
      if (error > tol) return;
      results.push({ DIST: m.DIST, FR: m.FR, V: m.V, CONC: concRounded, D_pred: Number(D_pred.toFixed(3)), error: Number(error.toFixed(3)), extras: m.extras || {} });
    });
    results.sort((a, b) => a.error - b.error);
    return results.slice(0, tN);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        const parsed = parseCSV(text);
        if (!parsed || parsed.length === 0) {
          setParsingError("No valid rows found in CSV. Expect columns: DIST, FR, V, CONC., D");
          setUploadedData(null);
          setModels(null);
          return;
        }
        setUploadedData(parsed);
        const built = buildModels(parsed);
        setModels(built);
        setParsingError("");
        setRecommendedParams(null);
      } catch (err) {
        setParsingError("Failed to parse CSV");
        setUploadedData(null);
        setModels(null);
      }
    };
    reader.onerror = () => {
      setParsingError("Failed to read file");
      setUploadedData(null);
      setModels(null);
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  useEffect(() => {
    if (!allowDatasetUpload) return;
    if (models && models.length > 0) return;
    try {
      const source = datasetRaw || defaultDatasetRaw;
      if (!source) return;
      const parsed = parseCSV(source);
      if (!parsed || parsed.length === 0) {
        setParsingError("Embedded dataset parsed but contains no valid rows.");
        setUploadedData(null);
        setModels(null);
        setFileName("");
        return;
      }
      setUploadedData(parsed);
      const built = buildModels(parsed);
      setModels(built);
      setFileName("embedded-dataset.csv");
      setParsingError("");
      setRecommendedParams(null);
    } catch (err) {
      setParsingError("Failed to parse embedded dataset: " + (err.message || err));
      setUploadedData(null);
      setModels(null);
    }
  }, [allowDatasetUpload, datasetRaw]);

  return (
    <div className="synthesize-page">
      <div className="header-row">
        <button className="back" onClick={() => navigate("/dashboard")}>← Back to Catalog</button>

        <div className="material-identity">
          <div className="material-icon"></div>
          <div className="material-meta">
            <div className="title-row">
              <h2>{name}</h2>
              <span className="pill">2D Materials</span>
            </div>
            <p className="short-desc">{desc}</p>
          </div>
        </div>
      </div>

      {/* Material Specifications */}
      {/* Material Specifications */}
<div className="card specs-card">
  <div className="card-heading">
    <h4>Material Specifications</h4>
  </div>

  <div className="specs-grid">

    <div className="col">
      <div className="spec">
        <div className="label">Chemical Formula</div>
        <div className="value">{specs?.formula || "-"}</div>
      </div>

      <div className="spec">
        <div className="label">Density</div>
        <div className="value">{specs?.density || "-"}</div>
      </div>

      <div className="spec">
        <div className="label">Crystal Structure</div>
        <div className="value">{specs?.structure || "-"}</div>
      </div>
    </div>

    <div className="col">
      <div className="spec">
        <div className="label">Molecular Weight</div>
        <div className="value">{specs?.molecularWeight || "-"}</div>
      </div>

      <div className="spec">
        <div className="label">Melting Point</div>
        <div className="value">{specs?.meltingPoint || "-"}</div>
      </div>
    </div>

  </div>
</div>

      {/* Source Paper */}
      {/* Source Paper */}
<div className="card paper-card">
  <div className="card-heading">
    <h4>Source Paper</h4>
  </div>

  <h3 className="paper-title">{paper?.title || "-"}</h3>
  <p className="paper-author">{paper?.authors || "-"}</p>

  <div className="paper-meta">
    Journal: {paper?.journal || "-"} • 
    Year: {paper?.year || "-"} • 
    DOI: <span className="doi">{paper?.doi || "-"}</span>
  </div>
</div>

      <div className="info-row">
        <div className="info-left">
          <div className="card model-card">
            <h4>ML Model</h4>
            <p className="model-name">{modelInfo?.name || "GrapheneNet"}</p>
            <h5>Architecture</h5>
            <p>{modelInfo?.architecture || "CNN-LSTM Hybrid"}</p>
            <h5>Input Features</h5>
            <div className="features">
              {features.map((f, i) => (
                <span key={i} className="chip">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="info-right">
          <div className="card model-stats">
            <h5>Type</h5>
            <p>{modelInfo?.type || "Deep Neural Network"}</p>
            <h5>Training Data</h5>
            <p>{modelInfo?.training || "15,000 synthesis experiments"}</p>
          </div>
        </div>
      </div>

      <div className="metrics-card card">
  <h4>Model Performance Metrics</h4>
  <div className="metrics-grid">

    <div className="metric green">
      <div className="label">R² Score</div>
      <div className="value">{metrics?.r2 || "0.00"}</div>
    </div>

    <div className="metric blue">
      <div className="label">MSE</div>
      <div className="value">{metrics?.mse || "0.00"}</div>
    </div>

    <div className="metric purple">
      <div className="label">MAE</div>
      <div className="value">{metrics?.mae || "0.00"}</div>
    </div>

    <div className="metric orange">
      <div className="label">RMSE</div>
      <div className="value">{metrics?.rmse || "0.00"}</div>
    </div>

  </div>
</div>

      <div className="bottom-actions center">
        <button
          className="predict-btn"
          onClick={() => {
            setModalOpen(true);
            setMode("choose");
          }}
        >
          ⚡ Launch Prediction Engine
        </button>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* PREDICTION MODAL - Parameter Input */}
      {/* ═══════════════════════════════════════════ */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Prediction Engine</h3>
              <button className="close-btn" onClick={() => setModalOpen(false)}>
                ✖
              </button>
            </div>

            {mode === "choose" && (
              <div className="choose-grid animate-fade-in">
                <button className="option option-morph glass-card interactive-card" onClick={() => setMode("morphology")}>
                  <div className="option-icon-wrapper">
                    <span className="option-icon">🔬</span>
                  </div>
                  <div className="option-content">
                    <span className="option-title">Predict Diameter</span>
                    <span className="option-desc">Estimate fiber morphology from your synthesis parameters</span>
                  </div>
                </button>
                <button className="option option-inverse glass-card interactive-card" onClick={() => setMode("inputs")}>
                  <div className="option-icon-wrapper">
                    <span className="option-icon">🧪</span>
                  </div>
                  <div className="option-content">
                    <span className="option-title">Estimate Parameters</span>
                    <span className="option-desc">Reverse-engineer ideal conditions for a target diameter</span>
                  </div>
                </button>
              </div>
            )}

            {mode === "morphology" && (
              <div className="panel">
                <h4>Predict Diameter from Input Parameters</h4>
                <div className="form-grid">
                  {Object.keys(COEFFS).map((key) => (
                    <label key={key}>
                      {labelFor(key, String(key).replace(/([A-Z])/g, " $1")).trim()}
                      <input
                        name={key}
                        value={params[key]}
                        onChange={handleParamChange}
                        type="number"
                        step={inputStep(key)}
                        placeholder="Enter value..."
                      />
                    </label>
                  ))}
                </div>
                <div className="modal-actions">
                  <button onClick={calcDiameter} className="run">
                    🚀 Run Prediction
                  </button>
                  <button onClick={() => setMode("choose")} className="back-btn">
                    ← Back
                  </button>
                </div>
              </div>
            )}

            {mode === "inputs" && (
              <div className="panel">
                <h4>Predict Input Parameters from Target Diameter</h4>
                {allowDatasetUpload && (
                  <div className="form-grid single">
                    <div className="small-note">📊 Using embedded dataset — {models ? models.length : 0} regression models trained</div>
                    {parsingError && <div className="error">{parsingError}</div>}
                  </div>
                )}

                <div className="form-grid single">
                  <label>
                    Target Diameter (nm)
                    <input value={target} onChange={(e) => setTarget(e.target.value)} type="number" step="0.1" placeholder="e.g. 250" />
                  </label>
                </div>
                <div className="modal-actions">
                  <button onClick={calcInputsFromTarget} className="run">
                    🧬 Calculate Parameters
                  </button>
                  <button onClick={() => setMode("choose")} className="back-btn">
                    ← Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* RESULTS PANEL — Fiber Visualizer + Report  */}
      {/* ═══════════════════════════════════════════ */}
      {showResults && (diameter !== null || computedParams || (predictions && predictions.length > 0)) && (
        <div className="results-panel animate-slide-up" ref={resultsRef}>
          <div className="results-panel-header glass-card">
            <div className="results-header-left">
              <div className="results-status-dot animate-pulse"></div>
              <h3>Synthesis Simulation Results</h3>
            </div>
            <div className="results-header-actions">
              <button
                className="report-download-btn"
                disabled={isGeneratingPdf}
                onClick={async () => {
                  if (!reportRef.current) return;
                  setIsGeneratingPdf(true);
                  try {
                    const html2canvas = (await import('html2canvas')).default;
                    const { jsPDF } = await import('jspdf');
                    const canvas = await html2canvas(reportRef.current, {
                      scale: 2,
                      useCORS: true,
                      backgroundColor: '#ffffff',
                    });
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    pdf.save(`LabHour_${name}_Report_${new Date().toISOString().slice(0,10)}.pdf`);
                  } catch (err) {
                    console.error('PDF generation failed:', err);
                  } finally {
                    setIsGeneratingPdf(false);
                  }
                }}
              >
                {isGeneratingPdf ? '⏳ Generating...' : '📄 Download Report'}
              </button>
              <button className="results-close-btn" onClick={() => setShowResults(false)}>
                ✕ Close
              </button>
            </div>
          </div>

          {/* Results Data */}
          <div className="results-body">

            {/* MORPHOLOGY MODE RESULT */}
            {diameter !== null && (
              <div className="results-data-section">
                <div className="diameter-result-hero">
                  <div className="hero-label">Predicted Nanofiber Diameter</div>
                  <div className="hero-value">
                    <span className={`hero-number ${diameter >= 1000 ? 'out-of-range' : ''}`}>{diameter}</span>
                    <span className="hero-unit">nm</span>
                  </div>
                  {diameter >= 1000 && (
                    <div className="warning-box">
                      Not in the nanoscale range — Please change parameters.
                    </div>
                  )}
                  <div className="hero-params">
                    {Object.entries(params).map(([key, val]) => (
                      <span key={key} className="hero-param-chip">
                        {labelFor(key, key)}: {val || '0'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* INPUTS MODE RESULT */}
            {computedParams && (
              <div className="results-data-section">
                <div className="inputs-result-hero">
                  <div className="hero-label">Target Diameter: <strong>{target} nm</strong></div>
                  {parseFloat(target) >= 1000 && (
                    <div style={{textAlign: "center", marginBottom: "16px"}}>
                      <div className="warning-box">
                        Not in the nanoscale range — Please change your target diameter.
                      </div>
                    </div>
                  )}
                  <h4>Estimated Optimal Parameters</h4>
                  <div className="computed-params-grid">
                    {Object.entries(computedParams).map(([key, value]) => (
                      <div key={key} className="computed-param-card">
                        <div className="cparam-label">{labelFor(key, key)}</div>
                        <div className="cparam-value">{value}</div>
                      </div>
                    ))}
                  </div>
                  {recommendedParams && (
                    <div className="recommended-note">
                      <span className="rec-badge">💡 Unquantized</span>
                      {Object.entries(recommendedParams).map(([key, value]) => (
                        <span key={key} className="rec-item">
                          {labelFor(key, key)}: {Number(value).toFixed(4)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PREDICTIONS MODE RESULT (Dataset matches) */}
            {predictions && predictions.length > 0 && (
              <div className="results-data-section">
                <div className="predictions-hero">
                  <div className="hero-label">Target Diameter: <strong>{target} nm</strong> — Top {predictions.length} Matches</div>
                  <div className="predictions-table-wrapper">
                    <table className="predictions-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Concentration (%)</th>
                          <th>Flow Rate (ml/hr)</th>
                          <th>Distance (cm)</th>
                          <th>Voltage (kV)</th>
                          <th>Predicted D (nm)</th>
                          <th>Error (nm)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {predictions.map((p, idx) => (
                          <tr key={idx} className={idx === 0 ? 'best-match-row' : ''}>
                            <td><span className={`rank-badge rank-${idx+1}`}>#{idx + 1}</span></td>
                            <td>{p.CONC}</td>
                            <td>{p.FR}</td>
                            <td>{p.DIST}</td>
                            <td>{p.V}</td>
                            <td className="pred-d">{p.D_pred}</td>
                            <td className="pred-error">±{p.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 3D VISUALIZER: Morphological OR Apparatus */}
            <div className="results-visualizer-section">
              <ErrorBoundary>
                <div className="visualizer-tabs">
                  <button 
                    className={`vis-tab ${activeVisualizer === 'fesem' ? 'active' : ''}`}
                    onClick={() => setActiveVisualizer('fesem')}
                  >
                    🔬 FESEM Morphology
                  </button>
                  <button 
                    className={`vis-tab ${activeVisualizer === 'setup' ? 'active' : ''}`}
                    onClick={() => setActiveVisualizer('setup')}
                  >
                    ⚙️ Apparatus Setup
                  </button>
                </div>

                {activeVisualizer === 'fesem' ? (
                  <FiberVisualizer
                    diameter={diameter || (predictions.length > 0 ? predictions[0].D_pred : parseFloat(target) || 200)}
                    structure={specs?.structure}
                    voltage={params.voltage || (predictions.length > 0 ? predictions[0].V : 15)}
                    distance={params.distance || (predictions.length > 0 ? predictions[0].DIST : 15)}
                  />
                ) : (
                  <ElectrospinningSetup 
                    params={computedParams || (predictions.length > 0 ? predictions[0] : params)}
                  />
                )}
              </ErrorBoundary>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Report Generator for PDF export */}
      <ReportGenerator
        ref={reportRef}
        materialName={name}
        specs={specs}
        paper={paper}
        modelInfo={modelInfo}
        params={{
          ...params,
          targetDiameter: target,
        }}
        mode={mode === "morphology" || diameter !== null ? "morphology" : "inputs"}
        diameterResult={diameter}
        inputsResult={computedParams}
        predictions={predictions}
        timestamp={new Date().toLocaleString()}
      />
    </div>
  );
}

export default MaterialSynthesize;
