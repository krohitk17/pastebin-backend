import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { uid } from 'rand-token';

import { Data, DataDocument } from './data.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetBodyDto, PostBodyDto, UpdateBodyDto } from './dto/request.dto';
import * as bcrypt from 'bcrypt';
import { ResponseDataDto, ResponseUrlDto } from './dto/response.dto';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Data.name) private readonly dataModel: Model<DataDocument>,
  ) {}

  async getData(authData: GetBodyDto): Promise<ResponseDataDto> {
    const data = await this.dataModel.findOne({ url: authData.url }).exec();
    if (!data) {
      throw new NotFoundException('Data not found');
    }
    console.log('Found ' + data);

    if (data.password) {
      if ((await bcrypt.compare(authData.password, data.password)) === false) {
        throw new UnauthorizedException();
      }
    }

    if (data.burnOnRead) {
      console.log('Deleting ' + data);
      await data.delete();
    }

    return {
      formData: data.formData,
      burnOnRead: data.burnOnRead,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  async createData(data: PostBodyDto): Promise<ResponseUrlDto> {
    const newData = new this.dataModel();
    newData.url = uid(6);
    newData.formData = data.formData;
    newData.password = data.password
      ? await bcrypt.hash(data.password, 10)
      : '';
    newData.burnOnRead = data.burnOnRead;
    newData.updatedAt = new Date();
    console.log('Adding Data ' + newData);

    await newData.save();
    return { url: newData.url };
  }

  async updateData(newData: UpdateBodyDto): Promise<ResponseDataDto> {
    const data = await this.dataModel.findOne({ url: newData.url }).exec();
    if (!data) {
      throw new NotFoundException('Data not found');
    }
    console.log('Found ' + data);

    if (data.password) {
      if ((await bcrypt.compare(newData.password, data.password)) === false) {
        throw new UnauthorizedException();
      }
    }

    data.formData = newData.formData;
    data.updatedAt = new Date();
    console.log('Updated Data ' + data);

    await data.save();
    return {
      formData: data.formData,
      burnOnRead: data.burnOnRead,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
