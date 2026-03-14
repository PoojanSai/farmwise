import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const soilTypes = ['loamy', 'clay', 'sandy', 'silty', 'peaty', 'chalky']

export default function RegisterPage() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1)
    const [form, setForm] = useState({
        email: '', password: '', confirm_password: '',
        full_name: '', phone: '', village: '', district: '', state: '',
        land_size_acres: '', soil_type: 'loamy', crops_grown: '',
    })

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (form.password !== form.confirm_password) {
            toast.error('Passwords do not match')
            return
        }
        setLoading(true)
        try {
            await register({ ...form, land_size_acres: parseFloat(form.land_size_acres) || 0 })
            navigate('/login')
        } catch (err) {
            const errors = err.response?.data
            if (errors) {
                Object.entries(errors).forEach(([k, v]) => toast.error(`${k}: ${v}`))
            } else {
                toast.error('Registration failed. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-green-100 py-12 px-4">
            <div className="w-full max-w-xl animate-fade-in">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-4">
                        <span className="text-3xl">🌾</span>
                        <span className="text-2xl font-bold font-display text-gray-900">FarmWise</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Farmer Account</h1>
                    <p className="text-gray-500">Free forever. No credit card needed.</p>
                </div>

                {/* Step indicator */}
                <div className="flex gap-2 mb-6">
                    {[1, 2].map(s => (
                        <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step >= s ? 'bg-primary-600' : 'bg-gray-200'}`} />
                    ))}
                </div>

                <div className="card shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {step === 1 && (
                            <div className="space-y-4 animate-fade-in">
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">👤 Personal Information</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="label">Full Name *</label>
                                        <input className="input" placeholder="Ramu Reddy" value={form.full_name} onChange={e => set('full_name', e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="label">Email *</label>
                                        <input className="input" type="email" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="label">Phone Number</label>
                                        <input className="input" placeholder="9876543210" value={form.phone} onChange={e => set('phone', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="label">Password *</label>
                                        <input className="input" type="password" placeholder="min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
                                    </div>
                                    <div>
                                        <label className="label">Confirm Password *</label>
                                        <input className="input" type="password" placeholder="repeat password" value={form.confirm_password} onChange={e => set('confirm_password', e.target.value)} required />
                                    </div>
                                </div>
                                <button type="button" onClick={() => setStep(2)} className="btn-primary w-full mt-2">
                                    Next: Farm Details →
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4 animate-fade-in">
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">🌾 Farm Details</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Village / Town</label>
                                        <input className="input" placeholder="Your village name" value={form.village} onChange={e => set('village', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="label">District</label>
                                        <input className="input" placeholder="District name" value={form.district} onChange={e => set('district', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="label">State</label>
                                        <input className="input" placeholder="State name" value={form.state} onChange={e => set('state', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="label">Total Land (Acres)</label>
                                        <input className="input" type="number" step="0.1" min="0" placeholder="e.g. 5.5" value={form.land_size_acres} onChange={e => set('land_size_acres', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="label">Primary Soil Type</label>
                                        <select className="input" value={form.soil_type} onChange={e => set('soil_type', e.target.value)}>
                                            {soilTypes.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">Crops Previously Grown</label>
                                        <input className="input" placeholder="Rice, Wheat, Maize" value={form.crops_grown} onChange={e => set('crops_grown', e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
                                    <button type="submit" disabled={loading} className="btn-primary flex-1">
                                        {loading ? 'Creating account...' : '🌾 Create My Account'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                <p className="text-center text-gray-500 mt-6 text-sm">
                    Already registered?{' '}
                    <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in here</Link>
                </p>
            </div>
        </div>
    )
}
