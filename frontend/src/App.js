import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './App.css';
import Login from "./components/Login";
import Home from "./components/Home";
import TermsPrivacy from "./components/TermsPrivacy";
import OtpVerification from "./components/OtpVerification";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Transactions from "./components/Transactions";
import Settings from "./components/Settings";
import Budget from "./components/Budget";
import Reports from "./components/Reports";
import Goals from "./components/Goals";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Login />} />
        <Route
          path="/terms-and-conditions"
          element={
            <TermsPrivacy />
          }
        />
        <Route
          path="/privacy-policy"
          element={
            <TermsPrivacy />
          }
        />
        <Route
          path="/otp-verification"
          element={
            <OtpVerification />
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <Goals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/budget"
          element={
            <ProtectedRoute>
              <Budget />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;