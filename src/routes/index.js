const router = require('koa-router')()

const { nanoid } = require('nanoid')

let db = null

import("../database/index.mjs").then(item => {
  db = item.db
})

router.get('/', async (ctx, next) => {
  await ctx.render('transformUrl.html')
})

router.post('/shortUrl', async ({ req, res }, next) => {
  const { longUrl } = req.body

  const reg = /^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/

  if (!reg.test(longUrl)) {
    res.set

    return {
      code: 500,
      message: 'url不正确'
    }
  }

  const { urls } = db.data
  const item = urls.find((e) => e.longUrl === longUrl)

  if (item) return {
    code: 200,
    results: item?.shortUrl
  }

  const urlCode = nanoid(10)
  const a = {
    longUrl,
    shortKey: urlCode,
    creatTime: +new Date(),
    isDelet: 0, //是否删除
  }
  urls.push(a)
  await db.write()
  return {
    code: 200,
    results: a?.shortUrl
  }
})

router.get('/:code', async (ctx, next) => {
  const { request, response } = ctx
  const { code } = request.params
  await db.read()
  const { urls } = db.data
  const item = urls.find((e) => e.shortKey === code)
  if (item) {
    ctx.redirect(item.longUrl);
    return
  }
  ctx.body = {
    code: 404
  }
})

module.exports = router
