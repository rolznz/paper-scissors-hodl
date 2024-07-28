"use client";
import React from "react";
import { Option, WIN_AMOUNT_SATS, APP_NAME } from "./types";
import { createGame } from "@/app/actions";
import { useRouter } from "next/navigation";
import { PlayForm } from "@/components/PlayForm";
import { WebLNProvider } from "@webbtc/webln-types";

export default function Home() {
  const router = useRouter();
  async function onSubmit(
    selectedOption: Option,
    winInvoice: string,
    provider: WebLNProvider
  ) {
    try {
      const { invoice, paymentHash } = await createGame(
        selectedOption,
        winInvoice
      );
      await provider.sendPayment(invoice);

      router.push(`/games/${paymentHash}/share`);
    } catch (error) {
      console.error(error);
      alert("Something went wrong: " + error);
    }
  }

  return <PlayForm onSubmit={onSubmit} />;
}
