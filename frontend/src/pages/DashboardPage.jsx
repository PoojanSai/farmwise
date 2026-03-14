import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { soilAPI, cropsAPI, expertsAPI } from '../api/services'
import { FiDroplet, FiStar, FiUsers, FiShoppingBag, FiMapPin, FiCalendar, FiTrendingUp, FiArrowRight } from 'react-icons/fi'

function StatCard({ icon, label, value, sub, color }) {
    return (
        <div className="stat-card">
            <div className={`stat-icon ${color}`}>{icon}</div>
            <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm font-medium text-gray-700">{label}</p>
                {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    )
}

const healthColor = {
    excellent: 'text-green-600 bg-green-100',
    good: 'text-blue-600 bg-blue-100',
    moderate: 'text-yellow-600 bg-yellow-100',
    poor: 'text-orange-600 bg-orange-100',
    critical: 'text-red-600 bg-red-100',
}

export default function DashboardPage() {
    const { farmer } = useAuth()
    const { t } = useTranslation()
    const [soilData, setSoilData] = useState(null)
    const [recommendations, setRecommendations] = useState([])
    const [upcoming, setUpcoming] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            soilAPI.getLatest().catch(() => null),
            cropsAPI.getRecommendations().catch(() => ({ data: [] })),
            expertsAPI.getUpcoming().catch(() => ({ data: [] })),
        ]).then(([soil, recs, apts]) => {
            setSoilData(soil?.data || null)
            setRecommendations(recs?.data?.slice(0, 3) || [])
            setUpcoming(apts?.data?.slice(0, 3) || [])
        }).finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <h1 className="page-title">{t('dashboard.goodMorning', { name: farmer?.full_name?.split(' ')[0] })}</h1>
                <p className="page-subtitle flex items-center gap-1.5 mt-1">
                    <FiMapPin className="text-primary-500" />
                    {farmer?.village ? `${farmer.village}, ` : ''}{farmer?.district}, {farmer?.state}
                </p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                <StatCard
                    icon="🌾"
                    label={t('dashboard.totalLand')}
                    value={`${farmer?.land_size_acres || 0} acres`}
                    sub={`${farmer?.soil_type?.toUpperCase()} soil`}
                    color="bg-green-100"
                />
                <StatCard
                    icon="🧪"
                    label={t('dashboard.soilHealth')}
                    value={soilData ? `${soilData.health_score}/100` : '–'}
                    sub={soilData?.health_status || 'No report yet'}
                    color="bg-blue-100"
                />
                <StatCard
                    icon="🤖"
                    label={t('dashboard.topCropAdvice')}
                    value={recommendations[0]?.recommended_crop?.toUpperCase() || '–'}
                    sub={recommendations[0] ? `${(recommendations[0].confidence_score * 100).toFixed(0)}% confidence` : 'Run AI analysis'}
                    color="bg-purple-100"
                />
                <StatCard
                    icon="📅"
                    label={t('dashboard.expertAppointments')}
                    value={upcoming.length}
                    sub={t('dashboard.upcomingConsultations')}
                    color="bg-amber-100"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Farmer Profile Card */}
                <div className="card lg:col-span-1">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-16 h-16 gradient-green rounded-2xl flex items-center justify-center text-3xl">👨‍🌾</div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">{farmer?.full_name}</h3>
                            <p className="text-gray-500 text-sm">{farmer?.email}</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {[
                            { label: 'Phone', value: farmer?.phone || '–' },
                            { label: 'Location', value: `${farmer?.district}, ${farmer?.state}` },
                            { label: 'Land Area', value: `${farmer?.land_size_acres} acres` },
                            { label: 'Soil Type', value: farmer?.soil_type?.toUpperCase() },
                            { label: 'Previous Crops', value: farmer?.crops_grown || '–' },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex items-start justify-between text-sm">
                                <span className="text-gray-500 font-medium">{label}</span>
                                <span className="text-gray-900 font-semibold text-right max-w-[55%]">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Latest Soil Report */}
                <div className="card lg:col-span-2">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold text-gray-900">{t('dashboard.latestSoilReport')}</h2>
                        <Link to="/soil-test" className="text-primary-600 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                            {t('dashboard.newTest')} <FiArrowRight />
                        </Link>
                    </div>

                    {soilData ? (
                        <>
                            <div className="flex items-center gap-3 mb-5">
                                <span className={`badge ${healthColor[soilData.health_status] || 'badge-green'}`}>
                                    {soilData.health_status?.toUpperCase()} – {soilData.health_score}/100
                                </span>
                                <span className="text-sm text-gray-400">{soilData.field_name}</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                {[
                                    { label: 'pH', value: soilData.ph, unit: '', ideal: '6.0–7.5', color: 'bg-blue-50 border-blue-200' },
                                    { label: 'Moisture', value: soilData.moisture, unit: '%', ideal: '40–70%', color: 'bg-cyan-50 border-cyan-200' },
                                    { label: 'Nitrogen', value: soilData.nitrogen, unit: ' mg/kg', ideal: '280–560', color: 'bg-green-50 border-green-200' },
                                    { label: 'Phosphorus', value: soilData.phosphorus, unit: ' mg/kg', ideal: '25–50', color: 'bg-yellow-50 border-yellow-200' },
                                    { label: 'Potassium', value: soilData.potassium, unit: ' mg/kg', ideal: '200–400', color: 'bg-orange-50 border-orange-200' },
                                ].map(({ label, value, unit, ideal, color }) => (
                                    <div key={label} className={`rounded-xl border p-3 text-center ${color}`}>
                                        <p className="text-sm font-medium text-gray-500">{label}</p>
                                        <p className="text-xl font-bold text-gray-900">{value}{unit}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">Ideal: {ideal}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-4">Tested on {new Date(soilData.tested_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                        </>
                    ) : (
                        <div className="text-center py-10">
                            <div className="text-5xl mb-3">🧪</div>
                            <p className="text-gray-500 mb-4">{t('dashboard.noSoilReport')}</p>
                            <Link to="/soil-test" className="btn-primary inline-flex">{t('dashboard.startSoilTest')}</Link>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Recommendations */}
                <div className="card">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold text-gray-900">{t('dashboard.aiCropRecommendations')}</h2>
                        <Link to="/crop-recommend" className="text-primary-600 text-sm font-semibold hover:underline">{t('dashboard.getNew')}</Link>
                    </div>
                    {recommendations.length > 0 ? (
                        <div className="space-y-3">
                            {recommendations.map((rec) => (
                                <div key={rec.id} className="flex items-center gap-4 p-3 rounded-xl bg-primary-50 border border-primary-100">
                                    <div className="text-3xl">🌱</div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900 capitalize">{rec.recommended_crop}</p>
                                        <p className="text-sm text-gray-500">Yield: {rec.yield_estimate}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="badge badge-green">{(rec.confidence_score * 100).toFixed(0)}%</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-400 text-sm mb-3">{t('dashboard.noRecommendations')}</p>
                            <Link to="/crop-recommend" className="btn-primary text-sm px-4 py-2 inline-flex">{t('dashboard.runAIAnalysis')}</Link>
                        </div>
                    )}
                </div>

                {/* Upcoming Appointments */}
                <div className="card">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold text-gray-900">📅 {t('dashboard.upcomingConsultations')}</h2>
                        <Link to="/experts" className="text-primary-600 text-sm font-semibold hover:underline">Book →</Link>
                    </div>
                    {upcoming.length > 0 ? (
                        <div className="space-y-3">
                            {upcoming.map((apt) => (
                                <div key={apt.id} className="flex items-start gap-4 p-3 rounded-xl bg-blue-50 border border-blue-100">
                                    <div className="text-3xl">👨‍⚕️</div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900">{apt.expert_name}</p>
                                        <p className="text-sm text-gray-500">{apt.expert_specialization}</p>
                                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                            <FiCalendar /> {apt.scheduled_date} at {apt.scheduled_time}
                                        </p>
                                    </div>
                                    <span className={`badge ${apt.appointment_type === 'video' ? 'badge-blue' : 'badge-green'}`}>
                                        {apt.type_display}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-400 text-sm mb-3">{t('dashboard.noUpcomingConsultations')}</p>
                            <Link to="/experts" className="btn-secondary text-sm px-4 py-2 inline-flex">{t('dashboard.findAnExpert')}</Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Links */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { to: '/marketplace',  icon: '🛒', labelKey: 'dashboard.buyInputs',      color: 'bg-green-50 hover:bg-green-100 border-green-200' },
                    { to: '/crop-selling', icon: '📦', labelKey: 'dashboard.sellCrops',      color: 'bg-amber-50 hover:bg-amber-100 border-amber-200' },
                    { to: '/analytics',    icon: '📊', labelKey: 'dashboard.marketAnalytics', color: 'bg-blue-50 hover:bg-blue-100 border-blue-200' },
                    { to: '/companies',    icon: '🏢', labelKey: 'dashboard.companyBuyers',   color: 'bg-purple-50 hover:bg-purple-100 border-purple-200' },
                ].map(({ to, icon, labelKey, color }) => (
                    <Link key={to} to={to} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${color}`}>
                        <span className="text-3xl">{icon}</span>
                        <span className="text-sm font-semibold text-gray-700">{t(labelKey)}</span>
                    </Link>
                ))}
            </div>
        </div>
    )
}
