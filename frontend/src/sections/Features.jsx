import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Receipt, Shield, Clock, Users, CreditCard, ChevronRight } from 'lucide-react';

const Features = () => {
  const [hoveredFeature, setHoveredFeature] = useState(null);
  
  const features = [
    {
      icon: <Building2 size={28} />,
      title: "Corporate Dashboard",
      description: "Centralized platform to manage all airport transfers, track expenses, and monitor team travel in real-time.",
      color: "from-primary to-secondary"
    },
    {
      icon: <Receipt size={28} />,
      title: "Simplified Invoicing",
      description: "Consolidated monthly billing with detailed reports for streamlined expense management and cost tracking.",
      color: "from-secondary to-accent"
    },
    {
      icon: <Shield size={28} />,
      title: "Duty of Care",
      description: "Real-time tracking and safety protocols ensure your team members are secure throughout their journey.",
      color: "from-accent to-primary"
    },
    {
      icon: <Clock size={28} />,
      title: "24/7 Availability",
      description: "Round-the-clock support and service availability for international flights and urgent business travel needs.",
      color: "from-primary to-accent"
    },
    {
      icon: <Users size={28} />,
      title: "Corporate Accounts",
      description: "Dedicated account managers and customized service packages tailored to your organization's needs.",
      color: "from-accent to-secondary"
    },
    {
      icon: <CreditCard size={28} />,
      title: "Flexible Payment",
      description: "Multiple payment options with the ability to set departmental budgets and approval workflows.",
      color: "from-secondary to-primary"
    }
  ];

  return (
    <section id="services" className="py-10 bg-background relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <motion.span 
            className="px-4 py-1 bg-primary/10 rounded-full text-primary text-sm font-medium"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Enterprise-Grade Solutions
          </motion.span>
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-text my-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Features Designed for <span className="text-primary">Business Travel</span> Efficiency
          </motion.h2>
          <motion.p 
            className="text-lg text-text/70"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Tailored functionality for corporate travel managers and business administrators to streamline airport and hotel transfers.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg h-full transform transition-transform duration-300 group-hover:-translate-y-2 relative z-10 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center bg-gradient-to-br ${feature.color} text-white`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-bold text-text mb-4 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                <p className="text-text/70 mb-6">{feature.description}</p>
                
                <div className="flex items-center text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Learn more</span>
                  <motion.div
                    animate={hoveredFeature === index ? { x: [0, 5, 0] } : {}}
                    transition={{ duration: 1, repeat: hoveredFeature === index ? Infinity : 0 }}
                  >
                    <ChevronRight size={18} className="ml-1" />
                  </motion.div>
                </div>
                
                <motion.div
                  className="absolute -bottom-3 -right-3 w-20 h-20 bg-gradient-to-tl opacity-10"
                  animate={hoveredFeature === index ? 
                    { rotate: 0, scale: 1 } : 
                    { rotate: 45, scale: 0.8 }
                  }
                  transition={{ duration: 0.5 }}
                  style={{ 
                    borderRadius: "50% 0 50% 0",
                    background: `linear-gradient(to top left, ${hoveredFeature === index ? 'var(--color-accent)' : 'transparent'}, transparent)`
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;