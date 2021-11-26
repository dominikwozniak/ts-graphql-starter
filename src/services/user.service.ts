import { ApolloError } from 'apollo-server';
import bcrypt from 'bcrypt';
import Context from '../types/context';
import { User, UserModel } from '../schemas/user.schema';
import { LoginUserInput } from '../input/user/login-user.input';
import { RegisterUserInput } from '../input/user/register-user.input';
import { sessionCookieId, sessionUserId } from '../consts/session.consts';

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
    return UserModel.create(input);
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

    // @ts-ignore
    context.req.session[sessionUserId] = user._id;

    return user;
  }

  logoutUser(context: Context) {
    return new Promise((res, rej) =>
      context.req.session!.destroy((err) => {
        if (err) {
          console.log(err);
          return rej(false);
        }

        context.res.clearCookie(sessionCookieId);
        return res(true);
      }),
    );
  }
}

export default UserService;
