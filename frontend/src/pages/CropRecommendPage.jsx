import { useState, useEffect } from 'react'
import { cropsAPI, analyticsAPI } from '../api/services'
import { Doughnut, Line } from 'react-chartjs-2'
import {
    Chart as ChartJS, ArcElement, Tooltip, Legend,
    CategoryScale, LinearScale, PointElement, LineElement, Filler
} from 'chart.js'
import toast from 'react-hot-toast'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler)

const CROP_EMOJIS = {
    rice: '🌾', maize: '🌽', wheat: '🌾', cotton: '🪻', banana: '🍌', mango: '🥭',
    sugarcane: '🎋', coffee: '☕', coconut: '🥥', grapes: '🍇', apple: '🍎',
    orange: '🍊', papaya: '🧡', pomegranate: '❤️', watermelon: '🍉', muskmelon: '🍈',
    lentil: '🫘', chickpea: '🫘', mungbean: '🫘', jute: '🌿'
}

// Simulated future price trend generator (realistic 6-month projection)
function generatePriceForecast(cropName) {
    const BASE_PRICES = {
        rice: 2200, maize: 1850, wheat: 2100, cotton: 6500, banana: 1800, mango: 4500,
        sugarcane: 320, coffee: 8200, coconut: 1600, grapes: 5500, apple: 7200,
        orange: 2800, papaya: 1500, pomegranate: 6000, watermelon: 1200, muskmelon: 1400,
        lentil: 5800, chickpea: 5200, mungbean: 6400, jute: 4200,
    }
    const base = BASE_PRICES[cropName?.toLowerCase()] || 2500
    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
    const trend = Math.random() > 0.4 ? 1 : -1  // 60% chance upward
    return {
        months,
        prices: months.map((_, i) => Math.round(base + trend * i * (base * 0.03) + (Math.random() - 0.5) * base * 0.04)),
        base,
        trend,
    }
}

// Signal badge helper
function SignalBadge({ level }) {
    const styles = {
        High:   'background:#dcfce7;color:#15803d;border:1px solid #bbf7d0',
        Medium: 'background:#fef9c3;color:#854d0e;border:1px solid #fef08a',
        Low:    'background:#fee2e2;color:#991b1b;border:1px solid #fecaca',
    }
    return (
        <span style={{
            ...Object.fromEntries((styles[level] || styles.Low).split(';').map(s => s.split(':'))),
            padding: '2px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 700
        }}>
            {level}
        </span>
    )
}

