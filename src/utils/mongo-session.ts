import config from 'config'
import * as session from 'express-session';
const MongoDBStore = require('connect-mongodb-session')(session);

export const store = new MongoDBStore({
  uri: config.get('dbUri'),
  collection: 'sessions',
  expires: 1000 * 60 * 60 * 24 * 7,
});
