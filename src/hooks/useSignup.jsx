import {
  useState
} from 'react';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  auth
} from 'firebase/auth'
import {
  useAuthContext
} from './useauthContext'

export const useSignup = () => {
  const [error, setError] = useState(null)
  const [isPending, setIsPending] = useState(false)
  const {
    dispatch
  } = useAuthContext()

  const signup = async (email, password, displayName) => {
    setError(null)
    setIsPending(true)
    try {
      // signup user
      const res = await createUserWithEmailAndPassword(auth, email, password)


      if (!res) {
        throw new Error('Could not complete signup')
      }

      // add display name to user
      await updateProfile(res.user, {
        displayName
      })

      // dispatch login action
      dispatch({
        type: 'LOGIN',
        payload: res.user
      })

    } catch (err) {
      console.log(err.message)
      // setError(err.message) // This line is commented out, consider removing
      setError(err.message)
      setIsPending(false)
    }
  }

  return {
    signup
  }
}