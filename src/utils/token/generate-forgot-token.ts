import { forgotPasswordPrefix } from '../../consts/redis-prefixes.const';

export const generateForgotToken = (providedToken = '') => {
  return forgotPasswordPrefix + providedToken;
};
