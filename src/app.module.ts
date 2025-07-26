import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { WebrtcModule } from './webrtc/webrtc.module';
import { ConfigModule } from '@nestjs/config';
import { GeminiModule } from './gemini/gemini.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    AuthModule,
    WebrtcModule,
    GeminiModule,
  ],
})
export class AppModule {}
