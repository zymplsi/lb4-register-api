import {repository} from '@loopback/repository';
import {post, requestBody, HttpErrors} from '@loopback/rest';
import {Student} from '../models';
import {
  RegistrationRepository,
  TeacherRepository,
  StudentRepository,
} from '../repositories';
import {Suspend} from '../models/suspend.model';
import {getStudentByEmail} from './helper';

export class SuspendController {
  constructor(
    @repository(RegistrationRepository)
    public registrationRepository: RegistrationRepository,
    @repository(TeacherRepository)
    public teacherRepository: TeacherRepository,
    @repository(StudentRepository)
    public studentRepository: StudentRepository,
  ) {}

  @post('/suspend', {
    responses: {
      '204': {
        description: 'suspend a specified student',
        content: {'application/json': {schema: {'x-ts-type': Suspend}}},
      },
    },
  })
  async create(@requestBody() suspend: Suspend) {
    /** find student to suspend */
    let student = await getStudentByEmail(
      suspend.email,
      this.studentRepository,
    );

    /** student does not exist, throw error */
    if (!student) {
      throw new HttpErrors[403](`${suspend.email} does not exist!`);
    }

    /** update student suspended property */
    await this.studentRepository.update(
      new Student({...student, suspended: true}),
    );
  }
}
