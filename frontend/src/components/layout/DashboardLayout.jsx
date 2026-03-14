import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    FiHome, FiDroplet, FiStar, FiUsers, FiShoppingBag,
    FiTrendingUp, FiBarChart2, FiBriefcase, FiLogOut,
    FiMenu, FiX, FiUser
} from 'react-icons/fi'
import { GiFarmer } from 'react-icons/gi'
import LanguageSwitcher from '../LanguageSwitcher'

export default function DashboardLayout() {
    const { farmer, logout } = useAuth()
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const navItems = [
        { to: '/dashboard',     icon: FiHome,       label: t('nav.dashboard') },
        { to: '/experts',       icon: FiUsers,      label: t('nav.expertConsult') },
        { to: '/soil-test',     icon: FiDroplet,    label: t('nav.soilTesting') },
        { to: '/analytics',     icon: FiBarChart2,  label: t('nav.analytics') },
        { to: '/marketplace',   icon: FiShoppingBag,label: t('nav.krishiBhandhu') },
        { to: '/crop-selling',  icon: FiTrendingUp, label: t('nav.krishiVikretha') },
        { to: '/crop-recommend',icon: FiStar,       label: t('nav.aiCropAdvisor') },
        { to: '/companies',     icon: FiBriefcase,  label: t('nav.companyTieUps') },
    ]

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="px-6 py-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 gradient-green rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">🌾</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 font-display">FarmWise</h1>
                        <p className="text-xs text-gray-400">Smart Agriculture</p>
                    </div>
                </div>
            </div>

            {/* Farmer info */}
            <div className="px-4 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3 bg-primary-50 rounded-xl px-3 py-3">
                    <div className="w-10 h-10 bg-primary-200 rounded-full flex items-center justify-center">
                        <FiUser className="text-primary-700 w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{farmer?.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{farmer?.district}, {farmer?.state}</p>
                    </div>
                </div>
            </div>

            {/* Nav items */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                            isActive ? 'nav-link-active' : 'nav-link'
                        }
                    >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Language switcher in sidebar */}
            <div className="px-4 py-3 border-t border-gray-100">
                <div className="flex justify-center">
                    <LanguageSwitcher />
                </div>
            </div>

            {/* Logout */}
            <div className="px-4 py-4 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className="nav-link w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                    <FiLogOut className="w-5 h-5" />
                    <span>{t('nav.logout')}</span>
                </button>
            </div>
        </div>
    )

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 flex-shrink-0">
                <SidebarContent />
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                    <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl z-50">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar (mobile) */}
                <header className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
                            <FiMenu className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🌾</span>
                            <span className="font-bold text-gray-900 font-display">FarmWise</span>
                        </div>
                    </div>
                    {/* Language switcher visible on mobile top bar */}
                    <LanguageSwitcher />
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
