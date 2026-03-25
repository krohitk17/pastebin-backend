import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class Paste {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, default: '', index: true })
  ownerId: string;

  @Prop({ type: String, required: true, immutable: true })
  objectKey: string;

  @Prop({ type: String, required: true })
  syntax: string;

  @Prop({ type: String, required: true, immutable: true })
  url: string;

  @Prop({
    type: String,
    default: '',
    maxlength: 60,
  })
  password: string;

  @Prop({ type: Boolean, default: false })
  burnOnRead: boolean;

  @Prop({ type: Date, default: Date.now, immutable: true })
  createdAt: Date;

  @Prop({ type: Date, required: true, expires: 0 })
  expiresAt: Date;
}

export type PasteDocument = HydratedDocument<Paste>;
export const PasteSchema = SchemaFactory.createForClass(Paste);
