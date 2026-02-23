import { Autocomplete, TextField } from "@mui/material";

interface DropdownQuestionProps {
  value: string | null;
  options: string[];
  onChange: (value: string | null) => void;
}

export function DropdownQuestion({
  value,
  options,
  onChange,
}: DropdownQuestionProps) {
  return (
    <Autocomplete
      options={options}
      value={value || null}
      onChange={(_, newValue) => onChange(newValue)}
      renderInput={(params) => (
        <TextField {...params} placeholder="Select..." />
      )}
      isOptionEqualToValue={(option, val) => option === val}
    />
  );
}
