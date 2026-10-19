// express.Router() có bắt lỗi cho handler async.
// Express 4 không tự bắt lỗi của async function -> request bị treo hoặc server crash.
const express = require('express');

function wrap(handler) {
  if (typeof handler !== 'function' || handler.length >= 4) return handler; // error middleware
  return function (req, res, next) {
    try {
      const result = handler(req, res, next);
      if (result && typeof result.catch === 'function') result.catch(next);
    } catch (err) {
      next(err);
    }
  };
}

module.exports = function AsyncRouter() {
  const router = express.Router();
  ['get', 'post', 'put', 'delete', 'patch'].forEach((method) => {
    const original = router[method].bind(router);
    router[method] = (path, ...handlers) => original(path, ...handlers.map(wrap));
  });
  return router;
};
