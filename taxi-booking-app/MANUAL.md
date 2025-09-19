# Manual de Usuario y Desarrollo: Aplicación de Reserva de Taxis

## 1. Resumen General

Esta aplicación es una solución web completa diseñada para facilitar la reserva de servicios de taxi y la posterior gestión de dichas reservas. Consta de dos componentes principales:

1.  **Portal del Cliente:** Una interfaz pública donde los usuarios pueden rellenar un formulario detallado para solicitar un servicio de taxi.
2.  **Panel de Administración:** Un área privada para que los administradores vean, gestionen y den seguimiento a todas las reservas recibidas.

La aplicación está construida con un enfoque moderno, utilizando una arquitectura de frontend separada (React) que se comunica con un backend dedicado (Node.js) a través de una API REST.

## 2. Pila Tecnológica

La aplicación utiliza las siguientes tecnologías:

### Frontend
- **Framework:** React (v18.2.0) con TypeScript
- **Bundler/Dev Server:** Vite
- **Enrutamiento:** `react-router-dom` (v6.22.3)
- **Peticiones HTTP:** `axios` (v1.6.8)
- **Internacionalización (i18n):** `i18next` con `react-i18next` para soportar múltiples idiomas.
- **Generación de PDF:** `jspdf` (v2.5.1)
- **Estilos:** CSS puro con uso de variables para un temizado consistente.

### Backend
- **Entorno:** Node.js
- **Framework:** Express (v4.19.2)
- **Middleware:**
    - `cors`: Para permitir peticiones desde el frontend.
    - `body-parser`: Para procesar el cuerpo de las peticiones JSON.
- **Base de Datos:** SQLite con Prisma ORM.
- **Envío de Emails:** `nodemailer` (v7.0.6) para enviar correos de confirmación a través de un servicio SMTP (configurado para Gmail).
- **Variables de Entorno:** `dotenv` para gestionar de forma segura las credenciales del email.

## 3. Características Principales

### Portal del Cliente (`/`)
- **Formulario Multilingüe:** El usuario puede cambiar entre Español, Inglés y Alemán.
- **Reserva de Viaje Completa:** Permite especificar detalles para trayectos de solo ida o de ida y vuelta.
- **Campos Detallados:** Incluye campos para número de pasajeros, información de menores, necesidad de sillas especiales, tipo de equipaje, etc.
- **Campos Condicionales:** Ciertos campos solo aparecen si son necesarios (p. ej., la edad de los menores solo si se indica que hay menores).
- **Envío de Reservas:** Al enviar el formulario, la reserva se guarda en el sistema con estado "pendiente" y un ID único generado automáticamente con formato `AAAAMMDD-HHMMSS-XXX`.

### Panel de Administración (`/admin`)
- **Listado Centralizado:** Muestra todas las reservas en una tabla clara y organizada, incluyendo los IDs con el nuevo formato `AAAAMMDD-HHMMSS-XXX`.
- **Gestión de Estado:**
    - **Confirmar:** Marca una reserva como "confirmada" y envía automáticamente un email de confirmación detallado al cliente.
    - **Cancelar:** Marca una reserva como "cancelada".
- **Diferenciación Visual de Estados:**
    - **Pendiente:** Amarillo.
    - **Confirmada:** Verde.
    - **Cancelada:** Rojo.
- **Identificación de Reservas Pasadas:** Las reservas cuya fecha/hora de servicio ya ha transcurrido se muestran con un fondo gris para distinguirlas fácilmente de las reservas futuras.
- **Exportación a CSV:** Un botón permite descargar un listado completo de todas las reservas en formato `.csv`, compatible con Excel y otras hojas de cálculo.
- **Generación de PDF:** Para cada reserva, se pueden generar dos tipos de PDF:
    - **Parcial:** Con los detalles esenciales del viaje.
    - **Completo:** Con toda la información de la reserva, incluyendo datos de regreso e información adicional.

## 4. Estructura del Proyecto

El proyecto está organizado en una estructura de monorepo con el frontend y el backend en la misma raíz.

```
taxi-booking-app/
├── server/                  # Carpeta del Backend (Node.js)
│   ├── .env                 # Archivo para variables de entorno (NO INCLUIDO EN GIT)
│   ├── prisma/              # Archivos de Prisma (esquema y migraciones)
│   │   └── dev.db           # Archivo de base de datos SQLite
│   ├── package.json         # Dependencias del backend
│   └── server.js            # Lógica principal del servidor Express
│
├── src/                     # Carpeta del Frontend (React)
│   ├── components/          # Componentes reutilizables de React
│   │   ├── BookingForm.tsx  # El formulario de reserva principal
│   │   └── BookingList.tsx  # La tabla que lista las reservas en el panel de admin
│   ├── pages/               # Componentes que representan páginas completas
│   │   ├── AdminPage.tsx    # Página del panel de administración
│   │   └── ClientPage.tsx   # Página principal que ve el cliente
│   ├── assets/              # Imágenes y otros recursos estáticos
│   ├── locales/             # Archivos de traducción para i18n
│   ├── App.tsx              # Componente raíz con el enrutador
│   ├── main.tsx             # Punto de entrada de la aplicación React
│   └── i18n.ts              # Configuración de i18next
│
├── public/                  # Archivos públicos servidos directamente por Vite
├── .gitignore               # Archivos y carpetas ignorados por Git
├── package.json             # Dependencias y scripts del frontend
├── MANUAL.md                # Este manual
└── vite.config.ts           # Configuración de Vite
```

