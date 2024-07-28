import Link from "next/link";
import { WIN_AMOUNT_SATS, APP_NAME, GAME_AMOUNT_SATS } from "../types";

export default function Page() {
  return (
    <>
      <p className="uppercase">{APP_NAME}</p>

      <p className="text-xs mt-8">How it works:</p>
      <ul className="list-decimal">
        <li className="text-xs mt-2">
          An invoice will be requested from your wallet of {WIN_AMOUNT_SATS}{" "}
          sats. {APP_NAME} will pay this invoice if you win.
        </li>
        <li className="text-xs mt-2">
          You will pay an invoice of {GAME_AMOUNT_SATS} sats. If you lose, this
          will be paid to your opponent.
        </li>
        <li className="text-xs mt-2">
          {GAME_AMOUNT_SATS * 2 - WIN_AMOUNT_SATS} sats will go to the{" "}
          {APP_NAME} service fee.
        </li>
        <li className="text-xs mt-2">
          If no-one plays the game you create, your payment will not be
          refunded.
        </li>
        <li className="text-xs mt-2">
          If you and your opponent pick draw, a winner will be picked randomly
          based on the payments made by you and your opponent.
        </li>
      </ul>

      <Link href="/" className="mt-8">
        <button className="btn btn-primary">Play now!</button>
      </Link>
    </>
  );
}
