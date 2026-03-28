import type { NextApiRequest, NextApiResponse } from 'next' // Vercel + TS support

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const apiKey = process.env.NVIDIA_API_KEY
    if (!apiKey) return res.status(500).json({ error: 'Missing NVIDIA API key' })

    const body = req.body // expect the same shape your frontend sends

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    res.status(response.ok ? 200 : response.status).json(data)
  } catch (err: unknown) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}