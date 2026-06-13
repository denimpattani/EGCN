import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Mail, Lock, Phone, MapPin, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import AntiGravityNetwork from '../../components/AntiGravityNetwork';

const signupSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(8, 'Min 8 characters required'),
  businessName: z.string().min(2, 'Business name is required'),
  businessType: z.enum(['Retail', 'Service', 'Manufacturing', 'Other']),
  businessScale: z.enum(['0-5L', '5-15L', '15L+']),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Must be a 10-digit number'),
});

const InputField = ({ label, name, type = 'text', icon: Icon, placeholder, colSpan = 'col-span-1', register, errors }) => (
  <div className={colSpan}>
    <label className="block text-xs font-medium text-[#8C8C8C] mb-1.5 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
        <Icon className="h-4 w-4 text-[#5C5C5C] group-focus-within:text-primary transition-colors" />
      </div>
      <input
        {...register(name)}
        type={type}
        placeholder={placeholder}
        className="w-full bg-[#111] border border-[#2A2A2A] rounded-xl py-3 pl-10 pr-4 text-cream text-base placeholder-[#4C4C4C] focus:outline-none focus:ring-1 focus:ring-primary/60 focus:border-primary/60 hover:border-[#3A3A3A] transition-all shadow-inner"
      />
    </div>
    <AnimatePresence>
      {errors[name] && (
        <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-primary text-[11px] mt-1 ml-1 font-medium">
          {errors[name]?.message}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

import CustomSelectComponent from '../../components/CustomSelect';

const CustomSelect = ({ label, name, options, register, errors, watch, setValue }) => {
  const selectedValue = watch(name);

  return (
    <div>
      {/* Hidden native input for react-hook-form to register correctly */}
      <input type="hidden" {...register(name)} value={selectedValue || options[0].value} />

      <CustomSelectComponent
        label={label}
        options={options}
        value={selectedValue || options[0].value}
        onChange={(val) => setValue(name, val, { shouldValidate: true })}
      />
    </div>
  );
};

export default function Signup() {
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: 'onTouched',
  });

  const emailValue = watch('email');
  const generatedUsername = emailValue && emailValue.includes('@') ? emailValue.split('@')[0] : '';

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');
    try {
      const response = await api.post('/auth/signup', data);
      if (response.data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/verify-email', { state: { email: data.email } });
        }, 2000);
      }
    } catch (error) {
      setServerError(error.response?.data?.message || 'Registration failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center items-center p-4 relative overflow-hidden py-12">
      <AntiGravityNetwork />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[850px] relative z-10"
      >
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-cream mb-3">Welcome to EGCN</h1>
          <p className="text-[#8C8C8C] text-sm md:text-base max-w-md mx-auto">Create your account and digitise your business advisory workflow instantly.</p>
        </div>

        {/* Form Container */}
        <div className="bg-[#0A0A0A]/90 backdrop-blur-xl border border-[#1F1F1F] rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
          {/* Top Edge Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

            {/* Account Credentials Section */}
            <div>
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#1A1A1A]">
                <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                </div>
                <h2 className="text-sm font-semibold text-cream tracking-wide uppercase">Account Credentials</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <InputField register={register} errors={errors} label="Email Address" name="email" type="email" icon={Mail} placeholder="you@company.com" />
                  <AnimatePresence>
                    {generatedUsername && (
                      <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-[#4ade80] text-[13px] mt-1 ml-1 font-medium">
                        Username: {generatedUsername}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <InputField register={register} errors={errors} label="Password" name="password" type="password" icon={Lock} placeholder="Min. 8 characters" />
              </div>
            </div>

            {/* Business Details Section */}
            <div>
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#1A1A1A]">
                <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                </div>
                <h2 className="text-sm font-semibold text-cream tracking-wide uppercase">Business Profile</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField register={register} errors={errors} label="Legal Business Name" name="businessName" icon={Building2} placeholder="Company Ltd" />
                <InputField register={register} errors={errors} label="Phone Number" name="phone" icon={Phone} placeholder="10-digit number" />

                <CustomSelect
                  label="Business Type"
                  name="businessType"
                  watch={watch}
                  setValue={setValue}
                  register={register}
                  errors={errors}
                  options={[
                    { value: 'Retail', label: 'Retail' },
                    { value: 'Service', label: 'Service' },
                    { value: 'Manufacturing', label: 'Manufacturing' },
                    { value: 'Other', label: 'Other' },
                  ]}
                />

                <CustomSelect
                  label="Annual Turnover"
                  name="businessScale"
                  watch={watch}
                  setValue={setValue}
                  register={register}
                  errors={errors}
                  options={[
                    { value: '0-5L', label: '0 - 5 Lakhs' },
                    { value: '5-15L', label: '5 - 15 Lakhs' },
                    { value: '15L+', label: '15+ Lakhs' },
                  ]}
                />

                <InputField register={register} errors={errors} label="Street Address" name="address" icon={MapPin} placeholder="Full street address" colSpan="md:col-span-2" />

                <InputField register={register} errors={errors} label="City" name="city" icon={MapPin} placeholder="City name" />
                <InputField register={register} errors={errors} label="State" name="state" icon={MapPin} placeholder="State name" />
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {serverError && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                  <p className="text-primary text-sm text-center font-medium">{serverError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className={`w-full font-semibold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:pointer-events-none ${isSuccess
                  ? 'bg-[#4ade80] text-[#0A0A0A] shadow-[0_0_30px_-5px_rgba(74,222,128,0.4)] scale-[1.02]'
                  : 'bg-primary hover:bg-primary-hover text-cream shadow-[0_0_25px_-5px_rgba(215,67,57,0.3)] hover:shadow-[0_0_35px_-5px_rgba(215,67,57,0.4)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70'
                  }`}
              >
                <AnimatePresence mode="wait">
                  {isSuccess ? (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" /> Registration Successful!
                    </motion.div>
                  ) : isLoading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </motion.div>
                  ) : (
                    <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      Create Account <ArrowRight className="h-5 w-5 ml-1" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              <AnimatePresence>
                {isSuccess && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[#4ade80] text-sm text-center mt-4 font-medium">
                    Sending verification email...
                  </motion.p>
                )}
              </AnimatePresence>

              <p className="text-center text-[#6C6C6C] text-sm mt-6">
                Already have an account?{' '}
                <Link to="/signin" className="relative group text-cream font-medium transition-colors">
                  Sign in instead
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#d74339] transition-all duration-300 group-hover:w-full rounded-full" />
                </Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
