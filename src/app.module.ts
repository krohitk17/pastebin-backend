import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Data, DataSchema } from './data.model';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/pastebin'),
    MongooseModule.forFeature([{ name: Data.name, schema: DataSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
