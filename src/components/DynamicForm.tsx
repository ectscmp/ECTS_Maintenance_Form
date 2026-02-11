import { useEffect, useState } from "react";
import type { DynamicFormProps, SavedForm } from "../types";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { generateFormPDF } from "../utils/generateFormPdf";
import {
  fileToBase64,
  saveImageBase64,
  loadImageBase64,
} from "../utils/imageStore";

const questionBoxStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 1.5,
  padding: 2,
  borderRadius: 1.5,
  backgroundColor: "#fafafa",
  border: "1px solid #e0e0e0",
};

function QuestionLabel({
  text,
  required,
}: {
  text: string;
  required?: boolean;
}) {
  return (
    <Typography variant="subtitle1" fontWeight={500}>
      {text}
      {required && <span style={{ color: "red", marginLeft: 4 }}>*</span>}
    </Typography>
  );
}

export function DynamicForm({
  questions,
  onSubmit,
  initialValues,
  initialImageMap,
}: DynamicFormProps) {
  type ValueType = string | string[] | File | null;

  const [values, setValues] = useState<Record<number, ValueType>>(
    initialValues ?? {},
  );
  const [imageMap, setImageMap] = useState<Record<number, string>>(
    initialImageMap ?? {},
  );
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [shakeKey, setShakeKey] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleChange = (index: number, value: ValueType) => {
    setValues((prev) => ({ ...prev, [index]: value }));
  };

  const validate = (): number | null => {
    const newErrors: Record<number, string> = {};
    questions.forEach((q, index) => {
      if (!q.required) return;
      const value = values[index];
      const isEmpty =
        value == null ||
        (typeof value === "string" && value.trim() === "") ||
        (Array.isArray(value) && value.length === 0);
      if (isEmpty) newErrors[index] = "This field is required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length > 0
      ? Number(Object.keys(newErrors)[0])
      : null;
  };

  const handleSubmit = async () => {
    setSaving(true);
    const firstErrorIndex = validate();
    if (firstErrorIndex !== null) {
      setShakeKey((prev) => prev + 1);
      document
        .getElementById(`question-${firstErrorIndex}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      setSaving(false);
      return;
    }

    const newImageMap: Record<number, string> = { ...imageMap };
    const cleanAnswers: Record<number, unknown> = { ...values };

    // Save files as Base64
    for (const [indexStr, val] of Object.entries(values)) {
      const index = Number(indexStr);
      if (val instanceof File) {
        const base64 = await fileToBase64(val);
        const id = await saveImageBase64(base64);
        newImageMap[index] = id;
        delete cleanAnswers[index]; // don't store File directly
      }
    }

    // Update imageMap state
    setImageMap(newImageMap);

    const savedForm: SavedForm = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      questions,
      answers: cleanAnswers,
      imageMap: newImageMap,
    };

    const existing: SavedForm[] = JSON.parse(
      localStorage.getItem("savedForms") || "[]",
    );
    localStorage.setItem(
      "savedForms",
      JSON.stringify([...existing, savedForm]),
    );

    generateFormPDF(questions, cleanAnswers, newImageMap);
    onSubmit(cleanAnswers);
    setSaving(false);
  };

  // Restore Base64 images on mount
  useEffect(() => {
    if (!initialImageMap) return;

    (async () => {
      const restored: Record<number, ValueType> = { ...(initialValues ?? {}) };

      for (const [indexStr, imageId] of Object.entries(initialImageMap)) {
        const base64 = await loadImageBase64(imageId);
        if (base64) restored[Number(indexStr)] = base64;
      }
      setValues(restored);
    })();
  }, [initialImageMap, initialValues]);

  useEffect(() => {
    setValues(initialValues ?? {});
    setImageMap(initialImageMap ?? {});
    setErrors({});
  }, [initialImageMap, initialValues, questions]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={4}
      sx={{
        backgroundColor: "#fff",
        borderRadius: 2,
        padding: 3,
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
      }}
    >
      {questions.map((q, index) => {
        const val = values[index];

        const errorBorder = errors[index] ? "#d32f2f" : "#e0e0e0";

        switch (q.answerType) {
          case "TextBox":
            return (
              <Box
                key={shakeKey}
                id={`question-${index}`}
                sx={{ ...questionBoxStyle, borderColor: errorBorder }}
              >
                <QuestionLabel text={q.question} required={q.required} />
                <TextField
                  fullWidth
                  value={(val as string) || ""}
                  onChange={(e) => handleChange(index, e.target.value)}
                />
                {errors[index] && (
                  <Typography color="error" variant="caption">
                    {errors[index]}
                  </Typography>
                )}
              </Box>
            );

          case "MultipleChoice":
            return (
              <Box
                key={shakeKey}
                id={`question-${index}`}
                sx={{ ...questionBoxStyle, borderColor: errorBorder }}
              >
                <QuestionLabel text={q.question} required={q.required} />
                <RadioGroup
                  value={(val as string) || ""}
                  onChange={(e) => handleChange(index, e.target.value)}
                >
                  {q.answers.map((answer) => (
                    <FormControlLabel
                      key={answer}
                      value={answer}
                      control={<Radio />}
                      label={answer}
                    />
                  ))}
                </RadioGroup>
                {errors[index] && (
                  <Typography color="error" variant="caption">
                    {errors[index]}
                  </Typography>
                )}
              </Box>
            );

          case "Checkbox":
            return (
              <Box
                key={shakeKey}
                id={`question-${index}`}
                sx={{ ...questionBoxStyle, borderColor: errorBorder }}
              >
                <QuestionLabel text={q.question} required={q.required} />
                {q.answers.map((answer) => {
                  const current = (val as string[]) || [];
                  return (
                    <FormControlLabel
                      key={answer}
                      control={
                        <Checkbox
                          checked={current.includes(answer)}
                          onChange={(e) =>
                            handleChange(
                              index,
                              e.target.checked
                                ? [...current, answer]
                                : current.filter((a) => a !== answer),
                            )
                          }
                        />
                      }
                      label={answer}
                    />
                  );
                })}
                {errors[index] && (
                  <Typography color="error" variant="caption">
                    {errors[index]}
                  </Typography>
                )}
              </Box>
            );

          case "Dropdown":
            return (
              <Box
                key={shakeKey}
                id={`question-${index}`}
                sx={{ ...questionBoxStyle, borderColor: errorBorder }}
              >
                <QuestionLabel text={q.question} required={q.required} />

                <Autocomplete
                  options={q.answers}
                  value={(val as string) || null}
                  onChange={(_, newValue) => handleChange(index, newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select..."
                      error={!!errors[index]}
                    />
                  )}
                  isOptionEqualToValue={(option, value) => option === value}
                />

                {errors[index] && (
                  <Typography color="error" variant="caption">
                    {errors[index]}
                  </Typography>
                )}
              </Box>
            );

          case "FileUpload": {
            let previewUrl: string | undefined;
            if (val instanceof File) previewUrl = URL.createObjectURL(val);
            else if (typeof val === "string") previewUrl = val;

            return (
              <Box
                key={shakeKey}
                id={`question-${index}`}
                sx={{ ...questionBoxStyle, borderColor: errorBorder }}
              >
                <QuestionLabel text={q.question} required={q.required} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleChange(index, file);
                  }}
                />
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      marginTop: 12,
                      maxWidth: "100%",
                      maxHeight: 300,
                      borderRadius: 8,
                      border: "1px solid #ddd",
                    }}
                  />
                )}
                {errors[index] && (
                  <Typography color="error" variant="caption">
                    {errors[index]}
                  </Typography>
                )}
              </Box>
            );
          }

          default:
            return null;
        }
      })}
      <Button
        variant="contained"
        size="large"
        sx={{ alignSelf: "flex-end", mt: 2, px: 4 }}
        onClick={handleSubmit}
      >
        {saving ? "Saving…" : "Submit & Download PDF"}
      </Button>
    </Box>
  );
}
