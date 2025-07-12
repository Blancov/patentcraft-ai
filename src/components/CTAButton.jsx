const CTAButton = ({ children, onClick, className = '', variant = 'primary' }) => {
  const baseClasses = "py-3 px-6 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = variant === 'primary' 
    ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
    : "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 focus:ring-blue-500";
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default CTAButton;