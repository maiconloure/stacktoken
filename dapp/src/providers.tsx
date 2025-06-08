import type React from "react"
import { useEffect, useState, useRef } from "react"
import { DappProvider } from "@multiversx/sdk-dapp/wrappers"
import { SignTransactionsModals, TransactionsToastList } from "@multiversx/sdk-dapp/UI"
import { SearchProvider } from "@/contexts/SearchContext"

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const isInitialized = useRef(false)

  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true
    setMounted(true)
  }, [])

  console.log("Providers mounted:", isInitialized)

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
      environment={process.env.REACT_APP_ENVIRONMENT || "devnet"}
      customNetworkConfig={{
        id: process.env.REACT_APP_CHAIN || "D",
        name: 'MultiversX',
        apiTimeout: 60000,
        egldLabel: "xEGLD",
        decimals: "18",
        digits: "4",
        gasPerDataByte: "1500",
        walletConnectDeepLink:
          process.env.REACT_APP_CONNECTION_DEEP_LINK || "https://maiar.page.link/?apn=com.elrond.maiar.wallet&isi=1519405832&ibi=com.elrond.maiar.wallet&link=https://xportal.com/",
        walletConnectBridgeAddresses: ["https://bridge.walletconnect.org"],
        walletAddress: process.env.REACT_APP_WALLET_ADDRESS || "https://devnet-wallet.multiversx.com/dapp/init",
        apiAddress: process.env.REACT_APP_NETWORK_API || "https://devnet-api.multiversx.com",
        explorerAddress: process.env.REACT_APP_EXPLORER_ADDRESS || "http://devnet-explorer.multiversx.com",
        chainId: process.env.REACT_APP_CHAIN || "D",
        walletConnectV2ProjectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID || "",
      }}
      dappConfig={{
        shouldUseWebViewProvider: true,
      }}
      customComponents={{
        transactionTracker: {
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
      <SearchProvider>
        {children}
      </SearchProvider>
      <SignTransactionsModals />
      <TransactionsToastList />
    </DappProvider>
  )
}