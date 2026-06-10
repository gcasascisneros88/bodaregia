import { ApifyClient } from 'apify-client'

const client = new ApifyClient({ token: process.env.APIFY_TOKEN })

function parseCookies() {
  const raw = process.env.FACEBOOK_COOKIES
  if (!raw) return undefined
  try {
    return JSON.parse(raw)
  } catch {
    // Support "name=value; name2=value2" cookie string format
    return raw.split(';').map(pair => {
      const [name, ...rest] = pair.trim().split('=')
      return { name: name.trim(), value: rest.join('=').trim() }
    })
  }
}

/**
 * Scrape posts from a Facebook group URL using Apify.
 * Returns normalized comment objects ready for /api/pipeline.
 */
export async function extraerComentariosFacebook(groupUrl, maxPosts = 50) {
  const cookies = parseCookies()

  const input = {
    startUrls: [{ url: groupUrl }],
    maxPosts,
    ...(cookies && { cookies }),
  }

  const run = await client.actor('apify/facebook-groups-scraper').call(input)

  const { items } = await client.dataset(run.defaultDatasetId).listItems()

  return items
    .filter(item => item.text?.trim())
    .map(item => ({
      texto: item.text.trim(),
      fuente: 'facebook',
      url_origen: item.url ?? groupUrl,
      fecha_publicacion: item.time
        ? new Date(item.time).toISOString().split('T')[0]
        : null,
    }))
}

/**
 * Scrape Instagram posts by hashtag using Apify.
 * Combines caption + top comments into a single texto field.
 * Returns normalized comment objects ready for /api/pipeline.
 */
export async function extraerComentariosInstagram(hashtag, maxPosts = 50) {
  const run = await client.actor('apify/instagram-hashtag-scraper').call({
    hashtags: [hashtag],
    resultsLimit: maxPosts,
  })

  const { items } = await client.dataset(run.defaultDatasetId).listItems()

  const comentarios = []

  for (const item of items) {
    const url = item.url ?? `https://www.instagram.com/p/${item.shortCode}/`
    const fecha = item.timestamp
      ? new Date(item.timestamp).toISOString().split('T')[0]
      : null

    // Caption as a comment if it mentions a vendor
    if (item.caption?.trim()) {
      comentarios.push({
        texto: item.caption.trim(),
        fuente: 'instagram',
        url_origen: url,
        fecha_publicacion: fecha,
      })
    }

    // Top comments on the post
    for (const c of item.latestComments ?? []) {
      if (c.text?.trim()) {
        comentarios.push({
          texto: c.text.trim(),
          fuente: 'instagram',
          url_origen: url,
          fecha_publicacion: fecha,
        })
      }
    }
  }

  return comentarios
}
