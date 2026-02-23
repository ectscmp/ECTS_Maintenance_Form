import { TextField } from "@mui/material";

interface TextBoxQuestionProps {
  value: string;
  onChange: (value: string) => void;
}

export function TextBoxQuestion({ value, onChange }: TextBoxQuestionProps) {
  return (
    <TextField
      fullWidth
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
