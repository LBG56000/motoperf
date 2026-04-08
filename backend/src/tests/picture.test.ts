import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../app'
import Picture from '../models/Picture'

describe('Picture Routes - /api/v1/pictures', () => {
  describe('GET /api/v1/pictures', () => {
    it('should return pictures list', async () => {
      await Picture.create({ title: 'Sunset', image_link: 'sunset.jpg' })
      await Picture.create({ title: 'Mountain', image_link: 'mountain.jpg' })

      const res = await request(app).get('/api/v1/pictures?project=all')

      expect(res.status).toBe(200)
      expect(res.body.pictures).toBeInstanceOf(Array)
      expect(res.body.pictures.length).toBe(2)
    })

    it('should filter pictures', async () => {
      await Picture.create({ title: 'Sunset', image_link: 'sunset.jpg' })
      await Picture.create({ title: 'Mountain', image_link: 'mountain.jpg' })

      const res = await request(app)
        .get('/api/v1/pictures?project=all&filter={"title":"Sunset"}')

      expect(res.status).toBe(200)
      expect(res.body.pictures.length).toBe(1)
      expect(res.body.pictures[0].title).toBe('Sunset')
    })

    it('should return empty array when no pictures', async () => {
      const res = await request(app).get('/api/v1/pictures?project=all')

      expect(res.status).toBe(200)
      expect(res.body.pictures).toEqual([])
    })
  })

  describe('POST /api/v1/pictures', () => {
    it('should create a new picture', async () => {
      const res = await request(app)
        .post('/api/v1/pictures')
        .send({ title: 'New picture', image_link: 'new.jpg' })

      expect(res.status).toBe(201)
      expect(res.body.picture.title).toBe('New picture')
      expect(res.body.picture.image_link).toBe('new.jpg')
    })

    it('should fail without image_link', async () => {
      const res = await request(app)
        .post('/api/v1/pictures')
        .send({ title: 'No link' })

      expect(res.status).toBe(400)
    })
  })
})
