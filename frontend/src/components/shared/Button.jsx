import React from 'react';

/**
 * Reusable Button component that implements the 3 variants from the Design System.
 */
export default function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  loading = false,
  disabled = false,
  ...props 
}) {
  const baseClasses = "inline-flex items-center justify-center gap-2 font-sans font-medium text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  
  const variants = {
    primary: "px-5 py-2.5 rounded-md bg-accent hover:bg-accent-hover text-white",
    secondary: "px-4 py-2 rounded-md bg-transparent hover:bg-bg-raised text-text-secondary hover:text-text-primary border border-white/10",
    ghost: "px-3 py-1.5 rounded-md bg-transparent hover:bg-bg-raised text-text-muted hover:text-text-secondary"
  };

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${className}`} 
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current flex-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}
