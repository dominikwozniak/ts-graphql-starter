import { Field, InputType } from 'type-graphql';

@InputType()
export class RemoveUserInput {
  @Field(() => String)
  password: string;
}
