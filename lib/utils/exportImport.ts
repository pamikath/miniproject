/**
 * Utility functions for Import & Export (CSV, Excel-compatible CSV, JSON)
 */

export function exportToJSON(data: any, filename = "export.json") {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
  triggerDownload(blob, filename.endsWith(".json") ? filename : `${filename}.json`);
}

export function exportToCSV(data: any[], filename = "export.csv") {
  if (!data || data.length === 0) {
    throw new Error("ไม่มีข้อมูลสำหรับส่งออก");
  }

  // Flatten nested objects if needed
  const flattened = data.map((item) => flattenObjectForExport(item));
  const headers = Array.from(
    new Set(flattened.flatMap((item) => Object.keys(item)))
  );

  const csvRows: string[] = [];

  // Header row
  csvRows.push(headers.map((h) => escapeCSVField(h)).join(","));

  // Data rows
  for (const item of flattened) {
    const row = headers.map((header) => {
      const val = item[header];
      if (val === undefined || val === null) return '""';
      return escapeCSVField(String(val));
    });
    csvRows.push(row.join(","));
  }

  // Prepend UTF-8 BOM so Microsoft Excel opens Thai characters correctly
  const csvContent = "\uFEFF" + csvRows.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, filename.endsWith(".csv") ? filename : `${filename}.csv`);
}

/**
 * Export Excel-compatible format with UTF-8 BOM and .csv extension
 */
export function exportToExcel(data: any[], filename = "export.csv") {
  const excelFilename = filename.replace(/\.(csv|xlsx|json)$/i, "") + "_excel.csv";
  exportToCSV(data, excelFilename);
}

function escapeCSVField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n") || field.includes("\r")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return `"${field}"`;
}

function flattenObjectForExport(obj: any): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val === null || val === undefined) {
      result[key] = "";
    } else if (Array.isArray(val)) {
      if (val.length > 0 && typeof val[0] === "object") {
        // e.g. order items
        result[key] = val.map((v) => v.title || v.name || JSON.stringify(v)).join(" | ");
      } else {
        result[key] = val.join(", ");
      }
    } else if (typeof val === "object" && !(val instanceof Date)) {
      // nested object e.g. address
      for (const subKey of Object.keys(val)) {
        result[`${key}_${subKey}`] = val[subKey];
      }
    } else {
      result[key] = val;
    }
  }

  return result;
}

export function parseCSV(csvText: string): Record<string, string>[] {
  // Strip BOM if present
  let cleanText = csvText;
  if (cleanText.charCodeAt(0) === 0xfeff) {
    cleanText = cleanText.slice(1);
  }

  const lines: string[] = [];
  let currentRow = "";
  let insideQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      currentRow += '"';
      i++; // skip escaped quote
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if ((char === "\r" || char === "\n") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") i++;
      if (currentRow.trim()) lines.push(currentRow);
      currentRow = "";
    } else {
      currentRow += char;
    }
  }
  if (currentRow.trim()) {
    lines.push(currentRow);
  }

  if (lines.length < 2) {
    throw new Error("ไฟล์ CSV ต้องมีหัวตาราง (Header) และข้อมูลอย่างน้อย 1 แถว");
  }

  const headers = parseCSVRow(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVRow(lines[i]);
    if (values.length === 0 || (values.length === 1 && !values[0])) continue;

    const rowObj: Record<string, string> = {};
    headers.forEach((header, index) => {
      rowObj[header.trim()] = values[index] !== undefined ? values[index].trim() : "";
    });
    rows.push(rowObj);
  }

  return rows;
}

function parseCSVRow(rowLine: string): string[] {
  const result: string[] = [];
  let currentVal = "";
  let insideQuotes = false;

  for (let i = 0; i < rowLine.length; i++) {
    const char = rowLine[i];
    const nextChar = rowLine[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      currentVal += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      result.push(currentVal);
      currentVal = "";
    } else {
      currentVal += char;
    }
  }
  result.push(currentVal);
  return result;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
