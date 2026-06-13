import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomSelect({
  label,
  options,
  value,
  onChange,
  className = '',
  containerClassName = '',
  size = 'md', // 'sm' or 'md'
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  const sizeClasses = {
    sm: {
      button: 'py-2.5 px-4 text-sm rounded-xl',
      dropdown: 'mt-2 py-1 rounded-xl text-xs',
      item: 'px-4 py-2.5 text-xs',
    },
    md: {
      button: 'py-3.5 px-4 text-base rounded-xl',
      dropdown: 'mt-2 py-1 rounded-xl text-sm',
      item: 'px-4 py-3 text-sm',
    }
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`relative ${containerClassName}`}>
      {label && (
        <label className="block text-xs font-medium text-[#8C8C8C] mb-1.5 ml-1">{label}</label>
      )}

      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-[#111] border text-cream transition-colors shadow-inner cursor-pointer flex justify-between items-center ${currentSize.button} ${isOpen ? 'border-primary/60 ring-1 ring-primary/60' : 'border-[#2A2A2A] hover:border-[#3A3A3A]'
          } ${className}`}
      >
        <span>{selectedOption?.label}</span>
        <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : 'text-[#5C5C5C]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Click outside overlay */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-xl overflow-hidden py-1"
            >
              {options.map((option) => (
                <div
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`cursor-pointer transition-colors flex justify-between items-center group ${currentSize.item} ${value === option.value ? 'bg-[#252525] text-primary font-medium' : 'text-cream'
                    } hover:bg-primary hover:text-cream`}
                >
                  <span>{option.label}</span>
                  {value === option.value && (
                    <svg className="w-4 h-4 text-primary group-hover:text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
