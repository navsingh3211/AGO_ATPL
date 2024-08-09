import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';

dotenv.config('../src/.env');
// console.log(process.env.JWT_SECRET_KEY);
const JWT_SECRET_TOKEN = process.env.JWT_SECRET_KEY;
// console.log(JWT_SECRET_TOKEN, 'sitaraman');
/**
 * get Institution details
 * token: jwt token
 * cb: callback function
 */
let getTokenDetails = (token, cb) => {
  try {
    let data = jwt.verify(token, JWT_SECRET_TOKEN);
    // console.log(data, 'x.com');
    cb(null, data);
  } catch (error) {
    // console.log('XcORPS.com');
    cb(error, null);
  }
};

export default getTokenDetails;
