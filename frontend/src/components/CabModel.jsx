import React, { useState, useEffect, useRef } from 'react';
import { UserRound, Check, Clock, MapPin, Music, Wind, Gauge, ShieldCheck, Tag, Coffee, Sofa, Umbrella, Car, ChevronDown, Briefcase, ShoppingBag, PlusCircle, MinusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PriceDisplay from './PriceDisplay';

const CabModel = ({ model, carType, capacity, luggage, handbag, image, pricing, features = [], onSelect, selectedPackages, exArrival, exDeparture }) => {
    const [featuresOpen, setFeaturesOpen] = useState(false);
    const [activeTooltip, setActiveTooltip] = useState(null);
    const tooltipRef = useRef(null);

    const handleSelectPackage = (packageType, quantity = 1) => {
        // Find if this package is already selected
        const existingPackageIndex = selectedPackages.findIndex(
            pkg => pkg.model === model && pkg.packageType === packageType
        );

        let updatedPackages;

        if (existingPackageIndex >= 0) {
            // If already selected, update the quantity
            updatedPackages = [...selectedPackages];
            
            // If quantity would be 0 or less, remove the package
            if (updatedPackages[existingPackageIndex].quantity + quantity <= 0) {
                updatedPackages.splice(existingPackageIndex, 1);
            } else {
                updatedPackages[existingPackageIndex] = {
                    ...updatedPackages[existingPackageIndex],
                    quantity: updatedPackages[existingPackageIndex].quantity + quantity
                };
            }
        } else {
            // If not already selected and we're adding (not removing), add it
            if (quantity > 0) {
                const cabInfo = { 
                    model, 
                    carType, 
                    capacity, 
                    luggage, 
                    handbag, 
                    packageType, 
                    price: pricing[packageType],
                    quantity: quantity,
                    ...(packageType === 'airport' && { exArrival, exDeparture })
                };
                updatedPackages = [...selectedPackages, cabInfo];
            } else {
                // If trying to remove a package that doesn't exist, do nothing
                updatedPackages = [...selectedPackages];
            }
        }
        
        onSelect(updatedPackages);
    };

    // Check if a package is selected and get its quantity
    const getPackageQuantity = (packageType) => {
        const existingPackage = selectedPackages.find(
            pkg => pkg.model === model && pkg.packageType === packageType
        );
        return existingPackage ? existingPackage.quantity : 0;
    };

    // Handle click outside to close tooltips
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
                setActiveTooltip(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Toggle tooltip on click
    const toggleTooltip = (tooltipName) => {
        setActiveTooltip(activeTooltip === tooltipName ? null : tooltipName);
    };

    const has4h40km = pricing && pricing['4hr40km'] !== undefined && pricing['4hr40km'] > 0;
    const has8h80km = pricing && pricing['8hr80km'] !== undefined && pricing['8hr80km'] > 0;
    const hasAirport = pricing && pricing['airport'] !== undefined && pricing['airport'] > 0;

    const cardVariants = {
        initial: { opacity: 0, y: 15 },
        animate: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 }
        },
        hover: {
            scale: 1.005,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            transition: { duration: 0.2 }
        }
    };

    const featureItemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.05,
                duration: 0.2
            }
        })
    };

    const getFeatureIcon = (feature) => {
        const text = feature.toLowerCase();
        if (text.includes('music') || text.includes('sound') || text.includes('infotainment'))
            return <Music size={14} className="text-accent" />;
        if (text.includes('air') || text.includes('climate'))
            return <Wind size={14} className="text-accent" />;
        if (text.includes('transmission') || text.includes('auto'))
            return <Gauge size={14} className="text-accent" />;
        if (text.includes('airbag') || text.includes('safety'))
            return <ShieldCheck size={14} className="text-accent" />;
        if (text.includes('seat') || text.includes('leather'))
            return <Sofa size={14} className="text-accent" />;
        if (text.includes('sunroof'))
            return <Umbrella size={14} className="text-accent" />;
        if (text.includes('spacious') || text.includes('cabin'))
            return <Car size={14} className="text-accent" />;
        if (text.includes('cruise'))
            return <Coffee size={14} className="text-accent" />;
        return <Tag size={14} className="text-accent" />;
    };

    return (
        <motion.div
            className="bg-white rounded-lg shadow-sm overflow-visible mb-6 border border-gray-100"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
        >
            <div className="flex flex-col md:flex-row">
                {/* Image and features container */}
                <div className="md:w-2/5 lg:w-1/3 flex flex-col">
                    {/* Image container*/}
                    <div className="h-52 sm:h-60 md:h-44 lg:h-56 bg-gray-100 flex items-center justify-center relative">
                        {image ? (
                            <motion.img
                                src={image}
                                alt={`${model}`}
                                className="w-full h-full object-cover object-center"
                                initial={{ opacity: 0.8 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.4 }}
                            />
                        ) : (
                            <div className="text-gray-400 flex items-center justify-center h-full w-full">
                                <span>Car Image</span>
                            </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 md:hidden">
                            <h3 className="text-white font-bold">{model}</h3>
                            <p className="text-white/90 text-xs">{carType}</p>
                        </div>
                    </div>
                </div>

                <div className="md:w-3/5 lg:w-2/3 p-3 md:p-4 flex flex-col">
                    <div className="flex flex-col md:flex-row justify-between mb-2">
                        <div className="hidden md:block">
                            <motion.h3
                                className="text-lg font-bold text-primary"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1, duration: 0.3 }}
                            >
                                {model}
                            </motion.h3>
                            <motion.p
                                className="text-gray-600 text-sm"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.15, duration: 0.3 }}
                            >
                                {carType}
                            </motion.p>

                        </div>

                        <div className="flex items-center gap-4 mt-2 md:mt-0" ref={tooltipRef}>
                            {/* Capacity */}
                            <motion.span
                                className="relative group inline-flex items-center gap-1 text-sm text-primary mt-1 md:mt-0 bg-primary/10 px-2.5 py-1.5 rounded-lg shadow-sm transition-all"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.3 }}
                                onClick={() => toggleTooltip('capacity')}
                            >
                                <UserRound size={16} />
                                <span>: {capacity || 'N/A'}</span>
                                <AnimatePresence>
                                    {(activeTooltip === 'capacity' || false) && (
                                        <motion.span 
                                            className="absolute left-1/2 -translate-x-1/2 -top-7 bg-primary text-white text-xs font-semibold rounded-md px-3 py-1 shadow-lg z-20 whitespace-nowrap"
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 5 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            Capacity
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                <span className="absolute left-1/2 -translate-x-1/2 -top-7 opacity-0 group-hover:opacity-100 pointer-events-none bg-primary text-white text-xs font-semibold rounded-md px-3 py-1 shadow-lg transition-all duration-200 z-20 whitespace-nowrap md:block hidden">
                                    Capacity
                                </span>
                            </motion.span>
                            
                            {/* Luggage */}
                            <motion.span
                                className="relative group inline-flex items-center gap-1 text-sm text-primary mt-1 md:mt-0 bg-primary/10 px-2.5 py-1.5 rounded-lg shadow-sm transition-all"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.22, duration: 0.3 }}
                                onClick={() => toggleTooltip('luggage')}
                            >
                                <Briefcase size={16} />
                                <span>: {luggage || 'N/A'}</span>
                                <AnimatePresence>
                                    {(activeTooltip === 'luggage' || false) && (
                                        <motion.span 
                                            className="absolute left-1/2 -translate-x-1/2 -top-7 bg-primary text-white text-xs font-semibold rounded-md px-3 py-1 shadow-lg z-20 whitespace-nowrap"
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 5 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            Luggage
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                <span className="absolute left-1/2 -translate-x-1/2 -top-7 opacity-0 group-hover:opacity-100 pointer-events-none bg-primary text-white text-xs font-semibold rounded-md px-3 py-1 shadow-lg transition-all duration-200 z-20 whitespace-nowrap md:block hidden">
                                    Luggage
                                </span>
                            </motion.span>
                            
                            {/* Handbag */}
                            <motion.span
                                className="relative group inline-flex items-center gap-1 text-sm text-primary mt-1 md:mt-0 bg-primary/10 px-2.5 py-1.5 rounded-lg shadow-sm transition-all"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.24, duration: 0.3 }}
                                onClick={() => toggleTooltip('handbag')}
                            >
                                <ShoppingBag size={16} />
                                <span>: {handbag || 'N/A'}</span>
                                <AnimatePresence>
                                    {(activeTooltip === 'handbag' || false) && (
                                        <motion.span 
                                            className="absolute left-1/2 -translate-x-1/2 -top-7 bg-primary text-white text-xs font-semibold rounded-md px-3 py-1 shadow-lg z-20 whitespace-nowrap"
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 5 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            Handbag
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                <span className="absolute left-1/2 -translate-x-1/2 -top-7 opacity-0 group-hover:opacity-100 pointer-events-none bg-primary text-white text-xs font-semibold rounded-md px-3 py-1 shadow-lg transition-all duration-200 z-20 whitespace-nowrap md:block hidden">
                                    Handbag
                                </span>
                            </motion.span>
                        </div>
                    </div>

                    {/* Mobile features section with animation */}
                    {features && features.length > 0 && (
                        <motion.div
                            className="mb-3 md:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                        >


                            {/* Wait time statement */}
                            <motion.p
                                className="text-md font-semibold text-text mb-2 mt-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.18, duration: 0.3 }}
                            >
                                Wait time for Airport: <span className=" text-primary">{exArrival}</span> on Arrival, <span className="text-primary">{exDeparture}</span> on Departure
                            </motion.p>

                            {/* <details
                                className="group"
                                open={featuresOpen}
                                onToggle={(e) => setFeaturesOpen(e.target.open)}
                            >
                                <summary className="text-xs text-primary font-medium flex items-center hover:underline cursor-pointer">
                                    View Features
                                    <ChevronDown
                                        size={12}
                                        className={`ml-1 transition-transform ${featuresOpen ? 'rotate-180' : 'rotate-0'}`}
                                    />
                                </summary>
                                <AnimatePresence>
                                    {featuresOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 pb-1 px-1">
                                                {features.map((feature, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        custom={idx}
                                                        variants={featureItemVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        className="flex items-center gap-1.5 text-xs text-gray-600"
                                                    >
                                                        {getFeatureIcon(feature)}
                                                        <span>{feature}</span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </details> */}
                        </motion.div>
                    )}

                    <motion.div
                        className="space-y-1.5 mt-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25, duration: 0.3 }}
                    >
                        <p className="text-gray-700 text-xs font-medium">Select Package(s):</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">

                            {hasAirport && (
                                <motion.div
                                    className={`flex flex-col p-2 border rounded-md transition-all
                                        ${getPackageQuantity('airport') > 0
                                            ? 'border-primary bg-primary/5'
                                            : 'hover:bg-primary/5 hover:border-primary/30'}`}
                                    initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} 
                                    transition={{ delay: 0.4, duration: 0.2 }}
                                >
                                    <div className="flex items-center text-xs justify-between">
                                        <div className="flex items-center">
                                            <MapPin size={12} className="mr-1" />
                                            <span>Airport Transfer</span>
                                        </div>
                                        {getPackageQuantity('airport') > 0 && <Check size={12} className="ml-auto mr-1 text-primary" />}
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <PriceDisplay
                                            price={pricing['airport']}
                                            className="font-bold text-sm"
                                        />
                                        
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => handleSelectPackage('airport', -1)}
                                                className={`p-1 rounded-full ${getPackageQuantity('airport') > 0 ? 'text-red-500 hover:bg-red-50' : 'text-gray-300 cursor-not-allowed'}`}
                                                disabled={getPackageQuantity('airport') === 0}
                                            >
                                                <MinusCircle size={16} />
                                            </button>
                                            <span className="mx-2 text-sm font-medium w-5 text-center">
                                                {getPackageQuantity('airport')}
                                            </span>
                                            <button
                                                onClick={() => handleSelectPackage('airport', 1)}
                                                className="p-1 text-primary hover:bg-primary/10 rounded-full"
                                            >
                                                <PlusCircle size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {has4h40km && (
                                <motion.div
                                    className={`flex flex-col p-2 border rounded-md transition-all
                                        ${getPackageQuantity('4hr40km') > 0
                                            ? 'border-primary bg-primary/5'
                                            : 'hover:bg-primary/5 hover:border-primary/30'}`}
                                    initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} 
                                    transition={{ delay: 0.3, duration: 0.2 }}
                                >
                                    <div className="flex items-center text-xs justify-between">
                                        <div className="flex items-center">
                                            <Clock size={12} className="mr-1" />
                                            <span>4 Hours / 40 KM</span>
                                        </div>
                                        {getPackageQuantity('4hr40km') > 0 && <Check size={12} className="ml-auto mr-1 text-primary" />}
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <PriceDisplay
                                            price={pricing['4hr40km']}
                                            className="font-bold text-sm"
                                        />
                                        
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => handleSelectPackage('4hr40km', -1)}
                                                className={`p-1 rounded-full ${getPackageQuantity('4hr40km') > 0 ? 'text-red-500 hover:bg-red-50' : 'text-gray-300 cursor-not-allowed'}`}
                                                disabled={getPackageQuantity('4hr40km') === 0}
                                            >
                                                <MinusCircle size={16} />
                                            </button>
                                            <span className="mx-2 text-sm font-medium w-5 text-center">
                                                {getPackageQuantity('4hr40km')}
                                            </span>
                                            <button
                                                onClick={() => handleSelectPackage('4hr40km', 1)}
                                                className="p-1 text-primary hover:bg-primary/10 rounded-full"
                                            >
                                                <PlusCircle size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {has8h80km && (
                                <motion.div
                                    className={`flex flex-col p-2 border rounded-md transition-all
                                        ${getPackageQuantity('8hr80km') > 0
                                            ? 'border-primary bg-primary/5'
                                            : 'hover:bg-primary/5 hover:border-primary/30'}`}
                                    initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} 
                                    transition={{ delay: 0.35, duration: 0.2 }}
                                >
                                    <div className="flex items-center text-xs justify-between">
                                        <div className="flex items-center">
                                            <Clock size={12} className="mr-1" />
                                            <span>8 Hours / 80 KM</span>
                                        </div>
                                        {getPackageQuantity('8hr80km') > 0 && <Check size={12} className="ml-auto mr-1 text-primary" />}
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <PriceDisplay
                                            price={pricing['8hr80km']}
                                            className="font-bold text-sm"
                                        />
                                        
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => handleSelectPackage('8hr80km', -1)}
                                                className={`p-1 rounded-full ${getPackageQuantity('8hr80km') > 0 ? 'text-red-500 hover:bg-red-50' : 'text-gray-300 cursor-not-allowed'}`}
                                                disabled={getPackageQuantity('8hr80km') === 0}
                                            >
                                                <MinusCircle size={16} />
                                            </button>
                                            <span className="mx-2 text-sm font-medium w-5 text-center">
                                                {getPackageQuantity('8hr80km')}
                                            </span>
                                            <button
                                                onClick={() => handleSelectPackage('8hr80km', 1)}
                                                className="p-1 text-primary hover:bg-primary/10 rounded-full"
                                            >
                                                <PlusCircle size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Features section on desktop */}
                        {features && features.length > 0 && (
                            <motion.div
                                className="p-3 hidden md:block"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.3 }}
                            >

                                {/* Wait time statement */}
                                <motion.p
                                    className="text-sm font-semibold text-text mb-2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.18, duration: 0.3 }}
                                >
                                    Wait time for Airport: <span className=" text-primary">{exArrival}</span> on Arrival, <span className="text-primary">{exDeparture}</span> on Departure
                                </motion.p>

                                {/* <h4 className="text-xs font-semibold text-gray-700">Features:</h4>
                                <div className="space-x-5 flex flex-wrap">
                                    {features.map((feature, idx) => (
                                        <motion.div
                                            key={idx}
                                            className="flex items-center gap-2 text-xs text-gray-600 py-1"
                                            initial={{ opacity: 0, x: -5 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.07 }}
                                        >
                                            {getFeatureIcon(feature)}
                                            <span>{feature}</span>
                                        </motion.div>
                                    ))}
                                </div> */}
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default CabModel;