import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { InventoryItem } from "../types/inventory"

// Exportar a Excel
export function exportToExcel(data: InventoryItem[], filename = "inventario") {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map((item) => ({
      ID: item.id,
      Descripción: item.description,
      Estado: item.status,
      Bodega: item.warehouse,
      "Fecha Creación": item.createdAt.toLocaleDateString(),
      "Última Actualización": item.updatedAt.toLocaleDateString(),
    })),
  )

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario")

  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

// Exportar a PDF
export function exportToPDF(data: InventoryItem[], filename = "inventario") {
  const doc = new jsPDF()

  // Título
  doc.setFontSize(20)
  doc.text("Reporte de Inventario", 14, 22)

  // Fecha del reporte
  doc.setFontSize(12)
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 32)

  // Tabla
  autoTable(doc, {
    head: [["ID", "Descripción", "Estado", "Bodega", "Fecha Creación"]],
    body: data.map((item) => [
      item.id.substring(0, 8) + "...",
      item.description,
      item.status,
      item.warehouse,
      item.createdAt.toLocaleDateString(),
    ]),
    startY: 40,
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [31, 41, 55], // gray-800
      textColor: [255, 255, 255],
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // gray-50
    },
  })

  doc.save(`${filename}.pdf`)
}
