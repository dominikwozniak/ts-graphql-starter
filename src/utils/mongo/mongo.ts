import mongoose from 'mongoose';
import config from 'config';
import log from '../../logger';

export async function connectToMongo() {
  try {
    await mongoose.connect(config.get('dbUri'));
    log.info('Connected to mongodb');
  } catch (err) {
    log.error(err);
    process.exit(1);
  }
}