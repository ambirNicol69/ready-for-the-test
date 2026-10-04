# Documento Técnico — Ready for the Test?

**Proyecto:** Ready for the Test?
**Integrantes:** Ambar · Abel (Grupo 15)
**Resultado de Aprendizaje:** RA1 — Aplicaciones Web con JavaScript
**Fecha:** Septiembre 2026

---

## 1. Descripción general

Ready for the Test? es una plataforma web de práctica académica que integra herramientas
en un solo sistema:

1. **Simulador de laboratorio** de Química/Física con cuatro estaciones: registro de muestras
   (masa, volumen y estado), mesa de mezclas entre reactivos, identificación de sustancias
   por propiedades y un catálogo informativo.
2. **Calculadora científica** con historial de operaciones por usuario.
3. **Salas de examen** tipo Kahoot, donde un docente crea salas con preguntas y los estudiantes
   se unen con un código de 6 caracteres para responder y sumar puntos.
4. **Minijuegos educativos**: dos experiencias por materia (Matemáticas, Física y Química), con
   puntuación, duración y récords personales guardados por estudiante.

Todos los módulos comparten un mismo sistema de cuentas, un marcador de puntos y a un
asistente de contexto (IA basada en reglas) que responde según la pantalla activa.

---

## 2. Arquitectura

El proyecto sigue una arquitectura **cliente–servidor monolítica de un solo origen**
(single-origin): el frontend y la API se sirven desde el mismo servidor, por lo que no se
presentan problemas de CORS en la comunicación.

```
Navegador (SPA en JavaScript ES6)
        │  fetch() → /api/...
        ▼
backend/router.php  (servidor PHP integrado)
        │
        ├── /api/*  → backend/public/index.php (front controller)
        │                └── enrutador → controlador → servicio → repositorio → MySQL
        └── demás rutas → sirve los estáticos de frontend/
```

Vista resumida de la estructura entregada:

```text
frontend/                 backend/
|-- index.html            |-- router.php
|-- src/                  |-- public/index.php
    |-- css/              |-- database/
    |-- js/                   |-- schema.sql
        |-- main.js           |-- seed.sql
        |-- modules/      |-- src/
        |-- services/         |-- config/ routes/ middlewares/
        |-- utils/            |-- controllers/ services/
    |-- assets/               |-- repositories/ models/ utils/
```

### 2.1 Capas del backend

| Capa | Carpeta | Responsabilidad |
| ---- | ------- | --------------- |
| Configuración | `backend/src/config/` | Carga de variables de entorno, conexión PDO a MySQL, bancos de preguntas y conocimiento del asistente |
| Middlewares | `backend/src/middlewares/` | Autenticación Bearer y manejo global de errores |
| Controladores | `backend/src/controllers/` | Validación de roles (docente/estudiante) y respuesta JSON |
| Servicios | `backend/src/services/` | Lógica de negocio: registro, puntos, mezclas, identificación, salas y asistente |
| Repositorios | `backend/src/repositories/` | Consultas SQL (SELECT/INSERT/UPDATE) a MySQL |
| Modelos | `backend/src/models/` | Clases que representan entidades (Usuario, Sustancia, Sala, etc.) |
| Utilidades | `backend/src/utils/` | Respuestas JSON, errores tipados, tokens JWT y validadores |

Cada capa depende solo de la inmediatamente inferior: el controlador no escribe SQL, el
servicio no conoce HTTP y el repositorio no conoce al usuario autenticado.

### 2.2 Frontend

La SPA está modularizada en **módulos ES6** agrupados por responsabilidad:

- `frontend/src/js/main.js`: punto de entrada; monta el shell, inicializa la sesión y el router.
- `modules/router.js`: enrutamiento por *hash* (`#/calculadora`, `#/laboratorio`, `#/salas`, ...)
  con protección de rutas según la sesión.
- `modules/`: una vista por pantalla (calculadora, laboratorio, mezclas, identificación,
  catálogo, salas, perfil) y módulos auxiliares de lógica.
- `services/`: un `api.js` central que envía el token Bearer automáticamente y un servicio
  por dominio.
- `utils/`: helpers reutilizables de DOM, formato, estados, almacenamiento local y toast.

El enrutador respeta el flujo de sesión: las rutas protegidas redirigen a `#/login` cuando el
usuario no está autenticado, y los formularios de login/registro redirigen a `#/perfil` cuando
ya hay sesión iniciada.

