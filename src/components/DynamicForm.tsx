import { Box, Button } from "@mui/material";
import type { DynamicFormProps, FormValue } from "../types";
import { useFormState } from "../hooks/useFormState";
import { QuestionWrapper } from "./QuestionWrapper";
import { TextBoxQuestion } from "./TextBoxQuestion";
import { MultipleChoiceQuestion } from "./MultipleChoiceQuestion";
import { CheckboxQuestion } from "./CheckboxQuestion";
import { DropdownQuestion } from "./DropdownQuestion";
import { FileUploadQuestion } from "./FileUploadQuestion";
import { DatePickerQuestion } from "./DatePickerQuestion";
import { TimePickerQuestion } from "./TimePickerQuestion";
import { useCallback } from "react";

type ValueType = string | string[] | null;

export function DynamicForm({
  questions,
  onSubmit,
  initialValues,
  initialImageMap,
  onFormChange,
}: DynamicFormProps) {
  const handleFormSubmit = useCallback(
    (answers: Record<number, unknown>) => {
      // Cast is safe because useFormState guarantees the values match FormValue
      onSubmit(answers as Record<number, FormValue>);
    },
    [onSubmit],
  );

  const handleFormChange = useCallback(
    (values: Record<number, ValueType>, imageMap: Record<number, string>) => {
      // Cast values back to FormValue (safe, as explained earlier)
      onFormChange(values as Record<number, FormValue>, imageMap);
    },
    [onFormChange],
  );

  const typedInitialValues = initialValues as
    | Record<number, ValueType>
    | undefined;

  const {
    values,
    errors,
    saving,
    handleChange,
    handleFileUpload,
    handleSubmit,
  } = useFormState(
    questions,
    handleFormSubmit,
    typedInitialValues,
    initialImageMap,
    handleFormChange,
  );

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
        const value = values[index];
        const error = errors[index];

        let inputElement: React.ReactNode = null;

        switch (q.answerType) {
          case "TextBox":
            inputElement = (
              <TextBoxQuestion
                value={value as string}
                onChange={(v) => handleChange(index, v)}
              />
            );
            break;
          case "MultipleChoice":
            inputElement = (
              <MultipleChoiceQuestion
                value={value as string}
                options={q.answers}
                onChange={(v) => handleChange(index, v)}
              />
            );
            break;
          case "Checkbox":
            inputElement = (
              <CheckboxQuestion
                value={value as string[]}
                options={q.answers}
                onChange={(v) => handleChange(index, v)}
              />
            );
            break;
          case "Dropdown":
            inputElement = (
              <DropdownQuestion
                value={value as string | null}
                options={q.answers}
                onChange={(v) => handleChange(index, v)}
              />
            );
            break;
          case "FileUpload":
            inputElement = (
              <FileUploadQuestion
                value={value as string | undefined}
                onChange={(file) => handleFileUpload(index, file)}
              />
            );
            break;
          case "DatePicker":
            inputElement = (
              <DatePickerQuestion
                value={value as string | null}
                onChange={(v) => handleChange(index, v)}
              />
            );
            break;
          case "TimePicker":
            inputElement = (
              <TimePickerQuestion
                value={value as string | null}
                onChange={(v) => handleChange(index, v)}
              />
            );
            break;
          default:
            inputElement = null;
        }

        return (
          <QuestionWrapper
            key={index}
            id={`question-${index}`}
            question={q.question}
            required={q.required}
            error={error}
          >
            {inputElement}
          </QuestionWrapper>
        );
      })}
      <Button
        variant="contained"
        size="large"
        sx={{ alignSelf: "flex-end", mt: 2, px: 4 }}
        onClick={handleSubmit}
        disabled={saving}
      >
        {saving ? "Saving…" : "Submit & Download PDF"}
      </Button>
    </Box>
  );
}
