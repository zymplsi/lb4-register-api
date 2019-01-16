import {repository, WhereBuilder} from '@loopback/repository';
import {post, requestBody, HttpErrors} from '@loopback/rest';
import {Register, Student, Registration} from '../models';
import {
  RegistrationRepository,
  TeacherRepository,
  StudentRepository,
} from '../repositories';

export class RegisterController {
  constructor(
    @repository(RegistrationRepository)
    public registrationRepository: RegistrationRepository,
    @repository(TeacherRepository)
    public teacherRepository: TeacherRepository,
    @repository(StudentRepository)
    public studentRepository: StudentRepository,
  ) {}

  @post('/register', {
    responses: {
      '204': {
        description: 'register one or more students to a specified teacher',
        content: {'application/json': {schema: {'x-ts-type': Register}}},
      },
    },
  })
  async create(@requestBody() register: Register) {
    let registrations = [];
    const {teacher, students} = register;

    const allStudentsEmailValid = students.every(email => email.length > 0);

    if (!allStudentsEmailValid) {
      throw HttpErrors.BadRequest;
    }

    const whereBuilder = new WhereBuilder();
    const where = whereBuilder.eq('email', teacher);

    const foundTeacher = await this.teacherRepository.find(where);

    if (!foundTeacher) {
      throw HttpErrors.BadRequest;
    }

    for (let email of students) {
      const student = await this.studentRepository.create(
        new Student({
          email: email,
        }),
      );
      const registration = await this.registrationRepository.create(
        new Registration({
          teacherId: foundTeacher[0].getId(),
          studentId: student.getId(),
        }),
      );

      registrations.push(registration);
    }
  }
}
