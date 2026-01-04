# Nuevas Funcionalidades - Raccoons Web

Este documento describe las nuevas funcionalidades agregadas al sistema Raccoons Web.

---

## 1. Notificaciones por WhatsApp

### Descripción
Cuando se crea un nuevo servicio en el panel de administración, el sistema ofrece automáticamente enviar el código de seguimiento al cliente por WhatsApp.

### Cómo Funciona

1. **Configuración de envío automático:**
   - En el formulario de servicio hay un toggle "WhatsApp automático"
   - **Activado (✓):** Se envía automáticamente al crear servicio con teléfono
   - **Desactivado (✗):** Pregunta antes de enviar
   - La configuración se guarda y persiste entre sesiones

2. **Al crear un servicio nuevo:**
   - Si el servicio incluye un número de teléfono del cliente
   - **Con auto-envío activado:** Se abre WhatsApp automáticamente
   - **Con auto-envío desactivado:** Aparece confirmación primero
   - Se abre WhatsApp Web con un mensaje pre-escrito

3. **Mensaje automático incluye:**
   - Saludo personalizado con el nombre del cliente
   - Código de seguimiento (formato: RCN-XXXXXXXXX)
   - Detalles del servicio (motocicleta y tipo de servicio)
   - Instrucciones para consultar el estado online

4. **Envío manual desde el panel:**
   - En cada tarjeta de servicio hay un botón "💬 WhatsApp"
   - Solo aparece si el servicio tiene número de teléfono registrado
   - Permite reenviar el código en cualquier momento

### Formato del Mensaje
```
¡Hola [Nombre]! 👋

Tu motocicleta *[Moto]* ha sido recibida en Raccoons Taller. 🏍️

📋 *Código de seguimiento:* RCN-XXXXXXXXX
🔧 *Servicio:* [Tipo de Servicio]

Puedes consultar el estado de tu servicio en cualquier momento
usando este código en nuestra página web.

¡Gracias por confiar en nosotros! 🦝
```

### Requisitos Técnicos
- El número debe ser de 10 dígitos (México)
- Se agrega automáticamente el código de país +52
- Funciona con WhatsApp Web (requiere WhatsApp instalado)
- Se abre en nueva ventana/pestaña del navegador

---

## 2. Evidencias Fotográficas del Trabajo

### Descripción
Los administradores pueden subir fotos del trabajo realizado en cada servicio. Estas evidencias se incluyen en el reporte PDF generado.

### Cómo Usar

#### Agregar Evidencias:

1. **Al crear/editar un servicio:**
   - Ir a la sección "Evidencias del Trabajo (Fotos)"
   - Hacer clic en "Choose Files" o arrastrar imágenes
   - Se pueden subir múltiples imágenes a la vez

2. **Para cada evidencia:**
   - Se muestra una vista previa de la imagen
   - Se puede agregar una descripción (ej: "Cambio de aceite completado")
   - Botón ✕ para eliminar la evidencia si es necesaria

3. **Formatos aceptados:**
   - JPEG/JPG
   - PNG
   - Cualquier formato de imagen estándar

#### Gestión de Evidencias:

- **Agregar descripción:** Ayuda a identificar qué muestra cada foto
- **Eliminar evidencia:** Click en el botón ✕ en la esquina de cada imagen
- **Múltiples fotos:** Sin límite (cuidado con el tamaño de almacenamiento)

### Almacenamiento
- Las imágenes se convierten a Base64 y se guardan en localStorage
- Cada evidencia incluye:
  - `url`: Imagen en formato Base64
  - `description`: Texto descriptivo (opcional)
  - `timestamp`: Fecha/hora de carga

### Consideraciones
- ⚠️ **LocalStorage tiene límite de ~5-10MB por dominio**
- Para producción se recomienda usar almacenamiento en servidor
- Las imágenes muy grandes pueden afectar el rendimiento

---

## 3. Generación de Reportes PDF

### Descripción
Sistema de generación de PDFs profesionales con dos variantes:
- **PDF Completo (Admin):** Incluye todas las evidencias fotográficas
- **PDF Simple (Cliente):** Reporte básico del estado del servicio

### PDF Completo (Desde el Panel de Admin)

#### Cómo Generar:
1. En la lista de servicios
2. Click en el botón "📄 PDF" de cualquier servicio
3. El PDF se descarga automáticamente

#### Contenido del PDF:
- **Header:** Logo y nombre del taller
- **Código de seguimiento** destacado
- **Información del servicio:**
  - Nombre del cliente
  - Teléfono (si disponible)
  - Motocicleta
  - Tipo de servicio
  - Estado actual
  - Fecha de ingreso
  - Última actualización
