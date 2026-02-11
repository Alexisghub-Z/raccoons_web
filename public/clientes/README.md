# Fotos de Clientes

Coloca aquí tus fotos de clientes satisfechos.

## Instrucciones

1. Nombra las fotos como: `cliente-1.jpg`, `cliente-2.jpg`, `cliente-3.jpg`, etc.
2. Tamaño recomendado: **800x800px** (cuadrada) o **800x600px**
3. Formato: **JPG** preferentemente (mejor compresión)
4. Peso máximo recomendado: **200KB por foto** (para carga rápida)

## Cómo optimizar tus fotos antes de subirlas

- Usa [Squoosh](https://squoosh.app) — gratis, en el navegador
- Configura: formato WebP o MozJPEG, calidad 75-80%
- Redimensiona a máximo 800px de ancho

## Agregar más fotos a la galería

Después de copiar tus fotos aquí, edita el archivo:
`src/components/Stats.jsx`

Busca el array `CLIENT_PHOTOS` y agrega o quita entradas:

```js
const CLIENT_PHOTOS = [
  { src: '/clientes/cliente-1.jpg', alt: 'Cliente satisfecho 1' },
  { src: '/clientes/cliente-2.jpg', alt: 'Cliente satisfecho 2' },
  // agrega más aquí...
];
```
