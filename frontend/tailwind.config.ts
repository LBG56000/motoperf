import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './app/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './pages/**/*.vue',
    './layouts/**/*.vue',
    './plugins/**/*.{js,ts}',
    './utils/**/*.{js,ts}',
    './app.{js,ts,vue}'
  ]
}
