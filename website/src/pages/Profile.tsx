import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Check, Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type Order = {
  id: string
  item: string
  price: number
  status: string
}

type Favorite = {
  id: string
  name: string
  price: number
}

export default function Profile() {
  const { user, login } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'favorites'>('profile')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [isWhatsAppSame, setIsWhatsAppSame] = useState(true)

  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [orders, setOrders] = useState<Order[]>([])
  const [favorites, setFavorites] = useState<Favorite[]>([])

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setPhone(user.phone || '')
      setWhatsapp(user.whatsapp || '')
      setIsWhatsAppSame(user.whatsapp === user.phone || !user.whatsapp)
    }

    setOrders([
      { id: '1', item: 'Black Hoodie', price: 1299, status: 'Delivered' },
      { id: '2', item: 'White Shirt', price: 899, status: 'Shipped' }
    ])

    setFavorites([
      { id: '1', name: 'Denim Jacket', price: 1999 },
      { id: '2', name: 'Sneakers', price: 2499 }
    ])
  }, [user])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    setTimeout(() => {
      login({
        name,
        phone,
        whatsapp: isWhatsAppSame ? phone : whatsapp
      })

      setIsSaving(false)
      setSaved(true)
    }, 800)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button onClick={() => navigate('/login')}>Login</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft />
          </button>
          <h1 className="text-xl">My Account</h1>
        </div>

        <div className="flex gap-4 mb-10">
          {['profile', 'orders', 'favorites'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-full text-sm ${
                activeTab === tab ? 'bg-white text-black' : 'bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {activeTab === 'profile' && (
            <motion.form
              key="profile"
              onSubmit={handleSave}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="w-full p-3 bg-white/10 rounded"
              />

              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
                className="w-full p-3 bg-white/10 rounded"
              />

              <div>
                <button
                  type="button"
                  onClick={() => setIsWhatsAppSame(!isWhatsAppSame)}
                  className="flex items-center gap-2"
                >
                  <Check size={16} />
                  Same WhatsApp
                </button>

                {!isWhatsAppSame && (
                  <input
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="WhatsApp"
                    className="w-full mt-3 p-3 bg-white/10 rounded"
                  />
                )}
              </div>

              <button className="w-full bg-white text-black py-3 rounded">
                {isSaving ? 'Saving...' : saved ? 'Saved ✓' : 'Save'}
              </button>
            </motion.form>
          )}

          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {orders.map(order => (
                <div key={order.id} className="p-4 bg-white/10 rounded flex justify-between">
                  <div>
                    <p>{order.item}</p>
                    <p className="text-sm text-white/50">₹{order.price}</p>
                  </div>
                  <span className="text-sm">{order.status}</span>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'favorites' && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-4"
            >
              {favorites.map(item => (
                <div key={item.id} className="p-4 bg-white/10 rounded space-y-2">
                  <p>{item.name}</p>
                  <p className="text-sm text-white/50">₹{item.price}</p>
                  <button className="flex items-center gap-2 text-red-400">
                    <Heart size={14} />
                    Remove
                  </button>
                </div>
              ))}
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  )
}