// Currency mapping by country
const COUNTRY_CURRENCY_MAP = {
    'US': 'USD',
    'IN': 'INR',
    'GB': 'GBP',
    'CA': 'CAD',
    'AU': 'AUD',
    'DE': 'EUR',
    'FR': 'EUR',
    'IT': 'EUR',
    'ES': 'EUR',
    'NL': 'EUR',
    'SG': 'SGD',
    'AE': 'AED',
    'MY': 'MYR',
    'TH': 'THB',
    'JP': 'JPY',
    'CN': 'CNY',
    'KR': 'KRW',
    'HK': 'HKD',
    'TW': 'TWD',
    'PH': 'PHP',
    'ID': 'IDR',
    'VN': 'VND',
    'BD': 'BDT',
    'PK': 'PKR',
    'LK': 'LKR',
    'NP': 'NPR',
    'BH': 'BHD',
    'KW': 'KWD',
    'OM': 'OMR',
    'QA': 'QAR',
    'SA': 'SAR',
    // Add more countries as needed
};

// Currency symbols
const CURRENCY_SYMBOLS = {
    'USD': '$',
    'INR': '₹',
    'GBP': '£',
    'CAD': 'C$',
    'AUD': 'A$',
    'EUR': '€',
    'SGD': 'S$',
    'AED': 'د.إ',
    'MYR': 'RM',
    'THB': '฿',
    'JPY': '¥',
    'CNY': '¥',
    'KRW': '₩',
    'HKD': 'HK$',
    'TWD': 'NT$',
    'PHP': '₱',
    'IDR': 'Rp',
    'VND': '₫',
    'BDT': '৳',
    'PKR': '₨',
    'LKR': '₨',
    'NPR': '₨',
    'BHD': '.د.ب',
    'KWD': 'د.ك',
    'OMR': 'ر.ع.',
    'QAR': 'ر.ق',
    'SAR': 'ر.س',
};

class CurrencyService {
    constructor() {
        this.baseCurrency = 'USD'; // Your base currency in data.json
        this.currentCurrency = 'USD';
        this.exchangeRates = {};
        this.userCountry = 'US';
        this.API_KEY = import.meta.env.VITE_EXCHANGE_API_KEY;
    }

    // Detect user's country from IP
    async detectUserCountry() {
        try {
            // Try multiple services
            const services = [
                'https://api.country.is/', // CORS-friendly
                'https://ipapi.co/json/', // Fallback
                'https://api.ipify.org?format=json' // Just for IP
            ];

            for (const serviceUrl of services) {
                try {
                    if (serviceUrl === 'https://api.country.is/') {
                        const response = await fetch(serviceUrl);
                        const data = await response.json();

                        if (data.country) {
                            this.userCountry = data.country;
                            this.currentCurrency = COUNTRY_CURRENCY_MAP[this.userCountry] || 'USD';
                            console.log('Detected country via api.country.is:', this.userCountry, 'Currency:', this.currentCurrency);
                            return this.userCountry;
                        }
                    } else if (serviceUrl === 'https://ipapi.co/json/') {
                        const response = await fetch(serviceUrl);
                        const data = await response.json();

                        if (data.country_code && !data.error) {
                            this.userCountry = data.country_code;
                            this.currentCurrency = COUNTRY_CURRENCY_MAP[this.userCountry] || 'USD';
                            console.log('Detected country via ipapi.co:', this.userCountry, 'Currency:', this.currentCurrency);
                            return this.userCountry;
                        }
                    }
                } catch (serviceError) {
                    console.log(`Service ${serviceUrl} failed, trying next...`);
                    continue;
                }
            }

            throw new Error('All IP detection services failed');

        } catch (error) {
            console.log('Could not detect country, using default (US). Error:', error.message);

            // For development, let's simulate based on time zone or use a default
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            console.log('Detected timezone:', timeZone);

            // Simple timezone to country mapping for common cases
            const timezoneCountryMap = {
                'Asia/Kolkata': 'IN',
                'Asia/Mumbai': 'IN',
                'Asia/Delhi': 'IN',
                'Europe/London': 'GB',
                'Europe/Paris': 'FR',
                'Europe/Berlin': 'DE',
                'Asia/Singapore': 'SG',
                'Asia/Dubai': 'AE',
                'Asia/Tokyo': 'JP',
                'Asia/Shanghai': 'CN',
                'Australia/Sydney': 'AU',
                'America/New_York': 'US',
                'America/Los_Angeles': 'US',
                'America/Chicago': 'US',
            };

            // Try to guess country from timezone
            this.userCountry = timezoneCountryMap[timeZone] || 'US';
            this.currentCurrency = COUNTRY_CURRENCY_MAP[this.userCountry] || 'USD';

            console.log('Using timezone-based detection:', this.userCountry, 'Currency:', this.currentCurrency);
            return this.userCountry;
        }
    }

