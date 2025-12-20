import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import TournamentList from './components/TournamentList';
import Leaderboard from './components/Leaderboard';
import AdminDashboard from './components/AdminDashboard';
import CreateTournament from './components/CreateTournament';
import Login from './components/Login';
import Signup from './components/Signup';

import NotFound from './components/NotFound';

// Basic wrapper to allow using Router hooks in Navigation
import AddTeam from './components/AddTeam';
import CreateMatch from './components/CreateMatch';
import SubmitScore from './components/SubmitScore';

function AppContent() {
  return (
    <div className="min-h-screen bg-gaming-900 text-white font-sans selection:bg-gaming-accent selection:text-gaming-900">
      <Navbar />
      <main className="p-8 container mx-auto max-w-7xl animate-fade-in relative z-0">
        <Routes>
          <Route path="/" element={<TournamentList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/tournament/:id" element={<Leaderboard />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/dashboard/create" element={<CreateTournament />} />
          <Route path="/dashboard/add-team" element={<AddTeam />} />
          <Route path="/dashboard/create-match" element={<CreateMatch />} />
          <Route path="/dashboard/submit-score" element={<SubmitScore />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
