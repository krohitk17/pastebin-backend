import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class Data {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  formData: string;

  @Prop({ required: false, default: '' })
  password: string;

  @Prop({ required: false, default: false })
  burnOnRead: boolean;
}

export type DataDocument = HydratedDocument<Data>;
export const DataSchema = SchemaFactory.createForClass(Data);
