import { useState, useEffect } from 'react'
import { companiesAPI } from '../api/services'
import toast from 'react-hot-toast'

const CAT_ICONS = { food_processing: '🏭', logistics: '🚛', corporate_buyer: '🏢', export: '✈️', retail: '🏪' }
const CAT_OPTIONS = [
    { value: 'food_processing', label: '🏭 Food Processing' },
    { value: 'logistics', label: '🚛 Logistics Partner' },
    { value: 'corporate_buyer', label: '🏢 Corporate Buyer' },
    { value: 'export', label: '✈️ Export Company' },
    { value: 'retail', label: '🏪 Retail Chain' },
]

export default function CompaniesPage() {
    const [companies, setCompanies] = useState([])
    const [interests, setInterests] = useState([])
    const [filter, setFilter] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [tab, setTab] = useState('buyers')

    const [form, setForm] = useState({
        name: '', category: 'food_processing', contact_person: '', email: '',
        phone: '', website: '', address: '', description: '',
        crops_interested: '', monthly_requirement_tonnes: '',
    })

    useEffect(() => {
        const params = filter ? { category: filter } : {}
        companiesAPI.getCompanies(params).then(r => setCompanies(r.data || [])).catch(() => { })
        companiesAPI.getInterests().then(r => setInterests(r.data || [])).catch(() => { })
    }, [filter])

    const handleRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await companiesAPI.registerCompany({
                ...form,
                monthly_requirement_tonnes: parseFloat(form.monthly_requirement_tonnes) || 0
            })
            setCompanies(prev => [res.data, ...prev])
            setShowForm(false)
            toast.success('🏢 Company registered! Pending review.')
        } catch (err) {
            const errs = err.response?.data
            if (errs) Object.entries(errs).forEach(([k, v]) => toast.error(`${k}: ${v}`))
        } finally { setLoading(false) }
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="page-title">🤝 Company Tie-Ups</h1>
                        <p className="page-subtitle">Connect with food companies, logistics partners, and corporate buyers</p>
                    </div>
                    <button onClick={() => setShowForm(true)} className="btn-primary flex-shrink-0">+ Register Company</button>
                </div>
            </div>

            <div className="flex gap-2 mb-6 border-b border-gray-200">
                {[['buyers', '🏢 Company Buyers'], ['interests', '📋 Purchase Interests']].map(([key, label]) => (
                    <button key={key} onClick={() => setTab(key)}
                        className={`px-5 py-2.5 font-semibold text-sm rounded-t-xl transition-colors ${tab === key ? 'bg-white border border-b-white border-gray-200 text-primary-600 -mb-px' : 'text-gray-500 hover:text-gray-700'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {tab === 'buyers' && (
                <>
                    {/* Category filter */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        <button onClick={() => setFilter('')} className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${!filter ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}>All Categories</button>
                        {CAT_OPTIONS.map(opt => (
                            <button key={opt.value} onClick={() => setFilter(opt.value)} className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${filter === opt.value ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}>{opt.label}</button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {companies.map(company => (
                            <div key={company.id} className="card-hover">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                                        {CAT_ICONS[company.category] || '🏢'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-bold text-gray-900">{company.name}</h3>
                                            <span className={`badge ${company.status === 'approved' ? 'badge-green' : 'badge-yellow'}`}>{company.status}</span>
                                        </div>
                                        <p className="text-sm text-primary-600 font-medium">{company.category_display}</p>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{company.description}</p>

                                <div className="space-y-2 text-sm mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Contact Person</span>
                                        <strong className="text-gray-900">{company.contact_person}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Crops Interested</span>
                                        <strong className="text-gray-900 text-right max-w-[60%]">{company.crops_interested}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Monthly Requirement</span>
                                        <strong className="text-primary-600">{company.monthly_requirement_tonnes} tonnes</strong>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-3 border-t border-gray-100">
                                    <a href={`mailto:${company.email}`} className="btn-primary flex-1 text-center text-sm py-2.5">📧 Contact</a>
                                    {company.website && (
                                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="btn-secondary flex-1 text-center text-sm py-2.5">🌐 Website</a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {tab === 'interests' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {interests.map(int => (
                        <div key={int.id} className="card-hover border-l-4 border-primary-500">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-2xl">📋</span>
                                <div>
                                    <h3 className="font-bold text-gray-900">{int.company_name}</h3>
                                    <p className="text-xs text-gray-400">Purchase Requirement</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Crop</span>
                                    <strong className="text-gray-900 capitalize">{int.crop_name}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Quantity Needed</span>
                                    <strong className="text-primary-600">{int.quantity_tonnes} tonnes</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Offered Price</span>
                                    <strong className="text-gray-900">₹{Number(int.price_per_tonne).toLocaleString()}/tonne</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Deliver by</span>
                                    <strong className="text-gray-900">{int.delivery_by}</strong>
                                </div>
                            </div>
                        </div>
                    ))}
                    {interests.length === 0 && (
                        <div className="col-span-full card text-center py-16">
                            <p className="text-gray-400">No active purchase interests</p>
                        </div>
                    )}
                </div>
            )}

            {/* Company Registration Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up p-6 my-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-5">🏢 Register Company</h2>
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="label">Company Name *</label>
                                    <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                                </div>
                                <div>
                                    <label className="label">Category *</label>
                                    <select className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                                        {CAT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Contact Person *</label>
                                    <input className="input" value={form.contact_person} onChange={e => setForm(p => ({ ...p, contact_person: e.target.value }))} required />
                                </div>
                                <div>
                                    <label className="label">Email *</label>
                                    <input type="email" className="input" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
                                </div>
                                <div>
                                    <label className="label">Phone *</label>
                                    <input className="input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required />
                                </div>
                                <div className="col-span-2">
                                    <label className="label">Address *</label>
                                    <input className="input" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} required />
                                </div>
                                <div>
                                    <label className="label">Crops Interested *</label>
                                    <input className="input" value={form.crops_interested} onChange={e => setForm(p => ({ ...p, crops_interested: e.target.value }))} placeholder="Rice, Wheat, Cotton" required />
                                </div>
                                <div>
                                    <label className="label">Monthly Req. (tonnes)</label>
                                    <input type="number" className="input" value={form.monthly_requirement_tonnes} onChange={e => setForm(p => ({ ...p, monthly_requirement_tonnes: e.target.value }))} placeholder="500" />
                                </div>
                                <div className="col-span-2">
                                    <label className="label">Description *</label>
                                    <textarea className="input resize-none" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                                <button type="submit" disabled={loading} className="btn-primary flex-1">
                                    {loading ? 'Registering...' : '✅ Register Company'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
