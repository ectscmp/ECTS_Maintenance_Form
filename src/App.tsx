import { useState } from "react";
import { ImportQuestions } from "./components/ImportQuestions";
import { DynamicForm } from "./components/DynamicForm";
import type { FormValue, QuestionList, SavedForm } from "./types";
import { SavedFormsDropdown } from "./components/SavedFormsDropdown";

function App() {
  const [questions, setQuestions] = useState<QuestionList | null>(null);
  const [loadedValues, setLoadedValues] = useState<Record<
    number,
    FormValue
  > | null>(null);
  const [loadedImageMap, setLoadedImageMap] = useState<Record<
    number,
    string
  > | null>(null);

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "32px 16px",
      }}
    >
      <SavedFormsDropdown
        onSelect={(form: SavedForm) => {
          setQuestions(form.questions);
          setLoadedValues(form.answers as Record<number, FormValue>);
          setLoadedImageMap(form.imageMap ?? null);
        }}
      />

      <ImportQuestions
        onImport={(importedQuestions) => {
          setQuestions(importedQuestions);
          setLoadedValues(null);
          setLoadedImageMap(null);
        }}
      />

      {questions && (
        <DynamicForm
          questions={questions}
          initialValues={loadedValues ?? undefined}
          initialImageMap={loadedImageMap ?? undefined}
          onSubmit={(answers) => {
            console.log("Form results:", answers);
          }}
        />
      )}
    </div>
  );
}

export default App;
