import { HttpError } from "http-errors";

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    msg: err.message,
  });
};

export default errorHandler;
