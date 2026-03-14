import { useState, useEffect } from 'react'
import { expertsAPI } from '../api/services'
import { FiStar, FiCalendar, FiVideo, FiMessageSquare, FiMapPin, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'

const SPEC_EMOJI = { soil: '🌍', crops: '🌾', pest: '🐛', irrigation: '💧', organic: '🌿', agribusiness: '💼', horticulture: '🍅' }

export default function ExpertPage() {
    const [experts, setExperts] = useState([])
    const [selected, setSelected] = useState(null)
    const [showBook, setShowBook] = useState(false)
    const [appointments, setAppointments] = useState([])
    const [tab, setTab] = useState('experts')
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({ expert: '', appointment_type: 'video', scheduled_date: '', scheduled_time: '10:00', description: '' })

    useEffect(() => {
        expertsAPI.getExperts().then(r => setExperts(r.data || [])).catch(() => { })
        expertsAPI.getAppointments().then(r => setAppointments(r.data || [])).catch(() => { })
    }, [])

    const book = (expert) => {
        setSelected(expert)
        setForm(p => ({ ...p, expert: expert.id }))
        setShowBook(true)
    }

    const handleBook = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await expertsAPI.bookAppointment(form)
            setAppointments(prev => [res.data, ...prev])
            setShowBook(false)
            toast.success(`✅ Appointment booked with ${selected.name}!`)
        } catch (err) {
            toast.error('Booking failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const statusBadge = { pending: 'badge-yellow', confirmed: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red' }

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">👨‍🌾 Expert Consultation</h1>
                <p className="page-subtitle">Connect with certified agronomists for professional farming advice</p>
            </div>

            <div className="flex gap-2 mb-6 border-b border-gray-200">
                {[['experts', '🔍 Find Experts'], ['appointments', '📅 My Appointments']].map(([key, label]) => (
                    <button key={key} onClick={() => setTab(key)}
                        className={`px-5 py-2.5 font-semibold text-sm rounded-t-xl transition-colors ${tab === key ? 'bg-white border border-b-white border-gray-200 text-primary-600 -mb-px' : 'text-gray-500 hover:text-gray-700'}`}>
                        {label} {key === 'appointments' && appointments.length > 0 && <span className="ml-1 bg-primary-100 text-primary-700 rounded-full px-1.5 py-0.5 text-xs">{appointments.length}</span>}
                    </button>
                ))}
            </div>

            {tab === 'experts' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {experts.map(expert => (
                        <div key={expert.id} className="card-hover flex flex-col">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-14 h-14 rounded-2xl gradient-green flex items-center justify-center text-2xl flex-shrink-0">
                                    {SPEC_EMOJI[expert.specialization] || '👨‍🔬'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900">{expert.name}</h3>
                                    <p className="text-sm text-primary-600 font-medium">{expert.specialization_display}</p>
                                    <p className="text-xs text-gray-400 truncate">{expert.organization}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mb-3 text-sm">
                                <div className="flex items-center gap-1 text-amber-500">
                                    <FiStar className="fill-amber-500" />
                                    <span className="font-bold text-gray-900">{expert.rating}</span>
                                </div>
                                <span className="text-gray-300">|</span>
                                <span className="text-gray-500">{expert.experience_years} yrs experience</span>
                                <span className="text-gray-300">|</span>
                                <span className="text-gray-500">{expert.total_consultations} sessions</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-2">{expert.bio}</p>
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <div>
                                    <span className="text-lg font-bold text-gray-900">₹{expert.consultation_fee}</span>
                                    <span className="text-gray-400 text-xs">/session</span>
                                </div>
                                <button onClick={() => book(expert)} className="btn-primary text-sm px-4 py-2">Book Now</button>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <span className="badge badge-blue flex items-center gap-1"><FiVideo className="w-3 h-3" /> Video</span>
                                <span className="badge badge-green flex items-center gap-1"><FiMapPin className="w-3 h-3" /> Farm Visit</span>
                                <span className="badge bg-purple-100 text-purple-700 flex items-center gap-1"><FiMessageSquare className="w-3 h-3" /> Chat</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'appointments' && (
                <div className="space-y-4">
                    {appointments.length > 0 ? appointments.map(apt => (
                        <div key={apt.id} className="card flex flex-col sm:flex-row gap-4 items-start">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
                                {apt.appointment_type === 'video' ? '📹' : apt.appointment_type === 'farm_visit' ? '🚜' : '💬'}
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h3 className="font-bold text-gray-900">{apt.expert_name}</h3>
                                    <span className={`badge ${statusBadge[apt.status] || 'badge-green'}`}>{apt.status_display}</span>
                                    <span className="badge badge-blue">{apt.type_display}</span>
                                </div>
                                <p className="text-sm text-gray-500 mb-1">{apt.expert_specialization}</p>
                                <p className="text-sm text-gray-700 mb-2">{apt.description}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><FiCalendar className="w-3.5 h-3.5" /> {apt.scheduled_date} at {apt.scheduled_time}</span>
                                    {apt.meeting_link && (
                                        <a href={apt.meeting_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline font-medium">
                                            <FiVideo className="w-3.5 h-3.5" /> Join Meeting
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="card text-center py-16">
                            <div className="text-5xl mb-3">📅</div>
                            <p className="text-gray-500 mb-4">No appointments booked yet</p>
                            <button onClick={() => setTab('experts')} className="btn-primary">Find an Expert</button>
                        </div>
                    )}
                </div>
            )}

            {/* Booking Modal */}
            {showBook && selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowBook(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Book Consultation</h2>
                        <p className="text-gray-500 text-sm mb-5">with <strong>{selected.name}</strong> – ₹{selected.consultation_fee}/session</p>
                        <form onSubmit={handleBook} className="space-y-4">
                            <div>
                                <label className="label">Consultation Type</label>
                                <select className="input" value={form.appointment_type} onChange={e => setForm(p => ({ ...p, appointment_type: e.target.value }))}>
                                    <option value="video">📹 Video Call</option>
                                    <option value="farm_visit">🚜 Farm Visit</option>
                                    <option value="chat">💬 Chat</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="label">Date</label>
                                    <input type="date" className="input" value={form.scheduled_date} onChange={e => setForm(p => ({ ...p, scheduled_date: e.target.value }))} required min={new Date().toISOString().split('T')[0]} />
                                </div>
                                <div>
                                    <label className="label">Time</label>
                                    <input type="time" className="input" value={form.scheduled_time} onChange={e => setForm(p => ({ ...p, scheduled_time: e.target.value }))} required />
                                </div>
                            </div>
                            <div>
                                <label className="label">Describe your problem</label>
                                <textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="e.g. My paddy leaves are turning yellow..." required />
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowBook(false)} className="btn-secondary flex-1">Cancel</button>
                                <button type="submit" disabled={loading} className="btn-primary flex-1">
                                    {loading ? 'Booking...' : '✅ Confirm Booking'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
