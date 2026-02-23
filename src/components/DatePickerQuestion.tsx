import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

interface DatePickerQuestionProps {
  value: string | null; // ISO string
  onChange: (value: string | null) => void;
}

export function DatePickerQuestion({
  value,
  onChange,
}: DatePickerQuestionProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        value={value ? dayjs(value) : null}
        onChange={(newValue) => onChange(newValue?.toISOString() ?? null)}
        slotProps={{ textField: { fullWidth: true } }}
      />
    </LocalizationProvider>
  );
}
