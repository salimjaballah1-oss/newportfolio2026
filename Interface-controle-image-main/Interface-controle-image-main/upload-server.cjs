const express = require('express')
const multer  = require('multer')
const cors    = require('cors')
const path    = require('path')
const fs      = require('fs')

const app  = express()
const PORT = 3001

// Chemin réseau — modifiable via variable d'environnement pour la prod
const PHOTOS_DIR = process.env.PHOTOS_DIR || '\\\\10.1.2.63\\ged_infologic\\Photos'

app.use(cors({ origin: '*' }))
app.use(express.json())

const upload = multer({ storage: multer.memoryStorage() })

app.post('/upload-local', upload.single('image'), (req, res) => {
  try {
    const { productCode, size } = req.body

    if (!req.file)       return res.status(400).json({ error: 'Fichier manquant' })
    if (!productCode)    return res.status(400).json({ error: 'productCode manquant' })

    // Dossier par produit : \Photos\{productCode}\
    const productDir = path.join(PHOTOS_DIR, String(productCode))
    if (!fs.existsSync(productDir)) fs.mkdirSync(productDir, { recursive: true })

    const ext      = req.file.mimetype === 'image/png' ? 'png' : 'jpg'
    const filename = `${productCode}.${ext}`
    const dest     = path.join(productDir, filename)

    fs.writeFileSync(dest, req.file.buffer)

    console.log(`[GED] ✓ ${dest}`)
    res.json({ success: true, path: dest })
  } catch (err) {
    console.error('[GED] ✗', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.get('/ping', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`\n[GED] Serveur upload local → http://localhost:${PORT}`)
  console.log(`[GED] Destination          → ${PHOTOS_DIR}\n`)
})
