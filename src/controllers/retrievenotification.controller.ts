import {repository, WhereBuilder} from '@loopback/repository';
import {post, requestBody, HttpErrors} from '@loopback/rest';
import {RetrieveForNotifications, Student, Registration} from '../models';
import {
  RegistrationRepository,
  TeacherRepository,
  StudentRepository,
} from '../repositories';
import {
  getTeacher,
  getStudentsByIds,
  getStudentsRegisteredWithTeacher,
  parseMentionedeMails,
} from './helper';

export class RetrieveForNotificationsController {
  constructor(
    @repository(RegistrationRepository)
    public registrationRepository: RegistrationRepository,
    @repository(TeacherRepository)
    public teacherRepository: TeacherRepository,
    @repository(StudentRepository)
    public studentRepository: StudentRepository,
  ) {}

  @post('/retrievefornotifications', {
    responses: {
      '200': {
        description:
          'retrieve a list of students who can receive a given notification.',
        content: {
          'application/json': {schema: {'x-ts-type': RetrieveForNotifications}},
        },
      },
    },
  })
  async create(
    @requestBody() retrievefornotifications: RetrieveForNotifications,
  ) {
    const teacherEmail = retrievefornotifications.teacher;
    const notification = retrievefornotifications.notification;

    const parsedEmails = parseMentionedeMails(notification);
    const notSuspendedStudents = await getStudentsNotSuspended(
      this.studentRepository,
    );

    const notSuspendedStudentsEmail = notSuspendedStudents.map(
      student => student.email,
    );

    const mentionedNotSuspendedStudentsEmail = [];
    if (parsedEmails) {
      for (let email of parsedEmails) {
        if (notSuspendedStudentsEmail.includes(email)) {
          mentionedNotSuspendedStudentsEmail.push(email);
        }
      }
    }

    const teacher = await getTeacher(teacherEmail, this.teacherRepository);

    const getStudentsRegisteredWithTeacherResult = await Promise.all(
      notSuspendedStudents.map(async student => {
        return await getStudentsRegisteredWithTeacher(
          student,
          teacher,
          this.registrationRepository,
        );
      }),
    );

    const registeredStudentsId = getStudentsRegisteredWithTeacherResult.map(
      registration =>
        registration.length > 0 ? registration[0].studentId : null,
    );
    const registeredStudents = await getStudentsByIds(
      registeredStudentsId,
      this.studentRepository,
    );
    const registeredStudentsEmail = registeredStudents.map(
      student => student.email,
    );

    const recipients = [
      ...mentionedNotSuspendedStudentsEmail,
      ...registeredStudentsEmail,
    ];

    const filteredRecipients = recipients.filter((keyword, index) => {
      return recipients.lastIndexOf(keyword) === index;
    });

    return JSON.stringify({recipients: filteredRecipients});
  }
}

export const getStudentsNotSuspended = async (
  studentRepository: StudentRepository,
) => {
  const whereStudentIdBuilder = new WhereBuilder();
  const whereStudentId = whereStudentIdBuilder.eq('suspended', false);
  return await studentRepository.find(whereStudentId);
};

//     if (studentEmails.length === 0) {
//       throw new HttpErrors[403](`require students email!`);
//     }

//     /** get teacher from Teacher repository, throw Error if doesnt exist */
//     const teacher = await getTeacher(teacherEmail, this.teacherRepository);
//     if (!teacher) {
//       throw new HttpErrors[403](`${teacherEmail} does not exist!`);
//     }

//     /** get students and create student in Student repository if doesn't exist */
//     const students = await Promise.all(
//       studentEmails.map(async email => {
//         let student = await getStudent(email, this.studentRepository);
//         if (!student) {
//           student = await this.studentRepository.create(
//             new Student({
//               email: email,
//               suspended: false,
//             }),
//           );
//         }
//         return student;
//       }),
//     );

//     /** check if students have registered with this teacher*/
//     const getStudentsRegisteredWithTeacherResult = await Promise.all(
//       students.map(async student => {
//         return await getStudentsRegisteredWithTeacher(
//           student,
//           teacher,
//           this.registrationRepository,
//         );
//       }),
//     );

//     /** filter empty arrays from the registered student list*/
//     const studentsRegisteredWithTeacher = getStudentsRegisteredWithTeacherResult.filter(
//       student => {
//         return student && student.length > 0 ? true : false;
//       },
//     );

//     /** generate students Id list */
//     const studentsIdList = await Promise.all(
//       students.map(student => student.id),
//     );

//     /** list students already registered with this teacher to ensure
//      * no duplicate entries
//      */
//     const studentsRegisteredWithTeacherIdList = await Promise.all(
//       studentsRegisteredWithTeacher.map(registration => {
//         console.log(registration);
//         return registration[0].studentId;
//       }),
//     );

//     /** list new students not registered with this teacher*/
//     const studentsNotRegisteredWithTeacherIdList = await Promise.all(
//       studentsIdList.filter(
//         studentId => !studentsRegisteredWithTeacherIdList.includes(studentId),
//       ),
//     );

//     /** register new student with this teacher*/
//     await Promise.all(
//       studentsNotRegisteredWithTeacherIdList.map(
//         async studentIdNotRegistered => {
//           await this.registrationRepository.create(
//             new Registration({
//               teacherId: teacher.id,
//               studentId: studentIdNotRegistered,
//             }),
//           );
//         },
//       ),
//     );
// }
// }
