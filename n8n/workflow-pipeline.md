# Configuración del Workflow en n8n

## Workflow 1 — Extracción de comentarios (cada 6 horas)

### Nodo 1: Schedule Trigger
- **Tipo:** Schedule Trigger
- **Intervalo:** Every 6 hours
- **Hora de inicio:** 00:00

---

### Nodo 2: HTTP Request → /api/pipeline
- **Tipo:** HTTP Request
- **Method:** POST
- **URL:** `https://TU_DOMINIO/api/pipeline`
- **Authentication:** None (manual header)
- **Headers:**
  ```
  Authorization: Bearer TU_PIPELINE_TOKEN
  Content-Type: application/json
  ```
- **Body (JSON):**
  ```json
  {
    "comentarios": [
      {
        "texto": "{{ $json.texto }}",
        "fuente": "{{ $json.fuente }}",
        "url_origen": "{{ $json.url_origen }}",
        "fecha_publicacion": "{{ $json.fecha_publicacion }}"
      }
    ]
  }
  ```
  > Ajusta las expresiones según el nodo anterior (Apify, Facebook scraper, etc.)

- **Response:** Guardar en variable para log

---

### Nodo 3 (opcional): IF — Verificar errores
- **Condición:** `{{ $json.errores }} > 0`
- **True:** Enviar notificación (Slack, email, etc.)
- **False:** Continuar

---

## Workflow 2 — Recálculo de scores (diario a la 1 AM)

### Nodo 1: Schedule Trigger
- **Tipo:** Schedule Trigger
- **Modo:** Every Day
- **Hora:** 01:00

---

### Nodo 2: HTTP Request → /api/scoring
- **Tipo:** HTTP Request
- **Method:** GET
- **URL:** `https://TU_DOMINIO/api/scoring`
- **Headers:**
  ```
  Authorization: Bearer TU_PIPELINE_TOKEN
  ```

---

### Nodo 3 (opcional): IF — Verificar errores
- **Condición:** `{{ $json.errores }} > 0`
- **True:** Enviar notificación
- **False:** Fin

---

## Variables de entorno en n8n

Configura estas credenciales en **n8n → Settings → Variables**:

| Variable | Valor |
|----------|-------|
| `BODAREGIA_URL` | URL de producción de tu app |
| `PIPELINE_TOKEN` | Token del `.env.local` |

---

## Notas

- En desarrollo local usa `ngrok` o `localtunnel` para exponer `localhost:3000` a n8n Cloud.
- Los comentarios sin proveedor detectado quedan como `activo=false` en Supabase — revísalos en `/admin`.
- El endpoint `/api/pipeline` es idempotente: comentarios duplicados (mismo hash MD5) se descartan automáticamente.
- Ejecuta el scoring después de correr el pipeline para tener scores actualizados el mismo día.
