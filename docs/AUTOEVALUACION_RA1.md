# Autoevaluación de requisitos RA1

**Proyecto:** Ready for the Test?  
**Equipo:** Grupo 15 — Ambar y Abel  
**Fecha de revisión:** 4 de octubre de 2026

Marquen cada punto durante la revisión final y anoten evidencia verificable. Una casilla
pendiente requiere comprobación o corrección antes de la presentación.

| Estado | Requisito | Evidencia / acción de revisión |
| --- | --- | --- |
| [x] | Repositorio Git con aportes de ambos integrantes | El historial local contiene commits de `abelxd211` y `ambirNicol69`; validar que estén publicados en el remoto. |
| [x] | README con descripción, requisitos, instalación y capturas | `README.md`, incluyendo instalación local y capturas en `docs/capturas/`. |
| [x] | `.gitignore` excluye `node_modules/`, `.env`, `dist/` y temporales | `.gitignore`. |
| [x] | Configuración mediante `.env` y `.env.example`, sin credenciales en código | `.env.example`; `backend/.env` se genera localmente y está ignorado. |
| [x] | Estructura modular del frontend y módulos ES6 | `frontend/src/js/modules/`, `services/` y `utils/`; `frontend/src/js/main.js`. |
| [x] | Eventos registrados desde JavaScript; solicitudes centralizadas en servicios | Vistas usan `addEventListener`; llamadas `fetch` encontradas en `frontend/src/js/services/`. |
| [x] | Estilos separados y vistas organizadas por pantalla | `frontend/src/css/` y `frontend/src/js/modules/`. |
| [x] | Backend separado por capas, API JSON y middleware global de errores | `backend/src/` y `backend/public/index.php`. |
| [x] | Validación de entrada y consultas parametrizadas | Validadores en `backend/src/utils/validators.php`; revisar servicios/repositorios al defender. |
| [ ] | Configuración explícita de CORS | El frontend y API usan el mismo origen; confirmar si se requiere habilitar CORS y documentar la política. |
| [x] | Documento técnico incluye arquitectura, relaciones de BD y API | `docs/DOCUMENTO_TECNICO.md`. |
| [ ] | Funcionalidad demostrada sin errores críticos | Ejecutar la aplicación en la PC de presentación y recorrer los flujos principales. |
| [ ] | Responsividad verificada en móvil y escritorio | Comprobar visualmente en ambos tamaños de pantalla. |
| [ ] | Funciones de máximo 40 líneas y anidación máxima de 3 | Revisar cada función y sus estructuras de control; no se ha auditado todavía. |
| [x] | Archivos de código de máximo 300 líneas | Revisión por conteo de líneas de los fuentes JS, PHP, CSS y HTML actuales. |
| [x] | Sin `console.log` ni `console.debug` de depuración | Búsqueda en los fuentes actuales sin coincidencias. |
| [ ] | Sin código comentado ni números mágicos; duplicación revisada | Realizar revisión final de los fuentes antes de entregar. |
| [ ] | Ambos integrantes explican cualquier módulo | Ensayar defensa cruzada y preparar video de 5 a 8 minutos. |
| [ ] | Aplicación desplegada o demostración local, enlace del repo y video entregables | Confirmar URL o plan de demostración, enlace y archivo del video. |

**Resultado:** revisión documental inicial. Completar las comprobaciones pendientes en equipo
antes de la presentación; no marcar como cumplidos los puntos que no hayan sido demostrados.
