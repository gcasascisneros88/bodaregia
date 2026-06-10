# BodaRegia

Directorio de proveedores de bodas en Monterrey y Área Metropolitana.

**Stack:** Next.js 16 · Supabase · Gemini 2.5 Flash · n8n

---

## Páginas

| Ruta | Descripción |
|------|-------------|
| `/` | Homepage con categorías, buscador y métricas |
| `/categoria/[slug]` | Lista de proveedores por categoría |
| `/proveedor/[slug]` | Ficha de proveedor: score, sentimiento, comentarios |
| `/buscar?q=` | Búsqueda por nombre y municipio |
| `/admin` | Panel de administración (requiere contraseña) |

---

## API — Endpoints del Pipeline

### POST `/api/pipeline`

Recibe comentarios desde fuentes externas, los analiza con Gemini y los guarda en Supabase.

**Headers**
```
Authorization: Bearer PIPELINE_TOKEN
Content-Type: application/json
```

**Body**
```json
{
  "comentarios": [
    {
      "texto": "Texto del comentario",
      "fuente": "facebook | instagram | tiktok | google_maps",
      "url_origen": "https://...",
      "fecha_publicacion": "2026-01-15"
    }
  ]
}
```

**Respuesta**
```json
{
  "procesados": 5,
  "insertados": 4,
  "sin_match": 1,
  "errores": 0,
  "detalles": [...]
}
```

**Lógica interna por comentario:**
1. Calcula MD5 del texto — descarta duplicados
2. Llama a Gemini 2.5 Flash para extraer: proveedor, sentimiento, confianza, categoría, zona, precio, advertencia
3. Busca proveedor en Supabase por similitud pg_trgm (umbral 0.3)
4. Si hay match → inserta en tabla `comentarios`
5. Si no hay match → crea proveedor provisional (`activo=false`) para revisión manual en `/admin`

---

### GET `/api/scoring`

Recalcula el score de todos los proveedores activos basado en sus comentarios de los últimos 90 días.

**Headers**
```
Authorization: Bearer PIPELINE_TOKEN
```

**Respuesta**
```json
{
  "procesados": 12,
  "actualizados": 10,
  "sin_comentarios": 2,
  "errores": 0,
  "detalles": [...]
}
```

**Fórmula del score (escala 0–10):**
```
pct_positivo    = menciones_positivas / total_menciones
factor_volumen  = MIN(total_menciones / 50, 1.0)
factor_recencia = 0.5 + (% comentarios últimos 30 días * 0.5)
penalizacion    = alertas_graves * 0.15

score = ((pct_positivo * 0.50) + (factor_volumen * 0.30) + (factor_recencia * 0.20) - penalizacion) * 10
```

---

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
PIPELINE_TOKEN=
GEMINI_API_KEY=
RESEND_API_KEY=
APIFY_TOKEN=
GOOGLE_PLACES_API_KEY=
N8N_WEBHOOK_URL=
FACEBOOK_COOKIES=       # opcional — ver instrucciones abajo
```

### Configurar cookies de Facebook para scraping

Sin cookies, Apify solo puede acceder a grupos públicos con visibilidad limitada. Con cookies de una cuenta real se obtiene acceso completo.

**Cómo obtener las cookies desde Chrome/Edge:**

1. Inicia sesión en [facebook.com](https://facebook.com) con la cuenta que usarás para scraping (recomendado: cuenta secundaria dedicada).
2. Abre DevTools → `F12` → pestaña **Application** → **Cookies** → `https://www.facebook.com`.
3. Copia los valores de las cookies clave: `c_user`, `xs`, `datr`, `fr`, `sb`.
4. Construye el JSON con este formato:

```json
[
  { "name": "c_user", "value": "TU_USER_ID" },
  { "name": "xs",     "value": "TU_XS" },
  { "name": "datr",   "value": "TU_DATR" },
  { "name": "fr",     "value": "TU_FR" },
  { "name": "sb",     "value": "TU_SB" }
]
```

5. Minifica el JSON en una sola línea y asígnalo a `FACEBOOK_COOKIES` en `.env.local`:

```env
FACEBOOK_COOKIES=[{"name":"c_user","value":"123456"},{"name":"xs","value":"abc..."}]
```

> **Nota:** Las cookies expiran periódicamente. Si el scraping deja de funcionar, repite el proceso. Usa siempre una cuenta secundaria — nunca la cuenta principal.

---

## Tablas Supabase

| Tabla | Descripción |
|-------|-------------|
| `categorias` | Categorías del directorio |
| `proveedores` | Negocios registrados |
| `comentarios` | Reseñas analizadas por Gemini |
| `scores` | Score calculado por proveedor |
| `categorias_proveedor` | Relación proveedor ↔ categoría |
| `fuentes` | Fuentes de extracción (facebook, etc.) |
