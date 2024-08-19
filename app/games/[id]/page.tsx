"use client";

import { useParams, useRouter } from "next/navigation";
import React from "react";
import { Option } from "@/app/types";
import { checkGame, checkGameEnded, replyGame } from "@/app/actions";
import { PlayForm } from "@/components/PlayForm";
import { WebLNProvider } from "@webbtc/webln-types";
import Link from "next/link";

export default function Game() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [isLoading, setLoading] = React.useState(true);
  const [hasGameEnded, setGameEnded] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const hasGameEnded = await checkGameEnded(params.id);
      setGameEnded(hasGameEnded);
      setLoading(false);
    })();
  }, [params.id]);

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

  if (isLoading) {
    return (
      <div className="flex w-full h-full gap-2 items-center justify-center text-sm">
        <span className="loading loading-spinner loading-xs"></span>
        Loading...
      </div>
    );
  }

  if (hasGameEnded) {
    return (
      <>
        <p>This game has ended</p>
        <Link href="/" className="mt-8">
          <button className="btn btn-primary">Play again!</button>
        </Link>
      </>
    );
  }

  return <PlayForm onSubmit={onSubmit} isOpponent />;
}