- **Notas del servicio** (si existen)
- **Evidencias fotográficas:**
  - Imágenes del trabajo realizado
  - Descripción de cada evidencia
  - Máximo 2 imágenes por página
- **Footer:** Información de contacto del taller
- **Paginación automática**

### PDF Simple (Desde Seguimiento Público)

#### Cómo Generar:
1. Ir a `/seguimiento`
2. Ingresar código de seguimiento
3. Click en "📄 Descargar Reporte PDF"

#### Contenido del PDF:
- Header con logo del taller
- Código de seguimiento
- Información básica del servicio
- Estado actual
- **Timeline visual** del progreso:
  - Recibido ✓
  - En Diagnóstico
  - En Reparación
  - Listo para Entrega
  - Entregado
- Estados completados marcados con ✓
- Footer con información de contacto

### Características Técnicas

#### Tecnología:
- **Librería:** jsPDF
- **Formato:** A4 (210mm x 297mm)
- **Fuente:** Helvetica (bold y normal)
- **Colores:**
  - Primario: #dc2626 (Rojo Raccoons)
  - Secundario: #2a2a2a (Gris oscuro)
  - Texto: #333333

#### Nombre de Archivo:
- **Admin:** `Servicio_RCN-XXXXXXXXX_[timestamp].pdf`
- **Cliente:** `Estado_Servicio_RCN-XXXXXXXXX.pdf`

#### Imágenes en PDF:
- Formato: JPEG (convertidas automáticamente)
- Tamaño: 170mm x 100mm
- Posición: Centradas en la página
- Calidad: Optimizada para visualización

---

## 4. Campo de Teléfono en Servicios

### Descripción
Se agregó un campo opcional de teléfono del cliente en los servicios.

### Características:
- **Campo:** "Teléfono del Cliente"
- **Formato:** 10 dígitos (sin espacios ni guiones)
- **Ubicación:** Formulario de creación/edición de servicios
- **Obligatorio:** No (campo opcional)

### Usos:
1. **Notificaciones WhatsApp:** Necesario para enviar mensajes
2. **PDF Completo:** Se incluye en el reporte si está disponible
3. **Contacto directo:** Facilita la comunicación con clientes

### Validación:
- No tiene validación estricta en el frontend actual
- Se recomienda agregar validación para producción
- El servicio de WhatsApp limpia automáticamente caracteres no numéricos

---

## Flujo de Trabajo Completo

### Escenario: Nuevo Servicio

1. **Admin crea servicio:**
   - Completa formulario incluyendo teléfono del cliente
   - Guarda el servicio

2. **Sistema genera código:**
   - Código único formato: RCN-XXXXXXXXX

3. **Confirmación de WhatsApp:**
   - Aparece diálogo: "¿Enviar código por WhatsApp?"
   - Admin confirma
   - Se abre WhatsApp con mensaje pre-cargado
   - Admin envía el mensaje

4. **Cliente recibe código:**
   - Mensaje con código de seguimiento
   - Instrucciones para consultar estado

5. **Durante el servicio:**
   - Admin sube fotos del trabajo
   - Agrega descripciones a cada evidencia
   - Actualiza estado del servicio

6. **Cliente consulta estado:**
   - Entra a `/seguimiento`
   - Ingresa su código
   - Ve progreso actualizado
   - Descarga PDF simple si desea

7. **Al completar servicio:**
   - Admin marca como "Listo" o "Entregado"
   - Genera PDF completo con evidencias
   - Puede enviar PDF al cliente por correo/WhatsApp

---

## Archivos Nuevos Creados

### Servicios:
- `/src/services/whatsappService.js` - Funciones de WhatsApp
- `/src/services/pdfService.js` - Generación de PDFs

### Funciones Principales:

#### whatsappService.js:
- `sendTrackingCodeWhatsApp()` - Enviar código de seguimiento
- `sendStatusUpdateWhatsApp()` - Notificar cambio de estado
- `sendReadyForPickupWhatsApp()` - Notificar moto lista

#### pdfService.js:
- `generateServicePDF()` - PDF completo con evidencias
- `generateSimpleServicePDF()` - PDF simple para clientes

---

## Archivos Modificados

### Componentes:
- `/src/pages/AdminPage.jsx`
  - Campo de teléfono agregado
  - Upload de evidencias
  - Botones de WhatsApp y PDF
  - Funciones de manejo de evidencias

