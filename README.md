<div align="center">

# 🗂️ **Innclod Manager (Angular 17)**

![Angular](https://img.shields.io/badge/Angular-17+-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)
![Material](https://img.shields.io/badge/Angular%20Material-UI-673AB7?logo=google&logoColor=white)
![Architecture](https://img.shields.io/badge/Standalone-Components-0A7EA4?logo=angular&logoColor=white)

</div>

> **Gestor de Proyectos y Tareas para prueba técnica.**

---

## ✨ Características
- Angular 17 (standalone), TypeScript strict, Angular Material
- Login/Logout simulado con localStorage
- Rutas protegidas con Guard
- HTTP genérico + interceptor con notificaciones
- Proyectos desde /users (JSONPlaceholder)
- Tareas por proyecto desde /todos?userId=:id (lazy load)
- Formularios reactivos, diálogo de confirmación y estados loading/error/empty
- Accesibilidad básica (labels, mat-error, foco en diálogos)

---

## 🏁 Arranque rápido

### Requisitos
- Node.js 18.13+ (recomendado 18 LTS o 20)
- Angular CLI instalado globalmente  
  ```bash
  npm i -g @angular/cli
  ```

### Instalación
- Clonar el repo y entrar a la carpeta del proyecto  
  ```bash
  npm install
  ```

### Ejecución
- Desarrollo:  
  ```bash
  ng serve
  ```
- Abrir `http://localhost:4200/`

> No se requieren variables de entorno ni servidores adicionales.

---

## 🔎 Cómo evaluar (checklist guiado)

### 1) Autenticación (Login/Logout) + Guard
- Ir a `/login`. Ingresar cualquier email/clave y pulsar **Login**.
- Se redirige a `/projects` y en **Application → Local Storage** aparece la clave `innclod_session`.
- Refrescar la página: se mantiene la sesión y la ruta protegida sigue accesible.
- Pulsar **Logout** en el header: regresa a `/login` y se limpia `innclod_session`.
- Intentar ir directo a `/projects` sin sesión: el **guard** redirige a `/login`.

### 2) Datos reales desde API (JSONPlaceholder)
- En `/projects`, abrir **DevTools → Network → Fetch/XHR**.  
  Verás `GET https://jsonplaceholder.typicode.com/users` con **200**.
- Entrar a cualquier proyecto (icono de lista).  
  En `/projects/:id/tasks` verás `GET https://jsonplaceholder.typicode.com/todos?userId=:id` con **200**.
- (Opcional) En **Network**, activar **Disable cache** para evitar **304**.

### 3) Manejo de errores HTTP
- Abrir **DevTools → More tools → Network request blocking** y bloquear `*jsonplaceholder.typicode.com*`.
- Recargar `/projects` o navegar a **Tasks**.
- **Esperado:** snackbar de error + tarjeta de **estado de error** en la vista.
- Quitar el bloqueo y recargar → vuelve a la normalidad.

### 4) Formularios reactivos y validaciones
- **Login:** campos con `mat-error` visibles al tocar y enviar vacío.
- **Projects → Add Project:**
  - Nombre requerido, descripción opcional, checkbox “Active”.
  - Guardar/Cancelar. Edición con validaciones y snackbar.
- **Tasks:**
  - Título requerido, checkbox “Completed”.
  - Crear/editar/eliminar con confirmación y notificaciones.

### 5) Confirmación de borrado
- En **Projects** o **Tasks**, borrar un elemento.
- Debe abrirse un **diálogo de confirmación** (accesible, foco inicial en “Cancel”).
- Confirmar → **snackbar** de éxito y actualización de la lista.

### 6) Lazy Loading
- Acceder a `/projects` primero (lista visible).
- Navegar a `/projects/:id/tasks`: el feature de **Tasks** se carga al entrar (lazy).
- Volver atrás y entrar a otro proyecto: la página existe ya en memoria y repite la llamada a `/todos?userId=…`.

---

## 🧱 Arquitectura (carpetas y piezas clave)

**src/app/core/**
- `services/auth.service.ts` → sesión en localStorage (`innclod_session`), `login()/logout()`.
- `services/http.service.ts` → wrapper genérico `get/post/put/delete<T>()`.
- `services/notification.service.ts` → snackbar centralizado (`showError`, `showSuccess`, mapping de `HttpErrorResponse`).
- `guards/auth.guard.ts` → protege `/projects` y `/projects/:id/tasks`.
- `interceptors/http-error.interceptor.ts` → captura errores y notifica al usuario.

**src/app/shared/**
- `ui/confirm-dialog/confirm-dialog.component.ts` → diálogo accesible con foco inicial y labels personalizables.

**src/app/auth/**
- `pages/login.page.ts` → formulario reactivo (email/password), redirige a `/projects` al iniciar.

**src/app/features/projects/**
- `services/projects.api.ts` → `GET /users` (map a `{id,name,description}`), mezcla con cambios locales, soporte `active` y `origin`.
- `pages/projects.page.ts` → lista con iconos, tooltips, badges **Active/API/LOCAL** y acciones.
- `components/project-form.component.ts` → formulario reutilizable standalone con `@Input/@Output`.

**src/app/features/tasks/**
- `services/tasks.api.ts` → `GET /todos?userId=:id` (map a Task), mezcla con locales.
- `pages/tasks.page.ts` → listado + formulario reactivo con checkbox **Completed**.

**src/app/app.routes.ts** → rutas standalone con `loadComponent` y `canActivate` (guard).  
**src/main.ts** → `bootstrapApplication`, router, animations, HttpClient con interceptores.  
**src/styles.scss** → tema Material (light), tipografía, espaciado y utilidades de layout.

---

## 💡 Decisiones técnicas
- Standalone API: menos boilerplate que NgModules; rutas con `loadComponent` y `provideRouter`.
- Material: inputs, listas, diálogos y snackbars accesibles y consistentes.
- HTTP genérico + interceptor: manejo de errores centralizado, notificaciones coherentes y componentes simples.
- Estados explícitos: `loading`, `error`, `empty` en páginas de Projects/Tasks para UX clara.
- Tipado estricto: sin `any`; formularios controlados y mapeos con `Number/String/Boolean`.

---

## 🔗 Datos y mapeos (criterios de la prueba)
- Projects se obtienen de `/users`.  
  `description` ← `company.catchPhrase` de cada usuario.  
  Campo local `active` (checkbox) y `origin` (`api/local`) para mostrar en UI.
- Tasks se obtienen de `/todos?userId=:id`.  
  `projectId` ≡ `userId` de JSONPlaceholder.  
  Checkbox **Completed** en el form; CRUD local optimista.

> JSONPlaceholder no persiste cambios en servidor; las creaciones/ediciones se almacenan localmente y se **fusionan** con lo que devuelve la API.

---

## 🧪 Pruebas (mínimas sugeridas)
- Guard: sin sesión → redirección a `/login`; con sesión → permite acceso.
- Interceptor: ante `HttpErrorResponse`, dispara `NotificationService.showError`.

---

## 🛠️ Scripts útiles
```bash
ng serve   # desarrollo
ng build   # build de producción
ng test    # unit tests (si se incluyen)
```

> ¡Listo! Para evaluar, basta con `npm install` y `ng serve`, abrir `http://localhost:4200/` y seguir el checklist de “Cómo evaluar”.
