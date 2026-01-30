# 🚀 Prueba Rápida del Sistema (Con Imágenes Temporales)

Para ver las nuevas funcionalidades inmediatamente sin agregar tus imágenes reales, sigue estos pasos:

## Opción 1: Usar imágenes del taller como placeholders

Crea copias temporales de las imágenes que ya tienes:

```bash
# Navega a la carpeta del proyecto
cd /home/alexis/Escritorio/raccoons_web

# Crea copias para "Antes y Después"
cp public/workshop/taller-1.jpg public/before-after/before-1.jpg
cp public/workshop/taller-2.jpg public/before-after/after-1.jpg
cp public/workshop/taller-3.jpg public/before-after/before-2.jpg
cp public/workshop/taller-4.jpg public/before-after/after-2.jpg
cp public/workshop/taller-5.jpg public/before-after/before-3.jpg
cp public/workshop/taller-1.jpg public/before-after/after-3.jpg

# Crea copias para la galería
cp public/workshop/taller-1.jpg public/gallery/trabajo-1.jpg
cp public/workshop/taller-2.jpg public/gallery/trabajo-2.jpg
cp public/workshop/taller-3.jpg public/gallery/trabajo-3.jpg
cp public/workshop/taller-4.jpg public/gallery/trabajo-4.jpg
cp public/workshop/taller-5.jpg public/gallery/trabajo-5.jpg
cp public/workshop/taller-1.jpg public/gallery/trabajo-6.jpg
cp public/workshop/taller-2.jpg public/gallery/trabajo-7.jpg
cp public/workshop/taller-3.jpg public/gallery/trabajo-8.jpg
cp public/workshop/taller-4.jpg public/gallery/trabajo-9.jpg
```

## Opción 2: Script automático

Copia y pega este comando completo:

```bash
cd /home/alexis/Escritorio/raccoons_web && \
cp public/workshop/taller-1.jpg public/before-after/before-1.jpg && \
cp public/workshop/taller-2.jpg public/before-after/after-1.jpg && \
cp public/workshop/taller-3.jpg public/before-after/before-2.jpg && \
cp public/workshop/taller-4.jpg public/before-after/after-2.jpg && \
cp public/workshop/taller-5.jpg public/before-after/before-3.jpg && \
cp public/workshop/taller-1.jpg public/before-after/after-3.jpg && \
cp public/workshop/taller-1.jpg public/gallery/trabajo-1.jpg && \
cp public/workshop/taller-2.jpg public/gallery/trabajo-2.jpg && \
cp public/workshop/taller-3.jpg public/gallery/trabajo-3.jpg && \
cp public/workshop/taller-4.jpg public/gallery/trabajo-4.jpg && \
cp public/workshop/taller-5.jpg public/gallery/trabajo-5.jpg && \
cp public/workshop/taller-1.jpg public/gallery/trabajo-6.jpg && \
cp public/workshop/taller-2.jpg public/gallery/trabajo-7.jpg && \
cp public/workshop/taller-3.jpg public/gallery/trabajo-8.jpg && \
cp public/workshop/taller-4.jpg public/gallery/trabajo-9.jpg && \
echo "✅ Imágenes temporales creadas con éxito!"
```

## Inicia el servidor

```bash
npm run dev
```

## Abre en tu navegador

```
http://localhost:5173
```

## Qué verás:

1. **Scroll hacia abajo** en la página principal
2. Verás la **galería mosaico** con más variedad de imágenes
3. Verás la sección **"Transformaciones Increíbles"**
4. Prueba **arrastrar el slider** de izquierda a derecha
5. Usa las **flechas** para ver diferentes casos
6. Prueba en **móvil** (abre las DevTools y simula un dispositivo móvil)

## Limpia las imágenes temporales después

Cuando tengas tus imágenes reales listas:

```bash
# Elimina las temporales
rm public/before-after/before-*.jpg public/before-after/after-*.jpg
rm public/gallery/trabajo-*.jpg

# Agrega tus imágenes reales
# (sigue las instrucciones en IMAGENES_INSTRUCCIONES.md)
```

---

¡Disfruta probando las nuevas funcionalidades! 🎉
