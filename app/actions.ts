"use server";

import { GAME_AMOUNT_SATS, GameResult, Option, WIN_AMOUNT_SATS } from "./types";
import { nwc } from "@getalby/sdk";
import { Invoice } from "@getalby/lightning-tools";

export async function createGame(
  challengerOption: Option,
  challengerInvoice: string
) {
  if (new Invoice({ pr: challengerInvoice }).satoshi !== WIN_AMOUNT_SATS) {
    throw new Error("Incorrect invoice amount");
  }

  const nostrWalletConnectUrl = process.env.NWC_URL;
  if (!nostrWalletConnectUrl) {
    throw new Error("No NWC_URL set");
  }
  const nwcClient = new nwc.NWCClient({
    nostrWalletConnectUrl,
  });

  // TODO: this would be easier if NWC supported passing metadata
  const challengerTransaction = await nwcClient.makeInvoice({
    amount: GAME_AMOUNT_SATS * 1000,
    description: [challengerOption, challengerInvoice].join(" "),
  });

  return {
    invoice: challengerTransaction.invoice,
    paymentHash: challengerTransaction.payment_hash,
  };
}

export async function replyGame(
  gamePaymentHash: string,
  opponentOption: Option,
  opponentInvoice: string
) {
  if (new Invoice({ pr: opponentInvoice }).satoshi !== WIN_AMOUNT_SATS) {
    throw new Error("Incorrect invoice amount");
  }

  const nostrWalletConnectUrl = process.env.NWC_URL;
  if (!nostrWalletConnectUrl) {
    throw new Error("No NWC_URL set");
  }
  const nwcClient = new nwc.NWCClient({
    nostrWalletConnectUrl,
  });

  // TODO: this would be easier if NWC supported passing metadata
  const transaction = await nwcClient.makeInvoice({
    amount: GAME_AMOUNT_SATS * 1000,
    description: [gamePaymentHash, opponentOption, opponentInvoice].join(" "),
  });

  return {
    invoice: transaction.invoice,
  };
}

export async function checkGame(
  gamePaymentHash: string,
  isChallenger: boolean
): Promise<GameResult> {
  const nostrWalletConnectUrl = process.env.NWC_URL;
  if (!nostrWalletConnectUrl) {
    throw new Error("No NWC_URL set");
  }
  const nwcClient = new nwc.NWCClient({
    nostrWalletConnectUrl,
  });

  // if more people play at once then this can be fixed
  const { transactions } = await nwcClient.listTransactions({
    limit: 20,
  });

  const challengerTransaction = transactions.find(
    (t) => t.payment_hash === gamePaymentHash
  );
  const opponentTransaction = transactions.find(
    (t) =>
      t.type === "incoming" && t.description.split(" ")[0] === gamePaymentHash
  );

  if (!challengerTransaction || !opponentTransaction) {
    return "pending";
  }

  if (!challengerTransaction.preimage || !opponentTransaction.preimage) {
    return "pending";
  }

  const challengerOption = challengerTransaction.description.split(
    " "
  )[0] as Option;
  const opponentOption = opponentTransaction.description.split(
    " "
  )[1] as Option;

  let result: GameResult = "draw";

  if (
    (challengerOption === "paper" && opponentOption === "rock") ||
    (challengerOption === "rock" && opponentOption === "scissors") ||
    (challengerOption === "scissors" && opponentOption === "paper")
  ) {
    result = isChallenger ? "win" : "lose";
  } else if (challengerOption !== opponentOption) {
    result = isChallenger ? "lose" : "win";
  }

  if (result === "draw") {
    // for now, we can't refund both users. So instead, pick one of the players to win
    // using something only the server knows
    const seed = parseInt((challengerTransaction.preimage.substring(0, 4) + opponentTransaction.preimage.substring(0, 4)), 16);
    var x = Math.sin(seed) * 10000;
    result = (x - Math.floor(x)) > 0.5 ? "win" : "lose";
    if (!isChallenger) {
      result = result === "win" ? "lose" : "win";
    }
  }

  // NOTE: the lightning transaction can only be paid once
  // so future attempts will fail
  try {
    const challengerWon = isChallenger && result === "win";

    const invoiceToPay = challengerWon
      ? challengerTransaction.description.split(" ")[1]
      : opponentTransaction.description.split(" ")[2];

    await nwcClient.payInvoice({
      invoice: invoiceToPay,
    });
  } catch (error) {
    console.error(error);
  }

  return result;
}
