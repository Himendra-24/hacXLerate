import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { BriefBuilderPage } from './pages/BriefBuilderPage';
import { MatchResultsPage } from './pages/MatchResultsPage';
import { CreatorProfilePage } from './pages/CreatorProfilePage';
import { CreatorStudioPage } from './pages/CreatorStudioPage';
import { ShortlistPage } from './pages/ShortlistPage';
import { EngagementDetailPage } from './pages/EngagementDetailPage';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-charcoal-950 text-slate-100 font-sans">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/brief-builder" element={<BriefBuilderPage />} />
            <Route path="/matches" element={<MatchResultsPage />} />
            <Route path="/creators/:id" element={<CreatorProfilePage />} />
            <Route path="/studio" element={<CreatorStudioPage />} />
            <Route path="/shortlist" element={<ShortlistPage />} />
            <Route path="/engagements" element={<EngagementDetailPage />} />
            <Route path="/engagements/:id" element={<EngagementDetailPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
