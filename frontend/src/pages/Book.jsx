import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Calendar, CheckCircle, Trash2, MinusCircle, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CitySelector from '../components/CitySelector';
import CabModel from '../components/CabModel';
import BookingForm from '../components/BookingForm';
import PriceDisplay from '../components/PriceDisplay';
import data from '../data/data.json';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const Book = () => {
    const [selectedCity, setSelectedCity] = useState(null);
    const [availableModels, setAvailableModels] = useState([]);
    const [selectedPackages, setSelectedPackages] = useState([]);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const selectedCabRef = useRef(null);

    const { user } = useAuth();
    const [userData, setUserData] = useState(null);
    const db = getFirestore();

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUserData({ ...docSnap.data(), email: user.email, uid: user.uid });
                } else {
                    setUserData({ email: user.email, uid: user.uid });
                }
            }
        };
        fetchUserData();
    }, [user, db]);

    // For a real app, this would come from authentication context
    // const mockUserData = {
    //     fullName: 'John Doe',
    //     companyName: 'ABC Corporation',
    //     email: 'john.doe@example.com',
    //     phone: '+1 234-567-8900'
    // };

    // userData = user
    //     ? {
    //         fullName: user.displayName || '',
    //         companyName: '', // Fetch from Firestore if you store it there
    //         email: user.email,
    //         phone: '', // Fetch from Firestore if you store it there
    //         uid: user.uid
    //     }
    //     : null;

    useEffect(() => {
        if (selectedCity) {
            // Find the country data first
            const countryData = data.pricing.find(item => item.country === selectedCity.country);

            if (countryData) {
                // Find the city data within the country's states
                const cityData = countryData.states.find(item =>
                    item.city === selectedCity.city && item.state === selectedCity.state
                );

                if (cityData) {
                    const models = [];
                    Object.entries(cityData.pricing).forEach(([modelName, modelPricing]) => {
                        const modelInfo = data.categories.find(category => category.model === modelName);
                        if (modelInfo) {
                            models.push({
                                ...modelInfo,
                                pricing: modelPricing
                            });
                        }
                    });
                    setAvailableModels(models);
                }
            }
        }
    }, [selectedCity]);

    const handleCitySelect = (city) => {
        setSelectedCity(city);
        setSelectedPackages([]);
        setShowBookingForm(false);
    };

    const handlePackageSelect = (packages) => {
        setSelectedPackages(packages);
        if (packages.length > 0 && selectedCabRef.current) {
            setTimeout(() => {
                selectedCabRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                });
            }, 50);
        }
    };

    const handleUpdateQuantity = (packageIndex, change) => {
        const updatedPackages = [...selectedPackages];
        const newQuantity = updatedPackages[packageIndex].quantity + change;

        if (newQuantity <= 0) {
            // Remove package if quantity would be 0 or less
            updatedPackages.splice(packageIndex, 1);
        } else {
            // Update quantity
            updatedPackages[packageIndex] = {
                ...updatedPackages[packageIndex],
                quantity: newQuantity
            };
        }

        setSelectedPackages(updatedPackages);
    };

    const handleRemovePackage = (packageIndex) => {
        const updatedPackages = [...selectedPackages];
        updatedPackages.splice(packageIndex, 1);
        setSelectedPackages(updatedPackages);
    };

    const handleProceedToBooking = () => {
        setShowBookingForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBackToSelection = () => {
        setShowBookingForm(false);
    };

    const formatPackageType = (packageType) => {
        if (packageType === '4hr40km') return '4 Hours / 40 KM';
        if (packageType === '8hr80km') return '8 Hours / 80 KM';
        if (packageType === 'airport') return 'Airport Transfer';
        return packageType;
    };

    // Calculate total price
    const calculateTotalPrice = () => {
        return selectedPackages.reduce((total, pkg) => {
            return total + (pkg.price * pkg.quantity);
        }, 0);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.3, staggerChildren: 0.06 }
        },
        exit: {
            opacity: 0,
            transition: { duration: 0.2 }
        }
    };

    return (
        <div className="container mx-auto px-3 pt-32 pb-10 max-w-5xl min-h-screen" ref={selectedCabRef}>
            <AnimatePresence mode="wait">
                {!selectedCity ? (
                    <motion.div
                        key="city-selector"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={containerVariants}
                    >
                        <CitySelector onCitySelect={handleCitySelect} />
                    </motion.div>
                ) : showBookingForm ? (
                    <motion.div
                        key="booking-form"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={containerVariants}
                    >
                        <BookingForm
                            selectedPackages={selectedPackages}
                            onBack={handleBackToSelection}
                            userData={userData}
                            selectedCity={selectedCity}
                            totalPrice={calculateTotalPrice()}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="cab-selection"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={containerVariants}
                    >
                        <motion.div
                            className="flex items-center justify-between mb-3 bg-white/95 backdrop-blur-sm px-3 py-4 md:py-6 sticky top-0 z-10 rounded-md shadow-sm"
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div>
                                <h1 className="text-lg md:text-xl font-bold text-primary">{selectedCity.city}, {selectedCity.state}</h1>
                                <p className="text-xs text-gray-600">{selectedCity.country} - Select your preferred car</p>
                            </div>
                            <motion.button
                                onClick={() => setSelectedCity(null)}
                                className="flex items-center px-2 py-1 rounded-md text-primary text-sm cursor-pointer"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                                Change Location
                            </motion.button>
                        </motion.div>

                        <div>
                            <AnimatePresence>
                                {selectedPackages.length > 0 && (
                                    <motion.div
                                        className="mb-4 p-3 md:p-4 bg-primary/10 rounded-lg border border-primary"
                                        initial={{ opacity: 0, y: 15, height: 0 }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            height: 'auto',
                                            transition: { duration: 0.25 }
                                        }}
                                        exit={{
                                            opacity: 0,
                                            y: -8,
                                            height: 0,
                                            transition: { duration: 0.2 }
                                        }}
                                    >
                                        <div className="flex items-start gap-1 mb-3">
                                            <CheckCircle className="text-primary mt-0.5" size={16} />
                                            <h3 className="font-medium text-sm text-primary">Your Selection</h3>
                                        </div>

                                        <div className="space-y-3 mb-4">
                                            {selectedPackages.map((pkg, index) => (
                                                <div key={`${pkg.model}-${pkg.packageType}-${index}`}
                                                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 bg-white rounded-md border border-gray-200">
                                                    <div className="mb-2 sm:mb-0">
                                                        <p className="text-sm"><span className="font-medium">Car:</span> {pkg.model}</p>
                                                        <p className="text-sm text-gray-700"><span className="font-medium">Package:</span> {formatPackageType(pkg.packageType)}</p>
                                                    </div>
                                                    <div className="flex items-center justify-between w-full sm:w-auto">
                                                        <div className="flex items-center mr-4">
                                                            <button
                                                                onClick={() => handleUpdateQuantity(index, -1)}
                                                                className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                                                            >
                                                                <MinusCircle size={16} />
                                                            </button>
                                                            <span className="mx-2 text-sm font-medium w-5 text-center">
                                                                {pkg.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => handleUpdateQuantity(index, 1)}
                                                                className="p-1 text-primary hover:bg-primary/10 rounded-full"
                                                            >
                                                                <PlusCircle size={16} />
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <PriceDisplay
                                                                price={pkg.price * pkg.quantity}
                                                                className="text-lg font-bold text-primary"
                                                            />
                                                            <button
                                                                onClick={() => handleRemovePackage(index)}
                                                                className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                                                                aria-label="Remove package"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-t border-gray-200 pt-3">
                                            <div className="mb-3 sm:mb-0">
                                                <p className="text-sm font-medium">Total ({selectedPackages.reduce((sum, pkg) => sum + pkg.quantity, 0)} items)</p>
                                            </div>
                                            <div className="flex flex-col items-start sm:items-end">
                                                <PriceDisplay
                                                    price={calculateTotalPrice()}
                                                    className="text-2xl font-bold text-primary"
                                                    showOriginal={true}
                                                />
                                                <p className="text-xs text-gray-500 mb-1.5">All inclusive</p>
                                                <motion.button
                                                    className="bg-primary text-white py-2 px-3 text-sm rounded-md hover:bg-opacity-90 flex items-center cursor-pointer"
                                                    whileHover={{ scale: 1.01 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={handleProceedToBooking}
                                                >
                                                    <Calendar size={14} className="mr-1" />
                                                    Proceed to Booking
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="space-y-4">
                            {availableModels.map((model, index) => (
                                <CabModel
                                    key={index}
                                    model={model.model}
                                    carType={model.carType}
                                    capacity={model.capacity}
                                    luggage={model.luggage}
                                    handbag={model.handbag}
                                    image={model.image}
                                    features={model.features}
                                    pricing={model.pricing}
                                    onSelect={handlePackageSelect}
                                    selectedPackages={selectedPackages}
                                    exArrival={model.exArrival}
                                    exDeparture={model.exDeparture}
                                />
                            ))}
                        </div>

                        {availableModels.length === 0 && (
                            <motion.div
                                className="text-center p-6 text-gray-500 bg-gray-50 rounded-lg"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.3 }}
                            >
                                <p className="text-sm">No cab models available for this city.</p>
                                <p className="text-xs mt-1">Please select a different city or check back later.</p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Book;