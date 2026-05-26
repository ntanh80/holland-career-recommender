function errorHandler(err, req, res, _next) {
  console.error(`[${new Date().toISOString()}] ${err.message}`, err.stack);

  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: status === 500 ? 'Internal server error' : err.message,
    },
  });
}

function createError(status, message, code) {
  const err = new Error(message);
  err.status = status;
  err.code = code || 'ERROR';
  return err;
}

module.exports = { errorHandler, createError };
