import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/services/supabase'
import type { User, Session } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    setError(null)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    // If user was created, treat as success
    if (data.user) {
      return data
    }
    // Handle errors with useful messages
    if (error) {
      const msg = error.message
      if (msg === '{}' || msg === '' || msg === 'null') {
        setError('注册失败，请检查邮箱是否已被注册，或稍后再试')
      } else {
        setError(msg)
      }
      return null
    }
    return data
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      const msg = error.message
      if (msg === '{}' || msg === '' || msg === 'null') {
        setError('登录失败，请检查邮箱和密码是否正确')
      } else {
        setError(msg)
      }
      return null
    }
    return data
  }, [])

  const signOut = useCallback(async () => {
    setError(null)
    const { error } = await supabase.auth.signOut()
    if (error) {
      setError(error.message)
    }
  }, [])

  return {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
  }
}
