
import React, { useState } from 'react';
import { WalletContext, WalletContextType } from './WalletContext.types';

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const login = () => {
    setShowWalletModal(true);
  };

  const connectWallet = async (walletType: string) => {
    setIsLoading(true);
    setShowWalletModal(false);
    try {
      // This would be implemented with actual MultiversX wallet connection
      console.log(`Connecting to ${walletType}...`);
      // For demo purposes, we'll simulate a connection
      setTimeout(() => {
        setIsLoggedIn(true);
        setAddress('erd1qqqqqqqqqqqqqpgqz7wvj2hwu50k7zz7w7l6k3a4hjqhhh8g8cfqlph53u');
        setBalance('1.2345');
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setIsLoading(false);
    }
  };

  const disconnect = async () => {
    try {
      setIsLoggedIn(false);
      setAddress('');
      setBalance('0');
      console.log('Wallet disconnected');
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        isLoggedIn,
        address,
        balance,
        isLoading,
        showWalletModal,
        login,
        connectWallet,
        disconnect,
        setShowWalletModal,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
