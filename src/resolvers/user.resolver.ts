import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import Context from '../types/context';
import UserService from '../services/user.service';
import { IsAuth } from '../middlewares/isAuth';
import { User } from '../schemas/user.schema';
import { RegisterUserInput } from '../input/user/register-user.input';
import { LoginUserInput } from '../input/user/login-user.input';
import { ConfirmUserInput } from '../input/user/confirm-user.input';

@Resolver()
export default class UserResolver {
  constructor(private userService: UserService) {
    this.userService = new UserService();
  }

  @UseMiddleware(IsAuth)
  @Query(() => User, { nullable: true })
  whoAmI(@Ctx() context: Context) {
    return this.userService.whoAmI(context);
  }

  @Mutation(() => User)
  registerUser(@Arg('input') input: RegisterUserInput): Promise<User> {
    return this.userService.createUser(input);
  }

  @Mutation(() => User, { nullable: true })
  loginUser(@Arg('input') input: LoginUserInput, @Ctx() context: Context) {
    return this.userService.loginUser(input, context);
  }

  @Mutation(() => Boolean)
  logoutUser(@Ctx() context: Context) {
    return this.userService.logoutUser(context);
  }

  @Mutation(() => Boolean)
  confirmUser(@Arg('input') input: ConfirmUserInput) {
    return this.userService.confirmUser(input)
  }
}