"use strict";

function isSupportWebp() {
  try {
    return document.createElement('canvas').toDataURL('image/webp', 0.5).indexOf('data:image/webp') === 0;
  } catch (err) {
    return false;
  }
}

const webpKey = '__isSupportWebp__';

if (window && typeof window[webpKey] === 'undefined') {
  window[webpKey] = isSupportWebp();
}

module.exports = function (publicPath, webpPublicPath) {
  if (!webpPublicPath || !window[webpKey]) {
    return publicPath;
  } else {
    return webpPublicPath;
  }
};