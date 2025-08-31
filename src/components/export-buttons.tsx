"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react"
import { exportToExcel, exportToPDF } from "@/lib/export"
import { useToast } from "@/hooks/use-toast"
import type { InventoryItem } from "@/types/inventory"

interface ExportButtonsProps {
  items: InventoryItem[]
  filteredItems: InventoryItem[]
  disabled?: boolean
}

export function ExportButtons({ items, filteredItems, disabled = false }: ExportButtonsProps) {
  const { toast } = useToast()
  const [exporting, setExporting] = useState<string | null>(null)

  const handleExport = async (type: "excel" | "pdf", useFiltered = false) => {
    const dataToExport = useFiltered ? filteredItems : items

    if (dataToExport.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay productos para exportar",
        variant: "destructive",
      })
      return
    }

    setExporting(type)

    try {
      const timestamp = new Date().toISOString().split("T")[0]
      const filename = `inventario_${timestamp}`

      if (type === "excel") {
        exportToExcel(dataToExport, filename)
        toast({
          title: "Éxito",
          description: `Archivo Excel exportado: ${filename}.xlsx`,
        })
      } else {
        exportToPDF(dataToExport, filename)
        toast({
          title: "Éxito",
          description: `Archivo PDF exportado: ${filename}.pdf`,
        })
      }
    } catch (error) {
      console.error("Error exporting:", error)
      toast({
        title: "Error",
        description: `Error al exportar a ${type.toUpperCase()}`,
        variant: "destructive",
      })
    } finally {
      setExporting(null)
    }
  }

  const isExporting = exporting !== null
  const hasFilteredData = filteredItems.length > 0
  const hasAllData = items.length > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || isExporting || !hasAllData} className="gap-2 bg-transparent">
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {isExporting ? "Exportando..." : "Exportar"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Excel Export Options */}
        <DropdownMenuItem
          onClick={() => handleExport("excel", false)}
          disabled={isExporting || !hasAllData}
          className="gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <div className="flex flex-col">
            <span>Excel - Todos los productos</span>
            <span className="text-xs text-muted-foreground">{items.length} productos</span>
          </div>
        </DropdownMenuItem>

        {hasFilteredData && filteredItems.length !== items.length && (
          <DropdownMenuItem onClick={() => handleExport("excel", true)} disabled={isExporting} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            <div className="flex flex-col">
              <span>Excel - Productos filtrados</span>
              <span className="text-xs text-muted-foreground">{filteredItems.length} productos</span>
            </div>
          </DropdownMenuItem>
        )}

        {/* PDF Export Options */}
        <DropdownMenuItem
          onClick={() => handleExport("pdf", false)}
          disabled={isExporting || !hasAllData}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          <div className="flex flex-col">
            <span>PDF - Todos los productos</span>
            <span className="text-xs text-muted-foreground">{items.length} productos</span>
          </div>
        </DropdownMenuItem>

        {hasFilteredData && filteredItems.length !== items.length && (
          <DropdownMenuItem onClick={() => handleExport("pdf", true)} disabled={isExporting} className="gap-2">
            <FileText className="h-4 w-4" />
            <div className="flex flex-col">
              <span>PDF - Productos filtrados</span>
              <span className="text-xs text-muted-foreground">{filteredItems.length} productos</span>
            </div>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