---

## 3. Base de datos

Motor **MySQL** (XAMPP), base `ready_for_the_test`, conjunto de caracteres `utf8mb4`.
El esquema está en `backend/database/schema.sql` y los datos de ejemplo en `backend/database/seed.sql`.

### 3.1 Tablas del módulo de cuentas

| Tabla | Función |
| ----- | ------- |
| `users` | Usuarios (docente/estudiante), hash bcrypt de contraseña, `points` acumulados |

### 3.2 Tablas del módulo de calculadora

| Tabla | Función |
| ----- | ------- |
| `calculator_operations` | Historial de una operación: expresión, resultado y tipo (básica/científica) |

### 3.3 Tablas del módulo de laboratorio

| Tabla | Función |
| ----- | ------- |
| `lab_samples` | Muestras registradas por el usuario (masa, volumen, estado) |
| `known_substances` | Catálogo de sustancias con estado, transparencia, conductividad y densidad (usadas para identificar) |
| `reagents` | Reactivos disponibles en la mesa de mezclas (color, icono, descripción) |
| `mixture_reactions` | Reacciones entre pares de reactivos (efecto y color resultante) |
| `discovered_reactions` | Reacciones que el usuario ya descubrió (para otorgar bonificación única) |
| `lab_experiments` | Historial de actividades del laboratorio con puntos otorgados |

### 3.4 Tablas del módulo de salas de examen

| Tabla | Función |
| ----- | ------- |
| `quiz_rooms` | Salas creadas por docentes; el código de acceso es único y de 6 caracteres |
| `quiz_questions` | Preguntas de cada sala, con posición de la opción correcta y puntos |
| `quiz_question_options` | Las 4 opciones de cada pregunta |
| `quiz_attempts` | Un intento por estudiante y por sala (clave única `room_id + user_id`), con calificación final |

Las claves foráneas usan `ON DELETE CASCADE` para mantener la integridad al eliminar usuarios,
salas o muestras.

---

### 3.5 Tablas de minijuegos

| Tabla | Función |
| ----- | ------- |
| `minigame_attempts` | Historial de puntuación y duración por estudiante y minijuego |

### 3.6 Diagrama de relaciones

```mermaid
erDiagram
    USERS ||--o{ CALCULATOR_OPERATIONS : registra
    USERS ||--o{ LAB_SAMPLES : crea
    USERS ||--o{ LAB_EXPERIMENTS : realiza
    LAB_SAMPLES o|--o{ LAB_EXPERIMENTS : referencia
    USERS ||--o{ DISCOVERED_REACTIONS : descubre
    MIXTURE_REACTIONS ||--o{ DISCOVERED_REACTIONS : corresponde
    REAGENTS ||--o{ MIXTURE_REACTIONS : participa
    USERS ||--o{ QUIZ_ROOMS : crea
    QUIZ_ROOMS ||--o{ QUIZ_QUESTIONS : contiene
    QUIZ_QUESTIONS ||--|{ QUIZ_QUESTION_OPTIONS : ofrece
    USERS ||--o{ QUIZ_ATTEMPTS : responde
    QUIZ_ROOMS ||--o{ QUIZ_ATTEMPTS : recibe
    USERS ||--o{ CLASSROOMS : ensena
    CLASSROOMS ||--o{ CLASSROOM_STUDENTS : matricula
    USERS ||--o{ CLASSROOM_STUDENTS : participa
    CLASSROOMS ||--o{ ASSIGNMENTS : publica
    ASSIGNMENTS ||--o{ ASSIGNMENT_SUBMISSIONS : recibe
    USERS ||--o{ ASSIGNMENT_SUBMISSIONS : entrega
    USERS ||--o{ STUDENT_LESSON_PROGRESS : avanza
    USERS ||--o| USER_CUSTOMIZATIONS : personaliza
    USERS ||--o{ USER_AVATAR_ITEMS : posee
    USERS ||--o{ MINIGAME_ATTEMPTS : registra
```

## 4. API REST

Todos los endpoints responden con `{ success, data, message }`. Excepto registro y login,
todos exigen el encabezado `Authorization: Bearer <token>` (JWT con vigencia de 12 horas).

