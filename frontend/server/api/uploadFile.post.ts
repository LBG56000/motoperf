import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const formData = await readFormData(event)
  const file = formData.get('file') as File
  const type = formData.get('type') as string
  const directory = formData.get('directory') as string
  const name = formData.get('name') as string

  if (!file) throw createError({ statusCode: 400, message: 'Fichier manquant' })
  if (!directory)
    throw createError({ statusCode: 400, message: 'Répertoire manquant' })

  const safeName = name.toLowerCase().replace(/\s+/g, '_')
  const ext = file.name.split('.').pop()
  const fileName = `${safeName}.${ext}`

  const baseFolder =
    type === 'image'
      ? join('public', 'images', directory)
      : join('public', 'sounds', directory)
  const filePath = join(process.cwd(), baseFolder, fileName)

  await mkdir(join(process.cwd(), baseFolder), { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(filePath, buffer)

  const publicUrl =
    type === 'image'
      ? `/images/${directory}/${fileName}`
      : `/sounds/${directory}/${fileName}`

  return { url: publicUrl }
})
