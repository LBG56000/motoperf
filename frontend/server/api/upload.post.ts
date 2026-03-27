import { writeFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const formData = await readFormData(event)
  const file = formData.get('file') as File
  const type = formData.get('type') as string
  const motoName = formData.get('motoName') as string
  const motoYear = formData.get('motoYear') as string

  if (!file) throw createError({ statusCode: 400, message: 'Fichier manquant' })
  if (!motoName || !motoYear)
    throw createError({ statusCode: 400, message: 'Nom ou année manquant' })

  const safeName = motoName.toLowerCase().replace(/\s+/g, '_')
  const ext = file.name.split('.').pop()
  const fileName = `${safeName}_${motoYear}.${ext}`

  const folder =
    type === 'image'
      ? join('public', 'images', 'motorcycles')
      : join('public', 'sounds')

  const filePath = join(process.cwd(), folder, fileName)

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(filePath, buffer)

  const publicUrl =
    type === 'image' ? `/images/motorcycles/${fileName}` : `/sounds/${fileName}`

  return { url: publicUrl }
})
