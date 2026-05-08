# Portal Estudiantes — Frontend

Aplicación web desarrollada en **Angular 20** con **PrimeNG** como librería de componentes UI.

---

## Requisitos previos

| Herramienta | Versión mínima | Descarga |
|---|---|---|
| Node.js | 20.x (LTS) | https://nodejs.org |
| npm | 10.x (incluido con Node) | — |
| Angular CLI | 20.x | `npm install -g @angular/cli` |

> Verificá las versiones instaladas con: `node -v` y `npm -v`

---

## Instalación

```bash
# Clonar el repositorio y entrar a la carpeta del frontend
cd front/portal-estudiantes

# Instalar dependencias
npm install
```

---

## Configuración

El frontend se comunica con el backend a través de un proxy. El archivo `proxy.conf.json` ya está configurado para apuntar al backend en:

```
https://localhost:7090
```

Si el backend corre en otro puerto, editá `proxy.conf.json`:

```json
{
  "/api": {
    "target": "https://localhost:PUERTO_DEL_BACKEND",
    "secure": false,
    "changeOrigin": true
  }
}
```

---

## Ejecución

### Desarrollo con proxy (recomendado)

Levantá primero el backend y luego ejecutá:

```bash
npm run start:proxy
```

Esto inicia el servidor de desarrollo **con el proxy** hacia el backend y abre el navegador automáticamente en:

```
http://localhost:4200
```

### Desarrollo sin proxy

```bash
npm start
```

### Build de producción

```bash
npm run build
```

Los artefactos quedan en la carpeta `dist/`.

---

## Credenciales por defecto

Para ingresar al portal usá el usuario administrador creado por los scripts de base de datos:

| Campo | Valor |
|---|---|
| Usuario | `admin` |
| Contraseña | `Admin123!` |

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm start` | Servidor de desarrollo sin proxy |
| `npm run start:proxy` | Servidor de desarrollo con proxy al backend |
| `npm run build` | Build de producción |
| `npm run watch` | Build en modo watch (desarrollo) |
| `npm test` | Ejecutar tests unitarios con Karma |
| `npm run test:ci` | Tests en modo CI (headless) |

---

## Solución de problemas frecuentes

**`ng` no se reconoce como comando**
```bash
npm install -g @angular/cli
```

**Error de CORS o conexión al backend**
- Asegurate de usar `npm run start:proxy` (no `npm start`)
- Verificá que el backend esté corriendo en `https://localhost:7090`

**Error de certificado SSL del backend en el proxy**
- El proxy ya tiene `"secure": false` para ignorar el certificado de desarrollo

**Puerto 4200 en uso**
```bash
ng serve --port 4201
```
