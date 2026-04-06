import "./About.css";
import teamImage from '../../assets/Media.jpg';

function About() {
  return (
    <div className="about-container">

      <h2>About LabHour</h2>
      <p className="subtitle">
        Advancing materials science through machine learning and AI-driven synthesis
      </p>

      {/* Mission Box */}
      <div className="mission-box">
        <h3>Our Mission</h3>
        <p>
          LabHour is a cutting-edge materials synthesis platform that leverages advanced machine learning models to predict synthesis outcomes and optimize experimental parameters. Our goal is to accelerate materials discovery and reduce the time and cost associated with traditional trial-and-error approaches.
        </p>

        <p>
          By combining comprehensive materials databases, state-of-the-art ML algorithms, and intuitive user interfaces, we empower researchers and engineers to make data-driven decisions in materials development.
        </p>
      </div>

      {/* Our Team Section */}
      <div className="team-section">
        <h3>Our Team</h3>

        <div className="team-overview">
          {/* Group Image on the Left */}
          <div className="team-image-wrapper">
            <img
              src={teamImage}
              alt="LabHour Team"
              className="team-main-image"
            />
          </div>

          {/* Roles and Names on the Right */}
          <div className="team-members">
            <div className="member-card guide" style={{ animationDelay: '0.1s' }}>
              <div className="member-info">
                <h4>Dr.Harshada Mhetre </h4>
                <p>Project Guide</p>
              </div>
            </div>
            <div className="member-card teammate" style={{ animationDelay: '0.2s' }}>
              <div className="member-info">
                <h4>Shaleen Chakraborty</h4>
                <p>Team Lead, Backend Developer, DevOps </p>
              </div>
            </div>
            <div className="member-card teammate" style={{ animationDelay: '0.3s' }}>
              <div className="member-info">
                <h4>Piyush Kumar </h4>
                <p>ML Engineer </p>
              </div>
            </div>
            <div className="member-card teammate" style={{ animationDelay: '0.4s' }}>
              <div className="member-info">
                <h4>Sarvesh Sorte </h4>
                <p>Frontend Engineer, ML Pipelining </p>
              </div>
            </div>
          </div>
        </div>

        {/* Center Aligned Paragraph */}
        <div className="team-description">
          <p>
            Our team had been constantly working and researching under the guidance of Dr. Harshada Mhetre ma'am.
            We started off with our curiosities in the very first year of our college and here we are
            displaying our final-year project. From being at the Nanotechnology lab to
            now creating this solution for nanotechnology researchers, it feels great.
            Our guide gave us a lot of opportunities to explore various fields, be it
            Material Science, or Machine Learning. The learning curve was steep but it
            helped as outgrow as engineers.
            We got a chance to even present our research at iDEAAS Conference, held at MAHSA University, Malaysia.
            Our paper also got selected at AMSCA 2025, held at Sungkyunkwan University in South Korea and
            NanoCon 2025, world's one of the biggest nanotechnology conference held in Czech Republic, Europe.
          </p>
        </div>

        {/* Contact Links */}
        <div className="team-contact-links">
          <span>Get in touch: </span>
          <a href="hvmhetre@bvucoep.edu.in">Dr. Harshada Mhetre</a> •
          <a href="shaleenece@gmail.com">Shaleen Chakraborty</a> •
          <a href="piyushkumarkmr15329@gmail.com">Piyush Kumar</a> •
          <a href="sarvesh.1414sorte@gmail.com">Sarvesh Sorte</a>
        </div>
      </div>

      {/* Features Grid */}
      <div className="features-grid">

        <div className="feature-card">
          <h4>Precision Predictions</h4>
          <p>
            Our ML models achieve over 90% accuracy in predicting material morphologies and synthesis outcomes.
          </p>
        </div>

        <div className="feature-card">
          <h4>Rapid Optimization</h4>
          <p>
            Derive optimal synthesis parameters in seconds, reducing experimental iterations.
          </p>
        </div>

        <div className="feature-card">
          <h4>Comprehensive Database</h4>
          <p>
            Access detailed specifications and ML models for advanced materials.
          </p>
        </div>

        <div className="feature-card">
          <h4>Research Community</h4>
          <p>
            Join a growing community of materials scientists and engineers.
          </p>
        </div>

      </div>



    </div>
  );
}

export default About;