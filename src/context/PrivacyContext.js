import React, { createContext, useState, useContext, useEffect } from 'react';
import { isHideAmountsEnabled, setHideAmountsEnabled } from '../services/privacyService';

const PrivacyContext = createContext();

const MASKED_VALUE = '₹ ••••';

export const PrivacyProvider = ({ children }) => {
  const [hideAmounts, setHideAmounts] = useState(false);

  useEffect(() => {
    isHideAmountsEnabled().then(setHideAmounts);
  }, []);

  const toggleHideAmounts = () => {
    setHideAmounts((prev) => {
      const next = !prev;
      setHideAmountsEnabled(next);
      return next;
    });
  };

  // Wraps an already-formatted amount string (e.g. "₹1,234.00") and returns
  // a masked placeholder instead whenever privacy mode is on. Display-only —
  // never use this on values still being typed into an input.
  const maskAmount = (formattedValue) => (hideAmounts ? MASKED_VALUE : formattedValue);

  return (
    <PrivacyContext.Provider value={{ hideAmounts, toggleHideAmounts, maskAmount }}>
      {children}
    </PrivacyContext.Provider>
  );
};

export const usePrivacy = () => useContext(PrivacyContext);