## 5. Cómo Ejecutar el Proyecto

Sigue estos pasos para poner en marcha la aplicación en un entorno de desarrollo local.

### Prerrequisitos
- Tener instalado [Node.js](https://nodejs.org/) (que incluye `npm` y `npx`).
- **Para usuarios de Windows con PowerShell:** Si encuentras errores de ejecución de scripts (`npm : No se puede cargar el archivo...`), es posible que necesites ajustar la política de ejecución de PowerShell. Abre PowerShell como Administrador y ejecuta `Set-ExecutionPolicy RemoteSigned`. Confirma con `S` (Sí).

### 1. Configurar el Backend
```bash
# 1. Navega a la carpeta del servidor
cd server

# 2. Instala las dependencias
npm install

# 3. Crea un archivo .env en la carpeta /server con tus credenciales de Gmail y la URL de la base de datos
# Reemplaza con tu email y tu contraseña de aplicación de Gmail
GMAIL_USER=tu_email@gmail.com
GMAIL_PASS=tu_contraseña_de_aplicacion
DATABASE_URL="file:./dev.db"
JWT_SECRET=tu_secreto_jwt_seguro # Genera uno con 'node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"'

# 4. Ejecuta las migraciones de Prisma para configurar la base de datos
npx prisma migrate dev --name init --schema ./prisma/schema.prisma

# 5. Inicia el servidor (se ejecutará en http://localhost:3001)
npm start
```

### 1.1. Crear un Usuario Administrador (Solo la primera vez)
Para acceder al panel de administración, necesitas un usuario. Puedes crearlo ejecutando el siguiente comando en una nueva terminal (asegúrate de que el backend esté funcionando):

```powershell
Invoke-WebRequest -Uri http://localhost:3001/api/register -Method POST -Headers @{"Content-Type"="application/json"} -Body (ConvertTo-Json @{username="admin"; password="password123"})
```
*   **Importante:** Cambia `"admin"` y `"password123"` por el usuario y contraseña que desees.
*   Si el comando es exitoso, verás `StatusCode : 201` y un mensaje de éxito.

### 2. Configurar el Frontend
```bash
# 1. Desde la raíz del proyecto (si estás en /server, usa `cd ..`), instala las dependencias
npm install

# 2. Inicia la aplicación de desarrollo (se abrirá en http://localhost:5173 por defecto)
npm run dev
```
Ahora puedes acceder al formulario en `http://localhost:5173` y al panel de administración en `http://localhost:5173/admin`.

## 6. Trayectoria del Desarrollo

El desarrollo de la aplicación siguió un proceso iterativo e incremental:
1.  **Fundación:** Se inició con una plantilla de React + TypeScript usando Vite.
2.  **Formulario de Reserva:** Se construyó el componente principal `BookingForm` con todos sus campos y validaciones lógicas.
3.  **Backend Inicial:** Se creó un servidor Express básico para recibir y almacenar las reservas en un archivo `db.json`.
4.  **Panel de Administración:** Se desarrolló la página de `AdminPage` para mostrar las reservas recibidas desde el backend.
5.  **Internacionalización:** Se integró `i18next` para hacer la interfaz de usuario multilingüe, añadiendo los archivos de traducción correspondientes.
6.  **Funcionalidad de Gestión:** Se expandió la API del backend para incluir endpoints para `confirmar` y `cancelar` reservas.
7.  **Notificaciones por Email:** Se integró `Nodemailer` en el endpoint de confirmación para enviar correos electrónicos automáticos a los clientes.
8.  **Integración Frontend-Backend:** Se conectaron los botones del panel de administración a los nuevos endpoints de la API.
9.  **Características Avanzadas:** Se añadieron las funcionalidades de exportación a CSV y generación de PDF con `jspdf`.
10. **Generación de IDs Personalizados:** Se implementó una lógica para generar IDs de reserva únicos con un formato basado en la fecha (`AAAAMMDD-HHMMSS-XXX`).
11. **Refinamiento de UX:** Como ajuste final, se implementó la lógica para diferenciar visualmente las reservas pasadas, mejorando la usabilidad del panel de administración.

## 7. Mapa Conceptual

A continuación se presenta un mapa conceptual en formato de texto que ilustra el flujo y la arquitectura de la aplicación.

```mermaid
graph TD
    subgraph Usuario Final
        A[Cliente] --> B{Navegador Web};
    end

    subgraph "Frontend (React en Vite)"
        B --> C[ClientPage: /];
        C --> D[BookingForm];
        B --> E[AdminPage: /admin];
        E --> F[BookingList];
    end

    subgraph "Backend (Node.js en Express)"
        G[API Server: localhost:3001];
        H[dev.db (SQLite)];
        I[Nodemailer];
    end
    
    subgraph "Servicios Externos"
        J[Servidor Gmail SMTP]
    end

    D -- "POST /api/bookings (Nueva Reserva)" --> G;
    F -- "GET /api/bookings (Cargar Reservas)" --> G;
    F -- "POST /api/bookings/:id/confirm" --> G;
    F -- "POST /api/bookings/:id/cancel" --> G;
    
    G -- "Lee/Escribe (Prisma)" --> H;
    G -- "Envía Email de Confirmación" --> I;
    I -- "Autentica y Envía" --> J;
    J -- "Email al Cliente" --> A;
```
