import path from 'path'
import loaderUtils from 'loader-utils'
import validateOptions from 'schema-utils'
import schema from './options.json'
import parseToWebp from './lib/webp'

export default async function loader(content) {
  var callback = this.async()
  const options = loaderUtils.getOptions(this)
  // 验证参数是否合法
  validateOptions(schema, options, {
    name: 'Image Loader',
    baseDataPath: 'options'
  })
  // 设置默认参数
  options.name || (options.name = '[contenthash].[ext]')
  options.quality || (options.quality = 75)
  const context = options.context || this.rootContext

  const loadFile = (content, options) => {
    const url = loaderUtils.interpolateName(
      this,
      options.name,
      {
        context,
        content,
        regExp: options.regExp
      }
    )

    let outputPath = url
    if (options.outputPath) {
      if (typeof options.outputPath === 'function') {
        outputPath = options.outputPath(url, this.resourcePath, context)
      } else {
        outputPath = path.posix.join(options.outputPath, url)
      }
    }

    let publicPath = `__webpack_public_path__ + ${JSON.stringify(outputPath)}`
    if (options.publicPath) {
      if (typeof options.publicPath === 'function') {
        publicPath = options.publicPath(url, this.resourcePath, context)
      } else {
        publicPath = `${
          options.publicPath.endsWith('/')
            ? options.publicPath
            : `${options.publicPath}/`
          }${url}`
      }

      publicPath = JSON.stringify(publicPath)
    }

    if (options.postTransformPublicPath) {
      publicPath = options.postTransformPublicPath(publicPath)
    }

    if (typeof options.emitFile === 'undefined' || options.emitFile) {
      this.emitFile(outputPath, content)
    }
    return publicPath
  }

  // 处理普通文件
  const publicPath = loadFile(content, options)

  let isWebp = false
  let webpcontent
  try {
    // 普通图片转webp
    webpcontent = await parseToWebp(content, options.quality)
    isWebp = content.length > webpcontent.length
  } catch (err) {
    console.error(err)
  }

  const esModule = typeof options.esModule !== 'undefined' ? options.esModule : false
  let returnObj
  if (isWebp) {
    options.name = `${options.name}.webp`
    const webpPath = loadFile(webpcontent, options)
    const importPath = loaderUtils.stringifyRequest(this, `!${path.join(__dirname, 'runtime/index.js')}`)
    const rtn = `api(${publicPath}, ${webpPath})`
    returnObj = `${
      esModule
        ? `import api from ${importPath};export default ${rtn};`
        : `var api = require(${importPath}); module.exports=${rtn};`
      }`

  } else {
    returnObj = `${esModule ? 'export default' : 'module.exports ='} ${publicPath};`
  }
  callback(null, returnObj)

}

export const raw = true