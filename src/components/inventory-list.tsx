"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CldImage } from "next-cloudinary"
import { Search, Edit, Trash2, Eye, Filter, Package, Grid3X3, List } from "lucide-react"
import { getInventoryItems, deleteInventoryItem } from "@/lib/inventory"
import { InventoryForm } from "./inventory-form"
import { ExportButtons } from "./export-buttons"
import { useToast } from "@/hooks/use-toast"
import type { InventoryItem } from "@/types/inventory"

interface InventoryListProps {
  onStatsUpdate?: (stats: { total: number; available: number; outOfStock: number }) => void
}

export function InventoryList({ onStatsUpdate }: InventoryListProps) {
  const { toast } = useToast()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all")
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [viewingItem, setViewingItem] = useState<InventoryItem | null>(null)
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")

  const loadItems = async () => {
    try {
      setLoading(true)
      const data = await getInventoryItems()
      setItems(data)
      setFilteredItems(data)

      // Update stats
      const stats = {
        total: data.length,
        available: data.filter((item) => item.status === "disponible").length,
        outOfStock: 0, // Solo manejamos Nuevo y Usado ahora
      }
      onStatsUpdate?.(stats)
    } catch (error) {
      console.error("Error loading items:", error)
      toast({
        title: "Error",
        description: "Error al cargar los productos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  useEffect(() => {
    let filtered = items

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((item) => item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter)
    }

    // Filter by warehouse
    if (warehouseFilter !== "all") {
      filtered = filtered.filter((item) => item.warehouse === warehouseFilter)
    }

    setFilteredItems(filtered)
  }, [items, searchTerm, statusFilter, warehouseFilter])

  const handleDelete = async (item: InventoryItem) => {
    try {
      await deleteInventoryItem(item.id)

      // Delete image from Cloudinary if exists
      if (item.imagePublicId) {
        try {
          // await deleteCloudinaryImage(item.imagePublicId)
        } catch (error) {
          console.warn("Error deleting image from Cloudinary:", error)
        }
      }

      toast({
        title: "Éxito",
        description: "Producto eliminado correctamente",
      })

      loadItems()
    } catch (error) {
      console.error("Error deleting item:", error)
      toast({
        title: "Error",
        description: "Error al eliminar el producto",
        variant: "destructive",
      })
    }
  }

  const handleEditSuccess = () => {
    setEditingItem(null)
    loadItems()
  }

  const getStatusBadge = (status: InventoryItem["status"]) => {
    const variants = {
      disponible: "default",
      en_transito: "secondary",
    } as const

    const labels = {
      disponible: "✅ Nuevo",
      en_transito: "🔄 Usado",
    }

    return (
      <Badge variant={variants[status]} className="font-medium">
        {labels[status]}
      </Badge>
    )
  }

  const getWarehouseLabel = (warehouse: InventoryItem["warehouse"]) => {
    const labels = {
      bodega_1: "🏢 Bodega 1",
      bodega_2: "🏢 Bodega 2",
      bodega_3: "🏢 Bodega 3",
    }
    return labels[warehouse]
  }

  if (loading) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground font-medium">Cargando productos...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Filter className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Filtros y Búsqueda</CardTitle>
                <CardDescription className="text-sm text-black">Encuentra productos específicos</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ExportButtons items={items} filteredItems={filteredItems} disabled={loading} />
              <div className="hidden sm:flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-foreground">Buscar Productos</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="disponible">✅ Nuevo</SelectItem>
                  <SelectItem value="en_transito">🔄 Usado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Bodega</label>
              <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Todas las bodegas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las bodegas</SelectItem>
                  <SelectItem value="bodega_1">🏢 Bodega 1</SelectItem>
                  <SelectItem value="bodega_2">🏢 Bodega 2</SelectItem>
                  <SelectItem value="bodega_3">🏢 Bodega 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold">Inventario de Productos ({filteredItems.length})</CardTitle>
              <CardDescription className="text-sm">
                {filteredItems.length !== items.length
                  ? `Mostrando ${filteredItems.length} de ${items.length} productos`
                  : "Lista completa de productos en el sistema"}
              </CardDescription>
            </div>
            <div className="sm:hidden">
              <ExportButtons items={items} filteredItems={filteredItems} disabled={loading} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-foreground">
                  {items.length === 0 ? "No hay productos registrados" : "No se encontraron productos"}
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {items.length === 0
                    ? "Comienza agregando tu primer producto al inventario para empezar a gestionar tu stock"
                    : "Intenta ajustar los filtros de búsqueda para encontrar los productos que necesitas"}
                </p>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            // Grid View
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <Card key={item.id} className="group hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-4">
                    {/* Image */}
                    <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
                      {item.imageUrl ? (
                        <CldImage
                          src={item.imageUrl}
                          alt={item.description}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-foreground line-clamp-2 text-sm leading-tight">
                          {item.description}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">ID: {item.id.substring(0, 8)}...</p>
                      </div>

                      <div className="flex items-center justify-between">
                        {getStatusBadge(item.status)}
                        <span className="text-xs text-muted-foreground">{getWarehouseLabel(item.warehouse)}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 bg-transparent"
                              onClick={() => setViewingItem(item)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalles del Producto</DialogTitle>
                              <DialogDescription>Información completa del producto</DialogDescription>
                            </DialogHeader>
                            {viewingItem && (
                              <div className="space-y-4">
                                {viewingItem.imageUrl && (
                                  <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
                                    <CldImage
                                      src={viewingItem.imageUrl}
                                      alt={viewingItem.description}
                                      fill
                                      className="object-cover"
                                      sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Descripción</label>
                                    <p className="text-foreground">{viewingItem.description}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Estado</label>
                                    <div className="mt-1">{getStatusBadge(viewingItem.status)}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Bodega</label>
                                    <p className="text-foreground">{getWarehouseLabel(viewingItem.warehouse)}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Fecha Creación</label>
                                    <p className="text-foreground">{viewingItem.createdAt.toLocaleDateString()}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button variant="outline" size="sm" onClick={() => setEditingItem(item)}>
                          <Edit className="h-3 w-3" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. El producto será eliminado permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(item)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // Table View
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Imagen</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="w-32">Estado</TableHead>
                    <TableHead className="w-32">Bodega</TableHead>
                    <TableHead className="w-32">Fecha</TableHead>
                    <TableHead className="text-right w-32">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell>
                        {item.imageUrl ? (
                          <div className="w-16 h-16 relative rounded-md overflow-hidden bg-muted">
                            <CldImage
                              src={item.imageUrl}
                              alt={item.description}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-medium text-foreground truncate">{item.description}</p>
                          <p className="text-sm text-muted-foreground">ID: {item.id.substring(0, 8)}...</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-sm">{getWarehouseLabel(item.warehouse)}</TableCell>
                      <TableCell className="text-sm">{item.createdAt.toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setViewingItem(item)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Detalles del Producto</DialogTitle>
                                <DialogDescription>Información completa del producto</DialogDescription>
                              </DialogHeader>
                              {viewingItem && (
                                <div className="space-y-4">
                                  {viewingItem.imageUrl && (
                                    <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
                                      <CldImage
                                        src={viewingItem.imageUrl}
                                        alt={viewingItem.description}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                      />
                                    </div>
                                  )}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Descripción</label>
                                      <p className="text-foreground">{viewingItem.description}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Estado</label>
                                      <div className="mt-1">{getStatusBadge(viewingItem.status)}</div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Bodega</label>
                                      <p className="text-foreground">{getWarehouseLabel(viewingItem.warehouse)}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">
                                        Fecha Creación
                                      </label>
                                      <p className="text-foreground">{viewingItem.createdAt.toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <Button variant="outline" size="sm" onClick={() => setEditingItem(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. El producto será eliminado permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(item)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0">
            <div className="p-6">
              <InventoryForm item={editingItem} onSuccess={handleEditSuccess} onCancel={() => setEditingItem(null)} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
