/* eslint-disable @next/next/no-img-element */
"use client";

import { checkGame } from "@/app/actions";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React from "react";

export default function ShareGame() {
  const params = useParams<{ id: string }>();
  const shareUrl = `${window.location.origin}/games/${params.id}`;
  const router = useRouter();

  React.useEffect(() => {
    const interval = setInterval(async () => {
      const result = await checkGame(params.id, true);
      if (result.status === "pending") {
        return;
      }
      router.push(`/end?result=${btoa(JSON.stringify(result))}`);
    }, 10000);
    return () => {
      clearInterval(interval);
    };
  }, [params.id, router]);

  return (
    <div className="flex flex-col gap-6">
      <p>
        {"You've"} made your choice. Now you need an opponent. Share this game
        with a friend or post it on social media so that someone accepts your
        challenge.
      </p>

      <input
        value={shareUrl}
        readOnly
        className="input input-bordered w-full max-w-md"
        autoFocus
        onFocus={(e) => e.target.select()}
      />
      <div className="flex gap-2">
        <button
          className="btn flex-1 btn-primary"
          onClick={async () => {
            await navigator.clipboard.writeText(shareUrl);
            alert("Copied!");
          }}
        >
          Copy
        </button>
        <button
          className="flex-1 btn btn-primary"
          onClick={() => {
            try {
              navigator.share({
                url: shareUrl,
              });
            } catch (error) {
              alert("Failed to share. Please copy the URL instead");
            }
          }}
        >
          Share
        </button>
      </div>
      <p className="text-sm">
        If you win, you will automatically receive a payment.
      </p>
      <div className="flex gap-2 items-center justify-center text-sm">
        <span className="loading loading-spinner loading-xs"></span>
        Waiting for an opponent
      </div>
    </div>
  );
}
