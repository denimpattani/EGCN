import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Lock, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice';
import AntiGravityNetwork from '../../components/AntiGravityNetwork';

const signinSchema = z.object({
  email: z.string().min(1, 'Email or Username is required').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export default function Signin() {
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signinSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');
    try {
      let loginUrl = '/auth/signin';
      const emailLower = data.email.toLowerCase().trim();

      if (emailLower === 'egcnetworkofficial@gmail.com' || emailLower === 'admin') {
        loginUrl = '/admin/auth/login';
      }

      let response;
      try {
        response = await api.post(loginUrl, data);
      } catch (err) {
        // If standard client sign-in failed, attempt Expert login automatically
        if (loginUrl === '/auth/signin' && (err.response?.status === 401 || err.response?.status === 404)) {
          try {
            response = await api.post('/expert/auth/login', data);
          } catch (expErr) {
            throw err; // Throw original error if expert login also fails
          }
        } else {
          throw err;
        }
      }

      if (response.data.success) {
        dispatch(setCredentials({
          user: response.data.user,
          accessToken: response.data.accessToken
        }));
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 2000);
      }
    } catch (error) {
      if (error.response?.data?.requiresVerification) {
        navigate('/verify-email', { state: { email: data.email } });
      } else {
        setServerError(error.response?.data?.message || 'Invalid email/username or password');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <AntiGravityNetwork />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[500px] relative z-10"
      >
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-bold text-cream mb-3">Welcome back</h1>
          <p className="text-[#8C8C8C]">Enter your credentials to access your dashboard</p>
        </div>

        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle inner top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-cream mb-2 ml-1">Email or Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#5C5C5C]" />
                </div>
                <input
                  {...register('email')}
                  type="text"
                  placeholder="you@company.com"
                  className="w-full bg-[#111] border border-[#2A2A2A] rounded-xl py-3.5 pl-11 pr-4 text-cream placeholder-[#5C5C5C] focus:outline-none focus:ring-1 focus:ring-primary/60 focus:border-primary/60 transition-colors"
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-primary text-xs mt-2 ml-1">
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <div className="mb-2 ml-1">
                <label className="block text-sm font-medium text-cream">Password</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#5C5C5C]" />
                </div>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-[#111] border border-[#2A2A2A] rounded-xl py-3.5 pl-11 pr-4 text-cream placeholder-[#5C5C5C] focus:outline-none focus:ring-1 focus:ring-primary/60 focus:border-primary/60 transition-colors"
                />
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-primary text-sm mt-2 ml-1 font-medium">
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
              
              <div className="flex justify-end mt-2">
                <Link to="/forgot-password" className="text-sm font-medium text-[#8C8C8C] hover:text-primary transition-colors duration-300">
                  Forgot password?
                </Link>
              </div>
            </div>

            <AnimatePresence>
              {serverError && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-primary/10 border border-primary/20 rounded-xl p-3">
                  <p className="text-primary text-sm text-center font-medium">{serverError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className={`w-full font-semibold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 mt-6 disabled:pointer-events-none ${isSuccess
                  ? 'bg-[#4ade80] text-[#0A0A0A] shadow-[0_0_30px_-5px_rgba(74,222,128,0.4)] scale-[1.02]'
                  : 'bg-primary hover:bg-primary-hover text-cream shadow-[0_0_25px_-5px_rgba(215,67,57,0.3)] hover:shadow-[0_0_35px_-5px_rgba(215,67,57,0.4)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70'
                }`}
            >
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" /> Login Successful!
                  </motion.div>
                ) : isLoading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </motion.div>
                ) : (
                  <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    Sign In <ArrowRight className="h-5 w-5 ml-1" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <AnimatePresence>
              {isSuccess && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[#4ade80] text-sm text-center mt-4 font-medium">
                  Welcome back! Loading dashboard...
                </motion.p>
              )}
            </AnimatePresence>
          </form>
        </div>

        <p className="text-center text-[#6C6C6C] text-sm mt-8">
          Don't have an account?{' '}
          <Link to="/signup" className="relative group text-cream font-medium transition-colors">
            Create an account
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#d74339] transition-all duration-300 group-hover:w-full rounded-full" />
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
