import { Field, InputType } from 'type-graphql';

@InputType()
export class ForgotPasswordInput {
  @Field(() => String)
  email: string;
}
