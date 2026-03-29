import jwt from 'jsonwebtoken'

export const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.cookies.accessToken

  if (!token) return res.status(401).json({ message: 'Non authentifié' })

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in the environment variables')
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ message: 'Token invalide' })
  }
}
