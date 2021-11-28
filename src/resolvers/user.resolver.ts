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
import { RemoveUserInput } from '../input/user/remove-user.input';
import { ForgotPasswordInput } from '../input/user/forgot-password.input';
import { ForgotPasswordConfirmInput } from '../input/user/forgot-password-confirm.input';
import { UpdateUserInput } from '../input/user/update-user.input';
import { ChangePasswordInput } from '../input/user/change-password.input';

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
    return this.userService.confirmUser(input);
  }

  @UseMiddleware(IsAuth)
  @Mutation(() => Boolean)
  removeUser(@Arg('input') input: RemoveUserInput, @Ctx() context: Context) {
    return this.userService.removeUser(input, context);
  }

  @Mutation(() => Boolean)
  forgotPassword(@Arg('input') input: ForgotPasswordInput) {
    return this.userService.forgotPassword(input);
  }

  @Mutation(() => Boolean)
  forgotPasswordConfirm(@Arg('input') input: ForgotPasswordConfirmInput) {
    return this.userService.forgotPasswordConfirm(input);
  }

  @UseMiddleware(IsAuth)
  @Mutation(() => Boolean)
  updateUser(@Arg('input') input: UpdateUserInput, @Ctx() context: Context) {
    return this.userService.updateUser(input, context);
  }

  @UseMiddleware(IsAuth)
  @Mutation(() => Boolean)
  changePassword(
    @Arg('input') input: ChangePasswordInput,
    @Ctx() context: Context,
  ) {
    return this.userService.changePassword(input, context);
  }
}
