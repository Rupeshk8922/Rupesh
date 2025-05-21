import { useState } from 'react'
import { useAuthContext } from './useauthContext'
import { auth } from '../firebase/config'
import { signInWithEmailAndPassword } from 'firebase/auth'

export const useLogin = () => {
  const { dispatch } = useAuthContext()

  const [error, setError] = useState(null)
  const [isPending, setIsPending] = useState(false)
  const login = (email, password) => {
    setError(null)
    setIsPending(true)

    signInWithEmailAndPassword(auth, email, password)
      .then((res) => {
        dispatch({ type: 'LOGIN', payload: res.user })
        setIsPending(false)
      })
      .catch((err) => {
        setError(err.message)
      })
  }

  return { login, error, isPending }
}