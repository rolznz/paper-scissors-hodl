/* eslint-disable @next/next/no-img-element */
"use client";
import { useSearchParams } from "next/navigation";
import { GameResult, GameStatus } from "../types";
import Link from "next/link";
import { Suspense } from "react";
import React from "react";

export default function EndGame() {
  return (
    <Suspense>
      <EndGameInternal />
    </Suspense>
  );
}

function EndGameInternal() {
  const [showResult, setShowResult] = React.useState(false);
  const params = useSearchParams();
  const resultParam = params?.get("result");
  let result: GameResult;
  React.useEffect(() => {
    setTimeout(() => {
      setShowResult(true);
    }, 3000);
  });
  if (!resultParam) {
    return null;
  }

  try {
    result = JSON.parse(atob(resultParam)) as GameResult;
  } catch (error) {
    console.error(error);
    return null;
  }

  if (!showResult) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <img src="/animation.gif" className="w-32 h-32" alt="" />
      </div>
    );
  }

  return (
    <>
      <p className="text-5xl mb-8">You {result.status}!</p>

      <div className="flex justify-between items-center w-full">
        <div className="flex flex-col items-center justify-center gap-2">
          <p>You chose</p>
          <p className="font-bold">{result.options[0]}</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-2">
          <p>They chose</p>
          <p className="font-bold">{result.options[1]}</p>
        </div>
      </div>
      {result.options[0] === result.options[1] && (
        <div className="flex flex-col items-center justify-center gap-2 mt-8">
          <p className="text-xs">
            It was a draw, so a winner was chosen at random
          </p>
        </div>
      )}
      <Link href="/" className="mt-8">
        <button className="btn btn-primary">Play again!</button>
      </Link>
    </>
  );
}
