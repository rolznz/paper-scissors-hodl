"use client";
import React from "react";
import { Option, WIN_AMOUNT_SATS, APP_NAME } from "./types";
import { createGame } from "@/app/actions";
import { useRouter } from "next/navigation";
import { PlayForm } from "@/components/PlayForm";

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
      const ownInvoice = await provider.makeInvoice({
        amount: WIN_AMOUNT_SATS,
        defaultMemo: `${APP_NAME} WIN invoice`,
      });
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
    <PlayForm
      onSubmit={onSubmit}
      selectedOption={selectedOption}
      setSelectedOption={setSelectedOption}
    />
  );
}
