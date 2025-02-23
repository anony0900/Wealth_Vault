import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
// import './Budget.css';
import './Maintenance.css';
import BuildIcon from '@mui/icons-material/Build';

const Budget = () => {
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
                    <div className='logout-div'>
                        <Link to="/" className="logout-btn" onClick={handleLogout}>
                            <li className={location.pathname === '/' ? 'active' : ''}>
                                Logout
                            </li>
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="maintenance-container">
                    <BuildIcon className="maintenance-icon" />
                    <h1>Settings</h1>
                    <p>Our team is crafting powerful budget management features for you!</p>
                    <div className="maintenance-progress">
                        <div className="progress-bar"></div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Budget;
