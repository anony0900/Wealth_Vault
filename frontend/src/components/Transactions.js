import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import './Transactions.css';
import userImage from './images/user.png';

const Transactions = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTransaction, setNewTransaction] = useState({
        type: '',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        comment: ''
    });
    const [editingTransaction, setEditingTransaction] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');

    // Fetch transactions from the backend when the component loads
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const email = localStorage.getItem('email');
                const response = await fetch(`http://localhost:5000/api/transactions?email=${email}`, { method: 'GET' });
                const data = await response.json();

                // Check if the response is an array
                if (Array.isArray(data)) {
                    setTransactions(data);
                } else {
                    console.error('Expected array of transactions but got:', data);
                    setTransactions([]); // Set empty array as fallback
                }
            } catch (error) {
                console.error('Error fetching transactions:', error);
                setTransactions([]); // Set empty array on error
            }
        };

        fetchTransactions();
    }, []);

    const handleAddTransaction = () => {
        setIsModalOpen(true);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTransaction(null);
        setNewTransaction({
            type: '',
            category: '',
            amount: '',
            description: '',
            date: new Date().toISOString().split('T')[0],
            comment: ''
        });
    };

    const handleEdit = (transaction) => {
        setEditingTransaction(transaction);
        setNewTransaction({
            type: transaction.type,
            category: transaction.category,
            amount: transaction.amount,
            description: transaction.description,
            date: transaction.date,
            comment: transaction.comment
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (transactionId) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await deleteTransaction(transactionId);
                setTransactions(transactions.filter(t => t.id !== transactionId));
            } catch (error) {
                console.error('Error deleting transaction:', error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const transactionData = {
            ...newTransaction,
            amount: parseFloat(newTransaction.amount),
            email: localStorage.getItem('email')
        };
        try {
            if (editingTransaction) {
                // Update existing transaction
                await updateTransaction(editingTransaction.id, transactionData);
            } else {
                // Add new transaction
                const createdTransaction = await createTransaction(transactionData);
                setTransactions(prevTransactions => [...prevTransactions, createdTransaction]);
            }

            // Refresh transactions list after adding/editing
            const email = localStorage.getItem('email');
            const refreshedTransactions = await getTransactions(email);
            setTransactions(refreshedTransactions);

            handleCloseModal();
        } catch (error) {
            console.error('Error saving transaction:', error);
        }
    };




    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTransaction(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Filter and sort transactions
    const filteredTransactions = (transactions || [])
        .filter(transaction => {
            const matchesSearch = transaction.description
                ? transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
                : false;
            const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
            const matchesType = filterType === 'all' || transaction.type === filterType;
            return matchesSearch && matchesCategory && matchesType;
        })
        .sort((a, b) => {
            if (sortBy === 'date') {
                return sortOrder === 'desc' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date);
            } else if (sortBy === 'amount') {
                return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
            }
            return 0;
        });



    // Create transaction
    const createTransaction = async (transactionData) => {
        try {
            const response = await fetch('http://localhost:5000/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...transactionData,
                    email: localStorage.getItem('email') // Make sure email is included
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create transaction');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error creating transaction:', error);
            throw error;
        }
    };

    // Update transaction
    const updateTransaction = async (transactionId, updateData) => {
        try {
            const response = await fetch(`http://localhost:5000/api/transactions/${transactionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error('Failed to update transaction');
            }

            const updatedTransaction = await response.json();
            return updatedTransaction;
        } catch (error) {
            console.error('Error updating transaction:', error);
            throw error;
        }
    };


    // Get user's transactions
    const getTransactions = async (email) => {
        const response = await fetch(`http://localhost:5000/api/transactions?email=${email}`);
        if (!response.ok) {
            throw new Error('Failed to fetch transactions');
        }
        const data = await response.json();
        return Array.isArray(data) ? data : []; // Ensure we always return an array
    };

    // Delete transaction
    const deleteTransaction = async (transactionId) => {
        const response = await fetch(`http://localhost:5000/api/transactions/${transactionId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to delete transaction');
        }
        return response.json();
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
                {/* Header */}
                <header className="dashboard-header">
                    <div className="welcome-section">
                        <h1>Transactions</h1>
                        <p>Manage your financial transactions</p>
                    </div>
                    <div className="header-actions">
                        <button className="add-transaction-btn" onClick={handleAddTransaction}>+ Add Transaction</button>
                        <div className="user-profile-container">
                            <Link to="/profile">
                                <img className="user-profile" src={userImage} alt="User" />
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Filters Section */}
                <section className="filters-section">
                    <div className="filters-wrapper">
                        <div className="search-form">
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Categories</option>
                            <option value="Food">Food</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Income">Income</option>
                            <option value="Transportation">Transportation</option>
                            <option value="Salary">Salary</option>
                            <option value="Freelance">Freelance</option>
                            <option value="Investments">Investments</option>
                            <option value="Gifts">Gifts</option>
                            <option value="Other">Other</option>
                        </select>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                        <select
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [newSortBy, newSortOrder] = e.target.value.split('-');
                                setSortBy(newSortBy);
                                setSortOrder(newSortOrder);
                            }}
                            className="filter-select"
                        >
                            <option value="date-desc">Date (Newest First)</option>
                            <option value="date-asc">Date (Oldest First)</option>
                            <option value="amount-desc">Amount (Highest First)</option>
                            <option value="amount-asc">Amount (Lowest First)</option>
                        </select>
                    </div>
                </section>

                {/* Add Transaction Modal */}
                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Type:</label>
                                    <select name="type" value={newTransaction.type} onChange={handleInputChange}>
                                        <option value="">Select</option>
                                        <option value="expense">Expense</option>
                                        <option value="income">Income</option>
                                    </select>
                                </div>

                                {newTransaction.type && (
                                    <div className="form-group">
                                        <label>Category:</label>
                                        <select name="category" value={newTransaction.category || ''} onChange={handleInputChange}>
                                            {newTransaction.type === 'expense' ? (
                                                <>
                                                    <option value="">Select</option>
                                                    <option value="Food">Food</option>
                                                    <option value="Utilities">Utilities</option>
                                                    <option value="Transportation">Transportation</option>
                                                    <option value="Entertainment">Entertainment</option>
                                                    <option value="Other">Other</option>
                                                </>
                                            ) : (
                                                <>
                                                    <option value="">Select</option>
                                                    <option value="Salary">Salary</option>
                                                    <option value="Freelance">Freelance</option>
                                                    <option value="Investments">Investments</option>
                                                    <option value="Gifts">Gifts</option>
                                                    <option value="Other">Other</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                )}


                                <div className="form-group">
                                    <label>Amount:</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={newTransaction.amount}
                                        onChange={handleInputChange}
                                        required
                                        step="0.01"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Description:</label>
                                    <input
                                        type="text"
                                        name="description"
                                        value={newTransaction.description}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Date:</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={newTransaction.date}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Comment (optional):</label>
                                    <textarea
                                        name="comment"
                                        value={newTransaction.comment}
                                        onChange={handleInputChange}
                                        rows="3"
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button type="submit" className="submit-btn">
                                        {editingTransaction ? 'Update' : 'Add'} Transaction
                                    </button>
                                    <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Transactions Table */}
                <section className="transactions-table-container">
                    <table className="transactions-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="empty-state">
                                        <div className="empty-state-content">
                                            <p>No transactions found</p>
                                            <p className="empty-state-suggestion">
                                                Add an income first (recommended) 💰
                                            </p>
                                            <button
                                                className="add-transaction-btn"
                                                onClick={handleAddTransaction}
                                            >
                                                + Add Transaction
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map(transaction => (
                                    <tr key={transaction.id}>
                                        <td>{transaction.date}</td>
                                        <td>{transaction.description}</td>
                                        <td>{transaction.category}</td>
                                        <td className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                                            {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                                        </td>
                                        <td>
                                            <button
                                                className="action-btn edit"
                                                onClick={() => handleEdit(transaction)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                onClick={() => handleDelete(transaction.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </section>
            </main>
        </div>
    );
};

export default Transactions;