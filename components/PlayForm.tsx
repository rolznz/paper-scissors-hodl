import {
  APP_NAME,
  GAME_AMOUNT_SATS,
  Option,
  options,
  WIN_AMOUNT_SATS,
} from "@/app/types";

type PlayFormProps = {
  onSubmit(event: React.FormEvent): Promise<void>;
  selectedOption: Option | undefined;
  setSelectedOption(option: Option): void;
  isOpponent?: boolean;
};

export function PlayForm({
  onSubmit,
  selectedOption,
  setSelectedOption,
  isOpponent,
}: PlayFormProps) {
  return (
    <>
      <p className="uppercase">{APP_NAME}</p>
      {isOpponent && (
        <p className="text-sm my-4 max-w-sm">
          {"You've"} been challenged to a game of {APP_NAME}. Your challenger
          has already made their choice!
        </p>
      )}
      <form onSubmit={onSubmit}>
        {options.map((option) => (
          <div className="form-control" key={option}>
            <label className="label cursor-pointer">
              <span className="label-text">{option}</span>
              <input
                id={option}
                type="radio"
                name="option"
                className="radio checked:bg-red-500"
                required
                checked={option === selectedOption}
                onChange={(e) => e.target.checked && setSelectedOption(option)}
              />
            </label>
          </div>
        ))}

        <button className="btn btn-primary mt-4 w-full">
          Choose & Pay {GAME_AMOUNT_SATS} sats
        </button>
        <p className="text-xs mt-8">How it works:</p>
        <ul className="list-decimal">
          <li className="text-xs mt-2">
            An invoice will be requested from your wallet of {WIN_AMOUNT_SATS}{" "}
            sats. {APP_NAME} will pay this invoice if you win.
          </li>
          <li className="text-xs mt-2">
            You will pay an invoice of {GAME_AMOUNT_SATS} sats. If you lose,
            this will be paid to your opponent.
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
      </form>
    </>
  );
}
