"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "./image-upload"
import { createInventoryItem, updateInventoryItem } from "@/lib/inventory"
import { useToast } from "@/hooks/use-toast"
import type { InventoryItem, CreateInventoryItem } from "@/types/inventory"
import { Package, MapPin, Save, X, Image } from "lucide-react"

interface InventoryFormProps {
  item?: InventoryItem
  onSuccess?: () => void
  onCancel?: () => void
}

export function InventoryForm({ item, onSuccess, onCancel }: InventoryFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateInventoryItem>({
    description: item?.description || "",
    status: item?.status || "disponible",
    warehouse: item?.warehouse || "bodega_1",
    imageUrl: item?.imageUrl || "",
    imagePublicId: item?.imagePublicId || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.description.trim()) {
      toast({
        title: "Error",
        description: "La descripción es requerida",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      if (item) {
        await updateInventoryItem({ id: item.id, ...formData })
        toast({
          title: "Éxito",
          description: "Producto actualizado correctamente",
        })
      } else {
        await createInventoryItem(formData)
        toast({
          title: "Éxito",
          description: "Producto creado correctamente",
        })
      }

      onSuccess?.()
    } catch (error) {
      console.error("Error saving item:", error)
      toast({
        title: "Error",
        description: "Error al guardar el producto",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (imageUrl: string, publicId: string) => {
    setFormData((prev) => ({
      ...prev,
      imageUrl,
      imagePublicId: publicId,
    }))
  }

  const handleImageRemove = () => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: "",
      imagePublicId: "",
    }))
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-0">
      <Card className="border-2 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">
                  {item ? "Editar Producto" : "Nuevo Producto"}
                </CardTitle>
                <CardDescription className="text-sm">
                  Complete los campos para {item ? "actualizar" : "registrar"} el producto
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium flex items-center gap-1">
                Descripción
                <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Ej: Laptop HP ProBook, 16GB RAM, 512GB SSD..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="min-h-[80px] resize-none border-2 focus:border-blue-500"
                required
              />
            </div>

            {/* Estado y Bodega en la misma fila */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Estado */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  Estado
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="h-10 border-2 hover:border-blue-400 focus:border-blue-500">
                    <SelectValue placeholder="Selecciona estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponible">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Nuevo</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="en_transito">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span>Usado</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ubicación */}
              <div className="space-y-2">
                <Label htmlFor="warehouse" className="text-sm font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-gray-500" />
                  Ubicación
                </Label>
                <Select
                  value={formData.warehouse}
                  onValueChange={(value: any) => setFormData((prev) => ({ ...prev, warehouse: value }))}
                >
                  <SelectTrigger className="h-10 border-2 hover:border-purple-400 focus:border-purple-500">
                    <SelectValue placeholder="Selecciona bodega" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bodega_1">Bodega Principal</SelectItem>
                    <SelectItem value="bodega_2">Bodega Secundaria</SelectItem>
                    <SelectItem value="bodega_3">Bodega Externa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Imagen */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <Image className="h-3 w-3 text-gray-500" />
                Imagen del Producto
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                <ImageUpload
                  imageUrl={formData.imageUrl}
                  onImageUpload={handleImageUpload}
                  onImageRemove={handleImageRemove}
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {item ? "Actualizar" : "Guardar"}
                  </span>
                )}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="px-8 border-2"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}