    // Get exchange rates
    async getExchangeRates() {
        try {
            // Using your exchangerate-api.com key
            const response = await fetch(`https://v6.exchangerate-api.com/v6/${this.API_KEY}/latest/${this.baseCurrency}`);
            const data = await response.json();

            if (data.result === 'success') {
                this.exchangeRates = data.conversion_rates;
                console.log('Exchange rates loaded successfully');
                return this.exchangeRates;
            } else {
                throw new Error(`API returned error: ${data['error-type']}`);
            }
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            // Fallback rates (updated as of July 2025)
            this.exchangeRates = {
                'USD': 1,
                'INR': 83.0,
                'GBP': 0.79,
                'CAD': 1.36,
                'AUD': 1.52,
                'EUR': 0.92,
                'SGD': 1.34,
                'AED': 3.67,
                'MYR': 4.68,
                'THB': 35.5,
                'JPY': 149.0,
                'CNY': 7.24,
                'KRW': 1320.0,
                'HKD': 7.8,
                'TWD': 32.0,
                'PHP': 56.0,
                'IDR': 15400.0,
                'VND': 24500.0,
                'BDT': 110.0,
                'PKR': 280.0,
                'LKR': 300.0,
                'NPR': 133.0,
                'BHD': 0.377,
                'KWD': 0.307,
                'OMR': 0.385,
                'QAR': 3.64,
                'SAR': 3.75,
            };
            console.log('Using fallback exchange rates');
            return this.exchangeRates;
        }
    }

    // Convert price from base currency to current currency
    convertPrice(priceInUSD) {
        if (!this.exchangeRates[this.currentCurrency]) {
            return priceInUSD;
        }

        const convertedPrice = priceInUSD * this.exchangeRates[this.currentCurrency];

        // Round appropriately based on currency
        if (['JPY', 'KRW', 'VND', 'IDR'].includes(this.currentCurrency)) {
            return Math.round(convertedPrice); // No decimal places for these currencies
        } else {
            return Math.round(convertedPrice * 100) / 100; // 2 decimal places
        }
    }

    // Format price with currency symbol
    formatPrice(priceInUSD) {
        const convertedPrice = this.convertPrice(priceInUSD);
        const symbol = CURRENCY_SYMBOLS[this.currentCurrency] || '$';

        // Format with appropriate decimal places
        let decimals = 2;
        if (['INR', 'JPY', 'KRW', 'VND', 'IDR'].includes(this.currentCurrency)) {
            decimals = 0;
        }

        return `${symbol}${convertedPrice.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        })}`;
    }

    // Initialize the service
    async initialize() {
        try {
            console.log('Initializing currency service...');
            await this.detectUserCountry();
            await this.getExchangeRates();
            console.log('Currency service initialized successfully');
        } catch (error) {
            console.error('Error initializing currency service:', error);
        }
    }

    // Get current currency info
    getCurrencyInfo() {
        return {
            country: this.userCountry,
            currency: this.currentCurrency,
            symbol: CURRENCY_SYMBOLS[this.currentCurrency] || '$',
            rate: this.exchangeRates[this.currentCurrency] || 1
        };
    }

    // Manual currency change
    changeCurrency(newCurrency) {
        if (this.exchangeRates[newCurrency]) {
            this.currentCurrency = newCurrency;
            console.log('Currency manually changed to:', newCurrency);
        } else {
            console.error('Currency not supported:', newCurrency);
        }
    }

    // Get list of supported currencies
    getSupportedCurrencies() {
        return Object.keys(CURRENCY_SYMBOLS).map(code => ({
            code,
            symbol: CURRENCY_SYMBOLS[code],
            rate: this.exchangeRates[code] || 1
        }));
    }
}

export default new CurrencyService();