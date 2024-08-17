"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { APP_NAME, Option, WIN_AMOUNT_SATS } from "@/app/types";
import { checkGame, replyGame } from "@/app/actions";
import { PlayForm } from "@/components/PlayForm";
import { WebLNProvider } from "@webbtc/webln-types";

export default function Game() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  async function onSubmit(
    selectedOption: Option,
    winInvoice: string,
    provider: WebLNProvider
  ) {
    try {
      const { invoice } = await replyGame(
        params.id,
        selectedOption,
        winInvoice
      );

      await provider.sendPayment(invoice);

      const result = await checkGame(params.id, false);
      if (result.status === "pending") {
        alert("Something went wrong. Please try again");
        return;
      }
      router.push(`/end?result=${btoa(JSON.stringify(result))}`);
    } catch (error) {
      console.error(error);
      alert("Something went wrong: " + error);
    }
  }

  return <PlayForm onSubmit={onSubmit} isOpponent />;
}
