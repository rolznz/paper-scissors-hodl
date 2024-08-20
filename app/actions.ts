"use server";

import {
  APP_NAME,
  GAME_AMOUNT_SATS,
  GameResult,
  GameStatus,
  Option,
  WIN_AMOUNT_SATS,
} from "./types";
import { nwc } from "@getalby/sdk";
import { Invoice } from "@getalby/lightning-tools";

type ChallengerInvoiceMetadata = {
  option: Option;
  winInvoice: string;
};

type OpponentInvoiceMetadata = {
  gamePaymentHash: string;
  option: Option;
  winInvoice: string;
};

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

  const challengerTransaction = await nwcClient.makeInvoice(
    {
      amount: GAME_AMOUNT_SATS * 1000,
      description: `${APP_NAME} payment`,
      metadata: {
        option: challengerOption,
        winInvoice: challengerInvoice,
      } satisfies ChallengerInvoiceMetadata,
    } as nwc.Nip47MakeInvoiceRequest /* TODO: remove cast when JS SDK is updated */
  );

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

  if (await checkGameEnded(gamePaymentHash)) {
    throw new Error("Game already ended");
  }

  const transaction = await nwcClient.makeInvoice(
    {
      amount: GAME_AMOUNT_SATS * 1000,
      description: `${APP_NAME} payment`,
      metadata: {
        gamePaymentHash,
        option: opponentOption,
        winInvoice: opponentInvoice,
      } satisfies OpponentInvoiceMetadata,
    } as nwc.Nip47MakeInvoiceRequest /* TODO: remove cast when JS SDK is updated */
  );

  return {
    invoice: transaction.invoice,
  };
}

export async function checkGameEnded(gamePaymentHash: string) {
  const nostrWalletConnectUrl = process.env.NWC_URL;
  if (!nostrWalletConnectUrl) {
    throw new Error("No NWC_URL set");
  }
  const nwcClient = new nwc.NWCClient({
    nostrWalletConnectUrl,
  });

  // TODO: use limit instead of time-based paging
  let until: number | undefined;
  while (true) {
    const { transactions } = await nwcClient.listTransactions({
      until,
    });
    if (!transactions.length) {
      return false;
    }
    const opponentTransaction = transactions.find(
      (t) =>
        t.type === "incoming" &&
        (t.metadata as OpponentInvoiceMetadata | undefined)?.gamePaymentHash ===
          gamePaymentHash
    );
    if (opponentTransaction) {
      return true;
    }
    until = transactions[transactions.length - 1].created_at - 1;
  }
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
      t.type === "incoming" &&
      (t.metadata as OpponentInvoiceMetadata | undefined)?.gamePaymentHash ===
        gamePaymentHash
  );

  if (!challengerTransaction || !opponentTransaction) {
    return { status: "pending", options: [] };
  }

  if (!challengerTransaction.preimage || !opponentTransaction.preimage) {
    return { status: "pending", options: [] };
  }

  const challengerTransactionMetadata =
    challengerTransaction.metadata as ChallengerInvoiceMetadata;
  const opponentTransactionMetadata =
    opponentTransaction.metadata as OpponentInvoiceMetadata;

  const challengerOption = challengerTransactionMetadata.option;
  const opponentOption = opponentTransactionMetadata.option;

  let status: GameStatus = "draw";

  if (
    (challengerOption === "paper" && opponentOption === "rock") ||
    (challengerOption === "rock" && opponentOption === "scissors") ||
    (challengerOption === "scissors" && opponentOption === "paper")
  ) {
    status = isChallenger ? "win" : "lose";
  } else if (challengerOption !== opponentOption) {
    status = isChallenger ? "lose" : "win";
  }

  if (status === "draw") {
    // for now, we can't refund both users. So instead, pick one of the players to win
    // using something only the server knows
    const seed = parseInt(
      challengerTransaction.preimage.substring(0, 4) +
        opponentTransaction.preimage.substring(0, 4),
      16
    );
    var x = Math.sin(seed) * 10000;
    status = x - Math.floor(x) > 0.5 ? "win" : "lose";
    if (!isChallenger) {
      status = status === "win" ? "lose" : "win";
    }
  }

  // NOTE: the lightning transaction can only be paid once
  // so future attempts will fail
  try {
    const challengerWon =
      (isChallenger && status === "win") ||
      (!isChallenger && status === "lose");

    const invoiceToPay = challengerWon
      ? challengerTransactionMetadata.winInvoice
      : opponentTransactionMetadata.winInvoice;

    console.log(
      "Attempting to pay to",
      challengerWon ? "challenger" : "opponent",
      invoiceToPay
    );

    await nwcClient.payInvoice({
      invoice: invoiceToPay,
    });
    console.log(
      "Paid to ",
      challengerWon ? "challenger" : "opponent",
      invoiceToPay
    );
  } catch (error) {
    console.error(error);
  }

  const options = isChallenger
    ? [challengerOption, opponentOption]
    : [opponentOption, challengerOption];

  return { status, options };
}
