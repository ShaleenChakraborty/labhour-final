import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("DIAGNOSTIC ERROR caught by Boundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          backgroundColor: '#fff0f0',
          color: '#d00',
          borderRadius: '12px',
          border: '1px solid #fab',
          margin: '2rem auto',
          maxWidth: '600px',
          fontFamily: 'sans-serif',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '1rem' }}>🔬 Simulation Performance Error</h2>
          <p style={{ marginBottom: '1.5rem', color: '#666' }}>
            The 3D engine encountered a rendering conflict on this screen size.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '0.8rem 1.5rem',
                backgroundColor: '#d00',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🔄 Refresh Simulation
            </button>
            <button 
              onClick={() => this.setState({ hasError: false })}
              style={{
                padding: '0.8rem 1.5rem',
                backgroundColor: '#666',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