### 4.1 Autenticación y perfil

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| POST | `/api/auth/register` | Registro con `full_name`, `email`, `password` (mín. 8) y `role` |
| POST | `/api/auth/login` | Inicio de sesión; devuelve `token` |
| GET | `/api/me` | Datos del usuario autenticado e `points` acumulados |

### 4.2 Calculadora

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| GET | `/api/calculator-operations` | Historial de operaciones del usuario |
| POST | `/api/calculator-operations` | Registra `expression`, `result` y `operation_type` |

### 4.3 Laboratorio

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| POST | `/api/lab-samples` | Registra una muestra (`name`, `mass`, `volume`, `state`) |
| GET | `/api/lab-samples` | Lista las muestras del usuario |
| DELETE | `/api/lab-samples/{id}` | Elimina una muestra propia |
| GET | `/api/known-substances` | Catálogo de sustancias conocidas (con descripción y detalle) |
| GET | `/api/reagents` | Catálogo de reactivos |
| GET | `/api/mixture-reactions` | Reacciones conocidas del catálogo |
| POST | `/api/mixing` | Mezcla dos reactivos; si es reacción nueva otorga bonificación |
| POST | `/api/identify` | Identifica una sustancia por `state`, `transparency`, `conductivity`, `density` |
| GET | `/api/lab-experiments` | Historial de experimentos y puntos del usuario |

### 4.4 Salas de examen

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| POST | `/api/quiz-rooms` | Docente: crea sala con `title` y `questions` (texto, 4 opciones, correcta y puntos) |
| GET | `/api/quiz-rooms` | Docente: lista sus salas |
| GET | `/api/quiz-rooms/{id}` | Docente: ve una sala con sus respuestas |
| DELETE | `/api/quiz-rooms/{id}` | Docente: elimina una sala propia |
| GET | `/api/quiz-rooms/auto/topics` | Docente: temas disponibles para salas automáticas |
| POST | `/api/quiz-rooms/auto` | Docente: crea sala automática (`topic`, `question_count` 1–10, `points_value` 1–100); las opciones se barajan en el servidor |
| POST | `/api/quiz-rooms/join` | Estudiante: se une con `code`; recibe preguntas sin respuestas |
| POST | `/api/quiz-answers` | Estudiante: envía `attempt_id` + `answers` y recibe la calificación |
| POST | `/api/minigame-attempts` | Guarda puntuación y duración, y suma los puntos al perfil del estudiante |
| GET | `/api/minigames/{gameCode}/stats` | Consulta récords personales del estudiante |

### 4.5 Asistente de contexto (IA por reglas)

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| POST | `/api/assistant/query` | Consulta al asistente con `message` y `context` opcional |
| GET | `/api/assistant/help?context=` | Tópicos de ayuda por pantalla |
| GET | `/api/assistant/context` | Avance del usuario (puntos, experimentos, muestras, reacciones, salas) |

El asistente no usa servicios externos: es un motor de reglas que selecciona respuestas según
la pantalla, las palabras clave del mensaje y el progreso real del usuario en la base de datos.

---

## 5. Seguridad

- **Contraseñas:** almacenadas con `password_hash()` (bcrypt); nunca en texto plano.
- **Tokens:** JWT firmados con `TOKEN_SECRET` (variable de entorno, 48 caracteres aleatorios)
  y expiración de 12 horas.
- **Credenciales:** nunca están en el código. Se cargan desde `backend/.env` (ignorado por
  Git) mediante `loadEnv()`. El repositorio contiene solo el `.env.example`.
- **Robo/duplicación de respuestas:** la clave única `(room_id, user_id)` en `quiz_attempts`
  impide que un estudiante responda dos veces la misma sala; el backend valida que todas las
  preguntas tengan opción y nunca expone la opción correcta al estudiante.
- **Autorización:** los controladores verifican el rol (docente/estudiante) antes de cada
  operación; un docente no puede unirse a salas ni un estudiante crearlas.

---

## 6. Control de versiones

Repositorio Git alojado en GitHub:
**https://github.com/abelxd211/ready-for-the-test**

- Historial con commits de ambos integrantes (autores alternados según el módulo trabajado).
- `.gitignore` excluye `node_modules/`, `.env`, `dist/`, temporales y respaldos SQL.
- Convenciones: archivos en `kebab-case`, variables en `camelCase`, clases en `PascalCase`,
  constantes en `UPPER_SNAKE_CASE`, código en inglés sin comentarios y documentación en español.
