import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class Data {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  body: string;

  @Prop({ type: String, required: true })
  syntax: string;

  @Prop({ type: String, required: true, immutable: true })
  url: string;

  @Prop({
    type: String,
    default: '',
    maxlength: 60,
    immutable: true,
  })
  password: string;

  @Prop({ type: Boolean, default: false, immutable: true })
  burnOnRead: boolean;

  @Prop({ type: Date, default: Date.now, immutable: true })
  createdAt: Date;

  @Prop({ type: Date, required: true, immutable: true, expires: 0 })
  expiresAt: Date;
}

export type DataDocument = HydratedDocument<Data>;
export const DataSchema = SchemaFactory.createForClass(Data);
