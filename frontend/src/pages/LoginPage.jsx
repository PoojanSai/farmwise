import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import toast from 'react-hot-toast'
import LanguageSwitcher from '../components/LanguageSwitcher'

export default function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const { t } = useTranslation()
    const [form, setForm] = useState({ email: '', password: '' })
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await login(form.email, form.password)
            navigate('/dashboard')
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Invalid email or password')
        } finally {
            setLoading(false)
        }
    }

    const fillDemo = () => setForm({ email: 'farmer@farmwise.com', password: 'farmwise123' })

    return (
        <div className="min-h-screen flex">
            {/* Left – decorative */}
            <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-10 w-48 h-48 bg-white rounded-full blur-3xl" />
                </div>
                <div className="text-center text-white relative z-10 px-12">
                    <div className="text-8xl mb-6">🌾</div>
                    <h2 className="text-4xl font-bold font-display mb-4">Welcome Back,<br />Farmer!</h2>
                    <p className="text-white/70 text-lg">Your fields, your data, your decisions — all powered by FarmWise AI.</p>
                    <div className="mt-10 space-y-3">
                        {['🧪 Latest Soil Reports', '🤖 AI Crop Recommendations', '💰 Market Prices Today'].map(item => (
                            <div key={item} className="glass text-left px-5 py-3 rounded-xl text-white/90 text-sm">{item}</div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right – form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white relative">
                {/* Language switcher top-right */}
                <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                    <LanguageSwitcher />
                </div>
                <div className="w-full max-w-md animate-fade-in">
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 mb-6">
                            <span className="text-3xl">🌾</span>
                            <span className="text-2xl font-bold font-display text-gray-900">FarmWise</span>
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
                        <p className="text-gray-500">Access your personalized farming dashboard</p>
                    </div>

                    {/* Demo fill button */}
                    <button onClick={fillDemo} className="w-full mb-6 py-3 px-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm font-medium hover:bg-amber-100 transition-colors flex items-center gap-2 justify-center">
                        👨‍🌾 Use Demo Account (farmer@farmwise.com / farmwise123)
                    </button>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="label">Email Address</label>
                            <div className="relative">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                    className="input pl-11"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="label">Password</label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    className="input pl-11 pr-11"
                                    placeholder="Enter password"
                                    required
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    {showPw ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base mt-2">
                            {loading ? 'Signing in...' : 'Sign In to FarmWise'}
                        </button>
                    </form>

                    <p className="text-center text-gray-500 mt-6 text-sm">
                        New farmer?{' '}
                        <Link to="/register" className="text-primary-600 font-semibold hover:underline">{t('register')}</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
