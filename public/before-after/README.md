# Imágenes Antes y Después

Esta carpeta contiene las imágenes para la sección "Antes y Después" de motocicletas reparadas.

## Estructura de Archivos

Las imágenes deben seguir esta convención de nombres:

```
before-1.jpg  →  después-1.jpg
before-2.jpg  →  después-2.jpg
before-3.jpg  →  después-3.jpg
...
```

## Cómo Agregar Nuevas Imágenes

1. Agrega el par de imágenes (antes y después) con el siguiente formato:
   - `before-[número].jpg` (imagen del estado inicial)
   - `after-[número].jpg` (imagen después de la reparación)

2. Asegúrate de que ambas imágenes tengan el mismo número

3. El componente cargará automáticamente todas las imágenes que encuentre

## Formato Recomendado

- **Formato**: JPG o PNG
- **Tamaño recomendado**: 1200x800px (relación 3:2)
- **Peso máximo**: 500KB por imagen (para mejor rendimiento)
- **Calidad**: 80-85% para JPG

## Descripción de Trabajos

Para agregar descripciones a cada par de imágenes, edita el array `beforeAfterData` en el archivo:
`src/components/BeforeAfterGallery.jsx`

Ejemplo:
```javascript
const beforeAfterData = [
  {
    id: 1,
    title: "Restauración Completa Honda CB750",
    description: "Pintura personalizada, restauración de motor y sistema eléctrico",
    beforeImage: "/before-after/before-1.jpg",
    afterImage: "/before-after/after-1.jpg"
  },
  // ... más casos
];
```

## Imágenes de Ejemplo

Para comenzar, puedes agregar algunas imágenes de prueba con los nombres:
- before-1.jpg / after-1.jpg
- before-2.jpg / after-2.jpg
- before-3.jpg / after-3.jpg
