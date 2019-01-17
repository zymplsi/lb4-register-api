import {repository, WhereBuilder} from '@loopback/repository';
import {post, requestBody, HttpErrors} from '@loopback/rest';
import {Student} from '../models';
import {
  RegistrationRepository,
  TeacherRepository,
  StudentRepository,
} from '../repositories';
import {Suspend} from '../models/suspend.model';

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
    let student: Student[];

    const whereStudentBuilder = new WhereBuilder();
    const whereStudent = whereStudentBuilder.eq('email', suspend.email);

    student = await this.studentRepository.find(whereStudent);

    if (student.length === 0) {
      throw new HttpErrors[403](`${suspend.email} does not exist!`);
    }

    const result = await this.studentRepository.update(
      new Student({...student[0], suspended: true}),
    );

    console.log(result);
    debugger;
  }
}
