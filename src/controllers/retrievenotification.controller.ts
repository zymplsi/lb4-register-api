import {repository, WhereBuilder} from '@loopback/repository';
import {post, requestBody} from '@loopback/rest';
import {RetrieveForNotifications} from '../models';
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

    /** parse student's email from messade */
    const parsedEmails = parseMentionedeMails(notification);

    /** get all not suspended students*/
    const notSuspendedStudents = await getStudentsNotSuspended(
      this.studentRepository,
    );

    /** get not suspeneded students email */
    const notSuspendedStudentsEmail = notSuspendedStudents.map(
      student => student.email,
    );

    /** filter mentioned students email against not suspended student list */
    const mentionedNotSuspendedStudentsEmail = [];
    if (parsedEmails) {
      for (let email of parsedEmails) {
        if (notSuspendedStudentsEmail.includes(email)) {
          mentionedNotSuspendedStudentsEmail.push(email);
        }
      }
    }

    /** get teacher info */
    const teacher = await getTeacher(teacherEmail, this.teacherRepository);

    /** get list of not suspended students registered with the teacher*/
    const getStudentsRegisteredWithTeacherResult = await Promise.all(
      notSuspendedStudents.map(async student => {
        return await getStudentsRegisteredWithTeacher(
          student,
          teacher,
          this.registrationRepository,
        );
      }),
    );

    /** get not suspended and registered student their registrations ids */
    const registeredStudentsId = getStudentsRegisteredWithTeacherResult.map(
      registration =>
        registration.length > 0 ? registration[0].studentId : null,
    );

    /** get registered and not suspended full info from their registration ids */
    const registeredStudents = await getStudentsByIds(
      registeredStudentsId,
      this.studentRepository,
    );
    /** get the email for the not suspended and registered students */
    const registeredStudentsEmail = registeredStudents.map(
      student => student.email,
    );

    /** create the email recipients  */
    const recipients = [
      ...mentionedNotSuspendedStudentsEmail,
      ...registeredStudentsEmail,
    ];

    /** remove duplicate in email recipient list*/
    const filteredRecipients = recipients.filter((keyword, index) => {
      return recipients.lastIndexOf(keyword) === index;
    });

    /** send it out!*/
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
