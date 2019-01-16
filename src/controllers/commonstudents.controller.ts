import {
  Filter,
  repository,
  Where,
  WhereBuilder,
  FilterBuilder,
} from '@loopback/repository';
import {param, get} from '@loopback/rest';
import {CommonStudents, Teacher} from '../models';
import {
  RegistrationRepository,
  TeacherRepository,
  StudentRepository,
} from '../repositories';
// import {pathExists} from 'fs-extra';

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
    @param.array('teacher', 'query', {type: 'string'}) names: string[],
  ): Promise<string> {
    const teacherIdList = [];
    const studentIdList = [];
    const studentEmaiList = [];
    let teachers: Teacher[];
    // let students: Student[];
    let where: Where;
    let filter: Filter;
    let filterBuilder = new FilterBuilder();
    let whereBuilder = new WhereBuilder();

    where = whereBuilder.inq('id', names);
    filter = filterBuilder
      .fields('id')
      .where(where)
      .build();
    teachers = await this.teacherRepository.find(filter);

    if (teachers.length > 0) {
      debugger;
      console.log(teachers[0]);
      teacherIdList.push(teachers[0].id);
    }

    for (let teacherId of teacherIdList) {
      let student = await this.registrationRepository.findById(teacherId);
      if (student) {
        studentIdList.push(student.studentId);
      }
    }

    where = whereBuilder.inq('id', studentIdList);
    filter = filterBuilder
      .fields('email')
      .where(where)
      .build();
    let students = await this.studentRepository.find(filter);

    // debugger;
    // const where = new WhereBuilder();
    // where.eq();

    // this.registrationRepository.console.log(names);
    return `Hello, ${JSON.stringify(students)}`;
  }
}
