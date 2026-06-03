# GameVerse - Prueba Técnica Turing IA

Plataforma web para el descubrimiento y gestión de videojuegos, desarrollada como parte del periodo de evaluación para Turing Inteligencia Artificial. El proyecto consume la API externa de RAWG y cuenta con un backend propio para gestionar usuarios, favoritos y reseñas.

## Tecnologías Utilizadas

- **Frontend:** React 18, Vite, React Router, Axios
- **Backend:** Python 3.10+, FastAPI, SQLAlchemy, SQLite
- **Autenticación:** JWT (JSON Web Tokens) con contraseñas hasheadas (bcrypt)

## Estructura de la Base de Datos

Se implementó una base de datos relacional en SQLite cumpliendo con la Tercera Forma Normal (3NF) para garantizar la integridad de los datos.

Tablas principales:
1. **users:** Gestión de credenciales, roles (admin/user) y datos de usuario.
2. **games:** Caché local de juegos consumidos desde RAWG para optimizar consultas.
3. **reviews:** Sistema de calificaciones (0-5) y comentarios (Integración en día 2).
4. **favorites:** Relación muchos a muchos entre usuarios y juegos guardados (Integración en día 2).

## Instrucciones de Configuración Local

### 1. Variables de Entorno (Importante)
Por temas de seguridad, las credenciales no están expuestas en el repositorio.
1. Consigue una API Key gratuita creando una cuenta en https://rawg.io/apidocs.
2. En la carpeta `backend`, duplica el archivo `.env.example` y renómbralo a `.env`.
3. Pega tu API Key de RAWG y define tu cadena secreta para JWT dentro del `.env`.

### 2. Levantar el Backend (FastAPI)
Abre una terminal, navega a la carpeta `/backend` y ejecuta:

```bash
# Crear y activar entorno virtual (Windows)
python -m venv venv
.\venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Iniciar el servidor local
uvicorn main:app --reload
```

### 3. Levantar el Frontend (React)
Abre otra terminal, navega a la carpeta `/frontend` y ejecuta:

```bash
# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```
La aplicación estará disponible en http://localhost:5173

> **Nota:** Las credenciales de acceso del usuario administrador 
> se proporcionan en el video demostrativo del Día 3.
