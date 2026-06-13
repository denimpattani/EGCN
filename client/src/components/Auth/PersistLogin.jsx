import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Loader2 } from 'lucide-react';
import api from '../../services/api';
import { setCredentials } from '../../store/authSlice';
import { store } from '../../store';

export default function PersistLogin() {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;

    const verifyRefreshToken = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data.success && isMounted) {
          // The interceptor has already fetched the new accessToken
          dispatch(setCredentials({
            user: response.data.user,
            accessToken: store.getState().auth.accessToken
          }));
        }
      } catch (err) {
        console.error('Session expired or invalid', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (!user) {
      verifyRefreshToken();
    } else {
      setIsLoading(false);
    }

    return () => { isMounted = false; };
  }, [user, dispatch]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-[#8C8C8C] font-display tracking-widest text-sm uppercase">Restoring Session...</p>
      </div>
    );
  }

  return <Outlet />;
}
