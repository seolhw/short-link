
import Router from 'koa-router'
import { nanoid } from 'nanoid'
import { db, Link } from '../database/index.js'

const router = new Router()

router.get('/', async (ctx, next) => {
  await ctx.render('index')
})

router.post('/link', async (ctx, next) => {
  const { url: longUrl } = ctx.request.body

  const reg = /^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/

  if (!reg.test(longUrl)) {
    ctx.response.status = 400
    return ctx.body = {
      message: 'Invalid URL'
    }
  }
  await db.read()

  const link = db.data?.link

  const item = link?.find((e) => e.longUrl === longUrl)

  if (item) {
    return ctx.body = {
      data: { ...item, shortUrl: `${ctx.origin}/${item.shortKey}` }
    }
  }

  const urlCode = nanoid(10)
  const entity: Link = {
    longUrl,
    shortKey: urlCode,
    creatTime: new Date(),
    isDelete: 0, //是否删除
  }

  link?.push(entity)

  await db.write()

  return ctx.body = {
    data: { ...entity, shortUrl: `${ctx.origin}/${entity.shortKey}` }
  }
})

router.get('/:code', async (ctx, next) => {
  const { code } = ctx.params

  await db.read()

  const link = db.data?.link
  const item = link?.find((e) => e.shortKey === code)

  if (item) {
    ctx.redirect(item.longUrl);
    return
  }
  return ctx.body = {
    code: 404
  }
})

export default router
