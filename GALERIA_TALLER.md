# Galería del Taller con Animación Parallax

## Descripción

Se ha implementado una galería de imágenes con animación de scroll parallax usando GSAP y ScrollTrigger. Esta galería muestra fotos del taller en tres columnas que se mueven en direcciones opuestas al hacer scroll, creando un efecto visual atractivo.

## Características

- **Animación Parallax:** Las columnas impares se mueven hacia arriba y las pares hacia abajo mientras haces scroll
- **Efecto Suave:** Utiliza GSAP ScrollTrigger para animaciones fluidas
- **Responsive:** Se adapta a diferentes tamaños de pantalla
- **Hover Effects:** Efectos interactivos al pasar el mouse sobre las imágenes
- **Títulos Descriptivos:** Cada imagen tiene un título que aparece al hacer hover

## Archivos Creados

### Componente Principal
- `src/components/WorkshopGallery.jsx` - Componente React con la lógica de animación
- `src/components/WorkshopGallery.css` - Estilos para la galería

### Dependencias Instaladas
- `gsap` - Librería de animación profesional
- `lenis` - Ya estaba instalado (smooth scroll)

## Ubicación en el Sitio

La galería se encuentra en la página de inicio (HomePage) justo después de la sección "Sobre Nosotros" y antes de la sección "Seguimiento en Tiempo Real".

## Cómo Agregar Más Imágenes

### Paso 1: Agregar las imágenes
Coloca tus imágenes en la carpeta `public/workshop/`. Los nombres deben seguir el formato:
- `taller-1.jpg`
- `taller-2.jpg`
- `taller-3.jpg`
- etc.

### Paso 2: Actualizar el componente
Edita `src/components/WorkshopGallery.jsx` y modifica el array `columnImages`:

```javascript
const columnImages = [
  [
    { src: '/workshop/taller-1.jpg', alt: 'Descripción', title: 'Título' },
    { src: '/workshop/taller-2.jpg', alt: 'Descripción', title: 'Título' },
    // ... más imágenes
  ],
  [
    { src: '/workshop/taller-5.jpg', alt: 'Descripción', title: 'Título' },
    // ... más imágenes
  ],
  [
    { src: '/workshop/taller-9.jpg', alt: 'Descripción', title: 'Título' },
    // ... más imágenes
  ],
];
```

## Estructura de Columnas

La galería tiene 3 columnas:
- **Columna 1 (impar):** Se mueve hacia arriba al hacer scroll
- **Columna 2 (par):** Se mueve hacia abajo al hacer scroll
- **Columna 3 (impar):** Se mueve hacia arriba al hacer scroll

## Personalización

### Cambiar Velocidad de Animación
En `WorkshopGallery.jsx`, modifica el valor de `yPercent`:

```javascript
gsap.to(element, {
  yPercent: 100, // Incrementa para más velocidad, reduce para menos
  // ...
});
```

### Cambiar Aspecto de las Imágenes
En `WorkshopGallery.css`, modifica el `aspect-ratio`:

```css
.workshop-gallery__img {
  aspect-ratio: 3/4; /* Cambia a 16/9 para horizontal, 1/1 para cuadrado, etc. */
}
```

### Cambiar Colores
```css
.workshop-gallery-section {
  background-color: #0a0a0a; /* Fondo oscuro */
}

.workshop-gallery__item {
  background: rgba(255, 255, 255, 0.05); /* Fondo de las tarjetas */
}
```

## Problemas Comunes

### Las imágenes no se muestran
- Verifica que las imágenes estén en `public/workshop/`
- Verifica que los nombres coincidan exactamente (incluyendo mayúsculas/minúsculas)
- Verifica que las rutas en el código empiecen con `/workshop/`

### La animación no funciona
- Verifica que GSAP esté instalado: `npm install gsap`
- Revisa la consola del navegador para errores
- Asegúrate de que el componente esté montado correctamente en HomePage

### Rendimiento lento
- Optimiza el tamaño de las imágenes (recomendado: máximo 500KB por imagen)
- Reduce la cantidad de imágenes en cada columna
- Usa formatos modernos como WebP

## Tecnologías Utilizadas

- **React 19.2.0** - Framework de UI
- **GSAP (GreenSock Animation Platform)** - Animaciones
- **ScrollTrigger** - Plugin de GSAP para animaciones basadas en scroll
- **CSS Grid/Flexbox** - Layout responsive

## Créditos

Animación inspirada en el efecto de scroll parallax de columnas, adaptada para React y optimizada para el proyecto Raccoons Web.
