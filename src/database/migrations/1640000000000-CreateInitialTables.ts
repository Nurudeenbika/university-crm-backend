import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1640000000000 implements MigrationInterface {
  name = 'CreateInitialTables1640000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."user_role_enum" AS ENUM('student', 'lecturer', 'admin')
    `);

    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "firstName" character varying NOT NULL,
        "lastName" character varying NOT NULL,
        "role" "public"."user_role_enum" NOT NULL DEFAULT 'student',
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
        CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "course" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "description" text,
        "credits" integer NOT NULL DEFAULT 3,
        "lecturerId" uuid,
        "syllabusPath" character varying,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bf95180dd756fd204fb01ce4916" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."enrollment_status_enum" AS ENUM('pending', 'approved', 'rejected', 'dropped')
    `);

    await queryRunner.query(`
      CREATE TABLE "enrollment" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "courseId" uuid NOT NULL,
        "studentId" uuid NOT NULL,
        "status" "public"."enrollment_status_enum" NOT NULL DEFAULT 'pending',
        "enrolledAt" TIMESTAMP NOT NULL DEFAULT now(),
        "approvedAt" TIMESTAMP,
        "approvedBy" uuid,
        CONSTRAINT "PK_7c0f752f9fb68bf6ed7367ab00f" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "assignment" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "courseId" uuid NOT NULL,
        "studentId" uuid NOT NULL,
        "title" character varying NOT NULL,
        "description" text,
        "filePath" character varying,
        "submissionText" text,
        "grade" numeric(5,2),
        "weight" numeric(3,2) NOT NULL DEFAULT 1.00,
        "submittedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "gradedAt" TIMESTAMP,
        "gradedBy" uuid,
        CONSTRAINT "PK_43c2f5a3859f54cedafb270f37e" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "course" ADD CONSTRAINT "FK_course_lecturer" 
      FOREIGN KEY ("lecturerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "enrollment" ADD CONSTRAINT "FK_enrollment_course" 
      FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "enrollment" ADD CONSTRAINT "FK_enrollment_student" 
      FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "enrollment" ADD CONSTRAINT "FK_enrollment_approved_by" 
      FOREIGN KEY ("approvedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "assignment" ADD CONSTRAINT "FK_assignment_course" 
      FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "assignment" ADD CONSTRAINT "FK_assignment_student" 
      FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "assignment" ADD CONSTRAINT "FK_assignment_graded_by" 
      FOREIGN KEY ("gradedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // Create indexes for better performance
    await queryRunner.query(
      `CREATE INDEX "IDX_user_email" ON "user" ("email")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_user_role" ON "user" ("role")`);
    await queryRunner.query(
      `CREATE INDEX "IDX_course_lecturer" ON "course" ("lecturerId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_enrollment_course_student" ON "enrollment" ("courseId", "studentId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_enrollment_status" ON "enrollment" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_assignment_course_student" ON "assignment" ("courseId", "studentId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "assignment"`);
    await queryRunner.query(`DROP TABLE "enrollment"`);
    await queryRunner.query(`DROP TABLE "course"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TYPE "public"."enrollment_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
  }
}
