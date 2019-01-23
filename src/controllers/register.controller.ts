import {repository} from '@loopback/repository';
import {post, requestBody, HttpErrors} from '@loopback/rest';
import {Register, Student, Registration} from '../models';
import {
  RegistrationRepository,
  TeacherRepository,
  StudentRepository,
} from '../repositories';
import {
  getNotSuspendedRegisteredStudents,
  getTeacherByEmail,
  getStudentByEmail,
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

    /** finds the specified teacher in teacher repository,
     *  throw Error if doesn't exist
     * */
    const teacher = await getTeacherByEmail(
      teacherEmail,
      this.teacherRepository,
    );
    if (!teacher) {
      throw new HttpErrors[403](`${teacherEmail} does not exist!`);
    }

    /** finds all specified students in student repository
     *  create specified student not exist in student repository
     */
    const students = await Promise.all(
      studentEmails.map(async email => {
        let student = await getStudentByEmail(email, this.studentRepository);
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

    /** find student and teacher pair in registration repository*/
    const getNotSuspendedRegisteredStudentsResult = await Promise.all(
      students.map(async student => {
        return await getNotSuspendedRegisteredStudents(
          student,
          teacher,
          this.registrationRepository,
        );
      }),
    );

    /** filter empty arrays from the registered student list*/
    const studentsRegisteredWithTeacher = getNotSuspendedRegisteredStudentsResult.filter(
      student => {
        return student && student.length > 0 ? true : false;
      },
    );

    /** generate students Id list */
    const studentsIdList = students
      .filter(student => student)
      .map(student => student.id);

    /** list students already registered with this teacher to ensure
     * no duplicate entries
     */
    const studentsRegisteredWithTeacherIdList = studentsRegisteredWithTeacher.map(
      registration => {
        return registration[0].studentId;
      },
    );

    /** list new students not registered with this teacher*/
    const studentsNotRegisteredWithTeacherIdList = studentsIdList.filter(
      studentId => !studentsRegisteredWithTeacherIdList.includes(studentId),
    );

    /** register new student with teacher*/
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
