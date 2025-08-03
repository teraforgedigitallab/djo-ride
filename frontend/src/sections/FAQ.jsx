import { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Phone } from 'lucide-react';
import FAQItem from '../components/FAQItem';
import Button from '../components/Button';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);
  
  const faqs = [
    {
      question: "How does corporate billing work?",
      answer: "We provide consolidated monthly invoicing with detailed reports showing all transfers by department, employee, cost center, or any other parameter you specify. Invoices can be delivered electronically or via traditional mail, and we support multiple payment methods including ACH, wire transfers, and credit cards."
    },
    {
      question: "Can we set different service levels for different employees?",
      answer: "Yes, our platform allows you to define service tiers based on employee seniority, department, or other criteria. You can customize vehicle types, waiting times, and additional services for each tier, ensuring appropriate service levels while maintaining cost control."
    },
    {
      question: "How do you handle flight delays?",
      answer: "Our system automatically tracks flight information and adjusts pickup times accordingly. Drivers receive real-time updates about flight status, ensuring they're always there when your employees land, regardless of delays or early arrivals. There are no additional charges for adjusted wait times due to flight changes."
    },
    {
      question: "Is there a minimum commitment or contract required?",
      answer: "We offer flexible terms tailored to your organization's needs. While our most competitive rates are available with annual commitments, we also provide month-to-month options. Our account managers can work with you to determine the best arrangement for your specific requirements."
    },
    {
      question: "How do you ensure driver quality and safety?",
      answer: "All drivers undergo rigorous background checks, have professional licenses, and receive regular training. Vehicles in our network are regularly inspected and must meet our strict quality standards. Our platform includes real-time tracking and a rating system to ensure consistent service quality."
    }
  ];

  return (
    <section id="faq" className="py-10 relative overflow-hidden">
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
          <motion.div
            className="lg:w-5/12"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="sticky top-24 lg:top-32">
              <motion.span 
                className="px-3 py-1 bg-primary/10 rounded-full text-primary text-xs sm:text-sm font-medium inline-block"
                initial={{ opacity: 0, y: -8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                FAQ
              </motion.span>
              <motion.h2 
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-text mt-3 sm:mt-4 mb-4 sm:mb-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                Frequently Asked <span className="text-primary">Questions</span>
              </motion.h2>
              <motion.p 
                className="text-base sm:text-lg text-text/70 mb-6 sm:mb-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                Get answers to common questions about our corporate airport transfer services. If you can't find what you're looking for, our team is ready to help.
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <Button className="flex items-center gap-2 hover:shadow-lg transition-all">
                  <HelpCircle size={18} />
                  Contact Support
                </Button>
              </motion.div>
              
              <motion.div 
                className="mt-8 sm:mt-10 md:mt-12 p-4 sm:p-5 md:p-6 border border-primary/20 rounded-xl md:rounded-2xl bg-white/50 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <h3 className="font-semibold text-base sm:text-lg mb-2 text-primary">Still have questions?</h3>
                <p className="text-sm sm:text-base text-text/70 mb-3 sm:mb-4">Our team is just a call away. Get personalized answers to all your corporate transportation questions.</p>
                <div className="flex items-center gap-2 text-lg font-bold text-text">
                  <Phone size={18} className="text-primary" />
                  <span>+91 99999 99999</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div
            className="lg:w-7/12"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 sm:p-5 md:p-6 hover:shadow-xl transition-shadow">
              {faqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={index === openIndex}
                  onToggle={() => setOpenIndex(index === openIndex ? null : index)}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;