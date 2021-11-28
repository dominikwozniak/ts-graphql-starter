import { Field, InputType } from 'type-graphql';

@InputType()
export class ForgotPasswordConfirmInput {
  @Field(() => String)
  password: string;

  @Field(() => String)
  token: string;
}
