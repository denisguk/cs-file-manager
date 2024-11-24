import { Controller, Post, UseInterceptors, UploadedFile, Body, Get, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { multerConfig } from '@config/multer.config';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';

@ApiTags('app')
@Controller('app')
@Controller('app')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @ApiOperation({ summary: 'Upload a file' })
  @ApiResponse({ status: 200, description: 'File uploaded successfully' })
  @ApiBody({
    description: 'File to upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return { message: 'File uploaded successfully', file };
  }

  @Post('folder/create')
  @ApiOperation({ summary: 'Create a new folder' })
  @ApiResponse({ status: 200, description: 'Folder created successfully' })
  @ApiBody({ description: 'Folder name', type: String })
  createFolder(@Body('folderName') folderName: string) {
    return this.fileService.createFolder(folderName);
  }

  @Get('folder')
  @ApiOperation({ summary: 'List files in a folder' })
  @ApiResponse({ status: 200, description: 'List of files' })
  @ApiQuery({ name: 'folderName', required: false, description: 'Name of the folder' })
  listFiles(@Query('folderName') folderName: string) {
    return this.fileService.listFiles(folderName);
  }
}