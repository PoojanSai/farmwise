import { Link } from 'react-router-dom'
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'

const features = [
    { icon: '🧪', title: 'Soil Testing', desc: 'Smart sensor simulation for real-time NPK, pH and moisture analysis' },
    { icon: '🤖', title: 'AI Crop Advisor', desc: 'Random Forest ML model recommends best crops based on your soil data' },
    { icon: '👨‍🌾', title: 'Expert Consultation', desc: 'Connect with certified agronomists via video, farm visit, or chat' },
    { icon: '🛒', title: 'Krishi Bhandhu', desc: 'Buy seeds, fertilizers, pesticides and tools at best market prices' },
    { icon: '📈', title: 'Krishi Vikretha', desc: 'List your harvest and connect directly with verified buyers' },
    { icon: '📊', title: 'Analytics Dashboard', desc: 'Track crop supply/demand, prices, and market trends with live charts' },
]

const stats = [
    { value: '50,000+', label: 'Farmers Registered' },
    { value: '22 States', label: 'Pan India Coverage' },
    { value: '95%', label: 'Crop Recommendation Accuracy' },
    { value: '₹2.4 Cr', label: 'Saved in Input Costs' },
]

const testimonials = [
    {
        name: 'Ramu Reddy', location: 'Anantapur, AP',
        text: 'FarmWise helped me switch from rice to maize based on AI advice. My yield doubled!',
        crop: 'Maize Farmer',
    },
    {
        name: 'Lakshmi Devi', location: 'Salem, TN',
        text: 'I sold all 3 tonnes of bananas through Krishi Vikretha at 20% above market price.',
        crop: 'Banana Farmer',
    },
    {
        name: 'Suresh Patel', location: 'Surat, GJ',
        text: 'The soil test report showed my potassium was low. Fixed it and got record cotton yield.',
        crop: 'Cotton Farmer',
    },
]

export default function LandingPage() {
    const { t } = useTranslation()

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Navbar */}
            <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🌾</span>
                        <span className="text-xl font-bold text-gray-900 font-display">FarmWise</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <LanguageSwitcher />
                        <Link to="/login" className="btn-secondary text-sm px-4 py-2">{t('login')}</Link>
                        <Link to="/register" className="btn-primary text-sm px-4 py-2">{t('getStartedFree')}</Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="gradient-hero pt-32 pb-24 px-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
                </div>
                <div className="max-w-5xl mx-auto text-center relative z-10 animate-fade-in">
                    <span className="inline-block bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-white/30">
                        🇮🇳 Powered by AI for Indian Farmers
                    </span>
                    <h1 className="text-5xl md:text-6xl font-bold font-display leading-tight mb-6">
                        {t('smartFarmingStarts')}<br />with <span className="text-yellow-300">FarmWise</span>
                    </h1>
                    <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
                        {t('heroSubtitle')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="bg-white text-primary-700 font-bold px-8 py-4 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex items-center gap-2 justify-center text-lg">
                            {t('getStartedFree')} <FiArrowRight />
                        </Link>
                        <Link to="/login" className="border-2 border-white/50 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all duration-200 text-lg">
                            {t('alreadyHaveAccount')}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="bg-primary-700 py-12">
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
                    {stats.map((s) => (
                        <div key={s.label} className="animate-slide-up">
                            <div className="text-3xl font-bold font-display text-yellow-300">{s.value}</div>
                            <div className="text-sm text-white/70 mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-6 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-4xl font-bold font-display text-gray-900 mb-4">{t('everythingAFarmerNeeds')}</h2>
                        <p className="text-gray-500 text-lg max-w-xl mx-auto">{t('featuresSubtitle')}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f) => (
                            <div key={f.title} className="card-hover group">
                                <div className="text-4xl mb-4">{f.icon}</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 font-display">{f.title}</h3>
                                <p className="text-gray-500">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-4xl font-bold font-display text-gray-900 mb-4">{t('howFarmWiseWorks')}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { step: '1', icon: '📝', title: 'Register', desc: 'Create your farmer profile with land and crop details' },
                            { step: '2', icon: '🧪', title: 'Test Soil', desc: 'Input sensor data and get instant soil health report' },
                            { step: '3', icon: '🤖', title: 'Get AI Advice', desc: 'Receive personalized crop recommendations with yield estimates' },
                            { step: '4', icon: '💰', title: 'Buy & Sell', desc: 'Shop for inputs and sell your harvest at best prices' },
                        ].map((item) => (
                            <div key={item.step} className="text-center">
                                <div className="w-16 h-16 gradient-green rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
                                    {item.icon}
                                </div>
                                <div className="text-xs font-bold text-primary-600 uppercase tracking-wide mb-2">Step {item.step}</div>
                                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 px-6 bg-primary-50">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-4xl font-bold font-display text-gray-900 mb-4">{t('farmersLoveFarmWise')}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((t_item) => (
                            <div key={t_item.name} className="card">
                                <p className="text-gray-700 mb-4 italic">"{t_item.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-200 rounded-full flex items-center justify-center text-xl">👨‍🌾</div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">{t_item.name}</p>
                                        <p className="text-xs text-gray-500">{t_item.location} · {t_item.crop}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 gradient-hero text-white text-center">
                <h2 className="text-4xl font-bold font-display mb-4">{t('readyToFarmSmarter')}</h2>
                <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">{t('ctaSubtitle')}</p>
                <Link to="/register" className="inline-block bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-10 py-4 rounded-xl text-lg transition-all hover:-translate-y-1 hover:shadow-xl">
                    {t('createFreeAccount')}
                </Link>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 px-6">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="flex items-center gap-2 justify-center mb-4">
                        <span className="text-2xl">🌾</span>
                        <span className="text-xl font-bold font-display">FarmWise</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">{t('smartDigitalPlatform')}</p>
                    <p className="text-gray-600 text-xs">© 2025 FarmWise. Made with ❤️ for the farmers of India.</p>
                </div>
            </footer>
        </div>
    )
}
