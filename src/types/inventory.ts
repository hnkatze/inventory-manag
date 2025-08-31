export interface InventoryItem {
  id: string
  description: string
  status: "disponible" | "en_transito" // disponible = Nuevo, en_transito = Usado
  warehouse: "bodega_1" | "bodega_2" | "bodega_3"
  imageUrl?: string
  imagePublicId?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateInventoryItem {
  description: string
  status: InventoryItem["status"]
  warehouse: InventoryItem["warehouse"]
  imageUrl?: string
  imagePublicId?: string
}

export interface UpdateInventoryItem extends Partial<CreateInventoryItem> {
  id: string
}
