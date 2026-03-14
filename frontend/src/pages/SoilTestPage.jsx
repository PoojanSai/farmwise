import { useState, useEffect } from 'react'
import { soilAPI } from '../api/services'
import { Radar, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import toast from 'react-hot-toast'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const healthColors = {
    excellent: { badge: 'bg-green-100 text-green-700', bar: 'bg-green-500' },
    good: { badge: 'bg-blue-100 text-blue-700', bar: 'bg-blue-500' },
    moderate: { badge: 'bg-yellow-100 text-yellow-700', bar: 'bg-yellow-500' },
    poor: { badge: 'bg-orange-100 text-orange-700', bar: 'bg-orange-500' },
    critical: { badge: 'bg-red-100 text-red-700', bar: 'bg-red-500' },
}

export default function SoilTestPage() {
    const [form, setForm] = useState({ field_name: 'Main Field', ph: 6.5, moisture: 60, nitrogen: 320, phosphorus: 38, potassium: 280, temperature: 26, organic_matter: 2.5, notes: '' })
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [history, setHistory] = useState([])
    const [tab, setTab] = useState('test')
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

    useEffect(() => {
        soilAPI.getReports().then(res => setHistory(res.data || [])).catch(() => { })
    }, [])

    const simulate = () => {
        setForm({
            field_name: 'Field ' + Math.floor(Math.random() * 5 + 1),
            ph: +(4.5 + Math.random() * 4).toFixed(1),
            moisture: +(30 + Math.random() * 50).toFixed(0),
            nitrogen: +(100 + Math.random() * 400).toFixed(0),
            phosphorus: +(10 + Math.random() * 70).toFixed(0),
            potassium: +(100 + Math.random() * 350).toFixed(0),
            temperature: +(18 + Math.random() * 15).toFixed(1),
            organic_matter: +(1 + Math.random() * 5).toFixed(1),
            notes: 'Simulated from soil sensor',
        })
        toast.success('📡 Soil sensor data simulated!')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await soilAPI.addReport(form)
            setResult(res.data)
            setHistory(prev => [res.data, ...prev])
            toast.success('Soil report generated! 🧪')
        } catch (err) {
            toast.error('Failed to submit report.')
        } finally {
            setLoading(false)
        }
    }

    const radarData = result ? {
        labels: ['pH', 'Moisture', 'Nitrogen', 'Phosphorus', 'Potassium', 'Org. Matter'],
        datasets: [{
            label: 'Your Soil',
            data: [
                (result.ph / 14) * 100,
                result.moisture,
                (result.nitrogen / 700) * 100,
                (result.phosphorus / 100) * 100,
                (result.potassium / 600) * 100,
                (result.organic_matter / 10) * 100,
            ],
            backgroundColor: 'rgba(34,197,94,0.2)',
            borderColor: '#16a34a',
            pointBackgroundColor: '#16a34a',
        }]
    } : null

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">🧪 Soil Testing System</h1>
                <p className="page-subtitle">Analyze your soil health and get detailed nutrient insights</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                {[['test', '📡 New Soil Test'], ['history', '📋 Report History']].map(([key, label]) => (
                    <button key={key} onClick={() => setTab(key)}
                        className={`px-5 py-2.5 font-semibold text-sm rounded-t-xl transition-colors ${tab === key ? 'bg-white border border-b-white border-gray-200 text-primary-600 -mb-px' : 'text-gray-500 hover:text-gray-700'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {tab === 'test' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Form */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-gray-900">Input Soil Parameters</h2>
                            <button onClick={simulate} className="btn-secondary text-sm px-3 py-2">📡 Simulate Sensor</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Field Name</label>
                                <input className="input" value={form.field_name} onChange={e => set('field_name', e.target.value)} placeholder="Main Field" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { key: 'ph', label: 'Soil pH', min: 0, max: 14, step: 0.1, unit: '(0–14)' },
                                    { key: 'moisture', label: 'Moisture %', min: 0, max: 100, step: 1, unit: '%' },
                                    { key: 'nitrogen', label: 'Nitrogen (N)', min: 0, max: 700, step: 1, unit: 'mg/kg' },
                                    { key: 'phosphorus', label: 'Phosphorus (P)', min: 0, max: 200, step: 1, unit: 'mg/kg' },
                                    { key: 'potassium', label: 'Potassium (K)', min: 0, max: 600, step: 1, unit: 'mg/kg' },
                                    { key: 'temperature', label: 'Temperature', min: 0, max: 60, step: 0.1, unit: '°C' },
                                    { key: 'organic_matter', label: 'Organic Matter', min: 0, max: 15, step: 0.1, unit: '%' },
                                ].map(({ key, label, min, max, step, unit }) => (
                                    <div key={key}>
                                        <label className="label">{label} <span className="text-gray-400 font-normal text-xs">{unit}</span></label>
                                        <input type="number" className="input" min={min} max={max} step={step}
                                            value={form[key]} onChange={e => set(key, parseFloat(e.target.value))} />
                                    </div>
                                ))}
                            </div>
                            <div className="col-span-2">
                                <label className="label">Notes (optional)</label>
                                <textarea className="input resize-none" rows={2} placeholder="Any observations..." value={form.notes} onChange={e => set('notes', e.target.value)} />
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary w-full py-4">
                                {loading ? '🔬 Analysing...' : '🔬 Generate Soil Report'}
                            </button>
                        </form>
                    </div>

                    {/* Result */}
                    <div className="space-y-5">
                        {result ? (
                            <>
                                <div className="card">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-bold text-gray-900">📊 Soil Report</h2>
                                        <span className={`badge ${healthColors[result.health_status]?.badge || 'badge-green'}`}>
                                            {result.health_status?.toUpperCase()} • {result.health_score}/100
                                        </span>
                                    </div>
                                    <div className="progress-bar mb-2">
                                        <div className={`progress-fill ${healthColors[result.health_status]?.bar || 'bg-green-500'}`} style={{ width: `${result.health_score}%` }} />
                                    </div>
                                    <p className="text-sm text-gray-500 mb-5">{result.health_score >= 80 ? '✅ Excellent soil health! Your soil is optimal for farming.' : result.health_score >= 65 ? '✅ Good soil health. Minor improvements possible.' : result.health_score >= 50 ? '⚠️ Moderate health. Some nutrients need attention.' : '❌ Poor soil health. Immediate corrective action recommended.'}</p>

                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { label: 'pH', value: result.ph, ideal: '6.0–7.5', good: result.ph >= 6 && result.ph <= 7.5 },
                                            { label: 'Moisture', value: `${result.moisture}%`, ideal: '40–70%', good: result.moisture >= 40 && result.moisture <= 70 },
                                            { label: 'Temp', value: `${result.temperature}°C`, ideal: '18–32°C', good: result.temperature >= 18 && result.temperature <= 32 },
                                            { label: 'N', value: `${result.nitrogen}`, ideal: '280–560', good: result.nitrogen >= 280 && result.nitrogen <= 560 },
                                            { label: 'P', value: `${result.phosphorus}`, ideal: '25–50', good: result.phosphorus >= 25 && result.phosphorus <= 50 },
                                            { label: 'K', value: `${result.potassium}`, ideal: '200–400', good: result.potassium >= 200 && result.potassium <= 400 },
                                        ].map(({ label, value, ideal, good }) => (
                                            <div key={label} className={`rounded-xl p-3 text-center border ${good ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                                <p className="text-xs font-medium text-gray-500">{label}</p>
                                                <p className="text-lg font-bold text-gray-900">{value}</p>
                                                <p className="text-xs text-gray-400">✓ {ideal}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Radar Chart */}
                                <div className="card">
                                    <h3 className="font-bold text-gray-900 mb-3">Nutrient Spider Chart</h3>
                                    <div className="h-56">
                                        <Radar data={radarData} options={{ responsive: true, maintainAspectRatio: false, scales: { r: { min: 0, max: 100, ticks: { display: false } } } }} />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="card flex flex-col items-center justify-center py-20 text-center">
                                <div className="text-6xl mb-4">🌍</div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Run a Soil Test</h3>
                                <p className="text-gray-400 text-sm">Fill in the parameters or simulate sensor data to see your soil report</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {tab === 'history' && (
                <div className="space-y-4">
                    {history.length > 0 ? history.map(r => (
                        <div key={r.id} className="card flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="font-bold text-gray-900">{r.field_name}</span>
                                    <span className={`badge ${healthColors[r.health_status]?.badge || 'badge-green'}`}>{r.health_status} • {r.health_score}/100</span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                    <span>pH: <strong className="text-gray-900">{r.ph}</strong></span>
                                    <span>N: <strong>{r.nitrogen}</strong></span>
                                    <span>P: <strong>{r.phosphorus}</strong></span>
                                    <span>K: <strong>{r.potassium}</strong></span>
                                    <span>Moisture: <strong>{r.moisture}%</strong></span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 flex-shrink-0">{new Date(r.tested_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
                        </div>
                    )) : (
                        <div className="card text-center py-16">
                            <p className="text-gray-400">No soil reports yet. Run your first test!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
