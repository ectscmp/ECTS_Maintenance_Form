import type { SavedForm } from "../types";

export function getSavedForms(): SavedForm[] {
  try {
    return JSON.parse(localStorage.getItem("savedForms") || "[]");
  } catch (error) {
    console.warn("Error: ", error);
    return [];
  }
}
