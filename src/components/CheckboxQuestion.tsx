import { FormControlLabel, Checkbox } from "@mui/material";

interface CheckboxQuestionProps {
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
}

export function CheckboxQuestion({
  value,
  options,
  onChange,
}: CheckboxQuestionProps) {
  const current = value || [];

  const handleToggle = (option: string) => {
    if (current.includes(option)) {
      onChange(current.filter((v) => v !== option));
    } else {
      onChange([...current, option]);
    }
  };

  return (
    <>
      {options.map((option) => (
        <FormControlLabel
          key={option}
          control={
            <Checkbox
              checked={current.includes(option)}
              onChange={() => handleToggle(option)}
            />
          }
          label={option}
        />
      ))}
    </>
  );
}
