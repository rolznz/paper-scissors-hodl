"use client";
import React from "react";
import { options, Option, GAME_AMOUNT_SATS, WIN_AMOUNT_SATS } from "./types";
import { createGame } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function Home() {
  const [selectedOption, setSelectedOption] = React.useState<Option>();
  const router = useRouter();
  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      if (!selectedOption) {
        throw new Error("No option selected");
      }
      const requestProvider = await import(
        "@getalby/bitcoin-connect-react"
      ).then((mod) => mod.requestProvider);
      const provider = await requestProvider();
      const ownInvoice = await provider.makeInvoice(WIN_AMOUNT_SATS);
      const { invoice, paymentHash } = await createGame(
        selectedOption,
        ownInvoice.paymentRequest
      );
      await provider.sendPayment(invoice);

      router.push(`/games/${paymentHash}/share`);
    } catch (error) {
      console.error(error);
      alert("Something went wrong: " + error);
    }
  }

  return (
    <>
      <p>PAPER SCISSORS HODL</p>
      <form onSubmit={onSubmit}>
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

        <button className="btn btn-primary mt-4">
          Choose & Pay {GAME_AMOUNT_SATS} sats
        </button>
        {/* <p>If you win, you will receive {WIN_AMOUNT_SATS * 2} sats</p> */}
      </form>
    </>
  );
}
