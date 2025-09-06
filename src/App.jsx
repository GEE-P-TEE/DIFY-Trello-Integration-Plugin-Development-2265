import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { TrelloProvider } from './contexts/TrelloContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CreateCard from './pages/CreateCard';
import Settings from './pages/Settings';
import History from './pages/History';
import './App.css';

function App() {
  return (
    <TrelloProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/create" element={<CreateCard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </Layout>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </TrelloProvider>
  );
}

export default App;