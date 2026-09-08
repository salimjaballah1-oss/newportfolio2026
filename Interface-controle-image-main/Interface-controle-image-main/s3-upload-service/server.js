const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })
const express = require('express')
const multer  = require('multer')
const cors    = require('cors')
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3')

const app  = express()
// Attention : ne pas utiliser process.env.PORT ici — sur Coolify (et la plupart des PaaS),
// PORT est injecté automatiquement par la plateforme (calqué sur "Ports Exposes", ex. 80),
// et rentrerait en collision avec nginx qui doit rester seul sur ce port.
// Ce service est purement interne (proxié par nginx), donc port fixe et dédié.
const PORT = process.env.S3_SERVICE_PORT || 4000

// ── CORS ──────────────────────────────────────────────────────────────────
// ALLOWED_ORIGINS="https://mon-site.exemple.com,https://autre.exemple.com"
// Laisser vide/"*" pour tout autoriser (déconseillé en prod si le bucket coûte cher en trafic).
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '*')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)

app.use(cors({
  origin: ALLOWED_ORIGINS.includes('*') ? '*' : ALLOWED_ORIGINS
}))
app.use(express.json())

// ── Upload en mémoire (le fichier ne touche jamais le disque du service) ──
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100 Mo — largement au-dessus d'une HD
})

// ── Client S3 ────────────────────────────────────────────────────────────
// Credentials via variables d'environnement (jamais en dur dans le code).
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: process.env.AWS_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    : undefined // sinon le SDK résout via un rôle/instance profile
})

const BUCKET  = process.env.S3_BUCKET
const S3_ACL  = process.env.S3_ACL || null // ex: 'public-read' — à laisser vide si ACLs désactivées sur le bucket (défaut AWS depuis 2023)
const PUBLIC_BASE_URL = process.env.S3_PUBLIC_BASE_URL || null // ex: https://cdn.exemple.com ou https://mon-bucket.s3.eu-west-3.amazonaws.com

// Deux variantes gérées par ce service, chacune avec son propre dossier S3.
// La HD ne va PAS sur Infologic (contourne juste la limite de l'API Admin) ;
// la web part en plus vers Infologic via un chemin séparé (upload-server.cjs).
// Les deux finissent sur la BDD Photos via s3-to-bdd-photos-sync.
// Nommage des dossiers/fichiers à confirmer — facilement ajustable ici.
const VARIANTS = {
  hd:  { prefix: process.env.S3_PREFIX_HD  || 'image/products-hd' },
  web: { prefix: process.env.S3_PREFIX_WEB || 'image/products-web' }
}

function buildPublicUrl(key) {
  if (PUBLIC_BASE_URL) return `${PUBLIC_BASE_URL.replace(/\/$/, '')}/${key}`
  return `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodeURI(key)}`
}

function registerUploadRoute(routePath, variant) {
  app.post(routePath, upload.single('image'), async (req, res) => {
    try {
      const { productCode } = req.body

      if (!req.file)    return res.status(400).json({ error: 'Fichier manquant' })
      if (!productCode) return res.status(400).json({ error: 'productCode manquant' })
      if (!BUCKET)      return res.status(500).json({ error: 'S3_BUCKET non configuré côté serveur' })

      const ext   = req.file.mimetype === 'image/png' ? 'png' : 'jpg'
      const stamp = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
      const key   = `${variant.prefix}/${productCode}/${productCode}-${stamp}.${ext}`

      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        ...(S3_ACL ? { ACL: S3_ACL } : {})
      }))

      const url = buildPublicUrl(key)
      console.log(`[S3] ✓ ${key}`)
      res.json({ success: true, url, key })
    } catch (err) {
      console.error('[S3] ✗', err.message)
      res.status(500).json({ error: err.message })
    }
  })
}

registerUploadRoute('/upload-hd', VARIANTS.hd)
registerUploadRoute('/upload-web', VARIANTS.web)

// Suppression : commune aux deux variantes, tant que la clé reste dans un des
// deux périmètres gérés par ce service (le bucket contient beaucoup d'autres
// dossiers gérés par d'autres systèmes, hors de question d'y toucher).
app.delete('/upload-hd', async (req, res) => {
  try {
    const { key } = req.body || {}

    if (!key)    return res.status(400).json({ error: 'key manquant' })
    if (!BUCKET) return res.status(500).json({ error: 'S3_BUCKET non configuré côté serveur' })

    const allowedPrefixes = Object.values(VARIANTS).map(v => `${v.prefix}/`)
    if (!allowedPrefixes.some(prefix => key.startsWith(prefix))) {
      return res.status(400).json({ error: 'clé hors du périmètre autorisé' })
    }

    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))

    console.log(`[S3] suppression ✓ ${key}`)
    res.json({ success: true })
  } catch (err) {
    console.error('[S3] suppression ✗', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.get('/ping', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`\n[S3-upload] Service démarré → http://localhost:${PORT}`)
  console.log(`[S3-upload] Bucket cible     → ${BUCKET || '(non configuré — voir .env)'}\n`)
})
