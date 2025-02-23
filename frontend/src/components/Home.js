import React from 'react';
import { useLocation, useNavigate } from "react-router-dom";

import './Home.css';

const Home = () => {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/login');
    };
    return (
        <div className="home-container">
            <header className="home-header">
                <p className='app-name'>Wealth Vault 💸</p>
                <div className="header-buttons">
                    <button className="login-button" onClick={handleLogin}>Login</button>
                </div>
            </header>
            <main className="home-main">
                <h1>Welcome to Personal Finance Tracker</h1>
                <p>Track your expenses, manage your budget, and achieve your financial goals.</p>
            </main>
        </div>
    );
};

export default Home;