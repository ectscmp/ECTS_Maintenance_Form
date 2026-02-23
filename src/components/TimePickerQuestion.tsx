import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

interface TimePickerQuestionProps {
  value: string | null; // ISO string
  onChange: (value: string | null) => void;
}

export function TimePickerQuestion({
  value,
  onChange,
}: TimePickerQuestionProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimePicker
        value={value ? dayjs(value) : null}
        onChange={(newValue) => onChange(newValue?.toISOString() ?? null)}
        slotProps={{ textField: { fullWidth: true } }}
      />
    </LocalizationProvider>
  );
}
