import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

function FloatingBubble({ className, delay }: { className: string; delay: number }) {
  return (
    <motion.div
      className={`absolute rounded-full opacity-15 ${className}`}
      animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 4, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

export function AuthGate() {
  const [mode, setMode] = useState<'login' | 'register'>('login')

  return (
    <div className="h-screen flex items-center justify-center bg-milk-bg relative overflow-hidden">
      <FloatingBubble className="w-32 h-32 bg-milk-primary top-[10%] left-[5%]" delay={0} />
      <FloatingBubble className="w-24 h-24 bg-milk-primary-light top-[20%] right-[8%]" delay={1} />
      <FloatingBubble className="w-40 h-40 bg-milk-primary/60 bottom-[15%] left-[10%]" delay={2} />
      <FloatingBubble className="w-20 h-20 bg-milk-accent/50 bottom-[25%] right-[15%]" delay={0.5} />
      <FloatingBubble className="w-28 h-28 bg-milk-primary-light/70 top-[50%] left-[3%]" delay={1.5} />

      <motion.span className="absolute text-4xl top-[15%] right-[12%]"
        animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}>🫧</motion.span>
      <motion.span className="absolute text-3xl bottom-[20%] left-[8%]"
        animate={{ y: [0, 10, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}>🫧</motion.span>

      <div className="w-full max-w-md px-6 relative z-10">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-3xl
                       bg-white shadow-xl shadow-milk-primary/10 mb-4"
          >
            <span className="text-5xl">🧋</span>
          </motion.div>
          <h1 className="text-3xl font-extrabold text-milk-text tracking-tight">奶茶记录册</h1>
          <p className="text-milk-text-secondary mt-2 text-sm">记录每一杯甜蜜时光 ✨</p>
        </div>

        <motion.div layout
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-milk-primary/5
                     p-8 border border-milk-border/30">
          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                <LoginForm />
              </motion.div>
            ) : (
              <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <RegisterForm onSuccess={() => setMode('login')} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.p className="text-center mt-6 text-milk-text-secondary text-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          {mode === 'login' ? '还没有账号？' : '已经有账号了？'}
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="ml-1 text-milk-primary font-bold hover:text-milk-primary-dark
                       transition-colors underline decoration-milk-primary-light decoration-2 underline-offset-4">
            {mode === 'login' ? '注册一个' : '去登录'}
          </button>
        </motion.p>
      </div>
    </div>
  )
}
