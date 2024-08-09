import jwt from 'jsonwebtoken';
import { apiresponse } from '../../src/utils/commonResponse.util.js';
import MESSAGES from '../../src/utils/commonMessage.util.js';

const JWT_SECRET_TOKEN = process.env.JWT_SECRET_KEY;

let verifyToken = (token, cb) => {
  try {
    let data = jwt.verify(token, JWT_SECRET_TOKEN);
    cb(null, data);
  } catch (error) {
    cb(error, null);
  }
};
export const validateToken = async (req, res, next) => {
  let token = req.headers['authorization'];
  if (token && typeof token !== 'undefined') {
    verifyToken(token, async (err, data) => {
      if (err) {
        return res
          .status(401)
          .json(await apiresponse(false, MESSAGES.INVALID_TOKEN, 401));
      }
      req.token = token;
      req.authData = data;
      // timeline token validation
      if (
        req.headers['timeline'] &&
        typeof req.headers['timeline'] !== 'undefined'
      ) {
        verifyToken(req.headers['timeline'], async (error, decoded) => {
          if (error) {
            delete req.timelineData;
            next();
          }
          req.timelineData = decoded;
          next();
        });
      } else {
        delete req.timelineData;
        next();
      }
    });
  } else {
    return res
      .status(401)
      .json(await apiresponse(false, MESSAGES.INVALID_TOKEN, 401));
  }
};
