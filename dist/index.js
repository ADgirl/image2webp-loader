"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = loader;
exports.raw = void 0;

var _path = _interopRequireDefault(require("path"));

var _loaderUtils = _interopRequireDefault(require("loader-utils"));

var _schemaUtils = _interopRequireDefault(require("schema-utils"));

var _options = _interopRequireDefault(require("./options.json"));

var _webp = _interopRequireDefault(require("./lib/webp"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function loader(content) {
  var callback = this.async();

  const options = _loaderUtils.default.getOptions(this); // 验证参数是否合法


  (0, _schemaUtils.default)(_options.default, options, {
    name: 'Image Loader',
    baseDataPath: 'options'
  }); // 设置默认参数

  options.name || (options.name = '[contenthash].[ext]');
  options.quality || (options.quality = 75);
  const context = options.context || this.rootContext;

  const loadFile = (content, options) => {
    const url = _loaderUtils.default.interpolateName(this, options.name, {
      context,
      content,
      regExp: options.regExp
    });

    let outputPath = url;

    if (options.outputPath) {
      if (typeof options.outputPath === 'function') {
        outputPath = options.outputPath(url, this.resourcePath, context);
      } else {
        outputPath = _path.default.posix.join(options.outputPath, url);
      }
    }

    let publicPath = `__webpack_public_path__ + ${JSON.stringify(outputPath)}`;

    if (options.publicPath) {
      if (typeof options.publicPath === 'function') {
        publicPath = options.publicPath(url, this.resourcePath, context);
      } else {
        publicPath = `${options.publicPath.endsWith('/') ? options.publicPath : `${options.publicPath}/`}${url}`;
      }

      publicPath = JSON.stringify(publicPath);
    }

    if (options.postTransformPublicPath) {
      publicPath = options.postTransformPublicPath(publicPath);
    }

    if (typeof options.emitFile === 'undefined' || options.emitFile) {
      this.emitFile(outputPath, content);
    }

    return publicPath;
  }; // 处理普通文件


  const publicPath = loadFile(content, options);
  let isWebp = false;
  let webpcontent;

  try {
    // 普通图片转webp
    webpcontent = await (0, _webp.default)(content, options.quality);
    isWebp = content.length > webpcontent.length;
  } catch (err) {
    console.error(err);
  }

  const esModule = typeof options.esModule !== 'undefined' ? options.esModule : false;
  let returnObj;

  if (isWebp) {
    options.name = `${options.name}.webp`;
    const webpPath = loadFile(webpcontent, options);

    const importPath = _loaderUtils.default.stringifyRequest(this, `!${_path.default.join(__dirname, 'runtime/index.js')}`);

    const rtn = `api(${publicPath}, ${webpPath})`;
    returnObj = `${esModule ? `import api from ${importPath};export default ${rtn};` : `var api = require(${importPath}); module.exports=${rtn};`}`;
  } else {
    returnObj = `${esModule ? 'export default' : 'module.exports ='} ${publicPath};`;
  }

  callback(null, returnObj);
}

const raw = true;
exports.raw = raw;