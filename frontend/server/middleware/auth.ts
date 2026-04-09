export default defineEventHandler((event) => {
  const url = getRequestURL(event)

  if (url.pathname.startsWith('/admin')) {
    const token = getCookie(event, 'auth_token')
    if (!token) {
      throw createError({ statusCode: 401, message: 'Non autorisé' })
    }
  }
})
