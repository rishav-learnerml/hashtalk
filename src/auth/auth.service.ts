import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<any>,
    private jwtService: JwtService,
  ) {}

  async signup(username: string, password: string) {
    const existing = await this.userModel.findOne({ username });
    if (existing) throw new Error('User exists');
    const user = new this.userModel({ username, password });
    await user.save();
    return { token: this.jwtService.sign({ username }) };
  }

  async signin(username: string, password: string) {
    const user = await this.userModel.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid creds');
    }
    return { token: this.jwtService.sign({ username }) };
  }
}
