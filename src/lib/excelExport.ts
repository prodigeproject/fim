import ExcelJS from "exceljs";
import { format } from "date-fns";

/**
 * Utility functions for Excel export using ExcelJS (secure alternative to xlsx)
 */

export interface SheetData {
  name: string;
  data: Record<string, unknown>[];
  columns?: { header: string; key: string; width?: number }[];
}

/**
 * Create and download an Excel workbook with multiple sheets
 */
export async function exportToExcel(
  sheets: SheetData[],
  filename: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "FIM Admin";
  workbook.created = new Date();

  for (const sheet of sheets) {
    if (sheet.data.length === 0) continue;

    const worksheet = workbook.addWorksheet(sheet.name.slice(0, 31)); // Max 31 chars

    // Auto-detect columns if not provided
    if (sheet.columns) {
      worksheet.columns = sheet.columns;
    } else {
      const keys = Object.keys(sheet.data[0]);
      worksheet.columns = keys.map((key) => ({
        header: key,
        key: key,
        width: Math.max(key.length, 15),
      }));
    }

    // Add header row styling
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // Add data rows
    for (const row of sheet.data) {
      worksheet.addRow(row);
    }

    // Auto-fit columns based on content
    worksheet.columns.forEach((column) => {
      if (column.eachCell) {
        let maxLength = 10;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const cellLength = cell.value ? String(cell.value).length : 0;
          if (cellLength > maxLength) {
            maxLength = Math.min(cellLength, 50);
          }
        });
        column.width = maxLength + 2;
      }
    });
  }

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Create a simple single-sheet Excel export
 */
export async function exportSingleSheet(
  data: Record<string, unknown>[],
  sheetName: string,
  filename: string
): Promise<void> {
  await exportToExcel([{ name: sheetName, data }], filename);
}

/**
 * Export array of arrays (AOA) to Excel - useful for custom formatted reports
 */
export async function exportAOAToExcel(
  aoaData: (string | number | null | undefined)[][],
  sheetName: string,
  filename: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "FIM Admin";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sheetName.slice(0, 31));

  for (const row of aoaData) {
    worksheet.addRow(row);
  }

  // Style the first row as header if it looks like one
  if (aoaData.length > 0) {
    const firstRow = worksheet.getRow(1);
    firstRow.font = { bold: true };
  }

  // Auto-fit columns
  worksheet.columns.forEach((column, index) => {
    let maxLength = 10;
    worksheet.eachRow((row) => {
      const cell = row.getCell(index + 1);
      const cellLength = cell.value ? String(cell.value).length : 0;
      if (cellLength > maxLength) {
        maxLength = Math.min(cellLength, 50);
      }
    });
    column.width = maxLength + 2;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get formatted filename with date
 */
export function getExcelFilename(prefix: string): string {
  return `${prefix}-${format(new Date(), "yyyy-MM-dd-HHmm")}.xlsx`;
}
