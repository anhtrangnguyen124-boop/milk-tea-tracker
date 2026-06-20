import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { UserPlus, Mail, Lock, Sparkles } from 'lucide-react'

interface Props {
  onSuccess: () => void
}

export function RegisterForm({ onSuccess }: Props) {
  const { signUp, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const result = await signUp(email, password)
    setLoading(false)
    if (result) {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-5 py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-2xl bg-milk-primary/10 flex items-center justify-center mx-auto"
        >
          <span className="text-4xl">🎉</span>
        </motion.div>
        <div>
          <h2 className="text-2xl font-extrabold text-milk-text">注册成功！</h2>
          <p className="text-milk-text-secondary text-sm mt-2">欢迎加入奶茶记录册</p>
        </div>
        <button
          onClick={onSuccess}
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-milk-primary to-emerald-500
                     text-white font-bold shadow-lg shadow-milk-primary/30
                     hover:shadow-xl transition-all"
        >
          去登录
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-milk-text">创建账号</h2>
        <p className="text-milk-text-muted text-sm mt-1">开始记录你的奶茶旅程</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl px-4 py-3 text-sm text-center">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-milk-text ml-1">邮箱</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-milk-primary" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-milk-border bg-milk-bg/50
                       text-milk-text placeholder:text-milk-text-muted text-base
                       focus:outline-none focus:ring-4 focus:ring-milk-primary/20 focus:border-milk-primary
                       transition-all"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-milk-text ml-1">密码</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-milk-primary" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="至少 6 位密码"
            required
            minLength={6}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-milk-border bg-milk-bg/50
                       text-milk-text placeholder:text-milk-text-muted text-base
                       focus:outline-none focus:ring-4 focus:ring-milk-primary/20 focus:border-milk-primary
                       transition-all"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-milk-primary to-emerald-500
                   text-white font-bold text-base shadow-lg shadow-milk-primary/30
                   hover:shadow-xl hover:shadow-milk-primary/40 hover:from-milk-primary-dark hover:to-emerald-600
                   active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Sparkles className="w-5 h-5 animate-spin" />
            注册中...
          </>
        ) : (
          <>
            <UserPlus className="w-5 h-5" />
            注册
          </>
        )}
      </button>
    </form>
  )
}
