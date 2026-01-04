# Configuración de WhatsApp Automático

## Descripción

El sistema ahora incluye un **toggle configurable** para el envío automático de mensajes WhatsApp cuando se crea un servicio nuevo.

---

## Características

### Toggle de Configuración

**Ubicación:** Esquina superior derecha del formulario de nuevo servicio

**Opciones:**
- ✅ **Activado (verde):** Envío automático de WhatsApp
- ❌ **Desactivado (gris):** Requiere confirmación manual

**Persistencia:** La configuración se guarda en `localStorage` y persiste entre sesiones

---

## Cómo Usar

### Activar Envío Automático

1. Ir al panel de administración (`/admin`)
2. Click en "+ Nuevo Servicio"
3. En la esquina superior derecha, activar el toggle "WhatsApp automático ✓"
4. Llenar el formulario incluyendo el **teléfono del cliente**
5. Al guardar, WhatsApp se abre **automáticamente** con el mensaje

### Desactivar (Requiere Confirmación)

1. En el formulario de nuevo servicio
2. Desactivar el toggle "WhatsApp automático ✗"
3. Al crear un servicio con teléfono, aparece un **diálogo de confirmación**
4. Puedes elegir enviar o no enviar el mensaje

---

## Comportamiento Detallado

### Con Toggle ACTIVADO (✓)

```javascript
// Al crear servicio con teléfono
1. Guardar servicio en localStorage
2. Abrir WhatsApp automáticamente con mensaje pre-cargado
3. No hay confirmación adicional
```

**Ventajas:**
- Flujo más rápido
- Menos clicks
- Ideal para alto volumen de servicios

### Con Toggle DESACTIVADO (✗)

```javascript
// Al crear servicio con teléfono
1. Guardar servicio en localStorage
2. Mostrar diálogo: "¿Deseas enviar el código por WhatsApp?"
3. Si acepta → Abrir WhatsApp
4. Si cancela → No se abre WhatsApp
```

**Ventajas:**
- Más control
- Evita envíos accidentales
- Ideal para revisión antes de enviar

---

## Detalles Técnicos

### LocalStorage

**Key:** `raccoons_auto_whatsapp`

**Valores:**
- `"true"` → Envío automático activado
- `"false"` o ausente → Requiere confirmación

### Estado del Toggle

```javascript
const [autoSendWhatsApp, setAutoSendWhatsApp] = useState(
  localStorage.getItem('raccoons_auto_whatsapp') === 'true'
);
```

### Función Toggle

```javascript
const toggleAutoSendWhatsApp = () => {
  const newValue = !autoSendWhatsApp;
  setAutoSendWhatsApp(newValue);
  localStorage.setItem('raccoons_auto_whatsapp', newValue.toString());
};
```

### Lógica de Envío

```javascript
if (isNewService && serviceData.clientPhone) {
  if (autoSendWhatsApp) {
    // Envío automático
    sendTrackingCodeWhatsApp(...);
  } else {
    // Pedir confirmación
    if (window.confirm("¿Enviar WhatsApp?")) {
      sendTrackingCodeWhatsApp(...);
    }
  }
}
```

---

## Estilos del Toggle

### Visual

- **Switch estilo iOS**
- **Color apagado:** Gris (#333333)
- **Color activado:** Verde (#10b981)
- **Animación suave:** 0.3s ease
- **Responsive:** Se adapta a móvil

### CSS Principal

```css
.toggle-switch {
  width: 50px;
  height: 26px;
  background-color: var(--color-bg-tertiary);
  border-radius: 50px;
  transition: background-color 0.3s ease;
}

.toggle-checkbox:checked + .toggle-switch {
  background-color: #10b981;
}
```

---

## Casos de Uso

### Caso 1: Taller con Alto Volumen

**Escenario:** Reciben 20+ servicios por día

**Recomendación:** Toggle **ACTIVADO**

**Razón:**
- Ahorra tiempo en cada servicio
- Envío inmediato al cliente
- Reduce pasos manuales

### Caso 2: Taller con Validación Personalizada

**Escenario:** Necesitan revisar cada servicio antes de notificar

**Recomendación:** Toggle **DESACTIVADO**

**Razón:**
- Control sobre cuándo se envía
- Permite verificar datos antes
- Evita notificaciones prematuras

### Caso 3: Servicio sin Teléfono

**Escenario:** Cliente no proporciona teléfono

**Comportamiento:**
- El toggle no afecta
- No se intenta enviar WhatsApp
- Servicio se crea normalmente

---

## Integración con Workflow

### Flujo Completo

```
1. Admin accede a /admin
   ↓
2. Click "+ Nuevo Servicio"
   ↓
3. Configura toggle según preferencia
   ↓
4. Llena formulario (incluye teléfono)
   ↓
5. Click "Crear Servicio"
   ↓
6a. [Toggle ON] → WhatsApp abre automáticamente
6b. [Toggle OFF] → Diálogo de confirmación
   ↓
7. Servicio creado y cliente notificado
```

---

## Troubleshooting

### Problema: Toggle no guarda la configuración

**Solución:**
```javascript
// Verificar en consola del navegador
localStorage.getItem('raccoons_auto_whatsapp')
// Debe retornar "true" o "false"

// Limpiar si hay problema
localStorage.removeItem('raccoons_auto_whatsapp')
```

### Problema: WhatsApp no se abre automáticamente

**Verificar:**
1. ✅ Toggle está activado (verde)
2. ✅ Servicio tiene teléfono ingresado
3. ✅ Navegador permite pop-ups
4. ✅ WhatsApp Web está accesible

### Problema: Siempre pide confirmación aunque toggle esté activado

**Solución:**
```javascript
// Forzar activación desde consola
localStorage.setItem('raccoons_auto_whatsapp', 'true')
// Recargar página
```

---

## Archivos Modificados

### JavaScript
- `src/pages/AdminPage.jsx`
  - Estado `autoSendWhatsApp`
  - Función `toggleAutoSendWhatsApp()`
  - Lógica condicional de envío
  - UI del toggle

### CSS
- `src/pages/AdminPage.css`
  - `.admin-form-header`
  - `.whatsapp-toggle`
  - `.toggle-label`
  - `.toggle-switch`
  - `.toggle-checkbox`
  - `.toggle-text`
  - Responsive media queries

### Documentación
- `NUEVAS_FUNCIONALIDADES.md` - Actualizado
- `WHATSAPP_AUTO.md` - Nuevo archivo

---

## Mejoras Futuras Sugeridas

1. **Opciones avanzadas de toggle:**
   - Envío solo en ciertos estados
   - Horarios permitidos para envío automático
   - Lista de teléfonos excluidos

2. **Estadísticas:**
   - Contador de WhatsApps enviados
   - Tasa de apertura (si se usa Business API)
   - Log de mensajes enviados

3. **Templates:**
   - Múltiples plantillas de mensaje
   - Variables personalizables
   - Mensajes por tipo de servicio

4. **Confirmación visual:**
   - Toast notification cuando se envía
   - Indicador en tarjeta de servicio
   - Historial de envíos

5. **WhatsApp Business API:**
   - Envío real sin abrir navegador
   - Confirmación de entrega
   - Respuestas automáticas
   - Chatbot de seguimiento

---

## Compatibilidad

- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile (iOS/Android)
- ✅ WhatsApp Web
- ✅ WhatsApp Desktop

---

## Notas Importantes

⚠️ **Advertencia de Pop-ups:**
- El navegador puede bloquear la ventana de WhatsApp
- Verificar configuración de pop-ups en el navegador
- Agregar excepción para el dominio del taller

⚠️ **Límites de WhatsApp:**
- WhatsApp Web debe estar activo
- Requiere sesión iniciada
- No es WhatsApp Business API (no hay envío programado)

✅ **Recomendado:**
- Mantener toggle activado para flujo rápido
- Revisar número antes de guardar
- Tener WhatsApp Web abierto en otra pestaña
