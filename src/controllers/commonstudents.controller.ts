import {
  repository,
  WhereBuilder,
} from '@loopback/repository';
import {param, get} from '@loopback/rest';
import {CommonStudents} from '../models';
import {
  RegistrationRepository,
  TeacherRepository,
  StudentRepository,
} from '../repositories';
import {getCommonNumber, getStudentFromIdList, getTeacherIds} from './helper';

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
  ) {
    /** get list of all teacher ids*/
    const teachers = await getTeacherIds(emails, this.teacherRepository);
    const teachersId = teachers.map(teacher => teacher.id);

    /** get list of registered teachers */
    const teachersRegistations = await Promise.all(
      teachersId.map(async teacherId => {
        const whereTeachersIdBuilder = new WhereBuilder();
        const whereTeachersId = whereTeachersIdBuilder.eq(
          'teacherId',
          teacherId,
        );
        return await this.registrationRepository.find(whereTeachersId);
      }),
    );

    /** get list of students ids for each registered teacher */
    const teacherStudentIds = teachersRegistations.map(teacherRegistations => {
      return teacherRegistations.map(registration => registration.studentId);
    });

    /** get list of students emails common to registered teachers */
    const commonStudentIds = getCommonNumber(teacherStudentIds);
    const students = await getStudentFromIdList(
      commonStudentIds,
      this.studentRepository,
    );
    const studentEmails = students.map(student => student.email);

    return JSON.stringify({students: studentEmails});
  }
}
