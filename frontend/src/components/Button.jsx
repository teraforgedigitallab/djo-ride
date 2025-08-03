import { motion } from 'framer-motion';

const Button = ({ children, variant = 'primary', size = 'md', className = '', onClick, ...props }) => {
  const baseClasses = "font-medium rounded-xl transition-all duration-300 flex items-center justify-center relative overflow-hidden group cursor-pointer ";
  
  const variantClasses = {
    primary: "bg-primary text-white hover:shadow-md hover:shadow-primary/30",
    secondary: "bg-secondary text-white hover:shadow-lg hover:shadow-secondary/30",
    accent: "bg-accent text-white hover:shadow-sm hover:shadow-accent/30",
    outline: "border-2 border-primary text-primary hover:bg-primary/5",
    ghost: "text-primary hover:bg-primary/5"
  };
  
  const sizeClasses = {
    sm: "text-sm py-2 px-4",
    md: "text-base py-3 px-5",
    lg: "text-lg py-3.5 px-7"
  };
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {variant !== 'ghost' && variant !== 'outline' && (
        <motion.span 
          className="absolute top-0 left-0 w-full h-full bg-white/20 transform -translate-x-full"
          animate={{ x: ["0%", "200%"] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear", repeatDelay: 2 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
};

export default Button;