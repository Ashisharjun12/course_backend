import createHttpError from "http-errors";

const customrole = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user?.role)) {
      return next(
        createHttpError(403, "you are not allowed to access this resource")
      );
    }
    next();
  };
};

export default customrole;
