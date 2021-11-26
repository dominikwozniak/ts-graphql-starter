import { Field, InputType } from 'type-graphql';

@InputType()
export class LoginUserInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;
}
