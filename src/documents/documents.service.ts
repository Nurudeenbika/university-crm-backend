import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentType } from './entities/document.entity';
import {
  UploadDocumentDto,
  DocumentResponseDto,
  GenerateTranscriptDto,
} from './dto';
import { User, UserRole } from '../users/entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
  ) {}

  async uploadDocument(
    file: Express.Multer.File,
    uploadDocumentDto: UploadDocumentDto,
    user: User,
  ): Promise<DocumentResponseDto> {
    const document = this.documentsRepository.create({
      originalName: file.originalname,
      filename: file.filename,
      filepath: file.path,
      mimetype: file.mimetype,
      size: file.size,
      type: uploadDocumentDto.type,
      description: uploadDocumentDto.description,
      courseId: uploadDocumentDto.courseId,
      uploadedById: user.id,
    });

    const savedDocument = await this.documentsRepository.save(document);
    return this.mapToResponseDto(savedDocument);
  }

  async findAll(user: User): Promise<DocumentResponseDto[]> {
    let documents: Document[];

    if (user.role === UserRole.ADMIN) {
      documents = await this.documentsRepository.find({
        relations: ['uploadedBy', 'course'],
      });
    } else if (user.role === UserRole.LECTURER) {
      documents = await this.documentsRepository.find({
        relations: ['uploadedBy', 'course'],
        where: [{ uploadedById: user.id }, { course: { lecturerId: user.id } }],
      });
    } else {
      documents = await this.documentsRepository.find({
        relations: ['uploadedBy', 'course'],
        where: { uploadedById: user.id },
      });
    }

    return documents.map(doc => this.mapToResponseDto(doc));
  }

  async findOne(id: number, user: User): Promise<DocumentResponseDto> {
    const document = await this.documentsRepository.findOne({
      where: { id },
      relations: ['uploadedBy', 'course'],
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Check access permissions
    if (
      user.role !== UserRole.ADMIN &&
      document.uploadedById !== user.id &&
      document.course?.lecturerId !== user.id
    ) {
      throw new BadRequestException('Access denied');
    }

    return this.mapToResponseDto(document);
  }

  async downloadDocument(
    id: number,
    user: User,
  ): Promise<{ filepath: string; filename: string }> {
    await this.findOne(id, user);

    const doc = await this.documentsRepository.findOne({
      where: { id },
    });

    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    if (!fs.existsSync(doc.filepath)) {
      throw new NotFoundException('File not found on disk');
    }

    return {
      filepath: doc.filepath,
      filename: doc.originalName,
    };
  }

  async deleteDocument(id: number, user: User): Promise<void> {
    const document = await this.documentsRepository.findOne({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Check permissions
    if (user.role !== UserRole.ADMIN && document.uploadedById !== user.id) {
      throw new BadRequestException('Access denied');
    }

    // Delete file from disk
    if (fs.existsSync(document.filepath)) {
      fs.unlinkSync(document.filepath);
    }

    await this.documentsRepository.remove(document);
  }

  async generateTranscript(
    generateTranscriptDto: GenerateTranscriptDto,
  ): Promise<string> {
    // This is a bonus feature - generate PDF transcript
    const { studentId } = generateTranscriptDto;

    // Mock data - in real implementation, fetch from database
    const studentData = {
      name: 'John Doe',
      email: 'john.doe@university.edu',
      studentId: studentId,
      courses: [
        { title: 'Computer Science 101', credits: 3, grade: 85 },
        { title: 'Mathematics 201', credits: 4, grade: 92 },
        { title: 'Physics 101', credits: 3, grade: 78 },
      ],
    };

    const filename = `transcript-${studentId}-${Date.now()}.pdf`;
    const filepath = path.join('./uploads', filename);

    const doc: PDFKit.PDFDocument = new PDFDocument();
    doc.pipe(fs.createWriteStream(filepath));

    // Header
    doc
      .fontSize(20)
      .text('University Official Transcript', { align: 'center' });
    doc.moveDown();

    // Student Info
    doc.fontSize(14).text(`Student Name: ${studentData.name}`);
    doc.text(`Student ID: ${studentData.studentId}`);
    doc.text(`Email: ${studentData.email}`);
    doc.moveDown();

    // Courses
    doc.text('Course History:', { underline: true });
    doc.moveDown();

    let totalCredits = 0;
    let totalGradePoints = 0;

    studentData.courses.forEach(course => {
      doc.text(
        `${course.title} - Credits: ${course.credits} - Grade: ${course.grade}%`,
      );
      totalCredits += course.credits;
      totalGradePoints += (course.grade / 100) * 4.0 * course.credits; // Convert to GPA scale
    });

    doc.moveDown();
    const gpa = totalGradePoints / totalCredits;
    doc.text(`Total Credits: ${totalCredits}`);
    doc.text(`Cumulative GPA: ${gpa.toFixed(2)}/4.0`);

    doc.end();

    // Save to database
    const transcriptDoc = this.documentsRepository.create({
      originalName: filename,
      filename: filename,
      filepath: filepath,
      mimetype: 'application/pdf',
      size: 0, // Will be updated after file is written
      type: DocumentType.TRANSCRIPT,
      description: `Official transcript for student ${studentId}`,
      uploadedById: studentId, // In real implementation, this should be system user
    });

    await this.documentsRepository.save(transcriptDoc);

    return filename;
  }

  private mapToResponseDto(document: Document): DocumentResponseDto {
    return {
      id: document.id,
      originalName: document.originalName,
      filename: document.filename,
      mimetype: document.mimetype,
      size: document.size,
      type: document.type,
      description: document.description,
      courseId: document.courseId,
      uploadedBy: {
        id: document.uploadedBy.id,
        email: document.uploadedBy.email,
        role: document.uploadedBy.role,
      },
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}
