import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQItem = ({ question, answer, isOpen, onToggle, index }) => {
  return (
    <motion.div 
      className={`border-b border-primary/10 ${isOpen ? 'bg-primary/5 rounded-xl -mx-2 sm:-mx-4 md:-mx-6 px-2 sm:px-4 md:px-6' : ''} transition-all duration-200`}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <button
        className="flex justify-between items-center w-full text-left focus:outline-none py-4 sm:py-5 md:py-6 group"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <h3 className={`text-base sm:text-lg font-medium transition-colors duration-200 ${isOpen ? 'text-primary' : 'text-text group-hover:text-primary/80'}`}>
          {question}
        </h3>
        <span 
          className={`ml-4 sm:ml-6 flex-shrink-0 transition-all duration-200 ${isOpen ? 'text-primary' : 'text-primary/50 group-hover:text-primary/70'}`}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        >
          <ChevronDown size={18} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-4 sm:pb-5 md:pb-6">
              <p className="text-sm sm:text-base text-text/80 leading-relaxed">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FAQItem;