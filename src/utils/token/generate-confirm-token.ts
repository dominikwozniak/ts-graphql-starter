import { confirmUserPrefix } from '../../consts/redis-prefixes.const';

export const generateConfirmToken = (providedToken = '') => {
  return confirmUserPrefix + providedToken;
};
