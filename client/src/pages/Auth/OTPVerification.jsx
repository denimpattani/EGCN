import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, MailCheck, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice';
import AntiGravityNetwork from '../../components/AntiGravityNetwork';

export default function OTPVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const email = location.state?.email;
  
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  if (!email) {
    return <Navigate to="/signup" replace />;
  }

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    // Allow pasting full code
    if (value.length > 1) {
      const pastedData = value.slice(0, 6).split('');
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      // Focus last filled input
      const focusIndex = Math.min(pastedData.length, 5);
      inputRefs[focusIndex].current.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value !== '' && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const verifyOTP = async (currentOtp) => {
    const otpValue = currentOtp || otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/verify-email', { email, otp: otpValue });
      
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
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code');
      setIsLoading(false);
    }
  };

  // Auto-verify when 6 digits are entered
  useEffect(() => {
    const otpValue = otp.join('');
    if (otpValue.length === 6 && !isLoading) {
      verifyOTP(otpValue);
    }
  }, [otp]);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <AntiGravityNetwork />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-[2rem] p-10 shadow-2xl relative overflow-hidden text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <MailCheck className="h-8 w-8 text-primary" />
          </div>
          
          <h1 className="font-display text-2xl font-bold text-cream mb-2">Check your email</h1>
          <p className="text-[#8C8C8C] text-sm mb-8">
            We sent a 6-digit verification code to<br/>
            <span className="text-cream font-medium">{email}</span>
          </p>

          <div className="flex justify-center gap-3 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                maxLength={6}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 bg-[#111] border border-[#2A2A2A] rounded-xl text-center text-xl text-cream font-bold focus:outline-none focus:border-primary/60 focus:bg-[#151515] transition-all"
              />
            ))}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <p className="text-primary text-sm font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => verifyOTP()}
            disabled={isLoading || isSuccess || otp.join('').length !== 6}
            className={`w-full font-semibold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:pointer-events-none ${
              isSuccess 
                ? 'bg-[#4ade80] text-[#0A0A0A] shadow-[0_0_30px_-5px_rgba(74,222,128,0.4)] scale-[1.02]' 
                : 'bg-primary hover:bg-primary-hover text-cream shadow-lg shadow-primary/20 disabled:opacity-50'
            }`}
          >
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" /> Verification Successful!
                </motion.div>
              ) : isLoading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Loader2 className="h-5 w-5 animate-spin" />
                </motion.div>
              ) : (
                <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Verify Account
                </motion.div>
              )}
            </AnimatePresence>
          </button>
          
          <AnimatePresence>
            {isSuccess && (
              <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[#4ade80] text-sm text-center mt-4 font-medium">
                Welcome to your dashboard...
              </motion.p>
            )}
          </AnimatePresence>

          <p className="text-[#6C6C6C] text-xs mt-6">
            Didn't receive the email? <button className="text-cream hover:text-primary transition-colors">Click to resend</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
