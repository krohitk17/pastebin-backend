import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { uid } from 'rand-token';

import { Data, DataDocument } from './data.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetBodyDto, PostBodyDto } from './body.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Data.name) private readonly dataModel: Model<DataDocument>,
  ) {}

  async getData(authData: GetBodyDto) {
    const data = await this.dataModel.findOne({ url: authData.url }).exec();
    if (!data) {
      throw new NotFoundException();
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
    return data;
  }

  async saveData(data: PostBodyDto): Promise<string> {
    const newData = new this.dataModel();
    newData.url = uid(6);
    newData.formData = data.formData;
    newData.password = !data.password
      ? ''
      : await bcrypt.hash(data.password, 10);
    newData.burnOnRead = data.burnOnRead;
    console.log(newData);

    await newData.save();
    return newData.url;
  }
}
