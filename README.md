# Ready for the Test?

Proyecto RA1 — Grupo 15. Plataforma que fusiona un simulador de laboratorio (Química/Física)
con una calculadora científica, orientada a que maestros creen salas de examen y estudiantes
practiquen los temas.

## Estado actual

- ✅ Calculadora científica (frontend), refactorizada en módulos ES6.
- ✅ Base de datos MySQL compartida (calculadora + laboratorio): `backend/database/schema.sql` + `seed.sql`.
- ✅ Backend PHP por capas: registro e inicio de sesión con bcrypt y tokens Bearer (vigencia 12 h).
- ✅ Historial de la calculadora persistido por usuario (endpoints protegidos).
- ✅ Módulo de laboratorio completo: muestras, catálogos, identificación, mesa de mezclas con descubrimientos y puntos por experimento.
- ✅ Salas de examen tipo Kahoot: docentes crean salas con pregunta/respuestas, estudiantes se unen con código y reciben puntos.
- ✅ Salas automáticas con IA: el docente elige un tema (aritmética, álgebra, geometría o de laboratorio: sustancias, mezclas, densidad), cantidad de preguntas (1–10) y puntos por pregunta (1–100); el sistema genera la sala al instante.
- 🕹️ Seis minijuegos para estudiantes (dos por materia): Reto Calculadora y Ordena la ecuación (Matemáticas), Carrera de conversiones y ¿Qué instrumento usarías? (Física), Sustancia misteriosa y Mezcla segura (Química). Al terminar los 8 retos, los puntos de la partida se guardan y se suman al puntaje del estudiante.
- 🖼️ Tienda de avatares para estudiantes con 13 imágenes de `frontend/src/assets/images/studentpfp/`; cada avatar cuesta 100 puntos. Los accesorios anteriores fueron retirados.
- ✅ Salones de clase: docentes organizan grupos, añaden estudiantes registrados por correo, publican asignaciones con documentos o imágenes y califican entregas con comentarios.
- ✅ Catálogo informativo ampliado: sustancias y reactivos con descripción y detalle, además de una nueva sección de Matemáticas (fórmulas y apuntes de repaso).
- ✅ Asistente de contexto (IA) basado en reglas: responde según la pantalla, con el avance del usuario y tópicos de cada módulo.

## API

Endpoints disponibles (base: `backend/public/index.php`):

