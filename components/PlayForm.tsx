import {
  APP_NAME,
  GAME_AMOUNT_SATS,
  Option,
  options,
  WIN_AMOUNT_SATS,
} from "@/app/types";
import { WebLNProvider } from "@webbtc/webln-types";
import Link from "next/link";
import React from "react";

type PlayFormProps = {
  onSubmit(
    selectedOption: Option,
    winInvoice: string,
    provider: WebLNProvider
  ): Promise<void>;
  isOpponent?: boolean;
};

export function PlayForm({ onSubmit, isOpponent }: PlayFormProps) {
  const [selectedOption, setSelectedOption] = React.useState<Option>();
  const [requestProvider, setRequestProvider] =
    React.useState<() => Promise<WebLNProvider>>();
  const [isLoading, setLoading] = React.useState(false);
  const [walletConnected, setWalletConnected] = React.useState(false);
  const [disconnectWallet, setDisconnectWallet] = React.useState<() => void>();

  React.useEffect(() => {
    (async () => {
      const mod = await import("@getalby/bitcoin-connect-react");
      mod.init({
        appName: APP_NAME,
      });
      setRequestProvider(() => mod.requestProvider);
      mod.onConnected(() => {
        setWalletConnected(true);
      });
      mod.onDisconnected(() => {
        setWalletConnected(false);
      });
      setDisconnectWallet(() => mod.disconnect);
    })();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      if (!selectedOption) {
        throw new Error("No option selected");
      }
      if (!requestProvider) {
        throw new Error("Bitcoin Connect not loaded");
      }
      const provider = await requestProvider();
      const winInvoice = await provider.makeInvoice({
        amount: WIN_AMOUNT_SATS,
        defaultMemo: `${APP_NAME} WIN invoice`,
      });
      onSubmit(selectedOption, winInvoice.paymentRequest, provider);
    } catch (error) {
      console.error(error);
      setLoading(false);
      throw error;
    }
  }

  return (
    <>
      <p className="uppercase mb-8">{APP_NAME}</p>
      {isOpponent && (
        <p className="text-sm my-4 max-w-sm">
          {"You've"} been challenged to a game of {APP_NAME}. Your challenger
          has already made their choice!
        </p>
      )}
      <form onSubmit={handleSubmit} className="w-full">
        {options.map((option) => (
          <div className="form-control" key={option}>
            <label className="label cursor-pointer">
              <span className="label-text">{option}</span>
              <input
                id={option}
                type="radio"
                name="option"
                className="radio checked:bg-red-500"
                required
                checked={option === selectedOption}
                onChange={(e) => e.target.checked && setSelectedOption(option)}
              />
            </label>
          </div>
        ))}

        <button
          className={`btn btn-primary mt-4 w-full ${
            isLoading && "btn-disabled"
          }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>Loading...</>
          ) : (
            <>Choose & Pay {GAME_AMOUNT_SATS} sats</>
          )}
        </button>
        <div className="w-full flex flex-col items-center justify-center gap-4">
          <Link href="/about" className="link text-xs mt-8">
            How it works
          </Link>

          {walletConnected && (
            <>
              <div className="divider" />
              <button
                className="btn btn-sm btn-ghost"
                onClick={disconnectWallet}
              >
                Disconnect wallet
              </button>
            </>
          )}
        </div>
      </form>
    </>
  );
}
