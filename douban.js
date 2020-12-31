const axios = require('axios')
const fs = require('fs')
const Dom = require('xmldom').DOMParser
const xpath = require('xpath')

const parsePage = async (url, timeout = 5000) => {
  const response = await axios.get(url, {
    timeout,
    headers: {
      'content-type': 'text/xml',
      Referer: 'https://movie.douban.com',
      Origin: 'https://movie.douban.com'
    }
  })

  const doc = new Dom({
    errorHandler: {
      warning(e) {},
      error(e) {},
      fatalError(e) {}
    }
  }).parseFromString(response.data.toString())

  const items = xpath.select(
    '//div[@class="grid-view"]/div[@class="item"]',
    doc
  )
  // console.log(response.data.toString())
  let next = xpath.select('string(//span[@class="next"]/a/@href)', doc)
  if (next.startsWith('/')) {
    next = 'https://movie.douban.com' + next
  }

  const list = []
  for (let i in items) {
    let parser = new Dom().parseFromString(items[i].toString())
    let name = xpath.select1('string(//li[@class="title"]/a/em)', parser)
    let url = xpath.select1('string(//li[@class="title"]/a/@href)', parser)
    let cover = xpath
      .select1(
        'string(//div[@class="item"]/div[@class="pic"]/a/img/@src)',
        parser
      )
      .replace('ipst', 'spst')

    let date = xpath.select1('string(//li/span[@class="date"])', parser)
    date = date ? date : ''

    let star = xpath.select1(
      'string(//li/span[starts-with(@class,"rating")]/@class)',
      parser
    )
    star = parseInt(star.substr(6, 1))
    let comment = xpath.select1('string(//li/span[@class="comment"])', parser)
    comment = comment ? comment : ''

    //image = 'https://images.weserv.nl/?url=' + image.substr(8, image.length - 8) + '&w=100';

    list.push({
      name,
      url,
      cover,
      date,
      star,
      comment,
      watch_year: parseInt(date.substr(0, 4))
    })
  }

  return { list, next }
}

const getWatchedMovies = async username => {
  const watchedUrl = `https://movie.douban.com/people/${username}/collect`

  let result = []
  for (let nextUrl = watchedUrl; nextUrl; ) {
    const parsed = await parsePage(nextUrl)
    nextUrl = parsed.next
    result = result.concat(parsed.list)
  }

  return result
}

const writeJson = async () => {
  const data = await getWatchedMovies(process.env.DOUBAN_USER)
  return await new Promise((resolve, reject) => {
    fs.writeFile(
      '.vuepress/theme/data/movies.json',
      JSON.stringify(data, null, 2),
      () => resolve()
    )
  })
}

writeJson()
