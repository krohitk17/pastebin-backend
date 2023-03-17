import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { uid } from 'rand-token';

import { Data, DataDocument } from './data.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetBodyDto, PostBodyDto } from './dto/request.dto';
import * as bcrypt from 'bcrypt';
import { ResponseDataDto, ResponseUrlDto } from './dto/response.dto';

function parseTimeString(timeString): Date {
  const unit = timeString.slice(-1);
  const value = parseInt(timeString.slice(0, -1));
  const now = new Date();
  switch (unit) {
    case 'm':
      now.setMinutes(now.getMinutes() + value);
      break;
    case 'h':
      now.setHours(now.getHours() + value);
      break;
    case 'd':
      now.setDate(now.getDate() + value);
      break;
    case 'w':
      now.setDate(now.getDate() + value * 7);
      break;
    case 'M':
      now.setMonth(now.getMonth() + value);
      break;
    // add more cases for other time units if needed
  }
  return now;
}

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Data.name) private readonly dataModel: Model<DataDocument>,
  ) {}

  async getData(authData: GetBodyDto): Promise<ResponseDataDto> {
    const data = await this.dataModel.findOne({ url: authData.url }).exec();
    if (!data) {
      console.log(authData.url + ' not found');
      throw new NotFoundException('Data not found');
    }
    console.log('Found ' + data.url);

    if (data.password) {
      if ((await bcrypt.compare(authData.password, data.password)) === false) {
        console.log('Wrong password ' + authData.password);
        throw new UnauthorizedException();
      }
    }

    if (data.burnOnRead) {
      console.log('Deleting ' + data.url);
      await data.delete();
    }

    return {
      title: data.title,
      body: data.body,
      syntax: data.syntax,
      burnOnRead: data.burnOnRead,
      createdAt: data.createdAt,
      expiresAt: data.expiresAt,
    };
  }

  async createData(data: PostBodyDto): Promise<ResponseUrlDto> {
    const newData = new this.dataModel();
    newData.url = uid(6);
    newData.title = data.title;
    newData.body = data.body;
    newData.password = data.password
      ? await bcrypt.hash(data.password, 10)
      : '';
    newData.syntax = data.syntax;
    newData.burnOnRead = data.burnOnRead;
    newData.expiresAt = parseTimeString(data.expiresAt);
    await newData.save();

    console.log('Adding Data ' + newData);
    return { url: newData.url };
  }
}
