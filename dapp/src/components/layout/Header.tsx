
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WalletModal } from '@/components/wallet/WalletModal';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { Search, Menu, Sun, Moon, Globe, Wallet, Image } from 'lucide-react';
import { useGetAccountInfo, useGetLoginInfo } from "@multiversx/sdk-dapp/hooks"
import { logout } from "@multiversx/sdk-dapp/utils"

const callbackUrl = `${window.location.origin}/`;
const onRedirect = undefined; // use this to redirect with useNavigate to a specific page after logout
const shouldAttemptReLogin = false; // use for special cases where you want to re-login after logout

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const { tokenLogin, isLoggedIn } = useGetLoginInfo();
  const { address, account } = useGetAccountInfo()

  const [showWalletModal, setShowWalletModal] = useState(false);

  console.log(isLoggedIn)
  console.log(account)
  console.log(address)

  useEffect(() => {
    console.log('Header mounted');
  }, [isLoggedIn, account]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (bal: string) => {
    if (!bal) return '0';
    return parseFloat(bal).toFixed(4);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    logout(
      callbackUrl,
      onRedirect,
      shouldAttemptReLogin,
      {
        shouldBroadcastLogoutAcrossTabs: true,
        hasConsentPopup: false
      }
    );
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
              <div className="w-12 h-12 flex items-center justify-center">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover rounded-lg" />
              </div>
            <div>
              <h1 className="text-xl font-bold">StackToken</h1>
              <p className="text-xs text-muted-foreground">Powered by MultiversX</p>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('search.placeholder')}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Wallet className="h-4 w-4" />
                    <div className="text-left">
                      <div className="text-xs">{formatAddress(address ?? 'N/A')}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatBalance(account?.balance ?? '0')} EGLD
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout}>
                    {t('wallet.disconnect')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => setShowWalletModal(true)} 
                className="stack-gradient text-white"
              >
                <Wallet className="h-4 w-4 mr-2" />
                {/* {isLoading ? 'Connecting...' : t('wallet.connect')} */}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeLanguage('en')}>
                  <Badge variant={i18n.language === 'en' ? 'default' : 'outline'}>
                    English
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('pt')}>
                  <Badge variant={i18n.language === 'pt' ? 'default' : 'outline'}>
                    Português
                  </Badge>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {showWalletModal && (<WalletModal
        open={showWalletModal}
        onOpenChange={setShowWalletModal}
      />)}
    </header>
  );
};
