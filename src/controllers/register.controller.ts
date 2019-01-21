import {repository} from '@loopback/repository';
import {post, requestBody, HttpErrors} from '@loopback/rest';
import {Register, Student, Registration} from '../models';
import {
  RegistrationRepository,
  TeacherRepository,
  StudentRepository,
} from '../repositories';
import {
  getTeacher,
  getStudent,
  getStudentsRegisteredWithTeacher,
} from './helper';

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
    const teacherEmail = register.teacher;
    const studentEmails = register.students;

    if (studentEmails.length === 0) {
      throw new HttpErrors[403](`require students email!`);
    }

    /** get teacher from Teacher repository, throw Error if doesnt exist */
    const teacher = await getTeacher(teacherEmail, this.teacherRepository);
    if (!teacher) {
      throw new HttpErrors[403](`${teacherEmail} does not exist!`);
    }

    /** get students and create student in Student repository if doesn't exist */
    const students = await Promise.all(
      studentEmails.map(async email => {
        let student = await getStudent(email, this.studentRepository);
        if (!student) {
          student = await this.studentRepository.create(
            new Student({
              email: email,
              suspended: false,
            }),
          );
        }
        return student;
      }),
    );

    /** check if students have registered with this teacher*/
    const getStudentsRegisteredWithTeacherResult = await Promise.all(
      students.map(async student => {
        return await getStudentsRegisteredWithTeacher(
          student,
          teacher,
          this.registrationRepository,
        );
      }),
    );

    /** filter empty arrays from the registered student list*/
    const studentsRegisteredWithTeacher = getStudentsRegisteredWithTeacherResult.filter(
      student => {
        return student && student.length > 0 ? true : false;
      },
    );

    /** generate students Id list */
    const studentsIdList = students.map(student => student.id);

    /** list students already registered with this teacher to ensure
     * no duplicate entries
     */
    const studentsRegisteredWithTeacherIdList = studentsRegisteredWithTeacher.map(
      registration => {
        console.log(registration);
        return registration[0].studentId;
      },
    );

    /** list new students not registered with this teacher*/
    const studentsNotRegisteredWithTeacherIdList = studentsIdList.filter(
      studentId => !studentsRegisteredWithTeacherIdList.includes(studentId),
    );

    /** register new student with this teacher*/
    await Promise.all(
      studentsNotRegisteredWithTeacherIdList.map(
        async studentIdNotRegistered => {
          await this.registrationRepository.create(
            new Registration({
              teacherId: teacher.id,
              studentId: studentIdNotRegistered,
            }),
          );
        },
      ),
    );
  }
}
