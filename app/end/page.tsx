"use client";
import { useSearchParams } from "next/navigation";
import { GameResult } from "../types";
import Link from "next/link";
import { Suspense } from "react";

export default function EndGame() {
  return (
    <Suspense>
      <EndGameInternal />
    </Suspense>
  );
}

function EndGameInternal() {
  const params = useSearchParams();
  const result = params && (params.get("result") as GameResult);

  return (
    <>
      <p>{result}</p>
      <Link href="/" className="mt-8">
        <button className="btn btn-primary">Play again!</button>
      </Link>
    </>
  );
}
