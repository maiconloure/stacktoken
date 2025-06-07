import { createContext } from 'react';

export interface WalletContextType {
  isLoggedIn: boolean;
  address: string;
  balance: string;
  isLoading: boolean;
  showWalletModal: boolean;
  login: () => void;
  connectWallet: (walletType: string) => void;
  disconnect: () => void;
  setShowWalletModal: (show: boolean) => void;
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined);