| Método | Ruta                              | Descripción                          | Protegido |
| ------ | --------------------------------- | ------------------------------------ | --------- |
| POST   | `/api/auth/register`              | Registro: `full_name`, `email`, `password` (mín. 8), `role` | No |
| POST   | `/api/auth/login`                 | Inicio de sesión: `email`, `password` | No |
| GET    | `/api/calculator-operations`      | Historial de operaciones del usuario autenticado | Sí |
| POST   | `/api/calculator-operations`      | Registrar operación: `expression`, `result`, `operation_type` | Sí |
| GET    | `/api/me`                         | Datos del usuario autenticado (incluye `points`) | Sí |
| POST   | `/api/lab-samples`                | Registrar muestra: `name`, `mass`, `volume`, `state` | Sí |
| GET    | `/api/lab-samples`                | Listar muestras del usuario | Sí |
| DELETE | `/api/lab-samples/{id}`           | Eliminar una muestra propia | Sí |
| GET    | `/api/known-substances`           | Catálogo de sustancias conocidas (con descripción y detalle) | Sí |
| GET    | `/api/reagents`                   | Catálogo de reactivos (con descripción) | Sí |
| GET    | `/api/mixture-reactions`          | Catalogo de reacciones | Sí |
| POST   | `/api/mixing`                     | Mezclar `reagent_a_id` + `reagent_b_id` (descubre y otorga puntos) | Sí |
| POST   | `/api/identify`                   | Identificar sustancia: `state`, `transparency`, `conductivity`, `density` | Sí |
| GET    | `/api/lab-experiments`            | Historial de experimentos y puntos | Sí |
| POST   | `/api/quiz-rooms`                 | Crear sala: `title`, `questions` (texto, 4 opciones, `correct_option`, `points_value`) | Sí (docente) |
| GET    | `/api/quiz-rooms`                 | Listar salas propias | Sí (docente) |
| GET    | `/api/quiz-rooms/{id}`            | Ver sala propia con respuestas | Sí (docente) |
| DELETE | `/api/quiz-rooms/{id}`            | Eliminar sala propia | Sí (docente) |
| GET    | `/api/quiz-rooms/auto/topics`     | Temas disponibles para salas automáticas | Sí (docente) |
| POST   | `/api/quiz-rooms/auto`            | Crear sala automática: `title`, `topic`, `question_count` (1–10), `points_value` (1–100) | Sí (docente) |
| POST   | `/api/quiz-rooms/join`            | Unirse con `code` (modo individual o sala de espera en vivo, según la sala) | Sí (estudiante) |
| POST   | `/api/quiz-answers`               | Enviar respuestas de una sala individual | Sí (estudiante) |
| POST | `/api/quiz-rooms/{id}/live/prepare` | Abrir la sala de espera y elegir el temporizador (15, 20, 30, 45 o 60 s) | Sí (docente) |
| POST | `/api/quiz-rooms/{id}/live/start` | Iniciar la competencia | Sí (docente) |
| GET | `/api/quiz-rooms/{id}/live` | Consultar participantes, pregunta y marcador en vivo | Sí (docente) |
| POST | `/api/quiz-rooms/{id}/live/advance` | Revelar la respuesta o avanzar la partida | Sí (docente) |
| POST | `/api/quiz-rooms/{id}/live/pause` | Pausar o reanudar el temporizador | Sí (docente) |
| POST | `/api/quiz-rooms/{id}/live/finish` | Finalizar la competencia y guardar puntos | Sí (docente) |
| GET | `/api/quiz-live/{attemptId}` | Consultar el estado sincronizado de una participación | Sí (estudiante) |
| POST | `/api/quiz-live/answer` | Registrar una respuesta de la pregunta activa | Sí (estudiante) |
| GET/POST | `/api/classrooms` | Listar salones del usuario o crear salón (docente) | Sí |
| POST | `/api/classrooms/{id}/students` | Añadir al salón un estudiante registrado por correo (docente) | Sí |
| POST | `/api/classrooms/{id}/assignments` | Publicar instrucciones, fecha y archivo (docente) | Sí |
| POST | `/api/assignments/{id}/submissions` | Entregar archivo de asignación (estudiante matriculado) | Sí |
| GET | `/api/assignments/{id}/submissions` | Consultar entregas (docente propietario) | Sí |
| PATCH | `/api/submissions/{id}` | Guardar calificación y comentario (docente propietario) | Sí |
| GET/POST | `/api/lesson-progress` | Consultar y guardar avance de lecciones por estudiante | Sí |
| POST | `/api/minigame-attempts` | Guardar puntuación y duración; suma los puntos al perfil | Sí (estudiante) |
| GET | `/api/minigames/{gameCode}/stats` | Consultar récords personales del minijuego | Sí (estudiante) |
| POST   | `/api/assistant/query`            | Consultar al asistente: `message` + `context` opcional | Sí |
| GET    | `/api/assistant/help?context=`    | Tópicos de ayuda disponibles por pantalla | Sí |
| GET    | `/api/assistant/context`          | Avance del usuario (puntos, experimentos, muestras, reacciones, salas) | Sí |

Respuestas en formato `{ success, data, message }`. El login y el registro devuelven un
`token` (Bearer) que se debe enviar en `Authorization: Bearer <token>` a los endpoints
protegidos.

## Base de datos

1. Abre phpMyAdmin (XAMPP) → pestaña "Importar".
2. Importa primero `backend/database/schema.sql` (crea la BD y las tablas).
3. Importa luego `backend/database/seed.sql` (carga sustancias, reactivos y reacciones ya existentes).

Si ya tienes una base de datos creada, importa una sola vez `backend/database/classrooms-migration.sql` para añadir las tablas del salón de clase. Importa también `backend/database/lessons-migration.sql` para habilitar el progreso de las lecciones, `backend/database/profile-shop-migration.sql` para guardar colores y avatares, y `backend/database/minigames-migration.sql` para guardar puntuaciones y tiempos de minijuegos. Si ya habías importado las migraciones de la tienda y de minijuegos, ejecuta una vez `backend/database/profile-avatar-shop-migration.sql` para retirar los accesorios antiguos, y `backend/database/minigame-attempt-token-migration.sql` para habilitar el guardado idempotente de puntuaciones.

Para habilitar competencias en vivo en una base existente, importa una sola vez `backend/database/quiz-live-migration.sql`. En una instalación nueva, las tablas y columnas ya están incluidas en `backend/database/schema.sql`. El docente prepara la competencia antes de compartir el código; los estudiantes se unen a la sala de espera y el docente inicia la partida.

### Probar una competencia en vivo

