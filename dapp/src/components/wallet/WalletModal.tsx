import { useTranslation } from 'react-i18next';
import { Wallet } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  WebWalletLoginButton,
  MetamaskLoginButton,
} from "@multiversx/sdk-dapp/UI"

export const WalletModal = ({
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            {t('wallet.connect')}
          </DialogTitle>
          <DialogDescription>
            Choose your preferred wallet to connect to StackToken
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          <WebWalletLoginButton callbackRoute="/questions" />
          <MetamaskLoginButton callbackRoute="/questions" />
        </div>

        <div className="mt-6 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            By connecting a wallet, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
