import { useState, useEffect } from 'react'
import { analyticsAPI } from '../api/services'
import {
    Line, Bar, Doughnut
} from 'react-chartjs-2'
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, BarElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler)

export default function AnalyticsPage() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        analyticsAPI.getOverview()
            .then(r => setData(r.data))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>
    if (!data) return <div className="text-center text-gray-500 py-20">Analytics data unavailable.</div>

    const { stats, monthly_supply, crop_supply, crop_demand, soil_health, state_participation } = data

    const supplyDemandChart = {
        labels: monthly_supply.map(m => m.month),
        datasets: [
            {
                label: 'Supply (kg)',
                data: monthly_supply.map(m => m.supply),
                borderColor: '#16a34a',
                backgroundColor: 'rgba(22,163,74,0.1)',
                fill: true, tension: 0.4,
            },
            {
                label: 'Demand (kg)',
                data: monthly_supply.map(m => m.demand),
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245,158,11,0.1)',
                fill: true, tension: 0.4,
            }
        ]
    }

    const cropSupplyChart = {
        labels: crop_supply.slice(0, 8).map(c => c.crop_name),
        datasets: [{
            label: 'Supply (kg)',
            data: crop_supply.slice(0, 8).map(c => c.total_kg),
            backgroundColor: ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#f59e0b', '#fbbf24', '#fb923c', '#f97316'],
            borderRadius: 8,
        }]
    }

    const soilHealthChart = {
        labels: soil_health.map(s => s.health_status?.charAt(0).toUpperCase() + s.health_status?.slice(1)),
        datasets: [{
            data: soil_health.map(s => s.count),
            backgroundColor: ['#16a34a', '#22c55e', '#f59e0b', '#f97316', '#ef4444'],
            borderWidth: 2, borderColor: '#fff',
        }]
    }

    const stateChart = {
        labels: state_participation.slice(0, 8).map(s => s.state || 'Unknown'),
        datasets: [{
            label: 'Farmers',
            data: state_participation.slice(0, 8).map(s => s.count),
            backgroundColor: '#0ea5e9',
            borderRadius: 6,
        }]
    }

    const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { font: { size: 11 } } } } }

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">📊 Supply & Demand Analytics</h1>
                <p className="page-subtitle">Real-time market intelligence for informed farming decisions</p>
            </div>

            {/* Total stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                {[
                    { label: 'Total Farmers', value: stats.total_farmers?.toLocaleString(), icon: '👨‍🌾', color: 'bg-green-100' },
                    { label: 'Soil Reports', value: stats.total_soil_reports, icon: '🧪', color: 'bg-blue-100' },
                    { label: 'AI Recommendations', value: stats.total_recommendations, icon: '🤖', color: 'bg-purple-100' },
                    { label: 'Crop Listings', value: stats.total_crop_listings, icon: '📦', color: 'bg-amber-100' },
                    { label: 'Total Orders', value: stats.total_orders, icon: '🛒', color: 'bg-pink-100' },
                    { label: 'Supply (kg)', value: Number(stats.total_supply_kg).toLocaleString(), icon: '⚖️', color: 'bg-orange-100' },
                ].map(({ label, value, icon, color }) => (
                    <div key={label} className="card text-center">
                        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-2xl mx-auto mb-2`}>{icon}</div>
                        <p className="text-2xl font-bold text-gray-900">{value || 0}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                {/* Supply vs Demand */}
                <div className="card">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">📈 Monthly Supply vs Demand</h2>
                    <div className="h-64">
                        <Line data={supplyDemandChart} options={{ ...chartOpts, scales: { y: { beginAtZero: true } } }} />
                    </div>
                </div>

                {/* Top Crop Supply */}
                <div className="card">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">🌾 Top Crops by Supply Volume</h2>
                    <div className="h-64">
                        {crop_supply.length > 0 ? (
                            <Bar data={cropSupplyChart} options={{ ...chartOpts, scales: { y: { beginAtZero: true } }, plugins: { ...chartOpts.plugins, legend: { display: false } } }} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">No crop listings data yet</div>
                        )}
                    </div>
                </div>

                {/* Soil Health Distribution */}
                <div className="card">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">🌍 Soil Health Distribution</h2>
                    <div className="h-64 flex items-center justify-center">
                        {soil_health.length > 0 ? (
                            <div className="w-56 h-56">
                                <Doughnut data={soilHealthChart} options={{ ...chartOpts, plugins: { legend: { position: 'right', labels: { font: { size: 11 } } } } }} />
                            </div>
                        ) : (
                            <div className="text-gray-400">No soil report data</div>
                        )}
                    </div>
                </div>

                {/* Farmer Participation by State */}
                <div className="card">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">🗺️ Farmer Participation by State</h2>
                    <div className="h-64">
                        {state_participation.length > 0 ? (
                            <Bar data={stateChart} options={{ ...chartOpts, indexAxis: 'y', scales: { x: { beginAtZero: true } }, plugins: { ...chartOpts.plugins, legend: { display: false } } }} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">No state data available</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Crop Demand table */}
            {crop_demand.length > 0 && (
                <div className="card">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">🤖 Most Recommended Crops (AI Engine)</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-2 text-gray-500 font-semibold text-xs uppercase">#</th>
                                    <th className="text-left py-2 text-gray-500 font-semibold text-xs uppercase">Crop</th>
                                    <th className="text-left py-2 text-gray-500 font-semibold text-xs uppercase">AI Recommendations</th>
                                    <th className="text-left py-2 text-gray-500 font-semibold text-xs uppercase">Demand Signal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {crop_demand.map((c, i) => (
                                    <tr key={c.recommended_crop} className="hover:bg-gray-50">
                                        <td className="py-3 text-gray-400 font-medium">{i + 1}</td>
                                        <td className="py-3 font-semibold text-gray-900 capitalize">{c.recommended_crop}</td>
                                        <td className="py-3 text-gray-600">{c.count} farmers</td>
                                        <td className="py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 bg-gray-100 rounded-full flex-1 max-w-32">
                                                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(c.count / crop_demand[0].count) * 100}%` }} />
                                                </div>
                                                <span className={`badge ${i === 0 ? 'badge-green' : i < 3 ? 'badge-yellow' : 'bg-gray-100 text-gray-600'}`}>
                                                    {i === 0 ? 'High' : i < 3 ? 'Medium' : 'Low'}
                                                </span>
                                            </div>
                                        </td>
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
