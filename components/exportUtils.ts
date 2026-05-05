// Shared export utilities for PickleNickAI
// Import these from any component that needs export functionality

export async function downloadTxt(content: string, label: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${label}_${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadPdf(content: string, label: string) {
  try {
    const res = await fetch("/api/export/chat-to-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, label }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "PDF generation failed" }));
      throw new Error(err.error || "PDF generation failed");
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${label}_${new Date().toISOString().slice(0, 10)}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "PDF export failed";
    console.error("[export/pdf]", msg);
    alert(`PDF export failed: ${msg}`);
  }
}

export async function downloadDOCX(content: string, label: string) {
  try {
    const res = await fetch("/api/export/docx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, title: label }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "DOCX generation failed" }));
      throw new Error(err.error || "DOCX generation failed");
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${label}_${new Date().toISOString().slice(0, 10)}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "DOCX export failed";
    console.error("[export/docx]", msg);
    alert(`DOCX export failed: ${msg}`);
  }
}

export async function downloadPPTX(content: string, label: string) {
  try {
    const res = await fetch("/api/export/pptx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, title: label }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "PPTX generation failed" }));
      throw new Error(err.error || "PPTX generation failed");
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${label}_${new Date().toISOString().slice(0, 10)}.pptx`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "PPTX export failed";
    console.error("[export/pptx]", msg);
    alert(`PPTX export failed: ${msg}`);
  }
}
