import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
// import './Goals.css';
import './Maintenance.css';
import EngineeringIcon from '@mui/icons-material/Engineering';

const Goals = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Add logout handler function
    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
                <div className="sidebar-header">
                    <h2>Wealth Vault 💸</h2>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <Link to="/dashboard" className="nav-link">
                            <li className={location.pathname === '/dashboard' ? 'active' : ''}>
                                Dashboard
                            </li>
                        </Link>
                        <Link to="/transactions" className="nav-link">
                            <li className={location.pathname === '/transactions' ? 'active' : ''}>
                                Transactions
                            </li>
                        </Link>
                        <Link to="/budget" className="nav-link">
                            <li className={location.pathname === '/budget' ? 'active' : ''}>
                                Budget
                            </li>
                        </Link>
                        <Link to="/goals" className="nav-link">
                            <li className={location.pathname === '/goals' ? 'active' : ''}>
                                Goals
                            </li>
                        </Link>
                        <Link to="/reports" className="nav-link">
                            <li className={location.pathname === '/reports' ? 'active' : ''}>
                                Reports
                            </li>
                        </Link>
                        <Link to="/settings" className="nav-link">
                            <li className={location.pathname === '/settings' ? 'active' : ''}>
                                Settings
                            </li>
                        </Link>

                    </ul>
                    <Link className="logout-btn" onClick={handleLogout}>
                        <li className={location.pathname === '/' ? 'active' : ''}>
                            Logout
                        </li>
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="maintenance-container">
                    <EngineeringIcon className="maintenance-icon" />
                    <h1>Financial Goals Feature</h1>
                    <p>We're building something amazing to help you achieve your financial goals!</p>
                    <div className="maintenance-progress">
                        <div className="progress-bar"></div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Goals;
