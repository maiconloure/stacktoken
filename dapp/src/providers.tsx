import type React from "react"
import { useEffect, useState, useRef } from "react"
import { DappProvider } from "@multiversx/sdk-dapp/wrappers"
import { SignTransactionsModals, TransactionsToastList } from "@multiversx/sdk-dapp/UI"

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const isInitialized = useRef(false)

  useEffect(() => {
    // Evitar dupla inicialização
    if (isInitialized.current) return
    isInitialized.current = true
    
    setMounted(true)
  }, [])

  console.log("Providers mounted:", isInitialized)

  // Não renderizar nada até estar montado no cliente
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Carregando StackToken...</p>
          <p className="text-sm text-gray-500">Conectando com MultiversX</p>
        </div>
      </div>
    )
  }

  return (
    <DappProvider
      environment="devnet"
      customNetworkConfig={{
        id: "D",
        name: 'MultiversX Devnet',
        apiTimeout: 60000,
        egldLabel: "xEGLD",
        decimals: "18",
        digits: "4",
        gasPerDataByte: "1500",
        walletConnectDeepLink:
          "https://maiar.page.link/?apn=com.elrond.maiar.wallet&isi=1519405832&ibi=com.elrond.maiar.wallet&link=https://xportal.com/",
        walletConnectBridgeAddresses: ["https://bridge.walletconnect.org"],
        walletAddress: "https://devnet-wallet.multiversx.com/dapp/init",
        apiAddress: "https://devnet-api.multiversx.com",
        explorerAddress: "http://devnet-explorer.multiversx.com",
        chainId: "D",
        walletConnectV2ProjectId: "3242aaa9e77cb94ec2613a57584fe4f6",
      }}
      dappConfig={{
        shouldUseWebViewProvider: true,
      }}
            customComponents={{
        transactionTracker: {
          // uncomment this to use the custom transaction tracker
          // component: TransactionsTracker,
          props: {
            onSuccess: (sessionId: string) => {
              console.log(`Session ${sessionId} successfully completed`);
            },
            onFail: (sessionId: string, errorMessage: string) => {
              console.log(`Session ${sessionId} failed. ${errorMessage ?? ''}`);
            }
          }
        }
      }}
    >
      {children}
      <SignTransactionsModals />
      <TransactionsToastList />
    </DappProvider>
  )
}