// Profile.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Profile.css";

const Profile = () => {
    const [data, setdata] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const email = localStorage.getItem("email");

    // Add new states for password viewing functionality
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpError, setOtpError] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isOtpLoading, setIsOtpLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");

    useEffect(() => {
        fetchdata();
    }, []);

    const fetchdata = async () => {
        try {
            const response = await fetch("http://127.0.0.1:5000/api/profile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();
            setdata({
                name: result.data.name,
                email: result.data.email,
                phone: result.data.mobile,
                password: result.data.password,
                wallet: result.data.wallet || 0
            });
            setLoading(false);
        } catch (error) {
            console.error("Error fetching user details:", error);
            setLoading(false);
        }
    };


    // Handle OTP input change
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    // Handle backspace in OTP input
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) {
                prevInput.focus();
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
            }
        }
    };

    const handleBack = () => {
        navigate(-1)
    }

    // Request OTP
    const handlePassword = async () => {
        setIsOtpLoading(true);
        setOtpError('');
        setLoadingMessage("Please wait, sending OTP to your email...");


        try {
            const response = await fetch('http://127.0.0.1:5000/api/create-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setShowOtpModal(true);
            } else {
                setOtpError(data.message || 'Failed to send OTP');
            }
        } catch (err) {
            setOtpError('Failed to send OTP. Please try again.');
        } finally {
            setIsOtpLoading(false);
            setLoadingMessage("");
        }
    };

    // Verify OTP
    const handleVerifyOTP = async () => {
        setIsOtpLoading(true);
        setOtpError('');
        setLoadingMessage("Please wait, verifying OTP...");

        const otpString = otp.join('');

        if (otpString.length !== 6) {
            setOtpError('Please enter complete OTP');
            setIsOtpLoading(false);
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/api/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    otp: otpString,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setIsPasswordVisible(true);
                setShowOtpModal(false);
                setOtp(['', '', '', '', '', '']);
            } else {
                setOtpError(result.message || 'Invalid OTP');
            }
        } catch (err) {
            setOtpError('Verification failed. Please try again.');
        } finally {
            setIsOtpLoading(false);
            setLoadingMessage("");
        }
    };

    if (loading) {
        return <div className="profile-loader">Loading...</div>;
    }

    return (
        <div className="profile-wrappers">


            <div className="profile-container">
                <div className="profile-card">
                    <h2 className="profile-title">My Profile</h2>
                    {data ? (
                        <div className="profile-info">
                            <div className="profile-info-item">
                                <span className="profile-label">Full Name:</span>
                                <span className="profile-value">{data.name}</span>
                            </div>
                            <div className="profile-info-item">
                                <span className="profile-label">Email:</span>
                                <span className="profile-value">{data.email}</span>
                            </div>
                            <div className="profile-info-item">
                                <span className="profile-label">Mobile:</span>
                                <span className="profile-value">{data.phone}</span>
                            </div>
                            <div className="profile-info-item">
                                <span className="profile-label">Password:</span>
                                <span className="profile-value">
                                    {isPasswordVisible ? data.password : '********'}
                                </span>
                                <button
                                    className="profile-password-btn"
                                    onClick={() => {
                                        if (isPasswordVisible) {
                                            // If password is visible, simply hide it
                                            setIsPasswordVisible(false);
                                        } else {
                                            // If password is hidden, trigger OTP process
                                            handlePassword();
                                        }
                                    }}
                                >
                                    {isPasswordVisible ? <FaEye /> : <FaEyeSlash />}
                                </button>
                            </div>
                            <div className="back-button" onClick={handleBack}>
                                Back
                            </div>

                        </div>
                    ) : (
                        <div className="profile-no-data">
                            No profile information available.
                        </div>
                    )}
                </div>
            </div>

            {/* OTP Modal */}
            {showOtpModal && (
                <div className="otp-modal-overlay">
                    <div className="otp-modal">
                        <h3>Enter OTP</h3>
                        <p>Please enter the OTP sent to your email</p>
                        <div className="otp-inputs">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-${index}`}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                />
                            ))}
                        </div>
                        {otpError && <div className="otp-error">{otpError}</div>}
                        <div className="otp-modal-buttons">
                            <button
                                className="otp-verify-btn"
                                onClick={handleVerifyOTP}
                                disabled={isOtpLoading}
                            >
                                {isOtpLoading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                            <button
                                className="otp-cancel-btn"
                                onClick={() => {
                                    setShowOtpModal(false);
                                    setOtp(['', '', '', '', '', '']);
                                    setOtpError('');
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Loading Overlay */}
            {loadingMessage && (
                <div className="loading-overlay">
                    <div className="loading-content">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">{loadingMessage}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
