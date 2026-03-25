import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ClientConfig,
} from '@aws-sdk/client-s3';

@Injectable()
export class ObjectStorageService {
  private readonly s3Client: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('s3Config.bucket');
    if (!this.bucket) {
      throw new Error('Missing required environment variable: S3_BUCKET');
    }

    const endpoint = this.configService.get<string>('s3Config.endpoint');
    const region = this.configService.get<string>('s3Config.region') || 'us-east-1';
    const accessKeyId = this.configService.get<string>('s3Config.accessKeyId');
    const secretAccessKey = this.configService.get<string>(
      's3Config.secretAccessKey',
    );
    const forcePathStyle =
      this.configService.get<boolean>('s3Config.forcePathStyle') || false;

    const s3Config: S3ClientConfig = {
      region,
      forcePathStyle,
    };

    if (endpoint) {
      s3Config.endpoint = endpoint;
    }

    if (accessKeyId && secretAccessKey) {
      s3Config.credentials = {
        accessKeyId,
        secretAccessKey,
      };
    }

    this.s3Client = new S3Client(s3Config);
  }

  async uploadTextObject(key: string, body: string): Promise<void> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: 'text/plain; charset=utf-8',
      }),
    );
  }

  async getTextObject(key: string): Promise<string> {
    const response = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    if (!response.Body) {
      throw new InternalServerErrorException('Stored object body is empty');
    }

    return response.Body.transformToString();
  }

  async deleteObject(key: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }
}
