#  Proyecto Final:  Gestor de Tareas  (React + MUI)

**Diplomado Desarrollo Web Full Stack - Módulo 3**

**Estudiante: Josue Israel Arista Huanca**

**Enlace del proyecto deployado : ** https://josueuab.github.io/project_react_arista_huanca/

---

## Descripción

Esta es una aplicación web moderna desarrollada con **React** y **Material UI** para la gestión de tareas personales. Permite crear, leer, actualizar y eliminar tareas (CRUD), así como gestionar el estado de las mismas (Pendiente/Finalizada) a través de una interfaz intuitiva y agradable.

### Características Principales

*   **Gestión de Tareas:** Crear, editar, eliminar y visualizar tareas.
*   **Estados:** Marcar tareas como "Pendiente" o "Finalizada" con un solo clic.
*   **Búsqueda:** Filtrado de tareas en tiempo real.
*   **Modales Interactivos:** Edición rápida y visualización de detalles sin salir de la página.

---

##  Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu sistema:

*   **Node.js** (versión 18 o superior recomendada)
*   **npm** (normalmente viene instalado con Node.js)

---

##  Guía de Instalación y Ejecución

### 1. Clonar o Descargar el Proyecto
Asegúrate de estar en la carpeta raíz del proyecto (`project_react_arista_huanca`).

### 2. Instalar Dependencias
Ejecuta el siguiente comando en la terminal para descargar todas las librerías necesarias:

```bash
npm install
```

### 3. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz (puedes copiar el `.env.sample` si existe) y configura la URL de tu API backend:

```env
VITE_API_URL=https://carlos-trigo.onrender.com/api
```

### 4. Ejecutar el Servidor de Desarrollo
Para iniciar la aplicación, corre el siguiente comando:

```bash
npm run dev
```

Una vez iniciado, verás una URL en la terminal (ej: `http://localhost:5173/`). Abre ese enlace en tu navegador.

---

## Scripts Disponibles

En el archivo `package.json` puedes encontrar los siguientes comandos:

*   `npm run dev`: Inicia el servidor de desarrollo.
*   `npm run build`: Compila la aplicación para producción.
*   `npm run lint`: Ejecuta el linter para encontrar errores de código.
*   `npm run preview`: Previsualiza la versión de producción localmente.

---

