import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
  WhereBuilder,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getWhereSchemaFor,
  patch,
  put,
  del,
  requestBody,
  HttpErrors,
} from '@loopback/rest';
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
        description: 'Register model instance',
        content: {'application/json': {schema: {'x-ts-type': Register}}},
      },
    },
  })
  async create(@requestBody() register: Register) {
    let registrations = [];
    const {teacher, students} = register;

    const emailsValid = students.every(email => email.length > 0);

    if (!emailsValid) {
      throw HttpErrors.BadRequest;
    }

    const where = new WhereBuilder();
    const foundTeacher = await this.teacherRepository.findOne(
      where.exists(teacher),
    );

    if (!foundTeacher) {
      throw HttpErrors.BadRequest;
    }

    for (let email in students) {
      const student = await this.studentRepository.create(
        new Student({
          email: email,
        }),
      );
      const registration = await this.registrationRepository.create(
        new Registration({
          teacherId: foundTeacher.getId(),
          studentId: student.getId(),
        }),
      );

      registrations.push(registration);
    }
  }
}
