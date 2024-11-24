import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { FileGateway } from './file.gateway';

@Injectable()
export class FileService {

  private rootDir = path.join(process.cwd(), 'root');
  private uploadProgress = new Map<string, { uploadedChunks: number, totalChunks: number }>();

  constructor(private readonly fileGateway: FileGateway) {}

  async createFolder(folderName: string) {
    const folderPath = path.join(this.rootDir);

    try {
      if (fs.existsSync(folderPath)) {
        return { error: 'Folder already exists' };
      }

      await fs.ensureDir(folderPath);
      return { message: 'Folder created successfully' };
    } catch (error) {
      return { error: 'Error creating folder' };
    }
  }

  async listFiles(folderName: string) {
    const folder = folderName.replace('root', '');
    const folderPath = path.join(this.rootDir, folder);
    try {
      const files = await fs.readdir(folderPath, { withFileTypes: true });

      return files.map(file => {
        const filePath = path.join(folderPath, file.name);
        const stats = fs.statSync(filePath);
        return {
          name: file.name,
          type: file.isDirectory() ? 'folder' : path.extname(file.name).slice(1),
          size: stats.size,
          createdDate: stats.birthtime,
        };
      });
    } catch (error) {
      console.log(error);
      return { error: 'Error reading directory' };
    }
  }

  getFolderTree(dirPath: string = this.rootDir): any {
    const stats = fs.statSync(dirPath);
    if (stats.isDirectory()) {
      const children = fs.readdirSync(dirPath)
        .map(child => path.join(dirPath, child))
        .filter(childPath => fs.statSync(childPath).isDirectory())
        .map(childDir => this.getFolderTree(childDir));
      return { name: path.basename(dirPath), children };
    }
    return null;
  }

  async uploadChunk(chunk: Buffer, chunkNumber: number, totalChunks: number, fileName: string) {
    const filePath = path.join(this.rootDir, fileName);

    try {
      await fs.appendFile(filePath, chunk);

      if (!this.uploadProgress.has(fileName)) {
        this.uploadProgress.set(fileName, { uploadedChunks: 0, totalChunks });
      }

      const progress = this.uploadProgress.get(fileName);
      progress.uploadedChunks += 1;

      const progressPercentage = (progress.uploadedChunks / totalChunks) * 100;
      this.fileGateway.sendProgress(fileName, progressPercentage);

      if (progress.uploadedChunks === totalChunks) {
        this.uploadProgress.delete(fileName);
        return { message: 'File uploaded successfully' };
      }

      return { message: 'Chunk uploaded successfully', progress: progressPercentage };
    } catch (error) {
      return { error: 'Error uploading chunk' };
    }
  }
}