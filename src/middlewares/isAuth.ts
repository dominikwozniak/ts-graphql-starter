import { MiddlewareFn } from 'type-graphql';
import { ApolloError } from 'apollo-server';
import Context from '../types/context';
import { sessionUserId } from '../consts/session.const';

export const IsAuth: MiddlewareFn<Context> = async ({ context }, next) => {
  // @ts-ignore
  if (!context.req.session[sessionUserId]) {
    throw new ApolloError('Authorization failed');
  }

  return next();
};
