const path = require('path')
const { CWebp } = require('cwebp')
const bin = require('cwebp-bin')
/**
 * 普通图片转 .webp图片
 * @param {string | Buffer} img 图片绝对路径或二进制流
 * @param {number} [quality=75] 生成 webp 图片的质量，默认75
 * @returns {Buffer} .webp 文件流
 */
export default async function parseToWebp(img, quality = 75) {
  let encoder = new CWebp(img, bin)
  encoder.quality = quality
  let buffer = await encoder.toBuffer()
  return buffer
}


