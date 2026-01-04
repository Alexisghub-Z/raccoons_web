# 🏍️ Logos de Marcas - Carrusel Infinito

Esta carpeta contiene los logos de las marcas de motocicletas para el carrusel infinito en la landing page.

## 📁 Instrucciones para Agregar Imágenes

### 1. Nombres de Archivos Requeridos:

Coloca las imágenes con estos nombres exactos:

```
honda.png
yamaha.png
suzuki.png
kawasaki.png
ducati.png
harley.png
bmw.png
cfmoto.png
bajaj.png
```

### 2. Especificaciones de las Imágenes:

- **Formato:** PNG con fondo transparente (recomendado)
- **Tamaño:** Ancho máximo 250px, Alto máximo 80px
- **Fondo:** Transparente preferiblemente
- **Calidad:** Alta resolución para verse bien en pantallas Retina

### 3. Recomendaciones:

✅ **Logos en blanco/negro** para que el efecto de grayscale se vea mejor
✅ **Fondos transparentes** para un look más profesional
✅ **Tamaño uniforme** entre todos los logos
✅ **Formato PNG** para mejor calidad con transparencia

### 4. Agregar o Quitar Marcas:

Si quieres agregar más marcas o cambiar las existentes:

1. Agrega la imagen en esta carpeta con el nombre que quieras (ej: `triumph.png`)
2. Ve a `src/pages/HomePage.jsx`
3. Busca la sección `{/* Brands Carousel Section */}`
4. Duplica un bloque `<div className="slide">` y cambia:
   - El `src` a tu nueva imagen
   - El `alt` con el nombre de la marca

**Ejemplo:**
```jsx
<div className="slide">
  <img src="/brands/triumph.png" height="80" alt="Triumph" />
</div>
```

**Importante:** Duplica el logo también en la segunda serie (después del comentario `{/* Segunda serie (duplicada para efecto infinito) */}`)

### 5. Donde Conseguir Logos:

- **Sitios oficiales** de las marcas (sección de prensa/media kit)
- **Wikimedia Commons:** https://commons.wikimedia.org/
- **Brands of the World:** https://www.brandsoftheworld.com/
- **Logopedia:** https://logos.fandom.com/

---

## 🎨 Efectos del Carrusel:

- **Scroll infinito:** Los logos se desplazan continuamente de derecha a izquierda
- **Grayscale inicial:** Los logos aparecen en escala de grises con 60% de opacidad
- **Hover effect:** Al pasar el mouse sobre un logo, se colorea y escala un 5%
- **Velocidad:** 30 segundos para completar un ciclo completo

---

¡Agrega tus imágenes y recarga la página para verlas en acción! 🚀
