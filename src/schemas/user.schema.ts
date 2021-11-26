import { Field, ObjectType } from 'type-graphql';
import {
  getModelForClass,
  index,
  pre,
  prop,
  queryMethod,
  ReturnModelType,
} from '@typegoose/typegoose';
import bcrypt from 'bcrypt';
import { AsQueryMethod } from '@typegoose/typegoose/lib/types';

interface QueryHelpers {
  findByEmail: AsQueryMethod<typeof findByEmail>;
  findById: AsQueryMethod<typeof findById>;
}

function findById(
  this: ReturnModelType<typeof User, QueryHelpers>,
  id: User['_id'],
) {
  return this.findOne({ _id: id });
}

function findByEmail(
  this: ReturnModelType<typeof User, QueryHelpers>,
  email: User['email'],
) {
  return this.findOne({ email });
}

@pre<User>('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = bcrypt.hashSync(this.password, salt);
})
@index({ email: 1 })
@queryMethod(findById)
@queryMethod(findByEmail)
@ObjectType()
export class User {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @prop({ required: true })
  name: string;

  @Field(() => String)
  @prop({ required: true })
  email: string;

  @prop({ required: true })
  password: string;
}

export const UserModel = getModelForClass<typeof User, QueryHelpers>(User);
