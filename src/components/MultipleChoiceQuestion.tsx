import { RadioGroup, FormControlLabel, Radio } from "@mui/material";

interface MultipleChoiceQuestionProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export function MultipleChoiceQuestion({
  value,
  options,
  onChange,
}: MultipleChoiceQuestionProps) {
  return (
    <RadioGroup value={value || ""} onChange={(e) => onChange(e.target.value)}>
      {options.map((option) => (
        <FormControlLabel
          key={option}
          value={option}
          control={<Radio />}
          label={option}
        />
      ))}
    </RadioGroup>
  );
}