- `/src/pages/TrackingPage.jsx`
  - Botón de descarga de PDF

### Estilos:
- `/src/pages/AdminPage.css`
  - Estilos para botones nuevos
  - Estilos para preview de evidencias
  - Responsive para nuevos elementos

- `/src/pages/TrackingPage.css`
  - Estilos para botón de descarga

### Dependencias:
- `package.json`
  - `jspdf`: ^2.5.2
  - `html2canvas`: ^1.4.1 (no usado aún, reservado para futuras funcionalidades)

---

## Estructura de Datos Actualizada

### Objeto Service (actualizado):
```javascript
{
  code: "RCN-XXXXXXXXX",
  clientName: "Juan Pérez",
  clientPhone: "5551234567",      // NUEVO
  motorcycle: "Yamaha R15 2023",
  serviceType: "Mantenimiento General",
  status: "en_reparacion",
  notes: "Revisión completa del motor",
  evidence: [                      // NUEVO
    {
      url: "data:image/jpeg;base64,...",
      description: "Cambio de aceite completado",
      timestamp: "2026-01-02T10:30:00.000Z"
    },
    {
      url: "data:image/jpeg;base64,...",
      description: "Filtro de aire nuevo instalado",
      timestamp: "2026-01-02T11:15:00.000Z"
    }
  ],
  dateCreated: "2026-01-02T09:00:00.000Z",
  dateUpdated: "2026-01-02T11:30:00.000Z"
}
```

---

## Notas para Producción

### Recomendaciones:

1. **Almacenamiento de Imágenes:**
   - Usar servidor de archivos (AWS S3, Cloudinary, etc.)
   - No almacenar Base64 en base de datos
   - Implementar compresión de imágenes
   - Establecer límites de tamaño y cantidad

2. **WhatsApp Business API:**
   - Para producción, considerar WhatsApp Business API
   - Permite envíos automáticos sin abrir navegador
   - Mejor para volumen alto de mensajes
   - Requiere cuenta Business verificada

3. **PDFs:**
   - Considerar generación en servidor
   - Cachear PDFs generados
   - Opción de envío por email automático
   - Integrar con almacenamiento en la nube

4. **Validaciones:**
   - Validar formato de teléfono (10 dígitos)
   - Validar tipo y tamaño de imágenes
   - Sanitizar descripciones de evidencias
   - Límite de evidencias por servicio

5. **Performance:**
   - Implementar lazy loading de imágenes
   - Comprimir imágenes antes de guardar
   - Limitar número de evidencias
   - Considerar paginación en lista de servicios

---

## Compatibilidad

### Navegadores Soportados:
- Chrome/Edge: ✅ Completo
- Firefox: ✅ Completo
- Safari: ✅ Completo
- Mobile (Chrome/Safari): ✅ Completo

### Dispositivos:
- Desktop: ✅ Experiencia completa
- Tablet: ✅ Responsive
- Mobile: ✅ Responsive (botones adaptados)

### WhatsApp:
- WhatsApp Web debe estar activo
- Requiere WhatsApp instalado en dispositivo vinculado
- Funciona en desktop y móvil

---

## Troubleshooting

### Problema: WhatsApp no abre
**Solución:**
- Verificar que WhatsApp Web está accesible
- Revisar que el navegador permite pop-ups
- Verificar formato del número de teléfono

### Problema: Imágenes no se cargan
**Solución:**
- Verificar tamaño de imagen (<5MB recomendado)
- Usar formatos estándar (JPG, PNG)
- Limpiar localStorage si está lleno

### Problema: PDF no se descarga
**Solución:**
- Verificar que el navegador permite descargas
- Revisar bloqueadores de pop-ups
- Intentar con otro navegador

### Problema: LocalStorage lleno
**Solución:**
- Limpiar servicios antiguos
- Reducir tamaño de imágenes
- Migrar a almacenamiento en servidor

---

## Próximas Mejoras Sugeridas

1. **Compresión de imágenes** automática antes de guardar
2. **Galería de evidencias** en vista de seguimiento para clientes
3. **Envío automático de PDF** por email al completar servicio
4. **Notificaciones WhatsApp** automáticas en cambios de estado
5. **Editor de imágenes** básico (crop, rotate) antes de subir
6. **Firmas digitales** en PDFs para validación
7. **QR code** en PDF con link directo al seguimiento
8. **Historial de notificaciones** enviadas
9. **Templates personalizables** para mensajes WhatsApp
10. **Backup automático** de evidencias a la nube
