// Login.js
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Add this import
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Set initial state based on the current path
  const [isLogin, setIsLogin] = useState("");
  const [mobileError, setMobileError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    setIsLogin(location.pathname === "/login");
  }, [location.pathname]);

  const toggleMode = () => {
    const newMode = !isLogin;
    setIsLogin(newMode);
    navigate(newMode ? "/login" : "/signup");
    // Refresh captcha when switching modes
    fetchCaptcha();
    // Clear form data including captcha
    setFormData({
      email: "",
      password: "",
      mobile: "",
      name: "",
      captcha: "",
    });
  };

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    mobile: "",
    name: "",
    captcha: "",
  });
  const [error, setError] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [isLoadingCaptcha, setIsLoadingCaptcha] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'mobile') {
      // Only allow numbers and limit to 10 digits
      const mobileValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData({
        ...formData,
        [name]: mobileValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleBack = () => {
    navigate("/");
  };
  const handleTermsClick = () => {
    navigate('/terms-and-conditions');
  };

  const handlePrivacyClick = () => {
    navigate('/privacy-policy');
  };

  // Fetch new captcha when component mounts
  useEffect(() => {
    fetchCaptcha();
  }, []);

  const fetchCaptcha = async () => {
    setIsLoadingCaptcha(true);
    try {
      const response = await fetch("https://wealth-vault-backend.onrender.com/api/get-captcha");

      const data = await response.json();

      // console.log("Captcha data:", data);
      // console.log("response:", response);

      setCaptchaImage(data.captcha_image);
      localStorage.setItem("captcha_text", data.captcha_text);
    } catch (error) {
      console.error("Error fetching captcha:", error);
    } finally {
      setIsLoadingCaptcha(false);
    }
  };

  const handleRefreshClick = () => {
    const refreshButton = document.querySelector('.auth-refresh-button');
    if (refreshButton) {
      refreshButton.classList.add('rotating');
      setTimeout(() => {
        refreshButton.classList.remove('rotating');
      }, 500);
    }
    fetchCaptcha();
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error message
    setIsSubmitting(true);

    const captcha = formData.captcha;
    const storedCaptcha = localStorage.getItem("captcha_text");

    if (captcha !== storedCaptcha) {
      setIsSubmitting(false);
      alert("Invalid captcha");
      setFormData({ ...formData, captcha: "" });
      fetchCaptcha();
      return;
    }

    try {
      const endpoint = isLogin ? "/api/login" : "/api/signup";
      const response = await fetch(`https://wealth-vault-backend.onrender.com${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && (data.message === "User logged in successfully" || data.message === "User registered successfully")) {
        // Proceed to OTP creation if login/signup was successful
        const otpResponse = await fetch("https://wealth-vault-backend.onrender.com/api/create-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        });

        const otpData = await otpResponse.json();

        if (otpResponse.ok) {
          // console.log("token:", data.token);
          localStorage.setItem("token", data.token);
          localStorage.setItem("email", formData.email);

          navigate("/otp-verification", {
            state: { email: formData.email, isNewUser: !isLogin },
          });

          // Reset form data after successful login/signup
          setFormData({
            email: "",
            password: "",
            mobile: "",
            name: "",
            captcha: "",
          });
        } else {
          setError(otpData.message || "Failed to send OTP");
          fetchCaptcha();
        }
      } else {
        setError(data.message || "An error occurred");
        fetchCaptcha();
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Server error. Please try again.");
      fetchCaptcha();
    } finally {
      setIsSubmitting(false); // Stop loading regardless of outcome
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-content-wrapper">
        {/* Auth Box */}
        <div className="auth-section">
          <div className="auth-form-box">
            <h2>{isLogin ? "Login" : "Sign Up"}</h2>

            {error && <div className="auth-error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="auth-form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div className="auth-form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="auth-form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {!isLogin && (
                <div className="auth-form-group">
                  <label>Mobile Number</label>
                  <input
                    type="number"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    maxLength="10"
                    pattern="[6-9][0-9]{9}"
                    placeholder="Enter 10 digit mobile number"
                    required
                    className={mobileError ? 'error-input' : ''}
                  />
                  {formData.mobile && formData.mobile.length !== 10 && (
                    <small style={{ color: 'red', fontSize: '20px' }}>
                      Mobile number must be 10 digits
                    </small>
                  )}
                </div>
              )}

              <div className="auth-captcha-container">
                <div className="auth-captcha-left">
                  <div className="auth-captcha-image-container">
                    <img
                      src={`data:image/png;base64,${captchaImage}`}
                      alt="CAPTCHA"
                      className="auth-captcha-image"
                    />
                    <button
                      type="button"
                      className="auth-refresh-button"
                      onClick={handleRefreshClick}
                      title="Refresh CAPTCHA"
                    >
                      ↻
                    </button>
                    {isLoadingCaptcha && (
                      <div className="auth-loading-overlay">
                        <div className="auth-loading-spinner"></div>
                      </div>
                    )}
                  </div>
                </div>


                <div className="auth-captcha-input-container">
                  <input
                    type="text"
                    id="captcha"
                    name="captcha"
                    className="auth-captcha-input"
                    value={formData.captcha}
                    onChange={handleChange}
                    placeholder="Enter the code shown"
                    required
                  />
                </div>
              </div>

              <div className="auth-button-container">
                <button
                  onClick={handleBack}
                  className="auth-submit-btn"
                  type="button"
                >
                  ← Back
                </button>
                <button type="submit" className="auth-submit-btn">
                  {isLogin ? "Login" : "Sign Up"}
                </button>
              </div>
            </form>

            <>
              {!isLogin && (
                <p className="auth-terms-text">
                  By signing up, you agree to our{' '}
                  <span
                    onClick={handleTermsClick}
                    onKeyPress={(e) => e.key === 'Enter' && handleTermsClick()}
                    role="button"
                    tabIndex={0}
                  >
                    Terms & Conditions
                  </span>{' '}
                  and{' '}
                  <span
                    onClick={handlePrivacyClick}
                    onKeyPress={(e) => e.key === 'Enter' && handlePrivacyClick()}
                    role="button"
                    tabIndex={0}
                  >
                    Privacy Policy
                  </span>
                </p>
              )}
              <p className="auth-toggle-text">
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <span className="auth-toggle-link" onClick={toggleMode}>
                  {isLogin ? "Sign up" : "Login"}
                </span>
              </p>
            </>
          </div>
        </div>
      </div>
      {isSubmitting && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p className="loading-text">Please wait, while we send OTP...</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;
