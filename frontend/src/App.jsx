import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import SoilTestPage from './pages/SoilTestPage'
import CropRecommendPage from './pages/CropRecommendPage'
import ExpertPage from './pages/ExpertPage'
import MarketplacePage from './pages/MarketplacePage'
import CropSellingPage from './pages/CropSellingPage'
import AnalyticsPage from './pages/AnalyticsPage'
import CompaniesPage from './pages/CompaniesPage'

// Layout
import DashboardLayout from './components/layout/DashboardLayout'

function ProtectedRoute({ children }) {
    const { farmer, loading } = useAuth()
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Loading FarmWise...</p>
            </div>
        </div>
    )
    return farmer ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
    const { farmer } = useAuth()
    return farmer ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: { fontSize: '14px', fontFamily: 'Inter, sans-serif', borderRadius: '12px' },
                        success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
                    }}
                />
                <Routes>
                    {/* Public */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

                    {/* Protected */}
                    <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="soil-test" element={<SoilTestPage />} />
                        <Route path="crop-recommend" element={<CropRecommendPage />} />
                        <Route path="experts" element={<ExpertPage />} />
                        <Route path="marketplace" element={<MarketplacePage />} />
                        <Route path="crop-selling" element={<CropSellingPage />} />
                        <Route path="analytics" element={<AnalyticsPage />} />
                        <Route path="companies" element={<CompaniesPage />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    )
}