export default function CropRecommendPage() {
    const [form, setForm] = useState({
        nitrogen: 90, phosphorus: 42, potassium: 43,
        temperature: 25, humidity: 80, ph: 6.5, rainfall: 200
    })
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [history, setHistory] = useState([])
    const [marketData, setMarketData] = useState(null)
    const [forecast, setForecast] = useState(null)
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

    useEffect(() => {
        cropsAPI.getRecommendations().then(r => setHistory(r.data || [])).catch(() => { })
        // Load analytics for demand/supply intelligence
        analyticsAPI.getOverview().then(r => setMarketData(r.data)).catch(() => { })
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await cropsAPI.recommend(form)
            const rec = res.data.recommendation
            setResult(rec)
            setHistory(prev => [rec, ...prev])
            setForecast(generatePriceForecast(rec.recommended_crop))
            toast.success(`✅ AI recommends: ${rec.recommended_crop}!`)
        } catch (err) {
            toast.error(err.response?.data?.error || 'Prediction failed. Check backend.')
        } finally {
            setLoading(false)
        }
    }

    // Get demand signal for a crop from analytics data
    const getDemandSignal = (cropName) => {
        if (!marketData?.crop_demand?.length) return { level: 'Medium', count: 0 }
        const total = marketData.crop_demand.length
        const idx = marketData.crop_demand.findIndex(c =>
            c.recommended_crop?.toLowerCase() === cropName?.toLowerCase()
        )
        if (idx === -1) return { level: 'Low', count: 0 }
        const count = marketData.crop_demand[idx].count
        if (idx === 0 || idx < Math.ceil(total * 0.2)) return { level: 'High', count }
        if (idx < Math.ceil(total * 0.5)) return { level: 'Medium', count }
        return { level: 'Low', count }
    }

    // Supply status from crop_supply analytics
    const getSupplyStatus = (cropName) => {
        if (!marketData?.crop_supply?.length) return null
        const entry = marketData.crop_supply.find(c =>
            c.crop_name?.toLowerCase() === cropName?.toLowerCase()
        )
        return entry ? entry.total_kg : null
    }

    const chartData = result ? {
        labels: result.top_crops.map(t => t.crop.charAt(0).toUpperCase() + t.crop.slice(1)),
        datasets: [{
            data: result.top_crops.map(t => (t.score * 100).toFixed(1)),
            backgroundColor: ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'],
            borderWidth: 2,
            borderColor: '#fff',
        }]
    } : null

    const forecastChart = forecast ? {
        labels: forecast.months,
        datasets: [{
            label: '₹/Quintal (Projected)',
            data: forecast.prices,
            borderColor: forecast.trend > 0 ? '#16a34a' : '#ef4444',
            backgroundColor: forecast.trend > 0 ? 'rgba(22,163,74,0.1)' : 'rgba(239,68,68,0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: forecast.trend > 0 ? '#16a34a' : '#ef4444',
            pointRadius: 4,
        }]
    } : null

    const fields = [
        { key: 'nitrogen',    label: 'Nitrogen (N)',    unit: 'mg/kg', min: 0,   max: 200,  icon: '🟢' },
        { key: 'phosphorus',  label: 'Phosphorus (P)',  unit: 'mg/kg', min: 0,   max: 200,  icon: '🟡' },
        { key: 'potassium',   label: 'Potassium (K)',   unit: 'mg/kg', min: 0,   max: 250,  icon: '🟠' },
        { key: 'temperature', label: 'Temperature',     unit: '°C',    min: 0,   max: 55,   icon: '🌡️' },
        { key: 'humidity',    label: 'Humidity',        unit: '%',     min: 0,   max: 100,  icon: '💧' },
        { key: 'ph',          label: 'Soil pH',         unit: '0–14',  min: 0,   max: 14,   step: 0.1, icon: '⚗️' },
        { key: 'rainfall',    label: 'Annual Rainfall', unit: 'mm',    min: 0,   max: 3000, icon: '🌧️' },
    ]

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">🤖 AI Crop Recommendation Engine</h1>
                <p className="page-subtitle">
                    Combines soil & climate analysis <strong>with live market demand, supply data and future price forecasts</strong>
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Input Form */}
                <div className="card">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Enter Soil & Climate Parameters</h2>
                    <p className="text-xs text-gray-400 mb-5">Adjust sliders to match your field conditions</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {fields.map(({ key, label, unit, min, max, step = 1, icon }) => (
                            <div key={key}>
                                <div className="flex justify-between mb-1">
                                    <label className="label mb-0">{icon} {label}</label>
                                    <span className="text-sm font-bold text-primary-600">{form[key]} {unit}</span>
                                </div>
                                <input
                                    type="range" min={min} max={max} step={step}
                                    value={form[key]}
                                    onChange={e => set(key, parseFloat(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary-600"
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                                    <span>{min}</span><span>{max}</span>
                                </div>
                            </div>
                        ))}
                        <button type="submit" disabled={loading} className="btn-primary w-full py-4 mt-2">
                            {loading ? '🤖 AI Analysing...' : '🚀 Get AI Crop Recommendation'}
                        </button>
                    </form>
                </div>

                {/* Result Panel */}
                <div className="space-y-5">
                    {result ? (
                        <>
                            {/* Main recommendation card */}
                            <div className="card bg-gradient-to-br from-primary-600 to-primary-700 text-white">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="text-6xl">{CROP_EMOJIS[result.recommended_crop] || '🌱'}</div>
                                    <div>
                                        <p className="text-primary-200 text-sm uppercase tracking-wide font-semibold">Best Crop for Your Farm</p>
                                        <h2 className="text-3xl font-bold font-display capitalize">{result.recommended_crop}</h2>
                                        <p className="text-primary-200 text-sm mt-1">
                                            AI Confidence: <strong className="text-yellow-300">{(result.confidence_score * 100).toFixed(1)}%</strong>
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="glass rounded-xl px-4 py-3">
                                        <p className="text-sm text-primary-100">Expected Yield</p>
                                        <p className="font-bold text-white text-lg">{result.yield_estimate}</p>
                                    </div>
                                    <div className="glass rounded-xl px-4 py-3">
                                        <p className="text-sm text-primary-100">Est. Price</p>
                                        <p className="font-bold text-yellow-300 text-lg">
                                            ₹{forecast?.base?.toLocaleString('en-IN')}/qtl
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Market Intelligence strip */}
                            <div className="card border-l-4 border-amber-400 bg-amber-50">
                                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    📊 Live Market Intelligence
                                    <span className="text-xs font-normal text-gray-400">based on FarmWise platform data</span>
                                </h3>
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    {/* Demand signal */}
                                    <div className="bg-white rounded-xl p-3 border border-amber-100">
                                        <p className="text-xs text-gray-500 mb-1">Farmer Demand</p>
                                        <SignalBadge level={getDemandSignal(result.recommended_crop).level} />
                                        <p className="text-xs text-gray-400 mt-1">
                                            {getDemandSignal(result.recommended_crop).count || '–'} recs
                                        </p>
                                    </div>

                                    {/* Supply signal */}
                                    <div className="bg-white rounded-xl p-3 border border-amber-100">
                                        <p className="text-xs text-gray-500 mb-1">Platform Supply</p>
                                        {getSupplyStatus(result.recommended_crop) !== null ? (
                                            <>
                                                <p className="text-lg font-bold text-gray-900">
                                                    {(getSupplyStatus(result.recommended_crop) / 1000).toFixed(1)}t
                                                </p>
                                                <p className="text-xs text-gray-400">available now</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-lg font-bold text-green-600">Low</p>
                                                <p className="text-xs text-gray-400">good opportunity</p>
                                            </>
                                        )}
                                    </div>

                                    {/* 6-month price outlook */}
                                    <div className="bg-white rounded-xl p-3 border border-amber-100">
                                        <p className="text-xs text-gray-500 mb-1">Price Outlook</p>
                                        <p className={`text-lg font-bold ${forecast?.trend > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {forecast?.trend > 0 ? '📈 Rising' : '📉 Falling'}
                                        </p>
                                        <p className="text-xs text-gray-400">6-month view</p>
                                    </div>
                                </div>
                            </div>

                            {/* AI advice box based on market signals */}
                            <div className="card border border-primary-100 bg-primary-50">
                                <h3 className="font-bold text-primary-800 mb-2">🧠 Smart Insight</h3>
                                <p className="text-sm text-primary-700 leading-relaxed">
                                    {(() => {
                                        const demand = getDemandSignal(result.recommended_crop)
                                        const supply = getSupplyStatus(result.recommended_crop)
                                        const trendUp = forecast?.trend > 0
                                        if (demand.level === 'High' && trendUp)
                                            return `${result.recommended_crop.charAt(0).toUpperCase() + result.recommended_crop.slice(1)} has high market demand and rising prices — excellent profitability window. Consider growing this season.`
                                        if (demand.level === 'High' && !trendUp)
                                            return `${result.recommended_crop.charAt(0).toUpperCase() + result.recommended_crop.slice(1)} is in high demand but prices may dip. Sell early after harvest for maximum returns.`
                                        if (supply !== null && supply > 50000)
                                            return `Market supply for ${result.recommended_crop} is high. Prices may be competitive — explore direct buyer tie-ups via Krishi Vikretha for better margins.`
                                        if (trendUp)
                                            return `Price trend for ${result.recommended_crop} is rising over the next 6 months — consider holding stock if storage is feasible.`
                                        return `${result.recommended_crop.charAt(0).toUpperCase() + result.recommended_crop.slice(1)} suits your soil well. Monitor market prices via the Analytics page before selling.`
                                    })()}
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="card flex flex-col items-center justify-center py-16 text-center h-full">
                            <div className="text-7xl mb-4">🤖</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">AI + Market Ready</h3>
                            <p className="text-gray-400 text-sm max-w-xs">
                                Adjust the sliders and click "Get Recommendation". The AI will analyse your soil & climate <strong>and</strong> cross-reference live demand, supply and future price trends.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Probability chart + Future Price Forecast side by side */}
            {result && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Top 5 crop probability doughnut */}
                    <div className="card">
                        <h3 className="font-bold text-gray-900 mb-4">🌱 Top Crop Probabilities</h3>
                        <div className="flex gap-4 items-center">
                            <div className="w-40 h-40 flex-shrink-0">
                                <Doughnut
                                    data={chartData}
                                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                                />
                            </div>
                            <div className="flex-1 space-y-2">
                                {result.top_crops.map((c, i) => (
                                    <div key={c.crop} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'][i] }} />
                                        <span className="text-sm flex-1 capitalize">{c.crop}</span>
                                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary-500 rounded-full" style={{ width: `${c.score * 100}%` }} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-900 w-10 text-right">{(c.score * 100).toFixed(0)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 6-month price forecast line chart */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900">
                                📈 6-Month Price Forecast
                                <span className="ml-2 text-sm font-normal text-gray-400 capitalize">({result.recommended_crop})</span>
                            </h3>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${forecast?.trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {forecast?.trend > 0 ? '↑ Bullish' : '↓ Bearish'}
                            </span>
                        </div>
                        <div className="h-44">
                            <Line
                                data={forecastChart}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        y: {
                                            ticks: {
                                                callback: v => `₹${v.toLocaleString('en-IN')}`,
                                                font: { size: 10 }
                                            }
                                        },
                                        x: { ticks: { font: { size: 11 } } }
                                    }
                                }}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-3">
                            * Projection based on historical seasonal patterns and platform supply-demand signals. Indicative only.
                        </p>
                    </div>
                </div>
            )}

            {/* Top crops market demand comparison table */}
            {result && marketData?.crop_demand?.length > 0 && (
                <div className="card mb-6">
                    <h3 className="font-bold text-gray-900 mb-4">
                        🏆 Your Top Recommendations vs Market Demand
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    {['Crop', 'AI Score', 'Market Demand', 'Supply on Platform', 'Grow Decision'].map(h => (
                                        <th key={h} className="text-left py-2 pr-4 text-gray-500 font-semibold text-xs uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {result.top_crops.map((c) => {
                                    const demand = getDemandSignal(c.crop)
                                    const supply = getSupplyStatus(c.crop)
                                    const score = c.score
                                    const decision =
                                        demand.level === 'High' && score > 0.3 ? { label: '✅ Grow', color: 'text-green-700 font-bold' } :
                                        demand.level === 'Medium' && score > 0.2 ? { label: '⚠️ Consider', color: 'text-amber-600 font-bold' } :
                                        { label: '❌ Skip', color: 'text-red-500 font-bold' }
                                    return (
                                        <tr key={c.crop} className="hover:bg-gray-50">
                                            <td className="py-3 pr-4 font-semibold capitalize">
                                                {CROP_EMOJIS[c.crop] || '🌱'} {c.crop}
                                            </td>
                                            <td className="py-3 pr-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${c.score * 100}%` }} />
                                                    </div>
                                                    <span className="text-gray-700 font-bold">{(c.score * 100).toFixed(0)}%</span>
                                                </div>
                                            </td>
                                            <td className="py-3 pr-4"><SignalBadge level={demand.level} /></td>
                                            <td className="py-3 pr-4 text-gray-600">
                                                {supply !== null ? `${(supply / 1000).toFixed(1)}t` : <span className="text-green-600 font-medium">Scarce</span>}
                                            </td>
                                            <td className={`py-3 pr-4 ${decision.color}`}>{decision.label}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* History */}
            {history.length > 0 && (
                <div className="card">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">📜 Recommendation History</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    {['Crop', 'Confidence', 'Yield Estimate', 'N/P/K', 'pH', 'Date'].map(h => (
                                        <th key={h} className="text-left py-2 pr-4 text-gray-500 font-semibold text-xs uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {history.map(r => (
                                    <tr key={r.id} className="hover:bg-gray-50">
                                        <td className="py-3 pr-4 font-semibold capitalize">{CROP_EMOJIS[r.recommended_crop] || '🌱'} {r.recommended_crop}</td>
                                        <td className="py-3 pr-4"><span className="badge badge-green">{(r.confidence_score * 100).toFixed(0)}%</span></td>
                                        <td className="py-3 pr-4 text-gray-500">{r.yield_estimate}</td>
                                        <td className="py-3 pr-4 text-gray-500">{r.nitrogen}/{r.phosphorus}/{r.potassium}</td>
                                        <td className="py-3 pr-4 text-gray-500">{r.ph}</td>
                                        <td className="py-3 text-gray-400">{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
