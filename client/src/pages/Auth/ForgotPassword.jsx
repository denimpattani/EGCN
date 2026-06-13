import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import AntiGravityNetwork from '../../components/AntiGravityNetwork';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address').toLowerCase(),
});

export default function ForgotPassword() {
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');
    
    try {
      const response = await api.post('/auth/forgot-password', data);
      
      if (response.data.success) {
        setIsSuccess(true);
      }
    } catch (error) {
      setServerError(error.response?.data?.message || 'Failed to send reset email');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <AntiGravityNetwork />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-[2rem] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-20" />
          
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl font-bold text-cream mb-3 tracking-tight">Forgot Password</h1>
            <p className="text-[#8C8C8C] text-base font-medium">Enter your email to receive a reset link.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#8C8C8C] mb-2 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#4A4A4A] group-focus-within:text-primary transition-colors duration-300" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className={`w-full bg-[#111] border ${
                    errors.email ? 'border-primary/50' : 'border-[#2A2A2A]'
                  } rounded-xl pl-12 pr-4 py-4 text-cream text-base focus:outline-none focus:border-primary/60 focus:bg-[#151515] transition-all duration-300`}
                  placeholder="you@company.com"
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-primary text-sm mt-2 ml-1 font-medium">
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {serverError && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                  <p className="text-primary text-sm text-center font-medium">{serverError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className={`w-full font-semibold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 mt-6 disabled:pointer-events-none ${
                isSuccess 
                  ? 'bg-[#4ade80] text-[#0A0A0A] shadow-[0_0_30px_-5px_rgba(74,222,128,0.4)] scale-[1.02]' 
                  : 'bg-primary hover:bg-primary-hover text-cream shadow-[0_0_25px_-5px_rgba(215,67,57,0.3)] hover:shadow-[0_0_35px_-5px_rgba(215,67,57,0.4)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70'
              }`}
            >
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" /> Link Sent!
                  </motion.div>
                ) : isLoading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </motion.div>
                ) : (
                  <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    Send Reset Link <ArrowRight className="h-5 w-5 ml-1" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <AnimatePresence>
              {isSuccess && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[#4ade80] text-sm text-center mt-4 font-medium">
                  Please check your email inbox.
                </motion.p>
              )}
            </AnimatePresence>
          </form>
        </div>

        <p className="text-center text-[#6C6C6C] text-sm mt-8">
          Remember your password?{' '}
          <Link to="/signin" className="relative group text-cream font-medium transition-colors">
            Sign In
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#d74339] transition-all duration-300 group-hover:w-full rounded-full" />
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
