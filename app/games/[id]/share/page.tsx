"use client";

import { checkGame } from "@/app/actions";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function ShareGame() {
  const params = useParams<{ id: string }>();
  const shareUrl = `${window.location.origin}/games/${params.id}`;
  const router = useRouter();
  return (
    <div className="flex flex-col gap-6">
      <p>Share this game!</p>
      <div className="flex gap-2">
        <input
          value={shareUrl}
          readOnly
          className="input input-bordered w-full max-w-md"
          autoFocus
          onFocus={(e) => e.target.select()}
        />
        <button
          className="btn btn-primary"
          onClick={async () => {
            await navigator.clipboard.writeText(shareUrl);
            alert("Copied!");
          }}
        >
          Copy
        </button>
        <button
          className="btn btn-primary"
          onClick={() => {
            navigator.share({
              url: shareUrl,
            });
          }}
        >
          Share
        </button>
      </div>
      <p>If you win, you will automatically receive a payment.</p>
      <button
        onClick={async () => {
          const result = await checkGame(params.id, true);
          if (result === "pending") {
            alert("Opponent has not chosen yet");
            return;
          }
          router.push(`/end?result=${result}`);
        }}
        className="btn btn-primary"
      >
        Check Result
      </button>
      <Link href="/" className="btn btn-secondary">
        Play again!
      </Link>
    </div>
  );
}
