import React from 'react';
import { useCurrency } from '../contexts/CurrencyContext';

const PriceDisplay = ({ price, className = "", showOriginal = false }) => {
  const { formatPrice, isLoading, currencyInfo } = useCurrency();

  if (isLoading) {
    return <span className={className}>Loading...</span>;
  }

  const formattedPrice = formatPrice(price);

  return (
    <span className={className}>
      {formattedPrice}
      {showOriginal && currencyInfo.currency !== 'USD' && (
        <span className="text-xs text-gray-500 ml-1">
          (${price})
        </span>
      )}
    </span>
  );
};

export default PriceDisplay;