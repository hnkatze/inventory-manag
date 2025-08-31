"use client"

import { useState, useEffect } from "react"
import { InventoryForm } from "@/components/inventory-form"
import { InventoryList } from "@/components/inventory-list"
import { ExportButtons } from "@/components/export-buttons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Package, FileText, TrendingUp, Loader2 } from "lucide-react"
import { getInventoryItems } from "@/lib/inventory"
import type { InventoryItem } from "@/types/inventory"

type ViewMode = "dashboard" | "form" | "list"

export default function HomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard")
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    outOfStock: 0,
  })
  const [allItems, setAllItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar datos al iniciar
  useEffect(() => {
    const loadData = async () => {
      try {
        const items = await getInventoryItems()
        setAllItems(items)
        
        // Calcular estadísticas
        const newStats = {
          total: items.length,
          available: items.filter((item) => item.status === "disponible").length,
          outOfStock: items.filter((item) => item.status === "en_transito").length,
        }
        setStats(newStats)
      } catch (error) {
        console.error("Error loading inventory:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const handleFormSuccess = () => {
    setViewMode("list")
    // Recargar datos después de agregar
    window.location.reload()
  }

  const handleStatsUpdate = (newStats: { total: number; available: number; outOfStock: number }) => {
    setStats(newStats)
  }

  if (viewMode === "form") {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => setViewMode(stats.total > 0 ? "list" : "dashboard")}
              className="mb-6 h-11 px-6 font-medium"
            >
              ← Volver {stats.total > 0 ? "al Inventario" : "al Dashboard"}
            </Button>
          </div>
          <InventoryForm
            onSuccess={handleFormSuccess}
            onCancel={() => setViewMode(stats.total > 0 ? "list" : "dashboard")}
          />
        </div>
      </div>
    )
  }

  if (viewMode === "list") {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-foreground">Gestor de Inventario</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sistema empresarial</p>
                </div>
                <h1 className="sm:hidden text-lg font-bold text-foreground">Inventario</h1>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setViewMode("dashboard")} className="hidden sm:flex">
                  Dashboard
                </Button>
                <Button onClick={() => setViewMode("form")} className="gap-2 bg-primary hover:bg-primary/90 h-10">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Nuevo Producto</span>
                  <span className="sm:hidden">Nuevo</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <InventoryList onStatsUpdate={handleStatsUpdate} />
        </main>
      </div>
    )
  }

  // Dashboard view
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-gradient-to-r from-card to-card/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gestor de Inventario</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sistema empresarial de gestión</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {stats.total > 0 && (
                <>
                  <div className="hidden sm:block">
                    <ExportButtons items={allItems} filteredItems={allItems} disabled={false} />
                  </div>
                  <Button variant="outline" onClick={() => setViewMode("list")} className="hidden sm:flex">
                    Ver Inventario
                  </Button>
                </>
              )}
              <Button onClick={() => setViewMode("form")} className="gap-2 bg-primary hover:bg-primary/90 h-11 px-6">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nuevo Producto</span>
                <span className="sm:hidden">Nuevo</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="shadow-lg border-2 hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div>
                    <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                      Total Productos
                    </CardTitle>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</div>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Productos registrados en el sistema</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-2 hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div>
                    <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                      Productos Nuevos
                    </CardTitle>
                    <div className="text-3xl font-bold text-green-600 mt-2">{stats.available}</div>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Productos con estado "Nuevo"</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-2 hover:shadow-xl transition-shadow sm:col-span-2 lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div>
                    <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                      Productos Usados
                    </CardTitle>
                    <div className="text-3xl font-bold text-blue-600 mt-2">{stats.outOfStock}</div>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Productos con estado "Usado"</p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-lg border-2">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-balance">
                  {stats.total === 0 ? "Bienvenido al Gestor de Inventario" : "Dashboard de Inventario"}
                </CardTitle>
                <CardDescription className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  {stats.total === 0
                    ? "Administra tus productos de manera eficiente y profesional. Comienza agregando tu primer producto para empezar a gestionar tu inventario."
                    : "Resumen completo de tu inventario actual. Gestiona productos, exporta reportes y mantén control total de tu stock."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
                  <Button
                    onClick={() => setViewMode("form")}
                    className="gap-2 bg-primary hover:bg-primary/90 h-12 px-8 text-base font-semibold"
                  >
                    <Plus className="h-5 w-5" />
                    {stats.total === 0 ? "Agregar Primer Producto" : "Agregar Producto"}
                  </Button>
                  {stats.total > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setViewMode("list")}
                      className="gap-2 h-12 px-8 text-base font-semibold border-2"
                    >
                      <Package className="h-5 w-5" />
                      Ver Inventario Completo
                    </Button>
                  )}
                  <Button variant="outline" className="gap-2 h-12 px-8 text-base font-semibold bg-transparent border-2">
                    <FileText className="h-5 w-5" />
                    <span className="hidden sm:inline">Ver Documentación</span>
                    <span className="sm:hidden">Docs</span>
                  </Button>
                </div>

                {/* Mobile export button */}
                {stats.total > 0 && (
                  <div className="sm:hidden mt-6 flex justify-center">
                    <ExportButtons items={allItems} filteredItems={allItems} disabled={false} />
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}