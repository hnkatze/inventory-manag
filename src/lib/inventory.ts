import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp } from "firebase/firestore"
import { db } from "./firebase"
import type { InventoryItem, CreateInventoryItem, UpdateInventoryItem } from "../types/inventory"

const COLLECTION_NAME = "inventory"

// Crear un nuevo item de inventario
export async function createInventoryItem(item: CreateInventoryItem): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...item,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error creating inventory item:", error)
    throw error
  }
}

// Obtener todos los items de inventario
export async function getInventoryItems(): Promise<InventoryItem[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as InventoryItem[]
  } catch (error) {
    console.error("Error getting inventory items:", error)
    throw error
  }
}

// Actualizar un item de inventario
export async function updateInventoryItem(item: UpdateInventoryItem): Promise<void> {
  try {
    const { id, ...updateData } = item
    const docRef = doc(db, COLLECTION_NAME, id)

    await updateDoc(docRef, {
      ...updateData,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error("Error updating inventory item:", error)
    throw error
  }
}

// Eliminar un item de inventario
export async function deleteInventoryItem(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error("Error deleting inventory item:", error)
    throw error
  }
}
