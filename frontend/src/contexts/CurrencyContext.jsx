import React, { createContext, useContext, useState, useEffect } from 'react';
import currencyService from '../utils/currencyService';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currencyInfo, setCurrencyInfo] = useState({
    country: 'US',
    currency: 'USD',
    symbol: '$',
    rate: 1
  });

  useEffect(() => {
    const initializeCurrency = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Initializing currency service...');
        
        await currencyService.initialize();
        const info = currencyService.getCurrencyInfo();
        setCurrencyInfo(info);
        
        console.log('Currency initialized:', info);
      } catch (error) {
        console.error('Failed to initialize currency service:', error);
        setError(error.message);
        
        // Set default values on error
        setCurrencyInfo({
          country: 'US',
          currency: 'USD',
          symbol: '$',
          rate: 1
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeCurrency();
  }, []);

  const formatPrice = (priceInUSD) => {
    try {
      return currencyService.formatPrice(priceInUSD);
    } catch (error) {
      console.error('Error formatting price:', error);
      return `$${priceInUSD}`;
    }
  };

  const convertPrice = (priceInUSD) => {
    try {
      return currencyService.convertPrice(priceInUSD);
    } catch (error) {
      console.error('Error converting price:', error);
      return priceInUSD;
    }
  };

  const setCurrency = (currency) => {
    try {
      currencyService.changeCurrency(currency);
      const info = currencyService.getCurrencyInfo();
      setCurrencyInfo(info);
      console.log('Currency changed to:', currency);
    } catch (error) {
      console.error('Error changing currency:', error);
    }
  };

  const getSupportedCurrencies = () => {
    try {
      return currencyService.getSupportedCurrencies();
    } catch (error) {
      console.error('Error getting supported currencies:', error);
      return [{ code: 'USD', symbol: '$', rate: 1 }];
    }
  };

  const refreshRates = async () => {
    try {
      setIsLoading(true);
      await currencyService.getExchangeRates();
      const info = currencyService.getCurrencyInfo();
      setCurrencyInfo(info);
      console.log('Exchange rates refreshed');
    } catch (error) {
      console.error('Error refreshing rates:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isLoading,
    error,
    currencyInfo,
    formatPrice,
    convertPrice,
    setCurrency,
    getSupportedCurrencies,
    refreshRates
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext;