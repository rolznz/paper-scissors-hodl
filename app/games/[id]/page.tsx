"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import {
  GAME_AMOUNT_SATS,
  Option,
  options,
  WIN_AMOUNT_SATS,
} from "@/app/types";
import { checkGame, replyGame } from "@/app/actions";

export default function Game() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [selectedOption, setSelectedOption] = React.useState<Option>();

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
      const { invoice } = await replyGame(
        params.id,
        selectedOption,
        ownInvoice.paymentRequest
      );

      await provider.sendPayment(invoice);

      const result = await checkGame(params.id, false);
      if (result === "pending") {
        alert("Something went wrong. Please try again");
        return;
      }
      router.push(`/end?result=${result}`);
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
      </form>
    </>
  );
}
