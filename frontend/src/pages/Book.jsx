import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Calendar, CheckCircle, Trash2, MinusCircle, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CitySelector from '../components/CitySelector';
import CabModel from '../components/CabModel';
import BookingForm from '../components/BookingForm';
import PriceDisplay from '../components/PriceDisplay';
import data from '../data/data.json';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
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
                const usersRef = collection(db, "users");
                const q = query(usersRef, where("email", "==", user.email));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const docData = querySnapshot.docs[0].data();
                    setUserData({ ...docData, email: user.email, uid: user.uid });
                } else {
                    setUserData({ email: user.email, uid: user.uid });
                }
            }
        };
        fetchUserData();
    }, [user, db]);


    useEffect(() => {
        const fetchCityPricing = async () => {
            if (selectedCity) {
                try {
                    console.log("Fetching pricing for:", selectedCity);
                    // Get the document that matches this city-state-country combination
                    const pricingQuery = query(
                        collection(db, "pricing"),
                        where("cityName", "==", selectedCity.city),
                        where("stateName", "==", selectedCity.state),
                        where("countryName", "==", selectedCity.country)
                    );

                    const pricingSnapshot = await getDocs(pricingQuery);

                    if (!pricingSnapshot.empty) {
                        const cityDoc = pricingSnapshot.docs[0].data();
                        console.log("Raw Firebase data:", cityDoc);

                        const models = [];

                        // Get all pricing fields from the document (ending with 'Pricing')
                        const pricingFields = Object.keys(cityDoc).filter(key =>
                            key.endsWith('Pricing') && cityDoc[key] !== null
                        );

                        console.log("Available pricing fields:", pricingFields);

                        // Map to store relationships between Firebase model names and display names
                        const modelNameMap = {
                            'SedanPricing': 'Sedan',
                            'SedanPlusPricing': 'Sedan +',
                            'SedanLuxuryPricing': 'Sedan - Luxury',
                            'MUVPricing': 'MUV',
                            'SUVPricing': 'SUV',
                            'SUVPlusPricing': 'SUV +',
                            'LuxuryPricing': 'Luxury',
                            'LuxuryPlusPricing': 'Luxury +'
                        };

                        // Process each pricing field
                        pricingFields.forEach(pricingField => {
                            // Skip if pricing object is null
                            if (!cityDoc[pricingField]) return;

                            // Map Firebase rate fields to the expected format in the app
                            const pricing = {
                                '4hr40km': cityDoc[pricingField]['4H-40kmRate'] || 0,
                                '8hr80km': cityDoc[pricingField]['8H-80kmRate'] || 0,
                                'airport': cityDoc[pricingField]['AirportRate'] || 0
                            };

                            // Check if at least one price is greater than 0
                            const hasNonZeroPricing = Object.values(pricing).some(price => price > 0);

                            // Only add models with non-zero pricing
                            if (hasNonZeroPricing) {
                                // Get the display model name from our mapping
                                const displayModelName = modelNameMap[pricingField];

                                // Find matching category from data.json
                                const category = data.categories.find(cat => cat.model === displayModelName);

                                if (category) {
                                    // Use category data from data.json
                                    models.push({
                                        ...category,
                                        pricing: pricing
                                    });
                                } else {
                                    // Create a minimal model if no matching category found
                                    let modelName = displayModelName || pricingField.replace('Pricing', '');

                                    // Get default image based on the model type
                                    let image = '';
                                    let capacity = 4;
                                    let luggage = 2;
                                    let handbag = 2;

                                    if (modelName.includes('Sedan')) {
                                        image = '/images/car-models/Sedan.jpg';
                                    } else if (modelName.includes('SUV')) {
                                        image = '/images/car-models/SUV.jpg';
                                        capacity = 6;
                                        luggage = 4;
                                        handbag = 4;
                                    } else if (modelName.includes('MUV')) {
                                        image = '/images/car-models/MUV.jpg';
                                        capacity = 6;
                                        luggage = 3;
                                        handbag = 3;
                                    } else if (modelName.includes('Luxury')) {
                                        image = '/images/car-models/Luxury.jpg';
                                    }

                                    models.push({
                                        model: modelName,
                                        carType: modelName,
                                        capacity: capacity,
                                        luggage: luggage,
                                        handbag: handbag,
                                        image: image,
                                        features: [],
                                        exArrival: "60 Mins",
                                        exDeparture: "15 Mins",
                                        pricing: pricing
                                    });
                                }
                            }
                        });

                        // Sort models in a logical order
                        const modelOrder = {
                            'Sedan': 1,
                            'Sedan +': 2,
                            'Sedan - Luxury': 3,
                            'MUV': 6,
                            'SUV': 4,
                            'SUV +': 5,
                            'Luxury': 7,
                            'Luxury +': 8
                        };

                        models.sort((a, b) => {
                            const orderA = modelOrder[a.model] || 999;
                            const orderB = modelOrder[b.model] || 999;
                            return orderA - orderB;
                        });

                        console.log("Final processed models:", models);
                        setAvailableModels(models);
                    } else {
                        // No pricing found for this city
                        console.log("No pricing data found for this city");
                        setAvailableModels([]);
                    }
                } catch (error) {
                    console.error("Error fetching pricing data:", error);
                    setAvailableModels([]);
                }
            }
        };

        fetchCityPricing();
    }, [selectedCity, db]);

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
        <div className="container mx-auto px-3 pt-32 pb-10 max-w-7xl" ref={selectedCabRef}>
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