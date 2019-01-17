import {repository, WhereBuilder} from '@loopback/repository';
import {post, requestBody, HttpErrors} from '@loopback/rest';
import {Register, Student, Registration, Teacher} from '../models';
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
    const teacherEmail = register.teacher;
    const studentEmails = register.students;

    if (studentEmails.length === 0) {
      throw new HttpErrors[403](`require students email!`);
    }

    /** get teacher from Teacher repository */
    const teacher = await getTeacherFromRepository(
      teacherEmail,
      this.teacherRepository,
    );

    if (!teacher) {
      throw new HttpErrors[403](`${teacherEmail} does not exist!`);
    }

    /** get students and create student in Student repository if doesn't exist */
    const students = await Promise.all(
      studentEmails.map(async email => {
        let student = await getStudentFromRepository(
          email,
          this.studentRepository,
        );
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
    const studentsIdList = await Promise.all(
      students.map(student => student.id),
    );

    /** list students already registered with this teacher to ensure
     * no duplicate entries
     */
    const studentsRegisteredWithTeacherIdList = await Promise.all(
      studentsRegisteredWithTeacher.map(registration => {
        console.log(registration);
        return registration[0].studentId;
      }),
    );

    /** list new students not registered with this teacher*/
    const studentsNotRegisteredWithTeacherIdList = await Promise.all(
      studentsIdList.filter(
        studentId => !studentsRegisteredWithTeacherIdList.includes(studentId),
      ),
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

const getTeacherFromRepository = async (
  email: string,
  teacherRepository: TeacherRepository,
) => {
  const whereTeacherEmailBuilder = new WhereBuilder();
  const whereTeacherEmail = whereTeacherEmailBuilder.eq('email', email);
  return await teacherRepository.findOne(whereTeacherEmail);
};

const getStudentFromRepository = async (
  email: string,
  studentRepository: StudentRepository,
) => {
  const whereStudentEmailBuilder = new WhereBuilder();
  const whereStudentEmail = whereStudentEmailBuilder.eq('email', email);
  return await studentRepository.findOne(whereStudentEmail);
};

const getStudentsRegisteredWithTeacher = async (
  student: Student | null,
  teacher: Teacher,
  registrationRepository: RegistrationRepository,
) => {
  if (!student) return [];
  const whereRegisteredBuilder = new WhereBuilder();
  const whereRegistered = whereRegisteredBuilder.and([
    {studentId: student.id},
    {teacherId: teacher.id},
  ]);
  return await registrationRepository.find(whereRegistered);
};
