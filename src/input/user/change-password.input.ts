import { Field, InputType } from 'type-graphql';

@InputType()
export class ChangePasswordInput {
  @Field(() => String)
  oldPassword: string;

  @Field(() => String)
  newPassword: string;
}
