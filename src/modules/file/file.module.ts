import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { FileGateway } from './file.gateway';

@Module({
  controllers: [FileController],
  providers: [FileService, FileGateway]
})
export class FileModule {}
