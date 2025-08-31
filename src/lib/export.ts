import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { InventoryItem } from "../types/inventory"

// Mapear estados para mostrar nombres legibles
function getStatusLabel(status: InventoryItem["status"]): string {
  const labels = {
    disponible: "Nuevo",
    en_transito: "Usado",
  }
  return labels[status] || status
}

// Mapear bodegas para mostrar nombres legibles
function getWarehouseLabel(warehouse: InventoryItem["warehouse"]): string {
  const labels = {
    bodega_1: "Bodega Principal",
    bodega_2: "Bodega Secundaria",
    bodega_3: "Bodega Externa",
  }
  return labels[warehouse] || warehouse
}

// Exportar a Excel CON URL DE IMAGEN
export function exportToExcel(data: InventoryItem[], filename = "inventario") {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map((item) => ({
      ID: item.id,
      Descripción: item.description,
      Estado: getStatusLabel(item.status),
      Bodega: getWarehouseLabel(item.warehouse),
      "URL Imagen": item.imageUrl || "Sin imagen",
      "Fecha Creación": item.createdAt.toLocaleDateString(),
      "Última Actualización": item.updatedAt.toLocaleDateString(),
    })),
  )

  // Ajustar anchos de columna
  const colWidths = [
    { wch: 20 }, // ID
    { wch: 40 }, // Descripción
    { wch: 15 }, // Estado
    { wch: 20 }, // Bodega
    { wch: 50 }, // URL Imagen
    { wch: 15 }, // Fecha Creación
    { wch: 15 }, // Última Actualización
  ]
  worksheet["!cols"] = colWidths

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario")

  // Agregar hoja de resumen
  const summaryData = [
    { Concepto: "Total de productos", Valor: data.length },
    { Concepto: "Productos nuevos", Valor: data.filter(item => item.status === "disponible").length },
    { Concepto: "Productos usados", Valor: data.filter(item => item.status === "en_transito").length },
    { Concepto: "Productos con imagen", Valor: data.filter(item => item.imageUrl).length },
    { Concepto: "Sin imagen", Valor: data.filter(item => !item.imageUrl).length },
    { Concepto: "Fecha de exportación", Valor: new Date().toLocaleString() },
  ]
  
  const summarySheet = XLSX.utils.json_to_sheet(summaryData)
  summarySheet["!cols"] = [{ wch: 25 }, { wch: 30 }]
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumen")

  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

// Exportar a PDF mejorado
export function exportToPDF(data: InventoryItem[], filename = "inventario") {
  const doc = new jsPDF()

  // Título
  doc.setFontSize(20)
  doc.text("Reporte de Inventario", 14, 22)

  // Fecha del reporte
  doc.setFontSize(12)
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 32)
  doc.text(`Total: ${data.length} productos`, 14, 39)

  // Estadísticas
  const nuevos = data.filter(item => item.status === "disponible").length
  const usados = data.filter(item => item.status === "en_transito").length
  const conImagen = data.filter(item => item.imageUrl).length
  
  doc.setFontSize(10)
  doc.text(`Nuevos: ${nuevos} | Usados: ${usados} | Con imagen: ${conImagen}`, 14, 46)

  // Tabla con indicador de imagen
  autoTable(doc, {
    head: [["ID", "Descripción", "Estado", "Bodega", "Img", "Fecha"]],
    body: data.map((item) => [
      item.id.substring(0, 8) + "...",
      item.description.length > 35 ? item.description.substring(0, 35) + "..." : item.description,
      getStatusLabel(item.status),
      getWarehouseLabel(item.warehouse),
      item.imageUrl ? "✓" : "✗",
      item.createdAt.toLocaleDateString(),
    ]),
    startY: 52,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246], // blue-500
      textColor: [255, 255, 255],
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // gray-50
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 55 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 35 },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 25, halign: 'center' },
    },
  })

  doc.save(`${filename}.pdf`)
}