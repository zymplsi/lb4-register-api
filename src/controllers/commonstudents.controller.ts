import {
  repository,
  Where,
  WhereBuilder,
  FilterBuilder,
} from '@loopback/repository';
import {param, get} from '@loopback/rest';
import {CommonStudents} from '../models';
import {
  RegistrationRepository,
  TeacherRepository,
  StudentRepository,
} from '../repositories';

export class CommonStudentsController {
  constructor(
    @repository(RegistrationRepository)
    public registrationRepository: RegistrationRepository,
    @repository(TeacherRepository)
    public teacherRepository: TeacherRepository,
    @repository(StudentRepository)
    public studentRepository: StudentRepository,
  ) {}

  @get('/commonstudents', {
    responses: {
      '200': {
        description:
          'retrieve a list of students common to a given list of teachers',
        content: {'application/json': {schema: CommonStudents}},
      },
    },
  })
  async find(
    @param.array('teacher', 'query', {type: 'string'}) emails: string[],
  ): Promise<string> {
    let whereEmails: Where;
    let whereTeachersId: Where;

    /** get id of teachers from Teachers repository */
    const whereEmailsBuilder = new WhereBuilder();
    if (Array.isArray(emails)) {
      whereEmails = whereEmailsBuilder.inq('email', emails);
    } else {
      whereEmails = whereEmailsBuilder.eq('email', emails);
    }
    let teachers = await this.teacherRepository.find(whereEmails);
    const teachersId = teachers.map(teacher => teacher.id);

    /*** get students ids from Registration repository that has teachers ids*/
    const whereTeachersIdBuilder = new WhereBuilder();
    whereTeachersId = whereTeachersIdBuilder.inq('teacherId', teachersId);
    const studentRegistrations = await this.registrationRepository.find(
      whereTeachersId,
    );
    const studentIds = studentRegistrations.map(
      registration => registration.studentId,
    );

    /** get students from the Student repositor that has the student ids  */
    const whereStudentsBuilder = new WhereBuilder();
    const whereStudents = whereStudentsBuilder.inq('id', studentIds);
    const whereStudentsFilter = new FilterBuilder();
    const whereStudentsOrdered = whereStudentsFilter
      .order('email')
      .where(whereStudents)
      .build();
    const students = await this.studentRepository.find(whereStudentsOrdered);

    /** get students email and remove duplicates*/
    const studentEmails = students.map(student => student.email);
    const result = {students: [...new Set(studentEmails)]};

    return JSON.stringify(result);
  }
}
