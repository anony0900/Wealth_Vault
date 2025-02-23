// Dashboard.js
import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import userImage from './images/user.png';
import { Link, useNavigate, useLocation, Routes, Route } from "react-router-dom";

const Dashboard = () => {
    // Sample data - Replace with actual data from your backend
    const [balance, setBalance] = useState(5000);
    const [expenses, setExpenses] = useState([]);
    const [income, setIncome] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const location = useLocation(); // Add this hook at the top of your component
    const [token, setToken] = useState(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [expensesByCategory, setExpensesByCategory] = useState([]);
    const [transactionsData, setTransactionsData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);

    const user = localStorage.getItem('email');

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    const categoryIcons = {
        "Food": '🍽️',
        "Utilities": '🛒',
        "Transportation": '🚗',
        "Salary": '💰',
        "Freelance": '🖥️',
        "Entertainment": '🍿',
        "Investments": '📈',
        "Gifts": '🎁',
        "Other": '📦'
    };

    // Add this useEffect hook to fetch balance data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const email = localStorage.getItem('email');

                // Fetch balance data (POST request)
                const balanceResponse = await fetch('https://wealth-vault-backend.onrender.com/api/balance', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email })
                });

                const balanceData = await balanceResponse.json();

                if (balanceData.status === 'success') {
                    setBalance(balanceData.data.totalBalance || 0);
                    setIncome(balanceData.data.income || 0);
                    setExpenses(balanceData.data.expense || 0);
                }

                // Fetch transactions data (GET request)
                const transactionsResponse = await fetch(`https://wealth-vault-backend.onrender.com/api/transactions?email=${email}`);

                const transactionsData = await transactionsResponse.json();
                // console.log(transactionsResponse.ok)
                // console.log(transactionsData[0].amount)

                if (Array.isArray(transactionsData) && transactionsData.length > 0) {
                    const categoryTotals = transactionsData.reduce((acc, { category, type, amount }) => {
                        if (type === 'expense') {
                            // console.log("category:", category);
                            acc.set(category, (acc.get(category) || 0) + amount);
                        }
                        return acc;
                    }, new Map());

                    // Process data for Pie chart
                    const pieChartData = Array.from(categoryTotals, ([name, value]) => ({ name, value }));
                    // console.log('Pie chart data:', pieChartData); // Debug log
                    setExpensesByCategory(pieChartData);

                    // Process data for line chart
                    const monthlyChartData = processMonthlyData(transactionsData);
                    setMonthlyData(monthlyChartData);
                }

                setTransactionsData(transactionsData);

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const processMonthlyData = (transactions) => {
        const monthlyTotals = transactions.reduce((acc, transaction) => {
            // Get month and year from transaction date
            const date = new Date(transaction.date);
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            // Initialize the month if it doesn't exist
            if (!acc[monthYear]) {
                acc[monthYear] = {
                    name: new Date(date).toLocaleString('default', { month: 'short' }),
                    income: 0,
                    expenses: 0
                };
            }
            // Add amount to appropriate category
            if (transaction.type === 'income') {
                acc[monthYear].income += transaction.amount;
            } else {
                acc[monthYear].expenses += transaction.amount;
            }
            return acc;
        }, {});
        // Convert to array and sort by date
        return Object.values(monthlyTotals)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    };




    const handleLogout = () => {
        localStorage.clear()
        setToken(null);
        navigate('/login');
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
                {/* Rest of your existing main content... */}
                {/* Header section */}
                <header className="dashboard-header">
                    <div className="welcome-section">
                        <h1>Welcome back, {user}</h1>
                        <p>Here's your financial overview</p>
                    </div>
                    <div className="user-profile-container">
                        <Link to="/profile">
                            <img className="user-profile" src={userImage} alt="User" />
                        </Link>
                    </div>
                </header>

                {/* Quick Stats */}
                <section className="quick-stats">
                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <>
                            <div className="stat-card">
                                <h3>Total Balance</h3>
                                <p className="amount">${balance.toLocaleString()}</p>
                                <span className="trend positive">↑ 2.5%</span>
                            </div>
                            <div className="stat-card">
                                <h3>Monthly Income</h3>
                                <p className="amount">${income.toLocaleString()}</p>
                                <span className="trend positive">↑ 4.1%</span>
                            </div>
                            <div className="stat-card">
                                <h3>Monthly Expenses</h3>
                                <p className="amount">${expenses.toLocaleString()}</p>
                                <span className="trend negative">↓ 1.2%</span>
                            </div>
                        </>
                    )}
                </section>


                {/* Charts Section */}
                <section className="charts-section">
                    <div className="chart-container income-expense-chart">
                        <h3>Income vs Expenses</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="income" stroke="#8884d8" />
                                <Line type="monotone" dataKey="expenses" stroke="#82ca9d" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-container expense-breakdown-chart">
                        <h3>Expense Breakdown</h3>
                        {loading ? (
                            <div>Loading chart data...</div>
                        ) : expensesByCategory.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={expensesByCategory}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {expensesByCategory.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `$${value}`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div>No expense data available</div>
                        )}
                    </div>
                </section>

                {/* Recent Transactions */}
                <section className="recent-transactions">
                    <h3>Recent Transactions</h3>
                    <div className="transactions-list">
                        {transactionsData.slice(-2).map((transaction, index) => (
                            <div className="transaction-item" key={index}>
                                <div className={`transaction-icon ${transaction.category.toLowerCase()}`}>
                                    {categoryIcons[transaction.category] || '📦'}
                                </div>
                                <div className="transaction-info">
                                    <h4>{transaction.title}</h4>
                                    <p>{transaction.category}</p>
                                </div>
                                <div className='category'>
                                    <p>{transaction.date}</p>
                                </div>
                                <div className={`transaction-amount ${transaction.type}`}>
                                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div >
    );
};

export default Dashboard;