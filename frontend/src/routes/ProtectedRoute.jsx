import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { refreshAuth } from '../features/auth/authSlice'

function ProtectedRoute() {
  const dispatch = useDispatch()
  const { user, checkingAuth, authChecked } = useSelector((state) => state.auth)

  useEffect(() => {
    if (!user && !checkingAuth && !authChecked) {
      dispatch(refreshAuth())
    }
  }, [authChecked, checkingAuth, dispatch, user])

  if (checkingAuth || !authChecked) {
    return <div className="loading">loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
