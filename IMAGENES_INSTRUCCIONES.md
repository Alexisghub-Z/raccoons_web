# Instrucciones para Agregar Imágenes al Sistema

## Resumen de Nuevas Funcionalidades

Se han agregado dos nuevas secciones a la página principal:

1. **Sección "Antes y Después"** - Slider interactivo con divisor deslizante
2. **Galería Expandida** - Ahora soporta hasta 14 imágenes únicas

---

## 1. Sección Antes y Después

### Ubicación de las Imágenes
Las imágenes deben ir en la carpeta: `/public/before-after/`

### Convención de Nombres
```
before-1.jpg  →  after-1.jpg
before-2.jpg  →  after-2.jpg
before-3.jpg  →  after-3.jpg
```

### Pasos para Agregar Imágenes

1. **Prepara tus imágenes:**
   - Formato: JPG o PNG
   - Tamaño recomendado: 1200x800px (relación 3:2)
   - Peso máximo: 500KB por imagen

2. **Renombra las imágenes:**
   - Imagen "antes": `before-X.jpg` (donde X es el número)
   - Imagen "después": `after-X.jpg` (mismo número)

3. **Copia las imágenes:**
   ```bash
   # Ejemplo: copiar imágenes a la carpeta
   cp tu-imagen-antes.jpg /public/before-after/before-1.jpg
   cp tu-imagen-despues.jpg /public/before-after/after-1.jpg
   ```

4. **Agrega la descripción:**
   - Abre el archivo: `src/components/BeforeAfterGallery.jsx`
   - Busca el array `beforeAfterData`
   - Agrega o modifica las entradas:

   ```javascript
   const beforeAfterData = [
     {
       id: 1,
       title: "Restauración Completa Honda CB750",
       description: "Pintura personalizada, restauración de motor y sistema eléctrico",
       beforeImage: "/before-after/before-1.jpg",
       afterImage: "/before-after/after-1.jpg"
     },
     {
       id: 2,
       title: "Personalización Kawasaki Ninja",
       description: "Cambio de escape, pintura custom y mejoras de rendimiento",
       beforeImage: "/before-after/before-2.jpg",
       afterImage: "/before-after/after-2.jpg"
     },
     // Agrega más casos aquí...
   ];
   ```

### Características del Slider

- **Interactivo**: Arrastra el divisor para comparar antes/después
- **Responsive**: Funciona en móvil, tablet y desktop
- **Navegación**: Flechas para cambiar entre diferentes casos
- **Touch-friendly**: Optimizado para dispositivos táctiles

---

## 2. Galería Expandida (MosaicGallery)

### Ubicación de las Imágenes
Las imágenes van en la carpeta: `/public/gallery/`

### Convención de Nombres
```
trabajo-1.jpg
trabajo-2.jpg
trabajo-3.jpg
...
trabajo-9.jpg
```

### Pasos para Agregar Imágenes

1. **Prepara tus imágenes:**
   - Formato: JPG o PNG
   - Tamaño recomendado: 800x1000px (vertical, relación 4:5)
   - Peso máximo: 300KB por imagen

2. **Renombra y copia:**
   ```bash
   cp tu-trabajo1.jpg /public/gallery/trabajo-1.jpg
   cp tu-trabajo2.jpg /public/gallery/trabajo-2.jpg
   # ... y así sucesivamente
   ```

3. **Actualiza el componente (opcional):**
   - Si quieres agregar más de 9 imágenes de trabajos
   - Abre: `src/components/MosaicGallery.jsx`
   - Busca el array `galleryImages`
   - Agrega más rutas:

   ```javascript
   const galleryImages = [
     '/workshop/taller-1.jpg',
     '/workshop/taller-2.jpg',
     '/workshop/taller-3.jpg',
     '/workshop/taller-4.jpg',
     '/workshop/taller-5.jpg',
     '/gallery/trabajo-1.jpg',
     '/gallery/trabajo-2.jpg',
     '/gallery/trabajo-3.jpg',
     '/gallery/trabajo-4.jpg',
     '/gallery/trabajo-5.jpg',
     '/gallery/trabajo-6.jpg',
     '/gallery/trabajo-7.jpg',
     '/gallery/trabajo-8.jpg',
     '/gallery/trabajo-9.jpg'
     // Puedes agregar hasta 14 imágenes totales
   ];
   ```

### Capacidad Actual

- **Total de espacios**: 14 imágenes
- **Imágenes del taller**: 5 (ya incluidas)
- **Espacio disponible**: 9 imágenes de trabajos realizados

---

## 3. Probar el Sistema Localmente

### Iniciar el servidor de desarrollo

```bash
cd /home/alexis/Escritorio/raccoons_web
npm run dev
```

### Verificar las nuevas secciones

1. Abre tu navegador en: `http://localhost:5173`
2. Navega hacia abajo en la página principal
3. Deberías ver:
   - **Galería Mosaico** (con tus nuevas imágenes)
   - **"Transformaciones Increíbles"** (sección antes/después)
   - Prueba arrastrar el slider para comparar imágenes

---

## 4. Optimización de Imágenes

Para mejor rendimiento, optimiza tus imágenes antes de subirlas:

### Usando ImageMagick (línea de comandos)

```bash
# Redimensionar imagen
convert original.jpg -resize 1200x800^ -gravity center -extent 1200x800 optimizada.jpg

# Comprimir imagen (calidad 80%)
convert original.jpg -quality 80 optimizada.jpg
```

### Usando herramientas online

- **TinyPNG**: https://tinypng.com/
- **Squoosh**: https://squoosh.app/
- **ImageOptim**: https://imageoptim.com/

---

## 5. Estructura de Carpetas Final

```
/public/
├── before-after/
│   ├── README.md
│   ├── before-1.jpg
│   ├── after-1.jpg
│   ├── before-2.jpg
│   ├── after-2.jpg
│   └── before-3.jpg
│   └── after-3.jpg
├── gallery/
│   ├── README.md
│   ├── trabajo-1.jpg
│   ├── trabajo-2.jpg
│   ├── trabajo-3.jpg
│   └── ...
└── workshop/
    ├── taller-1.jpg (ya existentes)
    └── ...
```

---

## 6. Solución de Problemas

### Las imágenes no se muestran

1. **Verifica la ruta**: Las rutas deben empezar con `/` (por ejemplo: `/gallery/trabajo-1.jpg`)
2. **Verifica los nombres**: Deben coincidir exactamente (sensible a mayúsculas)
3. **Reinicia el servidor**: A veces necesitas detener y volver a ejecutar `npm run dev`
4. **Limpia el caché**: En el navegador, presiona Ctrl+Shift+R (o Cmd+Shift+R en Mac)

### El slider no funciona

1. **Verifica las rutas** en `beforeAfterData`
2. **Asegúrate** que ambas imágenes (before y after) existan
3. **Revisa la consola** del navegador (F12) para ver errores

### Imágenes muy pesadas

- Usa herramientas de compresión
- Reduce el tamaño a las dimensiones recomendadas
- Convierte PNG a JPG si no necesitas transparencia

---

## 7. Próximos Pasos

Una vez que hayas agregado tus imágenes:

1. **Prueba el sistema** localmente
2. **Construye** para producción: `npm run build`
3. **Despliega** los archivos de `/dist` a tu servidor

---

## Soporte

Si tienes problemas o preguntas:
- Revisa los archivos README en cada carpeta
- Verifica la consola del navegador para errores
- Asegúrate de que las rutas de las imágenes sean correctas
