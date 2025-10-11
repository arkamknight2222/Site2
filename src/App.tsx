import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import JobFinder from './pages/JobFinder';
import Events from './pages/Events';
import JobDetails from './pages/JobDetails';
import EventDetails from './pages/EventDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tracker from './pages/Tracker';
import Profile from './pages/Profile';
import Hire from './pages/Hire';
import JobApplicants from './pages/JobApplicants';
import Suggestions from './pages/Suggestions';
import Support from './pages/Support';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import PointsHistory from './pages/PointsHistory';
import Resume from './pages/Resume';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JobProvider } from './context/JobContext';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<JobFinder />} />
          <Route path="/events" element={<Events />} />
          <Route path="/job/:id" element={<JobDetails />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/tracker" element={user ? <Tracker /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/hire" element={user ? <Hire /> : <Navigate to="/login" />} />
          <Route path="/hire/job/:jobId/applicants" element={user ? <JobApplicants /> : <Navigate to="/login" />} />
          <Route path="/suggestions" element={user ? <Suggestions /> : <Navigate to="/login" />} />
          <Route path="/support" element={<Support />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/points-history" element={user ? <PointsHistory /> : <Navigate to="/login" />} />
          <Route path="/resume" element={user ? <Resume /> : <Navigate to="/login" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <JobProvider>
          <AppContent />
        </JobProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;