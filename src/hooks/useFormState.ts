import { useState, useEffect, useCallback, useRef } from "react";
import type { Question, SavedForm } from "../types";
import { generateFormPDF } from "../utils/generateFormPdf";
import { fileToBase64, saveImageBase64 } from "../utils/imageStore";

type ValueType = string | string[] | null; // File is no longer stored

interface UseFormStateReturn {
  values: Record<number, ValueType>;
  imageMap: Record<number, string>;
  errors: Record<number, string>;
  saving: boolean;
  handleChange: (index: number, value: ValueType) => void;
  handleFileUpload: (index: number, file: File) => Promise<void>;
  handleSubmit: () => Promise<void>;
  validate: () => number | null;
}

export function useFormState(
  questions: Question[],
  onSubmit: (answers: Record<number, unknown>) => void,
  initialValues?: Record<number, ValueType>,
  initialImageMap?: Record<number, string>,
  onFormChange?: (
    values: Record<number, ValueType>,
    imageMap: Record<number, string>,
  ) => void,
): UseFormStateReturn {
  const [values, setValues] = useState<Record<number, ValueType>>(
    initialValues ?? {},
  );
  const [imageMap, setImageMap] = useState<Record<number, string>>(
    initialImageMap ?? {},
  );
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);

  const changeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  // Debounced call to onFormChange
  useEffect(() => {
    if (onFormChange) {
      if (changeTimerRef.current) clearTimeout(changeTimerRef.current);
      changeTimerRef.current = setTimeout(() => {
        onFormChange(values, imageMap);
      }, 500);
    }
    return () => {
      if (changeTimerRef.current) clearTimeout(changeTimerRef.current);
    };
  }, [values, imageMap, onFormChange]);

  const handleChange = useCallback((index: number, value: ValueType) => {
    setValues((prev) => ({ ...prev, [index]: value }));
    // Clear error for this field
    setErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  }, []);

  const handleFileUpload = useCallback(async (index: number, file: File) => {
    try {
      const base64 = await fileToBase64(file);
      const id = await saveImageBase64(base64);
      setValues((prev) => ({ ...prev, [index]: id }));
      setImageMap((prev) => ({ ...prev, [index]: id }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    } catch (error) {
      console.error("Failed to save image", error);
      setErrors((prev) => ({ ...prev, [index]: "Failed to upload image" }));
    }
  }, []);

  const validate = useCallback((): number | null => {
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
    const errorIndices = Object.keys(newErrors).map(Number);
    return errorIndices.length > 0 ? errorIndices[0] : null;
  }, [questions, values]);

  const handleSubmit = useCallback(async () => {
    setSaving(true);
    try {
      const firstErrorIndex = validate();
      if (firstErrorIndex !== null) {
        document
          .getElementById(`question-${firstErrorIndex}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      const cleanAnswers: Record<number, unknown> = { ...values };

      const savedForm: SavedForm = {
        id: crypto.randomUUID?.(),
        createdAt: Date.now(),
        questions,
        answers: cleanAnswers,
        imageMap,
      };

      const existing: SavedForm[] = JSON.parse(
        localStorage.getItem("savedForms") || "[]",
      );
      localStorage.setItem(
        "savedForms",
        JSON.stringify([...existing, savedForm]),
      );

      await generateFormPDF(questions, cleanAnswers, imageMap);
      onSubmit(cleanAnswers);
    } catch (error) {
      console.error("Form submission failed:", error);
    } finally {
      setSaving(false);
    }
  }, [values, imageMap, validate, questions, onSubmit]);

  // Restore images from IDs (initialImageMap) on mount
  useEffect(() => {
    if (!initialImageMap) return;
    const restored: Record<number, ValueType> = { ...(initialValues ?? {}) };
    for (const [indexStr, imageId] of Object.entries(initialImageMap)) {
      restored[Number(indexStr)] = imageId;
    }
    setValues(restored);
  }, [initialImageMap, initialValues]);

  // Reset when questions change
  useEffect(() => {
    setValues(initialValues ?? {});
    setImageMap(initialImageMap ?? {});
    setErrors({});
  }, [initialImageMap, initialValues, questions]);

  return {
    values,
    imageMap,
    errors,
    saving,
    handleChange,
    handleFileUpload,
    handleSubmit,
    validate,
  };
}
