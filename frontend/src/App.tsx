import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { OpenBriefsPage } from './pages/OpenBriefsPage';
import { OrganizationsDirectoryPage } from './pages/OrganizationsDirectoryPage';
import { OrganizationDetailPage } from './pages/OrganizationDetailPage';
import { MessagesPage } from './pages/MessagesPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';

// Dedicated Auth & Dashboard Pages
import { CreatorLoginPage } from './pages/CreatorLoginPage';
import { CreatorRegisterPage } from './pages/CreatorRegisterPage';
import { CreatorDashboardPage } from './pages/CreatorDashboardPage';
import { OrganizationLoginPage } from './pages/OrganizationLoginPage';
import { OrganizationRegisterPage } from './pages/OrganizationRegisterPage';
import { OrganizationDashboardPage } from './pages/OrganizationDashboardPage';

// Protected Route Guard
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingModal } from './components/auth/OnboardingModal';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-[#F8F9FA] text-slate-900 font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Exploration & Directory Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/briefs" element={<OpenBriefsPage />} />
              <Route path="/organizations" element={<OrganizationsDirectoryPage />} />
              <Route path="/organizations/:id" element={<OrganizationDetailPage />} />
              <Route path="/creators/:id" element={<CreatorProfilePage />} />

              {/* Dedicated Authentication Experiences */}
              <Route path="/creator/login" element={<CreatorLoginPage />} />
              <Route path="/creator/register" element={<CreatorRegisterPage />} />
              <Route path="/organization/login" element={<OrganizationLoginPage />} />
              <Route path="/organization/register" element={<OrganizationRegisterPage />} />

              {/* Protected Creator Routes */}
              <Route
                path="/creator/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['creator']}>
                    <CreatorDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/studio"
                element={
                  <ProtectedRoute allowedRoles={['creator']}>
                    <CreatorStudioPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/creator/studio"
                element={
                  <ProtectedRoute allowedRoles={['creator']}>
                    <CreatorStudioPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/creator-studio"
                element={
                  <ProtectedRoute allowedRoles={['creator']}>
                    <CreatorStudioPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/opportunities"
                element={
                  <ProtectedRoute allowedRoles={['creator']}>
                    <OpportunitiesPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Organization / Brand Routes */}
              <Route
                path="/organization/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['brand']}>
                    <OrganizationDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/brand-hub"
                element={
                  <ProtectedRoute allowedRoles={['brand']}>
                    <OrganizationDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/brand-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['brand']}>
                    <OrganizationDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/brief-builder"
                element={
                  <ProtectedRoute allowedRoles={['brand']}>
                    <BriefBuilderPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/matches"
                element={
                  <ProtectedRoute allowedRoles={['brand']}>
                    <MatchResultsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shortlist"
                element={
                  <ProtectedRoute allowedRoles={['brand']}>
                    <ShortlistPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Shared Authenticated Routes */}
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <MessagesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/engagements"
                element={
                  <ProtectedRoute>
                    <EngagementDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/engagements/:id"
                element={
                  <ProtectedRoute>
                    <EngagementDetailPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <AuthModal />
          <OnboardingModal />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
