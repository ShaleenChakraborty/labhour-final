import "./Contact.css";

function Contact() {
  return (
    <div className="contact-container">

      <h2>Contact Us</h2>
      <p className="subtitle">
        Get in touch with our team for support, partnerships, or inquiries
      </p>

      {/* Top Cards */}
      <div className="contact-grid">

        <div className="contact-card">
          <h4>Email</h4>
          <p>For general inquiries and support</p>
          <a href="#">shaleenece@gmail.com</a>
        </div>

        <div className="contact-card">
          <h4>Phone</h4>
          <p>Available Mon-Fri, 9AM-5PM EST</p>
          <a href="#">NOT AVAILABLE</a>
        </div>

        <div className="contact-card">
          <h4>Address</h4>
          <p>
            Bharati Vidyapeeth (DU) <br />
            College of Engineering, Pune <br />
            Dhankawadi Campus <br />
            Pune-Satara Road, Pune-411043 <br />

          </p>
        </div>

      </div>

      {/* Bottom Section */}
      <div className="bottom-grid">

        {/* Form */}
        <div className="form-box">
          <h3>Send us a message</h3>

          <label>Name</label>
          <input placeholder="Your full name" />

          <label>Email</label>
          <input placeholder="your.email@example.com" />

          <label>Subject</label>
          <input placeholder="What is this regarding?" />

          <label>Message</label>
          <textarea placeholder="Tell us more about your inquiry..." />

          <button>Send Message</button>
        </div>

        {/* Office Info */}
        <div className="info-box">
          <h3>Office Hours</h3>

          <p><strong>Technical Support</strong></p>
          <p>Monday - Friday: 9:00 AM - 6:00 PM IST</p>
          <p>Saturday: 10:00 AM - 2:00 PM IST</p>
          <p>Sunday: Closed</p>

          <br />

          <p><strong>Research Inquiries</strong></p>
          <p>Monday - Friday: 9:00 AM - 5:00 PM EST</p>
          <p>Response time: Within 24 hours</p>

          <div className="partner-box">
            <h4>Partnership Opportunities</h4>
            <p>
              Interested in collaborating with LabHour? We work with academic institutions, research labs, and industry partners.
            </p>
            <a href="#">shaleenece@gmail.com</a>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Contact;