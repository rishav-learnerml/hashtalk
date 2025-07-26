import { Schema } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export const UserSchema = new Schema({
  username: String,
  password: String,
});

UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(this.password as string, salt as string, (err, hash) => {
      if (err) return next(err);
      this.password = hash;
      next();
    });
  });
});
