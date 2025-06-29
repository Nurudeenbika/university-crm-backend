import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { DocumentType } from '../entities/document.entity';

export class UploadDocumentDto {
  @IsEnum(DocumentType)
  type: DocumentType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  courseId?: number;
}

export class DocumentResponseDto {
  id: number;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  type: DocumentType;
  description?: string;
  courseId?: number;
  uploadedBy: {
    id: number;
    email: string;
    role: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class GenerateTranscriptDto {
  @IsNumber()
  studentId: number;
}
