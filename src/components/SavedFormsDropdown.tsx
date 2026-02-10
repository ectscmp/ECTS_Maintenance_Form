import { useState } from "react";
import type { SavedForm } from "../types";
import { getSavedForms } from "../utils/savedForms";
import { Box, MenuItem, Select, Typography } from "@mui/material";

type Props = {
  onSelect: (form: SavedForm) => void;
};

export function SavedFormsDropdown({ onSelect }: Props) {
  const [forms] = useState<SavedForm[]>(getSavedForms());
  const [selectedId, setSelectedId] = useState("");

  if (forms.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" gutterBottom>
        Load previous submission
      </Typography>

      <Select
        fullWidth
        value={selectedId}
        displayEmpty
        onChange={(e) => {
          const id = e.target.value;
          setSelectedId(id);

          const form = forms.find((f) => f.id === id);
          if (form) onSelect(form);
        }}
      >
        <MenuItem value="" disabled>
          Select a saved form...
        </MenuItem>

        {forms.map((form) => (
          <MenuItem key={form.id} value={form.id}>
            {new Date(form.createdAt).toLocaleString()}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}
