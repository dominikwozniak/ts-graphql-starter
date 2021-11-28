import { Field, InputType } from 'type-graphql';

@InputType()
export class ConfirmUserInput {
  @Field(() => String)
  token: string;
}
