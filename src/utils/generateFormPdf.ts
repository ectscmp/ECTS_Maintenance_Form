import jsPDF from "jspdf";
import type { QuestionList } from "../types";

export async function generateFormPDF(
  questions: QuestionList,
  answers: Record<number, unknown>,
) {
  const doc = new jsPDF();

  const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
  const MARGIN = 20;

  let y = MARGIN;

  doc.setFontSize(16);
  doc.text("Form Responses", 10, y);
  y += 12;

  doc.setFontSize(12);

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const answer = answers[i];

    /* ---- QUESTION ---- */
    if (y + 7 > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }

    doc.text(`Q${i + 1}: ${q.question}`, 10, y);
    y += 7;

    /* ---- ANSWER ---- */
    if (q.answerType === "ImageUpload" && answer instanceof File) {
      const base64 = await filetoBase64(answer);
      const format = base64.includes("image/png") ? "PNG" : "JPEG";

      const imgHeight = 80;
      const imgPadding = 5;

      if (y + imgHeight > PAGE_HEIGHT - MARGIN) {
        doc.addPage();
        y = MARGIN;
      }

      doc.addImage(base64, format, 10, y, 80, imgHeight);
      y += imgHeight + imgPadding;
    } else {
      const answerText = Array.isArray(answer)
        ? answer.join(", ")
        : String(answer ?? "No answer provided");

      if (y + 10 > PAGE_HEIGHT - MARGIN) {
        doc.addPage();
        y = MARGIN;
      }

      doc.text(`A: ${answerText}`, 14, y);
      y += 10;
    }

    y += 3; // spacing between questions
  }

  doc.save("form_responses.pdf");
}

function filetoBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
