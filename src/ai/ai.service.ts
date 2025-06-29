import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CoursesService } from '../courses/courses.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { RecommendCoursesDto, GenerateSyllabusDto } from './dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AiService {
  constructor(
    private configService: ConfigService,
    private coursesService: CoursesService,
    private enrollmentsService: EnrollmentsService,
  ) {}

  async recommendCourses(recommendDto: RecommendCoursesDto, user: User) {
    const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');

    // Get all available courses
    const allCourses = await this.coursesService.findAll();

    // Get user's enrolled courses
    const enrollments = await this.enrollmentsService.findByStudent(user.id);
    const enrolledCourseIds = enrollments.map(e => e.courseId);

    // Filter out already enrolled courses
    const availableCourses = allCourses.filter(
      course => !enrolledCourseIds.includes(course.id),
    );

    if (!openaiApiKey) {
      // Mock AI response when API key is not available
      return this.mockCourseRecommendations(
        availableCourses,
        recommendDto.interests,
      );
    }

    try {
      // Real OpenAI integration
      const prompt = `Based on the student's interests: "${recommendDto.interests}" and completed courses: ${recommendDto.completedCourses?.join(', ') || 'None'}, recommend the most suitable courses from this list:

${availableCourses.map(course => `- ${course.title}: ${course.description}`).join('\n')}

Provide recommendations with explanations in JSON format:
{
  "recommendations": [
    {
      "courseId": number,
      "title": "string",
      "reason": "string",
      "matchScore": number (0-100)
    }
  ]
}`;

      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1000,
            temperature: 0.7,
          }),
        },
      );

      const data = await response.json();
      const aiResponse = JSON.parse(data.choices[0].message.content);

      return aiResponse;
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to mock response
      return this.mockCourseRecommendations(
        availableCourses,
        recommendDto.interests,
      );
    }
  }

  async generateSyllabus(syllabusDto: GenerateSyllabusDto) {
    const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!openaiApiKey) {
      // Mock AI response when API key is not available
      return this.mockSyllabusGeneration(syllabusDto);
    }

    try {
      const prompt = `Generate a comprehensive syllabus for a course titled "${syllabusDto.courseName}" focusing on "${syllabusDto.topic}". 
      Duration: ${syllabusDto.duration || '16 weeks'}
      Level: ${syllabusDto.level || 'Intermediate'}

      Include:
      1. Course description
      2. Learning objectives
      3. Weekly topics breakdown
      4. Assessment methods
      5. Required materials
      6. Grading rubric

      Format as JSON:
      {
        "courseName": "string",
        "description": "string",
        "objectives": ["string"],
        "weeklyTopics": [{"week": number, "topic": "string", "description": "string"}],
        "assessments": [{"type": "string", "weight": number, "description": "string"}],
        "materials": ["string"],
        "gradingRubric": {"A": "string", "B": "string", "C": "string", "D": "string", "F": "string"}
      }`;

      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 2000,
            temperature: 0.7,
          }),
        },
      );

      const data = await response.json();
      const syllabus = JSON.parse(data.choices[0].message.content);

      return syllabus;
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to mock response
      return this.mockSyllabusGeneration(syllabusDto);
    }
  }

  private mockCourseRecommendations(
    availableCourses: { id: number; title: string; description: string }[],
    interests: string,
  ) {
    // Simple keyword matching for mock recommendations
    const keywords = interests.toLowerCase().split(/[\s,]+/);

    const recommendations = availableCourses
      .map(course => {
        const titleWords = course.title.toLowerCase().split(/\s+/);
        const descWords = course.description.toLowerCase().split(/\s+/);
        const allWords = [...titleWords, ...descWords];

        const matchScore = keywords.reduce((score, keyword) => {
          const matches = allWords.filter(word =>
            word.includes(keyword),
          ).length;
          return score + matches * 10;
        }, Math.random() * 30); // Add some randomness

        return {
          courseId: course.id,
          title: course.title,
          reason: `Matches your interest in ${keywords.join(', ')}`,
          matchScore: Math.min(Math.round(matchScore), 100),
        };
      })
      .filter(rec => rec.matchScore > 20)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);

    return { recommendations };
  }

  private mockSyllabusGeneration(
    syllabusDto: GenerateSyllabusDto,
  ): Record<string, unknown> {
    const weeks =
      parseInt((syllabusDto.duration || '16 weeks').split(' ')[0]) || 16;

    return {
      courseName: syllabusDto.courseName,
      description: `A comprehensive ${syllabusDto.level || 'intermediate'} level course focusing on ${syllabusDto.topic}. This course will provide students with practical knowledge and hands-on experience.`,
      objectives: [
        `Understand the fundamentals of ${syllabusDto.topic}`,
        `Apply theoretical concepts to practical scenarios`,
        `Develop critical thinking skills in the subject area`,
        `Complete hands-on projects and assignments`,
      ],
      weeklyTopics: Array.from({ length: weeks }, (_, i) => ({
        week: i + 1,
        topic: `Week ${i + 1}: Introduction to Topic ${i + 1}`,
        description: `Covering fundamental concepts and applications related to ${syllabusDto.topic}`,
      })),
      assessments: [
        {
          type: 'Midterm Exam',
          weight: 25,
          description:
            'Comprehensive examination covering first half of course',
        },
        {
          type: 'Final Exam',
          weight: 35,
          description: 'Comprehensive final examination',
        },
        {
          type: 'Assignments',
          weight: 30,
          description: 'Weekly assignments and projects',
        },
        {
          type: 'Participation',
          weight: 10,
          description: 'Class participation and engagement',
        },
      ],
      materials: [
        'Required textbook (will be specified)',
        'Online learning platform access',
        'Calculator (if applicable)',
        'Computer with internet access',
      ],
      gradingRubric: {
        A: '90-100%: Excellent understanding and application',
        B: '80-89%: Good understanding with minor gaps',
        C: '70-79%: Satisfactory understanding',
        D: '60-69%: Below average understanding',
        F: 'Below 60%: Insufficient understanding',
      },
    };
  }
}
