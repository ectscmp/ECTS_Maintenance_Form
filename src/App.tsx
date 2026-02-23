import { useState } from "react";
import { ImportQuestions } from "./components/ImportQuestions";
import { DynamicForm } from "./components/DynamicForm";
import type { FormValue, QuestionList, SavedForm } from "./types";
import { SavedFormsDropdown } from "./components/SavedFormsDropdown";

const DRAFT_KEY = "formDraft";

// Helper to read draft once (used in lazy initializer)
const loadDraft = () => {
  const saved = localStorage.getItem(DRAFT_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load draft", e);
    }
  }
  return null;
};

function App() {
  // Combine related state into one object and initialize lazily
  const [formState, setFormState] = useState<{
    questions: QuestionList | null;
    loadedValues: Record<number, FormValue> | null;
    loadedImageMap: Record<number, string> | null;
  }>(() => {
    const draft = loadDraft();
    if (draft) {
      return {
        questions: draft.questions,
        loadedValues: draft.values,
        loadedImageMap: draft.imageMap,
      };
    }
    return { questions: null, loadedValues: null, loadedImageMap: null };
  });

  // Destructure for convenience (optional)
  const { questions, loadedValues, loadedImageMap } = formState;

  // Save draft whenever the form changes (via onFormChange)
  const handleFormChange = (
    values: Record<number, FormValue>,
    imageMap: Record<number, string>,
  ) => {
    if (questions) {
      const draft = { questions, values, imageMap };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
  };

  // Import new questions – clear any existing draft
  const handleImport = (importedQuestions: QuestionList) => {
    setFormState({
      questions: importedQuestions,
      loadedValues: null,
      loadedImageMap: null,
    });
    localStorage.removeItem(DRAFT_KEY);
  };

  // Load a saved form – also update the draft
  const handleSelectSaved = (form: SavedForm) => {
    setFormState({
      questions: form.questions,
      loadedValues: form.answers as Record<number, FormValue>,
      loadedImageMap: form.imageMap ?? null,
    });
    // Immediately save as draft
    const draft = {
      questions: form.questions,
      values: form.answers,
      imageMap: form.imageMap ?? {},
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  };

  // Final submission – clear the draft
  const handleSubmit = (answers: Record<number, unknown>) => {
    console.log("Form results:", answers);
    localStorage.removeItem(DRAFT_KEY);
  };

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "32px 16px",
      }}
    >
      <SavedFormsDropdown onSelect={handleSelectSaved} />

      <ImportQuestions onImport={handleImport} />

      {questions && (
        <DynamicForm
          questions={questions}
          initialValues={loadedValues ?? undefined}
          initialImageMap={loadedImageMap ?? undefined}
          onFormChange={handleFormChange}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

export default App;
