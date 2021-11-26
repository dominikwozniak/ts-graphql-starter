import { Field, InputType } from 'type-graphql';
import { IsEmail, MaxLength, MinLength } from 'class-validator';

@InputType()
export class RegisterUserInput {
  @Field(() => String)
  name: string;

  @IsEmail()
  @Field(() => String)
  email: string;

  @MinLength(6, {
    message: 'password must be at least 6 characters long',
  })
  @MaxLength(50, {
    message: 'password must not be longer than 50 characters',
  })
  @Field(() => String)
  password: string;
}
