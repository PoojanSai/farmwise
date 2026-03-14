import { useState, useEffect } from 'react'
import { cropsAPI } from '../api/services'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function CropSellingPage() {
    const { farmer } = useAuth()
    const [listings, setListings] = useState([])
    const [myListings, setMyListings] = useState([])
    const [tab, setTab] = useState('browse')
    const [showForm, setShowForm] = useState(false)
    const [showInterest, setShowInterest] = useState(null)
    const [loading, setLoading] = useState(false)

    const [form, setForm] = useState({
        crop_name: '', variety: '', quantity_kg: '', price_per_kg: '',
        quality_grade: 'A', harvest_date: '', available_from: '',
        location: farmer?.district ? `${farmer.district}, ${farmer.state}` : '',
        description: '',
    })
    const [interest, setInterest] = useState({ buyer_name: '', buyer_email: '', buyer_phone: '', quantity_needed_kg: '', offered_price: '', message: '' })

    useEffect(() => {
        cropsAPI.getListings().then(r => setListings(r.data || [])).catch(() => { })
        cropsAPI.myListings().then(r => setMyListings(r.data || [])).catch(() => { })
    }, [])

    const submitListing = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await cropsAPI.addListing({ ...form, quantity_kg: parseFloat(form.quantity_kg), price_per_kg: parseFloat(form.price_per_kg) })
            setMyListings(prev => [res.data, ...prev])
            setShowForm(false)
            toast.success('🌾 Crop listed successfully!')
        } catch { toast.error('Failed to list crop.') }
        finally { setLoading(false) }
    }

    const submitInterest = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await cropsAPI.addBuyerInterest({ listing: showInterest.id, ...interest, quantity_needed_kg: parseFloat(interest.quantity_needed_kg) })
            setShowInterest(null)
            toast.success('✅ Interest sent to farmer!')
        } catch { toast.error('Failed to send interest.') }
        finally { setLoading(false) }
    }

    const statusBadge = { available: 'badge-green', partial: 'badge-yellow', sold: 'badge-red' }

    return (
        <div className="animate-fade-in">
            <div className="page-header flex-row flex justify-between items-start">
                <div>
                    <h1 className="page-title">📦 Krishi Vikretha</h1>
                    <p className="page-subtitle">List your harvest and connect with verified buyers</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn-primary flex-shrink-0">+ List My Crop</button>
            </div>

            <div className="flex gap-2 mb-6 border-b border-gray-200">
                {[['browse', '🔍 Browse Listings'], ['my', `📋 My Listings (${myListings.length})`]].map(([key, label]) => (
                    <button key={key} onClick={() => setTab(key)}
                        className={`px-5 py-2.5 font-semibold text-sm rounded-t-xl transition-colors ${tab === key ? 'bg-white border border-b-white border-gray-200 text-primary-600 -mb-px' : 'text-gray-500 hover:text-gray-700'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {tab === 'browse' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {listings.map(listing => (
                        <div key={listing.id} className="card-hover flex flex-col">
                            <div className="h-28 bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl flex items-center justify-center text-5xl mb-4">
                                🌾
                            </div>
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{listing.crop_name}</h3>
                                    {listing.variety && <p className="text-sm text-gray-500">{listing.variety}</p>}
                                </div>
                                <span className={`badge ${statusBadge[listing.status] || 'badge-green'}`}>{listing.status}</span>
                            </div>

                            <div className="space-y-2 text-sm mb-4 flex-1">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Quantity</span>
                                    <strong className="text-gray-900">{listing.quantity_kg.toLocaleString()} kg</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Price</span>
                                    <strong className="text-primary-600">₹{listing.price_per_kg}/kg</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Grade</span>
                                    <strong className="text-gray-900">{listing.quality_grade}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Location</span>
                                    <strong className="text-gray-900">{listing.location}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Available from</span>
                                    <strong className="text-gray-900">{listing.available_from}</strong>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p className="text-xs text-gray-400">Farmer</p>
                                        <p className="text-sm font-semibold text-gray-800">{listing.farmer_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400">Total Value</p>
                                        <p className="text-sm font-bold text-primary-700">₹{(listing.quantity_kg * listing.price_per_kg).toLocaleString()}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowInterest(listing)} className="btn-primary w-full text-sm py-2.5">
                                    📩 Express Interest
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'my' && (
                <div className="space-y-4">
                    {myListings.length > 0 ? myListings.map(listing => (
                        <div key={listing.id} className="card flex flex-col sm:flex-row gap-4 items-start">
                            <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">🌾</div>
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h3 className="font-bold text-gray-900 text-lg">{listing.crop_name} {listing.variety && `(${listing.variety})`}</h3>
                                    <span className={`badge ${statusBadge[listing.status] || 'badge-green'}`}>{listing.status}</span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm">
                                    <span className="text-gray-600">📦 <strong>{listing.quantity_kg} kg</strong></span>
                                    <span className="text-gray-600">💰 <strong>₹{listing.price_per_kg}/kg</strong></span>
                                    <span className="text-gray-600">🏆 Grade <strong>{listing.quality_grade}</strong></span>
                                    <span className="text-gray-600">📍 <strong>{listing.location}</strong></span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400">Interests</p>
                                <p className="text-xl font-bold text-primary-600">{listing.interests_count || 0}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="card text-center py-16">
                            <div className="text-5xl mb-3">📦</div>
                            <p className="text-gray-500 mb-4">You haven't listed any crops yet</p>
                            <button onClick={() => setShowForm(true)} className="btn-primary">List My Crop</button>
                        </div>
                    )}
                </div>
            )}

            {/* List Crop Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up p-6 my-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-5">🌾 List Your Crop</h2>
                        <form onSubmit={submitListing} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="label">Crop Name *</label>
                                    <input className="input" value={form.crop_name} onChange={e => setForm(p => ({ ...p, crop_name: e.target.value }))} placeholder="Rice, Wheat..." required />
                                </div>
                                <div>
                                    <label className="label">Variety</label>
                                    <input className="input" value={form.variety} onChange={e => setForm(p => ({ ...p, variety: e.target.value }))} placeholder="e.g. IR64" />
                                </div>
                                <div>
                                    <label className="label">Quantity (kg) *</label>
                                    <input type="number" className="input" value={form.quantity_kg} onChange={e => setForm(p => ({ ...p, quantity_kg: e.target.value }))} required min="1" />
                                </div>
                                <div>
                                    <label className="label">Price per kg (₹) *</label>
                                    <input type="number" step="0.01" className="input" value={form.price_per_kg} onChange={e => setForm(p => ({ ...p, price_per_kg: e.target.value }))} required min="0" />
                                </div>
                                <div>
                                    <label className="label">Quality Grade</label>
                                    <select className="input" value={form.quality_grade} onChange={e => setForm(p => ({ ...p, quality_grade: e.target.value }))}>
                                        {['A+', 'A', 'B', 'C'].map(g => <option key={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Location</label>
                                    <input className="input" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="District, State" />
                                </div>
                                <div>
                                    <label className="label">Harvest Date *</label>
                                    <input type="date" className="input" value={form.harvest_date} onChange={e => setForm(p => ({ ...p, harvest_date: e.target.value }))} required />
                                </div>
                                <div>
                                    <label className="label">Available From *</label>
                                    <input type="date" className="input" value={form.available_from} onChange={e => setForm(p => ({ ...p, available_from: e.target.value }))} required />
                                </div>
                            </div>
                            <div>
                                <label className="label">Description</label>
                                <textarea className="input resize-none" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Quality details, storage info..." />
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                                <button type="submit" disabled={loading} className="btn-primary flex-1">
                                    {loading ? 'Listing...' : '📦 List for Sale'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Buyer Interest Modal */}
            {showInterest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowInterest(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Express Purchase Interest</h2>
                        <p className="text-gray-500 text-sm mb-5">{showInterest.crop_name} from {showInterest.farmer_name}</p>
                        <form onSubmit={submitInterest} className="space-y-3">
                            {[
                                { key: 'buyer_name', label: 'Your Name', placeholder: 'Full name', type: 'text' },
                                { key: 'buyer_email', label: 'Email', placeholder: 'email@example.com', type: 'email' },
                                { key: 'buyer_phone', label: 'Phone', placeholder: '9876543210', type: 'text' },
                                { key: 'quantity_needed_kg', label: 'Quantity Needed (kg)', placeholder: '500', type: 'number' },
                                { key: 'offered_price', label: 'Offered Price per kg (₹)', placeholder: `Farmer asks ₹${showInterest.price_per_kg}`, type: 'number' },
                            ].map(({ key, label, placeholder, type }) => (
                                <div key={key}>
                                    <label className="label">{label}</label>
                                    <input type={type} className="input" value={interest[key]} onChange={e => setInterest(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} required={key !== 'offered_price'} />
                                </div>
                            ))}
                            <div>
                                <label className="label">Message</label>
                                <textarea className="input resize-none" rows={2} value={interest.message} onChange={e => setInterest(p => ({ ...p, message: e.target.value }))} placeholder="Any specific requirements..." />
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={() => setShowInterest(null)} className="btn-secondary flex-1">Cancel</button>
                                <button type="submit" disabled={loading} className="btn-primary flex-1">
                                    {loading ? 'Sending...' : '📩 Send Interest'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
