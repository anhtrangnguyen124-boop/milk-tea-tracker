import { useState, FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { LogIn, Mail, Lock } from 'lucide-react'

export function LoginForm() {
  const { signIn, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await signIn(email, password)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-milk-text">欢迎回来</h2>
        <p className="text-milk-text-secondary text-sm mt-1">登录以查看你的奶茶记录</p>
      </div>

      {error && (
        <div className="bg-milk-danger/6 border border-milk-danger/20 text-milk-danger rounded-2xl px-4 py-3 text-sm text-center">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-milk-text ml-1">邮箱</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-milk-primary" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com" required
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-milk-border bg-milk-bg
                       text-milk-text placeholder:text-milk-text-muted text-base
                       focus:outline-none focus:ring-2 focus:ring-milk-primary/20 focus:border-milk-primary transition-all" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-milk-text ml-1">密码</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-milk-primary" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" required minLength={6}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-milk-border bg-milk-bg
                       text-milk-text placeholder:text-milk-text-muted text-base
                       focus:outline-none focus:ring-2 focus:ring-milk-primary/20 focus:border-milk-primary transition-all" />
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full py-3.5 rounded-full bg-milk-primary text-white font-bold text-base
                   shadow-md shadow-milk-primary/15 hover:shadow-lg hover:shadow-milk-primary/25
                   hover:bg-milk-primary-dark active:scale-[0.98]
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200 flex items-center justify-center gap-2">
        {loading ? (<>登录中...</>) : (<><LogIn className="w-5 h-5" />登录</>)}
      </button>
    </form>
  )
}
