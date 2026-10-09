import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { Resend } from 'resend'

const app = express()
const PORT = process.env.PORT || 3001

const ALLOWED_ORIGINS = [
  'https://rachitportfolio-rouge.vercel.app',
  'https://rachitportfolio.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
]

app.use(cors({
  origin(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
}))
app.use(express.json())

app.post('/api/send-email', async (req, res) => {
  const { name, email, reason, message } = req.body ?? {}

  if (!name || !email || !message) {
    res.status(400).json({ error: 'Missing required fields: name, email, message' })
    return
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'Server not configured — RESEND_API_KEY missing' })
    return
  }

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: 'Rachit Portfolio <onboarding@resend.dev>',
      to: process.env.CONTACT_EMAIL ?? 'rachitsharma9990888@gmail.com',
      replyTo: email,
      subject: `New enquiry — ${reason ?? 'General'} (from ${name})`,
      text: `Name: ${name}\nEmail: ${email}\nReason: ${reason ?? 'General'}\n\n${message}`,
    })

    if (error) {
      res.status(500).json({ error: error.message })
      return
    }

    res.status(200).json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Send failed' })
  }
})

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`)
})