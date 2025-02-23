import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Maintenance.css';
import jsPDF from 'jspdf';
import './Reports.css';

const Reports = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const email = localStorage.getItem('email');
            const response = await fetch(`https://wealth-vault-backend.onrender.com/api/transactions?email=${email}`);
            const data = await response.json();
            console.log("Fetched data:", data); // Debug log
            if (Array.isArray(data) && data.length > 0) {
                setTransactions(data);
            } else {
                setTransactions([]);
                console.error('No transactions found');
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setTransactions([]);
        }
    };

    const generateMonthlyReport = () => {
        if (!transactions || transactions.length === 0) {
            alert('No transactions available to generate report');
            return;
        }

        setLoading(true);
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;

            // Header Background
            doc.setFillColor(0, 102, 204); // Blue color
            doc.rect(0, 0, pageWidth, 30, 'F');

            // App Name (White text on blue background)
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.text('Wealth Vault', pageWidth / 2 - 30, 20);

            // Reset Text Color
            doc.setTextColor(0, 0, 0);

            // Title
            doc.setFontSize(20);
            doc.text('Monthly Transaction Report', 20, 45);

            // Date
            doc.setFontSize(12);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 55);

            // Column positions
            const columns = {
                date: 22,
                desc: 60,
                amount: 100,
                type: 130,
                category: 160
            };

            // Column Headers with Gray Background
            doc.setFillColor(200, 200, 200);
            doc.rect(20, 65, pageWidth - 40, 8, 'F');

            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text('Date', columns.date, 70);
            doc.text('Description', columns.desc, 70);
            doc.text('Amount', columns.amount, 70);
            doc.text('Type', columns.type, 70);
            doc.text('Category', columns.category, 70);

            let yPosition = 78; // Start position for transactions
            let rowColor = true; // Alternate row color

            transactions.forEach((transaction) => {
                if (yPosition > pageHeight - 30) {
                    doc.addPage();
                    yPosition = 20;

                    // Re-add headers
                    doc.setFillColor(200, 200, 200);
                    doc.rect(20, yPosition, pageWidth - 40, 8, 'F');
                    doc.setTextColor(0, 0, 0);
                    doc.text('Date', columns.date, yPosition + 5);
                    doc.text('Description', columns.desc, yPosition + 5);
                    doc.text('Amount', columns.amount, yPosition + 5);
                    doc.text('Type', columns.type, yPosition + 5);
                    doc.text('Category', columns.category, yPosition + 5);
                    yPosition += 10;
                }

                // Alternate row background color
                if (rowColor) {
                    doc.setFillColor(240, 240, 240);
                    doc.rect(20, yPosition - 4, pageWidth - 40, 8, 'F');
                }
                rowColor = !rowColor;

                // Format and add transaction data
                const formattedDate = transaction.date ? new Date(transaction.date).toLocaleDateString() : 'N/A';
                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);

                doc.text(formattedDate, columns.date, yPosition);
                doc.text(transaction.description?.substring(0, 25) || 'N/A', columns.desc, yPosition);
                doc.text(`$${(transaction.amount || 0).toFixed(2)}`, columns.amount, yPosition);
                doc.text(transaction.type || 'N/A', columns.type, yPosition);
                doc.text(transaction.category || 'N/A', columns.category, yPosition);

                yPosition += 10;
            });

            // Summary Section
            if (yPosition > pageHeight - 50) {
                doc.addPage();
                yPosition = 15;
            }

            doc.setFillColor(238, 238, 238);
            doc.rect(20, yPosition, pageWidth - 40, 45, 'F');
            doc.setFillColor(0, 102, 204);
            doc.rect(20, yPosition, pageWidth - 40, 15, 'F');

            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text('Summary', 25, yPosition + 10);

            const totalIncome = transactions
                .filter(t => t.type.toLowerCase() === 'income')
                .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

            const totalExpenses = transactions
                .filter(t => t.type.toLowerCase() === 'expense')
                .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

            doc.text(`Total Income: $${totalIncome.toFixed(2)}`, 25, yPosition + 20);
            doc.text(`Total Expenses: $${totalExpenses.toFixed(2)}`, 25, yPosition + 30);
            doc.text(`Net Balance: $${(totalIncome - totalExpenses).toFixed(2)}`, 25, yPosition + 40);

            // Footer - Page Numbers
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(10);
                doc.text(`Page ${i} of ${pageCount}`, pageWidth - 40, pageHeight - 10);
            }

            // Save the PDF
            doc.save('Monthly-Transactions-Report.pdf');
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF report');
        } finally {
            setLoading(false);
        }
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
                        <Link to="/" className="logout-btn" onClick={() => {
                            localStorage.clear();
                            navigate('/');
                        }}>
                            <li>Logout</li>
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="reports-container">
                    <h1>Financial Reports</h1>
                    <div className="reports-content">
                        <div className="report-card">
                            <h2>Monthly Transaction Report</h2>
                            <p>Generate a detailed report of your transactions organized by month.</p>
                            <button
                                className="generate-report-btn"
                                onClick={generateMonthlyReport}
                                disabled={loading}
                            >
                                {loading ? 'Generating...' : 'Generate Report'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Reports;
