import Brand from '../models/Brand'
import { connectToMongo } from '.'

const seedBrand = async () => {
  await connectToMongo()
  await Brand.deleteMany({})

  await Brand.insertMany([
    {
      name: 'Honda',
      icon: 'https://gt-stickers.com/18267-large_default/autocollant-honda-logo-ailes.jpg',
    },
    {
      name: 'Kawasaki',
      icon: 'https://media.cdnws.com/_i/46016/2928/2689/32/kawasaki-ref34-stickers-moto-casque-scooter-sticker-autocollant-adhesifs.jpeg',
    },
    {
      name: 'Suzuki',
      icon: 'https://autocollant-sticker.com/2036-thickbox_default/logo-suzuki.jpg',
    },
    {
      name: 'Yamaha',
      icon: 'https://i.ebayimg.com/images/g/ivkAAOSwnv9cGl47/s-l400.jpg',
    },
    {
      name: 'BMW',
      icon: 'https://www.super-fabrique.fr/2174-large_default/sticker-bmw-retro-eclairant.jpg',
    },
    {
      name: 'Ducati',
      icon: 'https://upload.wikimedia.org/wikipedia/fr/a/ae/Ducati_logo.png',
    },
  ])
  console.log('Brand seeding')
}

export default seedBrand
