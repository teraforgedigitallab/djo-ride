import { motion } from 'framer-motion';
import { Calendar, ArrowRight, ChevronRight, Phone, Check, ChevronDown, Send } from 'lucide-react';
import Button from '../components/Button';
import { Link } from 'react-router-dom'

const CTA = () => {
  return (
    <section id="contact" className="py-10 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-90"></div>
      
      <div className="container mx-auto px-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 text-white"
          >
            <motion.h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-white drop-shadow-md"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Ready to streamline your corporate travel?
            </motion.h2>
            <motion.p
              className="text-white text-lg mb-6 max-w-xl drop-shadow"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              Schedule a personalized demo with our team to see how our platform can simplify airport transfers for your entire organization.
            </motion.p>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              {[
                "Dedicated account manager",
                "Custom pricing packages",
                "No implementation fees",
                "30-day free trial"
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-lg shadow-primary/20">
                    <Check size={12} className="text-primary" />
                  </div>
                  <span className="text-white font-medium">{item}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="relative group"
              >
                <Link to='/book'>
                <button className="relative bg-gradient-to-r from-white to-white/90 hover:from-white hover:to-white text-primary py-3 px-6 rounded-lg shadow-xl shadow-primary/20 font-semibold flex items-center gap-2 transition-all duration-300 cursor-pointer w-full md:w-auto align-center justify-center">
                  <Calendar size={18} />
                  Book Now
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 2 }}
                  >
                    <ArrowRight size={18} />
                  </motion.div>
                </button>
                </Link>
              </motion.div>

              <div className="flex items-center gap-2 text-white font-medium bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg border border-white/20 shadow-lg shadow-primary/5 align-center justify-center">
                <Phone size={20} className="text-white" />
                <span>+91 99999 99999</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-6 bg-white rounded-2xl p-8 shadow-2xl border border-white/80 relative overflow-hidden"
          >
            <form id='cta-form' className="space-y-6 relative">
              <h3 className="text-primary text-xl font-semibold mb-6 md:text-2xl">Have some Queries ?</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-800 text-sm font-medium mb-2" htmlFor='firstName'>First Name</label>
                  <input
                    type="text"
                    name='firstName'
                    id='firstName'
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-300"
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <label className="block text-gray-800 text-sm font-medium mb-2" htmlFor='lastName'>Last Name</label>
                  <input
                    type="text"
                    name='lastName'
                    id='lastName'
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-300"
                    placeholder="Your last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-800 text-sm font-medium mb-2" htmlFor='email'>Company Email</label>
                <input
                  type="email"
                  name='email'
                  id='email'
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-300"
                  placeholder="name@company.com"
                  autoComplete='email'
                />
              </div>

              <div>
                <label className="block text-gray-800 text-sm font-medium mb-2" htmlFor='company'>Company</label>
                <input
                  type="text"
                  name='company'
                  id='company'
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-300"
                  placeholder="Your company name"
                  autoComplete='organization'
                />
              </div>

              <div>
                <label className="block text-gray-800 text-sm font-medium mb-2" htmlFor='query'>Query</label>
                <input
                  type="text"
                  name='query'
                  id='query'
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all duration-300"
                  placeholder="Your query"
                  autoComplete='query'
                />
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative mt-8"
              >
                <Button
                  variant="primary"
                  className="relative w-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-3 font-semibold"
                >
                  Submit
                  <Send size={18} />
                </Button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTA;