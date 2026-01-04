# Panel de Administración - Raccoons

## Acceso al Panel de Admin

El panel de administración está ahora en una ruta separada de la página web principal.

### Formas de acceder:

1. **Desde la URL directa:**
   ```
   http://localhost:5173/admin
   ```

2. **Desde el Footer de la página:**
   - Ir al final de la página principal
   - Hacer clic en "Panel de Administración"

### Credenciales:

- **Contraseña:** `admin123`

---

## Características del Panel

### Gestión de Servicios:
- ✅ Crear nuevos servicios
- ✅ Editar servicios existentes
- ✅ Eliminar servicios
- ✅ Ver lista completa de servicios
- ✅ Generación automática de códigos únicos

### Estados de Servicio:
1. **Recibido** (Cyan) - El servicio acaba de ingresar
2. **En Diagnóstico** (Naranja) - Se está evaluando la moto
3. **En Reparación** (Rojo) - Se está realizando el trabajo
4. **Listo para Entrega** (Verde) - El trabajo está completo
5. **Entregado** (Azul) - El servicio fue entregado al cliente

### Código de Seguimiento:
- Formato: `RCN-XXXXXXXXX`
- Se genera automáticamente al crear un servicio
- El cliente usa este código para hacer seguimiento

---

## Seguimiento de Servicio (Clientes)

Los clientes pueden hacer seguimiento desde:
- Botón "Seguimiento de Servicio" en la página principal
- Solo necesitan el código que se les proporcionó

---

## Almacenamiento

Los datos se guardan en `localStorage` del navegador:
- Clave: `raccoons_services`
- Los datos persisten entre sesiones
- Para borrar todos los datos: abrir consola del navegador y ejecutar:
  ```javascript
  localStorage.removeItem('raccoons_services')
  ```

---

## Seguridad

⚠️ **IMPORTANTE:** Este es un sistema de demostración. Para producción:
- Implementar autenticación real con backend
- Usar base de datos en lugar de localStorage
- Agregar validación de permisos
- Implementar HTTPS
- Agregar protección CSRF
