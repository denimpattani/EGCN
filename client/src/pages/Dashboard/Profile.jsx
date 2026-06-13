import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Phone, MapPin, Loader2, CheckCircle2, Save } from 'lucide-react';
import api from '../../services/api';
import { setCredentials } from '../../store/authSlice';

import CustomSelect from '../../components/CustomSelect';

// Reusing CustomSelect logic specifically for Profile
const ProfileSelect = ({ label, name, options, value, onChange }) => {
  return (
    <CustomSelect
      label={label}
      options={options}
      value={value}
      onChange={(val) => onChange(name, val)}
    />
  );
};

export default function Profile() {
  const { user, accessToken } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, setValue, watch } = useForm();

  // Load user data into form
  useEffect(() => {
    if (user) {
      setValue('businessName', user.businessName || '');
      setValue('phone', user.phone || '');
      setValue('businessType', user.businessType || 'Retail');
      setValue('businessScale', user.businessScale || '0-5L');
      setValue('address', user.address || '');
      setValue('city', user.city || '');
      setValue('state', user.state || '');
    }
  }, [user, setValue]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');
    setIsSuccess(false);

    try {
      const response = await api.put('/users/profile', data);
      
      if (response.data.success) {
        // Update Redux state with new user data
        dispatch(setCredentials({
          user: response.data.data,
          accessToken: accessToken
        }));
        
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
      }
    } catch (error) {
      setServerError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pt-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1F1F1F]/40"
      >
        <div>
          <h1 className="text-3xl font-bold font-display text-cream mb-2">Business Profile</h1>
          <p className="text-[#8C8C8C]">Update your business details and contact information.</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-lg font-bold text-cream">{user?.businessName}</p>
          <p className="text-sm text-primary font-medium">{user?.plan?.toUpperCase()} PLAN</p>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-[2rem] p-8 shadow-xl mt-4"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* General Section */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-sm font-semibold text-cream tracking-wide uppercase mb-5 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> General Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-[#8C8C8C] mb-1.5 ml-1">Legal Business Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-[#4A4A4A]" />
                  </div>
                  <input
                    {...register('businessName')}
                    className="w-full bg-[#111] border border-[#2A2A2A] rounded-xl pl-11 pr-4 py-3.5 text-cream text-base focus:outline-none focus:ring-1 focus:ring-primary/60 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8C8C8C] mb-1.5 ml-1">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-[#4A4A4A]" />
                  </div>
                  <input
                    {...register('phone')}
                    className="w-full bg-[#111] border border-[#2A2A2A] rounded-xl pl-11 pr-4 py-3.5 text-cream text-base focus:outline-none focus:ring-1 focus:ring-primary/60 transition-colors"
                  />
                </div>
              </div>

              <ProfileSelect
                label="Business Type"
                name="businessType"
                value={watch('businessType')}
                onChange={setValue}
                options={[
                  { value: 'Retail', label: 'Retail' },
                  { value: 'Service', label: 'Service' },
                  { value: 'Manufacturing', label: 'Manufacturing' },
                  { value: 'Other', label: 'Other' },
                ]}
              />

              <ProfileSelect
                label="Annual Turnover"
                name="businessScale"
                value={watch('businessScale')}
                onChange={setValue}
                options={[
                  { value: '0-5L', label: '0 - 5 Lakhs' },
                  { value: '5-15L', label: '5 - 15 Lakhs' },
                  { value: '15L+', label: '15+ Lakhs' },
                ]}
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="h-px bg-[#1F1F1F] w-full" 
          />

          {/* Location Section */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h3 className="text-sm font-semibold text-cream tracking-wide uppercase mb-5 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Location Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#8C8C8C] mb-1.5 ml-1">Street Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-[#4A4A4A]" />
                  </div>
                  <input
                    {...register('address')}
                    className="w-full bg-[#111] border border-[#2A2A2A] rounded-xl pl-11 pr-4 py-3.5 text-cream text-base focus:outline-none focus:ring-1 focus:ring-primary/60 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8C8C8C] mb-1.5 ml-1">City</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-[#4A4A4A]" />
                  </div>
                  <input
                    {...register('city')}
                    className="w-full bg-[#111] border border-[#2A2A2A] rounded-xl pl-11 pr-4 py-3.5 text-cream text-base focus:outline-none focus:ring-1 focus:ring-primary/60 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8C8C8C] mb-1.5 ml-1">State</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-[#4A4A4A]" />
                  </div>
                  <input
                    {...register('state')}
                    className="w-full bg-[#111] border border-[#2A2A2A] rounded-xl pl-11 pr-4 py-3.5 text-cream text-base focus:outline-none focus:ring-1 focus:ring-primary/60 transition-colors"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {serverError && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-primary/10 border border-primary/20 rounded-xl p-3">
                <p className="text-primary text-sm font-medium text-center">{serverError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex justify-end pt-4"
          >
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                isSuccess 
                  ? 'bg-[#4ade80] text-[#0A0A0A] shadow-[0_0_20px_-5px_rgba(74,222,128,0.4)]'
                  : 'bg-primary text-cream hover:bg-primary-hover shadow-lg shadow-primary/20'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </div>
              ) : isSuccess ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Saved!
                </div>
              ) : (
                'Save Changes'
              )}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
