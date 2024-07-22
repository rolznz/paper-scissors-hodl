import { GAME_AMOUNT_SATS, Option, options, WIN_AMOUNT_SATS } from "@/app/types";

type PlayFormProps =  {
  onSubmit(event: React.FormEvent): Promise<void>;
  selectedOption: Option | undefined;
  setSelectedOption(option: Option): void;
  isOpponent?: boolean;
}

export function PlayForm({onSubmit, selectedOption, setSelectedOption, isOpponent}: PlayFormProps) {
  return (
    <>
      <p>PAPER SCISSORS HODL</p>
      {isOpponent && <p className="text-sm my-4 max-w-sm">{"You've"} been challenged to a game of Paper Scissors HODL. Your challenger has already made their choice!</p>}
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
        <p className="text-xs mt-2">If you win, you will receive {WIN_AMOUNT_SATS} sats</p>
      </form>
    </>
  );
}