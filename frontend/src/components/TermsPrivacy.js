// InfoPages.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TermsPrivacy.css";

const InfoPages = () => {
  const [activePage, setActivePage] = useState("terms");
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Goes back to previous page
  };

  const renderContent = () => {
    switch (activePage) {
      case "terms":
        return (
          <div className="terms-content">
            <h2>Terms & Conditions</h2>
            <div className="terms-section">
              <h3>1. Acceptance of Terms</h3>
              <p>
                By accessing and using SkyWay Airlines' services, you agree to be bound
                by these terms and conditions.
              </p>
            </div>

            <div className="terms-section">
              <h3>2. Booking and Payment</h3>
              <ul>
                <li>All bookings are subject to availability</li>
                <li>Full payment is required to confirm bookings</li>
                <li>Prices are subject to change without notice</li>
                <li>Booking confirmations are sent via email</li>
              </ul>
            </div>

            <div className="terms-section">
              <h3>3. Cancellation Policy</h3>
              <ul>
                <li>Cancellations must be made 24 hours before departure</li>
                <li>Refunds are subject to booking conditions</li>
                <li>No-shows may result in complete fare forfeiture</li>
              </ul>
            </div>

            <div className="terms-section">
              <h3>4. Baggage Policy</h3>
              <ul>
                <li>Baggage allowances vary by ticket class</li>
                <li>Excess baggage fees apply</li>
                <li>Restricted items are not permitted</li>
              </ul>
            </div>
          </div>
        );

      case "privacy":
        return (
          <div className="privacy-content">
            <h2>Privacy Policy</h2>
            <div className="privacy-section">
              <h3>1. Information We Collect</h3>
              <p>We collect personal information including but not limited to:</p>
              <ul>
                <li>Name and contact details</li>
                <li>Payment information</li>
                <li>Travel documentation</li>
                <li>Flight preferences</li>
              </ul>
            </div>

            <div className="privacy-section">
              <h3>2. How We Use Your Information</h3>
              <ul>
                <li>Processing your bookings</li>
                <li>Communicating flight updates</li>
                <li>Improving our services</li>
                <li>Legal compliance</li>
              </ul>
            </div>

            <div className="privacy-section">
              <h3>3. Data Security</h3>
              <p>
                We implement appropriate security measures to protect your personal
                information from unauthorized access, alteration, or disclosure.
              </p>
            </div>

            <div className="privacy-section">
              <h3>4. Your Rights</h3>
              <ul>
                <li>Access your personal data</li>
                <li>Request corrections</li>
                <li>Delete your information</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </div>
          </div>
        );

      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="info-pages-container">
      <div className="info-pages">
        <div className="page-header">
          <button className="back-button" onClick={handleBack}>
            ← Back
          </button>
          <h1>Legal Information</h1>
        </div>
        
        <div className="page-navigation">
          <button
            className={`nav-button ${activePage === "terms" ? "active" : ""}`}
            onClick={() => setActivePage("terms")}
          >
            Terms & Conditions
          </button>
          <button
            className={`nav-button ${activePage === "privacy" ? "active" : ""}`}
            onClick={() => setActivePage("privacy")}
          >
            Privacy Policy
          </button>
        </div>
        <div className="content-container">{renderContent()}</div>
      </div>
    </div>
  );
};

export default InfoPages;
