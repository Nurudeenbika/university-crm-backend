import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}

  getFileUrl(filename: string): string {
    const baseUrl = this.configService.get<string>(
      'BASE_URL',
      'http://localhost:3000',
    );
    return `${baseUrl}/uploads/${filename}`;
  }

  deleteFile(filename: string): void {
    const filePath = path.join('./uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  saveFile(file: Express.Multer.File): string {
    return file.filename;
  }
}
