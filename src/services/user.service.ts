import { ApolloError } from 'apollo-server';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import Context from '../types/context';
import log from '../logger';
import { User, UserModel } from '../schemas/user.schema';
import { RegisterUserInput } from '../input/user/register-user.input';
import { ConfirmUserInput } from '../input/user/confirm-user.input';
import { LoginUserInput } from '../input/user/login-user.input';
import { RemoveUserInput } from '../input/user/remove-user.input';
import { ForgotPasswordConfirmInput } from '../input/user/forgot-password-confirm.input';
import { ForgotPasswordInput } from '../input/user/forgot-password.input';
import { UpdateUserInput } from '../input/user/update-user.input';
import { sessionCookieId, sessionUserId } from '../consts/session.const';
import { redis } from '../utils/redis/redis';
import { generateConfirmToken } from '../utils/token/generate-confirm-token';
import { sendEmail } from '../utils/mail/sendEmail';
import { createConfirmUserUrl } from '../utils/mail/create-confirm-user-url';
import { createForgotPasswordUrl } from '../utils/mail/create-forgot-password-url';
import { generateForgotToken } from '../utils/token/generate-forgot-token';

class UserService {
  async findUserFromContext(userId: Context['userId']) {
    if (!userId) {
      throw new ApolloError('Authorization failed');
    }

    return UserModel.find().findById(userId);
  }

  async whoAmI(context: Context) {
    const user = await this.findUserFromContext(context.userId);

    if (!user) {
      throw new ApolloError('Invalid userId');
    }

    return user;
  }

  async createUser(input: RegisterUserInput): Promise<User> {
    const found = await UserModel.find().findByEmail(input.email).lean();

    if (found) {
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

  async removeUser(input: RemoveUserInput, context: Context) {
    const user = await this.findUserFromContext(context.userId);

    if (!user) {
      throw new ApolloError('Cannot remove user');
    }

    const passwordIsValid = await bcrypt.compare(input.password, user.password);
    if (!passwordIsValid) {
      throw new ApolloError('Invalid password');
    }

    await user.delete();
    await this.logoutUser(context);

    return true;
  }

  async forgotPassword(input: ForgotPasswordInput) {
    const user = await UserModel.find().findByEmail(input.email);

    if (!user) {
      return false;
    }

    const forgotMail = async () => {
      const token = nanoid(32);
      const url = createForgotPasswordUrl(token);
      await sendEmail(user.email, url, 'Reset password');
      await redis.set(
        generateForgotToken(token),
        user.email,
        'ex',
        60 * 60 * 24,
      );
    };
    await forgotMail();

    return true;
  }

  async forgotPasswordConfirm(input: ForgotPasswordConfirmInput) {
    const token = generateForgotToken(input.token);
    const userEmail = await redis.get(token);
    if (!userEmail) {
      return false;
    }

    const user = await UserModel.find().findByEmail(userEmail);
    if (!user) {
      return false;
    }

    user.password = input.password;
    await user.save();
    await redis.del(token)

    return true;
  }

  async updateUser(input: UpdateUserInput, context: Context) {
    const user = await this.findUserFromContext(context.userId);

    if (!user) {
      throw new ApolloError('Cannot update user');
    }
    await user.updateOne({ ...input });

    return true;
  }
}

export default UserService;
