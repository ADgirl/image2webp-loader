function isSupportWebp() {
  try {
    return document.createElement('canvas').toDataURL('image/webp', 0.5).indexOf('data:image/webp') === 0;
  } catch (err) {
    return false;
  }
}

const supportWebp = isSupportWebp()

module.exports = function(publicPath, webpPublicPath){
  if(!webpPublicPath || !supportWebp){
    return publicPath
  }else{
    return webpPublicPath
  }
}
