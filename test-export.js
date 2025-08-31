// Test script to verify export functionality
const { exportToExcel } = require('./src/lib/export-enhanced.ts');

// Mock data
const testData = [
  {
    id: '123456789',
    description: 'Laptop HP ProBook',
    status: 'disponible',
    warehouse: 'bodega_1',
    imageUrl: 'https://example.com/image1.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '987654321',
    description: 'Monitor Dell 24"',
    status: 'en_transito',
    warehouse: 'bodega_2',
    imageUrl: '',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

console.log('Test data to export:');
console.log(testData.map(item => ({
  ID: item.id,
  Descripción: item.description,
  Estado: item.status === 'disponible' ? 'Nuevo' : 'Usado',
  Bodega: item.warehouse,
  "URL Imagen": item.imageUrl || "Sin imagen",
  "Fecha Creación": item.createdAt.toLocaleDateString(),
  "Última Actualización": item.updatedAt.toLocaleDateString(),
})));