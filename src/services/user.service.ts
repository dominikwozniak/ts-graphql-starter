import { ApolloError } from 'apollo-server';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import Context from '../types/context';
import { User, UserModel } from '../schemas/user.schema';
import { LoginUserInput } from '../input/user/login-user.input';
import { RegisterUserInput } from '../input/user/register-user.input';
import { ConfirmUserInput } from '../input/user/confirm-user.input';
import { sessionCookieId, sessionUserId } from '../consts/session.const';
import { redis } from '../utils/redis/redis';
import { generateConfirmToken } from '../utils/generate-confirm-token';
import { sendEmail } from '../utils/mail/sendEmail';
import { createConfirmUserUrl } from '../utils/mail/create-confirm-user-url';
import log from '../logger';

class UserService {
  async whoAmI(context: Context) {
    if (!context.userId) {
      return undefined;
    }

    const user = await UserModel.find().findById(context.userId);

    if (!user) {
      throw new ApolloError('Invalid userId');
    }

    return user;
  }

  async createUser(input: RegisterUserInput): Promise<User> {
    const found = await UserModel.find().findByEmail(input.email).lean();

    if (!found) {
      throw new ApolloError('Cannot register with provided credentials');
    }

    const user = await UserModel.create(input);

    if (!user) {
      throw new ApolloError('Cannot create account with provided credentials');
    }

    const confirmMail = async () => {
      const token = nanoid(32);
      const url = createConfirmUserUrl(token);
      await sendEmail(user.email, url, 'Confirm account');
      await redis.set(
        generateConfirmToken(token),
        user.email,
        'ex',
        60 * 60 * 24,
      );
    };

    await confirmMail();

    return user;
  }

  async loginUser(input: LoginUserInput, context: Context): Promise<User> {
    const user = await UserModel.find().findByEmail(input.email).lean();

    if (!user) {
      throw new ApolloError('Invalid email or password');
    }

    const passwordIsValid = await bcrypt.compare(input.password, user.password);

    if (!passwordIsValid) {
      throw new ApolloError('Invalid email or password');
    }

    if (!user.confirmed) {
      throw new ApolloError('User is not active');
    }

    // @ts-ignore
    context.req.session[sessionUserId] = user._id;

    return user;
  }

  logoutUser(context: Context) {
    return new Promise((res, rej) =>
      context.req.session!.destroy((err) => {
        if (err) {
          log.error(err);
          return rej(false);
        }

        context.res.clearCookie(sessionCookieId);
        return res(true);
      }),
    );
  }

  async confirmUser(input: ConfirmUserInput) {
    const token = generateConfirmToken(input.token);
    const userEmail = await redis.get(token);
    if (!userEmail) {
      return false;
    }

    const user = await UserModel.find().findByEmail(userEmail);
    if (!user) {
      return false;
    }

    user.confirmed = true;
    await user.save();
    await redis.del(token);

    return true;
  }
}

export default UserService;
