import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { DocumentsService } from './documents.service';
import {
  UploadDocumentDto,
  DocumentResponseDto,
  GenerateTranscriptDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import * as fs from 'fs';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDocumentDto: UploadDocumentDto,
    @GetUser() user: User,
  ): Promise<DocumentResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.documentsService.uploadDocument(file, uploadDocumentDto, user);
  }

  @Get()
  async findAll(@GetUser() user: User): Promise<DocumentResponseDto[]> {
    return this.documentsService.findAll(user);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<DocumentResponseDto> {
    return this.documentsService.findOne(+id, user);
  }

  @Get(':id/download')
  async downloadDocument(
    @Param('id') id: string,
    @GetUser() user: User,
    @Res() res: Response,
  ): Promise<void> {
    const { filepath, filename } = await this.documentsService.downloadDocument(
      +id,
      user,
    );

    const fileStream = fs.createReadStream(filepath);
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    fileStream.pipe(res);
  }

  @Delete(':id')
  async deleteDocument(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    await this.documentsService.deleteDocument(+id, user);
    return { message: 'Document deleted successfully' };
  }
  @Post('generate-transcript')
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin)
  async generateTranscript(
    @Body() generateTranscriptDto: GenerateTranscriptDto,
  ): Promise<{ filename: string; message: string }> {
    const filename = await this.documentsService.generateTranscript(
      generateTranscriptDto,
    );
    return {
      filename,
      message: 'Transcript generated successfully',
    };
  }
}
