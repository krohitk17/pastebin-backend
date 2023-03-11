import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import configuration from './configuration';

@Schema()
export class Data {
  @Prop({ type: String, required: true })
  formData: string;

  @Prop({ type: String, required: true, immutable: true })
  url: string;

  @Prop({ type: String, default: '', immutable: true })
  password: string;

  @Prop({ type: Boolean, default: false, immutable: true })
  burnOnRead: boolean;

  @Prop({ type: Date, default: Date.now, immutable: true })
  createdAt: Date;

  @Prop({ type: Date, expires: configuration().dbConfig.expires })
  updatedAt: Date;
}

export type DataDocument = HydratedDocument<Data>;
export const DataSchema = SchemaFactory.createForClass(Data);
