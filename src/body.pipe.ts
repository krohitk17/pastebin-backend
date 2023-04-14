import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class BodyValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    //check if request is post
    if (metadata.type !== 'body') {
      return value;
    }
    const newBody = value.body.replace(/\n/g, '').trim();
    if (newBody === '') {
      throw new BadRequestException('body should not be empty');
    }
    return value;
  }
}
