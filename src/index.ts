import dotenv from 'dotenv';
dotenv.config();
import config from 'config';
import 'reflect-metadata';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import { buildSchema } from 'type-graphql';
import cookieParser from 'cookie-parser';
import { ApolloServer } from 'apollo-server-express';
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageProductionDefault,
} from 'apollo-server-core';
import { resolvers } from './resolvers';
import { connectToMongo } from './utils/mongo/mongo';
import { store } from './utils/mongo/mongo-session';
import Context from './types/context';
import { sessionCookieId, sessionUserId } from './consts/session.const';

async function bootstrap() {
  const schema = await buildSchema({
    resolvers,
  });

  const app = express();

  app.use(cookieParser());

  app.use(
    cors({
      credentials: true,
      origin: ['http://localhost:3000', 'http://localhost:4000'],
    }),
  );

  app.use(
    session({
      store: store,
      name: sessionCookieId,
      secret: config.get('sessionSecret'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    }),
  );

  const server = new ApolloServer({
    schema,
    context: (ctx: Context) => {
      const context = ctx;

      // @ts-ignore
      if (ctx.req.session[sessionUserId]) {
        // @ts-ignore
        context.userId = ctx.req.session[sessionUserId];
      }

      return context;
    },
    plugins: [
      process.env.NODE_ENV === 'production'
        ? ApolloServerPluginLandingPageProductionDefault()
        : ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
  });

  await server.start();
  server.applyMiddleware({ app, cors: false });

  app.listen({ port: 4000 }, () => {
    console.log('App is listening on http://localhost:4000');
  });

  connectToMongo();
}

bootstrap()
  .catch((err) => {
    console.error(err);
  });