1. Inicia Ready4TheTest? en el servidor local y abre la aplicación con una cuenta de docente.
2. Crea o elige una sala, pulsa **Competencia en vivo**, define el tiempo por pregunta y prepara la sala.
3. En otro navegador, perfil o dispositivo, inicia sesión con una cuenta de estudiante e ingresa el código que muestra el docente.
4. Cuando aparezca el estudiante en la sala de espera del docente, pulsa **Iniciar competencia**. Las preguntas, el reloj, las respuestas y el marcador se sincronizan mediante el servidor.

Cada navegador conserva una sola sesión iniciada. Para conectar docente y estudiante al mismo tiempo, usa dos perfiles de navegador, una ventana privada o dos dispositivos.

Los archivos adjuntos admitidos son PDF, documentos y hojas de Office, y fotos JPG, PNG o WebP (máximo 15 MB). Se guardan en `frontend/uploads/classes`.

## Requisitos previos

- XAMPP (Apache + MySQL + PHP). Solo se necesitan los módulos **MySQL** y **PHP**.

## Instalación local (tu PC)

1. Inicia **MySQL** desde el panel de control de XAMPP.
2. Crea la base de datos e importa los datos semilla ejecutando una sola vez:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\setup.ps1
   ```

   Este script crea `backend/.env` (con un `TOKEN_SECRET` aleatorio) e importa `backend/database/schema.sql` + `seed.sql`. Es seguro volver a ejecutarlo: si la base ya existe, omite la importación.
3. Inicia el servidor (frontend + API en un mismo origen):

   ```powershell
   C:\xampp\php\php.exe -S 0.0.0.0:8090 backend\router.php
   ```

4. Abre `http://localhost:8090` en el navegador.

## Llevar el proyecto a otra PC (ej. la de un compañero)

Todo queda dentro de la carpeta del proyecto, así que se comparte copiando la carpeta completa:

1. Copia toda la carpeta del proyecto (con `backend/`, `frontend/`, `setup.ps1` y los `*.sql`) a la otra PC, por USB o comprimida en ZIP.
2. En la otra PC: verifica que XAMPP esté instalado y que **MySQL** esté iniciado.
3. Ejecuta `setup.ps1` (regenera la base de datos y crea un `backend/.env` propio con su propio `TOKEN_SECRET`).
4. Inicia el servidor con `C:\xampp\php\php.exe -S 0.0.0.0:8090 backend\router.php` y abre `http://localhost:8090`.

Archivos clave que se copian: `backend/` (API), `frontend/` (SPA), `backend/database/schema.sql` y `seed.sql` (BD), `setup.ps1` (instalador) y `backend/router.php` (sirve frontend + API).

## Capturas de pantalla

La aplicación en funcionamiento:

| Pantalla | Captura |
| -------- | ------- |
| Inicio de sesión | ![Login](docs/capturas/01-login.png) |
| Registro de usuario | ![Registro](docs/capturas/02-registro.png) |
| Página de inicio (estudiante) | ![Inicio](docs/capturas/03-inicio.png) |
| Lecciones | ![Lecciones](docs/capturas/04-lecciones.png) |
| Laboratorio: mesa de mezclas | ![Mezclas](docs/capturas/05-laboratorio-mezclas.png) |
| Laboratorio: identificación de sustancias | ![Identificación](docs/capturas/06-identificacion.png) |
| Catálogo de sustancias | ![Sustancias](docs/capturas/07-catalogo-sustancias.png) |
| Catálogo de Matemáticas | ![Matemáticas](docs/capturas/08-catalogo-matematicas.png) |
| Salas de examen (estudiante) | ![Salas estudiante](docs/capturas/09-salas-estudiante.png) |
| Salón de clase | ![Clases](docs/capturas/10-clases.png) |
| Centro de minijuegos | ![Minijuegos](docs/capturas/11-minijuegos.png) |
| Minijuego: Reto Calculadora | ![Juego calculadora](docs/capturas/12-juego-calculadora.png) |
| Perfil con puntos y tienda de avatares | ![Perfil](docs/capturas/13-perfil.png) |
| Asistente de contexto (Milo) | ![Asistente](docs/capturas/14-asistente.png) |
| Página de inicio (docente) | ![Inicio docente](docs/capturas/15-inicio-docente.png) |
| Salas de examen (docente) | ![Salas docente](docs/capturas/16-salas-docente.png) |
| Salones de clase (docente) | ![Clases docente](docs/capturas/17-clases-docente.png) |

## Integrantes

- Ambar
- Abel

## Documentación de entrega RA1

- [Documento técnico](docs/DOCUMENTO_TECNICO.md): arquitectura, relaciones de base de datos y API.
- [Autoevaluación de requisitos](docs/AUTOEVALUACION_RA1.md): lista de verificación para el equipo antes de la presentación.
