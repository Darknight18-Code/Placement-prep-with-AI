"use server";

import * as pdfjs from "pdfjs-dist/legacy/build/pdf.js";

/** * We must manually import the worker and assign it to GlobalWorkerOptions 
 * to bypass the "Cannot find module './pdf.worker.js'" error.
 */
const setupWorker = async () => {
  if (typeof window === "undefined" && !pdfjs.GlobalWorkerOptions.workerSrc) {
    // In a Node.js environment, we point directly to the legacy worker file
    pdfjs.GlobalWorkerOptions.workerSrc = require("pdfjs-dist/legacy/build/pdf.worker.js");
  }
};

export async function extractTextFromPDF(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) return { success: false, text: "No file uploaded" };

  try {
    await setupWorker(); // Ensure worker is configured before processing

    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    const loadingTask = pdfjs.getDocument({
      data: buffer,
      verbosity: 0,
    });

    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      
      fullText += pageText + "\n";
    }

    return { success: true, text: fullText.trim() };
  } catch (error) {
    console.error("PDF Extraction Error:", error);
    return { success: false, text: "Extraction failed." };
  }
}