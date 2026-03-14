import { useState, useEffect } from 'react'
import { marketplaceAPI } from '../api/services'
import { FiShoppingCart, FiSearch, FiMinus, FiPlus, FiTrash2, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function MarketplacePage() {
    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [cart, setCart] = useState([])
    const [selectedCat, setSelectedCat] = useState(null)
    const [search, setSearch] = useState('')
    const [tab, setTab] = useState('shop')
    const [checkoutDone, setCheckoutDone] = useState(false)
    const [loading, setLoading] = useState(false)
    const [deliveryAddress, setDeliveryAddress] = useState('')

    useEffect(() => {
        marketplaceAPI.getCategories().then(r => setCategories(r.data || [])).catch(() => { })
        marketplaceAPI.getProducts().then(r => setProducts(r.data || [])).catch(() => { })
    }, [])

    useEffect(() => {
        const params = {}
        if (selectedCat) params.category = selectedCat
        if (search) params.search = search
        marketplaceAPI.getProducts(params).then(r => setProducts(r.data || [])).catch(() => { })
    }, [selectedCat, search])

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === product.id)
            if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
            return [...prev, { ...product, qty: 1 }]
        })
        toast.success(`${product.name} added to cart 🛒`)
    }

    const updateQty = (id, delta) => {
        setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0))
    }

    const cartTotal = cart.reduce((s, i) => s + (i.discounted_price || i.price) * i.qty, 0)
    const cartCount = cart.reduce((s, i) => s + i.qty, 0)

    const checkout = async () => {
        if (!deliveryAddress.trim()) { toast.error('Please enter delivery address'); return }
        setLoading(true)
        try {
            await marketplaceAPI.placeOrder({
                items: cart.map(i => ({ product_id: i.id, quantity: i.qty })),
                delivery_address: deliveryAddress,
            })
            setCheckoutDone(true)
            setCart([])
            toast.success('🎉 Order placed successfully!')
        } catch {
            toast.error('Order failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-title">🛒 Krishi Bhandhu Sampadha</h1>
                <p className="page-subtitle">Buy seeds, fertilizers, pesticides, tools and irrigation at best prices</p>
            </div>

            <div className="flex gap-2 mb-6 border-b border-gray-200">
                {[['shop', '🛍️ Shop'], ['cart', `🛒 Cart (${cartCount})`]].map(([key, label]) => (
                    <button key={key} onClick={() => setTab(key)}
                        className={`px-5 py-2.5 font-semibold text-sm rounded-t-xl transition-colors ${tab === key ? 'bg-white border border-b-white border-gray-200 text-primary-600 -mb-px' : 'text-gray-500 hover:text-gray-700'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {tab === 'shop' && (
                <div>
                    {/* Search + Filter */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-5">
                        <div className="relative flex-1">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input className="input pl-11" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <button onClick={() => setSelectedCat(null)} className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${!selectedCat ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}>All</button>
                            {categories.map(cat => (
                                <button key={cat.id} onClick={() => setSelectedCat(cat.id)} className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${selectedCat === cat.id ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}>
                                    {cat.icon} {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {products.map(product => {
                            const cartItem = cart.find(i => i.id === product.id)
                            const finalPrice = product.discounted_price || product.price
                            return (
                                <div key={product.id} className="card-hover flex flex-col">
                                    <div className="h-32 bg-gradient-to-br from-primary-50 to-green-100 rounded-xl flex items-center justify-center text-5xl mb-4">
                                        {product.category_name === 'Seeds' ? '🌱' : product.category_name === 'Fertilizers' ? '🧪' : product.category_name === 'Pesticides' ? '🛡️' : product.category_name === 'Irrigation' ? '💧' : '🔧'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-1">{product.category_name}</p>
                                        <h3 className="font-bold text-gray-900 mb-1 text-sm leading-tight">{product.name}</h3>
                                        {product.brand && <p className="text-xs text-gray-400 mb-2">{product.brand}</p>}
                                        <div className="flex items-center gap-1 mb-3">
                                            {'⭐'.repeat(Math.floor(product.rating))}
                                            <span className="text-xs text-gray-400">{product.rating}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <div>
                                            <span className="text-lg font-bold text-gray-900">₹{Number(finalPrice).toFixed(0)}</span>
                                            <span className="text-xs text-gray-400">/{product.unit}</span>
                                            {product.discount_percent > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs line-through text-gray-400">₹{Number(product.price).toFixed(0)}</span>
                                                    <span className="text-xs text-red-500 font-semibold">{product.discount_percent}% off</span>
                                                </div>
                                            )}
                                        </div>
                                        {cartItem ? (
                                            <div className="flex items-center gap-2 bg-primary-50 rounded-xl px-2 py-1">
                                                <button onClick={() => updateQty(product.id, -1)} className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center hover:bg-primary-200"><FiMinus className="w-3 h-3" /></button>
                                                <span className="font-bold text-primary-700 w-4 text-center">{cartItem.qty}</span>
                                                <button onClick={() => updateQty(product.id, 1)} className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700"><FiPlus className="w-3 h-3" /></button>
                                            </div>
                                        ) : (
                                            <button onClick={() => addToCart(product)} className="btn-primary text-xs px-3 py-2">Add to Cart</button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {tab === 'cart' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-3">
                        {checkoutDone ? (
                            <div className="card text-center py-16">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiCheck className="w-10 h-10 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Placed! 🎉</h3>
                                <p className="text-gray-500 mb-6">Your order has been confirmed. Items will be delivered to your farm.</p>
                                <button onClick={() => { setCheckoutDone(false); setTab('shop') }} className="btn-primary">Continue Shopping</button>
                            </div>
                        ) : cart.length > 0 ? cart.map(item => (
                            <div key={item.id} className="card flex items-center gap-4">
                                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                                    {item.category_name === 'Seeds' ? '🌱' : item.category_name === 'Fertilizers' ? '🧪' : item.category_name === 'Pesticides' ? '🛡️' : item.category_name === 'Irrigation' ? '💧' : '🔧'}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                    <p className="text-sm text-gray-500">₹{Number(item.discounted_price || item.price).toFixed(0)}/{item.unit}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"><FiMinus className="w-3.5 h-3.5" /></button>
                                    <span className="font-bold text-gray-900 w-6 text-center">{item.qty}</span>
                                    <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700"><FiPlus className="w-3.5 h-3.5" /></button>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">₹{(Number(item.discounted_price || item.price) * item.qty).toFixed(0)}</p>
                                </div>
                                <button onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))} className="text-red-400 hover:text-red-600"><FiTrash2 /></button>
                            </div>
                        )) : (
                            <div className="card text-center py-16">
                                <p className="text-gray-400 text-5xl mb-3">🛒</p>
                                <p className="text-gray-500 mb-4">Your cart is empty</p>
                                <button onClick={() => setTab('shop')} className="btn-primary">Browse Products</button>
                            </div>
                        )}
                    </div>

                    {cart.length > 0 && !checkoutDone && (
                        <div className="card h-fit sticky top-4">
                            <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
                            <div className="space-y-2 mb-4 text-sm">
                                {cart.map(i => (
                                    <div key={i.id} className="flex justify-between text-gray-600">
                                        <span>{i.name} × {i.qty}</span>
                                        <span>₹{(Number(i.discounted_price || i.price) * i.qty).toFixed(0)}</span>
                                    </div>
                                ))}
                                <div className="border-t pt-2 flex justify-between font-bold text-gray-900 text-base">
                                    <span>Total</span>
                                    <span>₹{cartTotal.toFixed(0)}</span>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="label">Delivery Address</label>
                                <textarea className="input resize-none" rows={2} value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} placeholder="Village, District, State, PIN" required />
                            </div>
                            <button onClick={checkout} disabled={loading} className="btn-primary w-full py-4">
                                {loading ? 'Placing Order...' : `Place Order – ₹${cartTotal.toFixed(0)}`}
                            </button>
                            <p className="text-xs text-gray-400 text-center mt-3">Free delivery on orders above ₹999</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
