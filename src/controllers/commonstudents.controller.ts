import {repository} from '@loopback/repository';
import {param, get, HttpErrors} from '@loopback/rest';
import {CommonStudents} from '../models';
import {
  RegistrationRepository,
  TeacherRepository,
  StudentRepository,
} from '../repositories';
import {
  getCommonNumber,
  getStudentFromIdList,
  getTeacherIdsByEmail,
  getTeacherRegistrationsById,
} from './helper';
import {K} from 'handlebars';

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
    /** find all teacher Ids*/
    const teachers = await getTeacherIdsByEmail(emails, this.teacherRepository);

    /** no teacher found, throw error*/
    if (!teachers || teachers.length === 0) {
      throw new HttpErrors[403]('No teacher record found!');
    }

    /** find all teachers with students registered
     * in registration repository
     * */
    const teachersId = teachers.map(teacher => teacher.id);
    const teachersRegistrations = await Promise.all(
      teachersId.map(
        async teacherId =>
          await getTeacherRegistrationsById(
            teacherId,
            this.registrationRepository,
          ),
      ),
    );

    /** find all students registered to each teacher */
    const teacherStudentIds = teachersRegistrations
      .filter(teacherRegistation => teacherRegistation)
      .map(teacherRegistation => {
        return teacherRegistation.map(registration => registration.studentId);
      });

    /** find students common to specified registered teachers */
    const commonStudentIds = getCommonNumber(teacherStudentIds);

    /** no common students found return empty list */
    if (commonStudentIds.length === 0) {
      return JSON.stringify({students: []});
    }

    /** find identifed common students from the student repository */
    const students = await getStudentFromIdList(
      commonStudentIds,
      this.studentRepository,
    );

    const studentEmails = students
      .filter(student => student)
      .map(student => student.email);

    return JSON.stringify({students: studentEmails});
  }
}
