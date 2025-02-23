// OTPVerification.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './OtpVerification.css';

const OTPVerification = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;
    const isNewUser = location.state?.isNewUser;

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(300); // 5 minutes in seconds
    const [error, setError] = useState('');
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        if (!email) {
            navigate('/login');
            return;
        }

        // Timer countdown
        const interval = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer <= 0) {
                    clearInterval(interval);
                    return 0;
                }
                return prevTimer - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [email, navigate]);

    const handleChange = (index, value) => {
        // Allow only numbers
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

    const handleKeyDown = (index, e) => {
        // Handle backspace
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

    const handleResendOTP = async () => {
        setIsResending(true);
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
                setTimer(180); // Reset timer to 5 minutes
                setError('');
            } else {
                setError(data.message || 'Failed to resend OTP');
            }
        } catch (err) {
            setError('Server error. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');

        if (otpString.length !== 6) {
            setError('Please enter complete OTP');
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

            const data = await response.json();
            if (response.ok) {
                navigate('/dashboard'); // Navigate to home page after successful verification
            } else {
                setError(data.message || 'Invalid OTP');
            }
        } catch (err) {
            setError('Server error. Please try again.');
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="otp-container">
            <div className="otp-box">
                <h2>OTP Verification</h2>
                
                <p className="otp-instruction">
                    {isNewUser 
                        ? "Please verify your email address to complete registration"
                        : "Please verify your identity to continue"}
                    <br />
                    <p className='otp-warning'>An otp has been sent to your registered email</p>
                    <span className="email-display">{email}</span>
                </p>

                {error && <div className="otp-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="otp-input-group">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                autoFocus={index === 0}
                            />
                        ))}
                    </div>

                    <div className="timer">
                        Time remaining: {formatTime(timer)}
                    </div>

                    <div className="otp-actions">
                        <button
                            type="button"
                            className="resend-button"
                            onClick={handleResendOTP}
                            disabled={timer > 0 || isResending}
                        >
                            {isResending ? 'Resending...' : 'Resend OTP'}
                        </button>
                        <button type="submit" className="verify-button">
                            Verify OTP
                        </button>
                    </div>
                    <p className='refresh'>Please, don't refresh this page</p>
                </form>
            </div>
        </div>
    );
};

export default OTPVerification;
