import {repository} from '@loopback/repository';
import {post, requestBody} from '@loopback/rest';
import {RetrieveForNotifications} from '../models';
import {
  RegistrationRepository,
  TeacherRepository,
  StudentRepository,
} from '../repositories';
import {
  getTeacherByEmail,
  getNotSuspendedRegisteredStudents,
  parseMentionedeMails,
  getStudentsNotSuspendedById,
  getStudentsByIds,
  getNotSuspendedRegisteredStudentsId,
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
    const parsedMentionedStudentEmails = parseMentionedeMails(notification);

    /** find all not suspended students*/
    const notSuspendedStudents = await getStudentsNotSuspendedById(
      this.studentRepository,
    );

    /** get not suspeneded students email */
    const notSuspendedStudentsEmail = notSuspendedStudents.map(
      student => student.email,
    );

    /** filter mentioned students email against not suspended student list */
    const mentionedNotSuspendedStudentsEmail = [];
    if (parsedMentionedStudentEmails) {
      for (let email of parsedMentionedStudentEmails) {
        if (notSuspendedStudentsEmail.includes(email)) {
          mentionedNotSuspendedStudentsEmail.push(email);
        }
      }
    }

    /** find specified teacher info */
    const teacher = await getTeacherByEmail(
      teacherEmail,
      this.teacherRepository,
    );

    /** find not suspended student registered with specified teacher */
    const getNotSuspendedRegisteredStudentsResult = await Promise.all(
      notSuspendedStudents.map(async student => {
        return await getNotSuspendedRegisteredStudents(
          student,
          teacher,
          this.registrationRepository,
        );
      }),
    );

    /** get not suspended and registered student their registrations ids */
    let notSuspendedRegisteredStudentsId = getNotSuspendedRegisteredStudentsId(
      getNotSuspendedRegisteredStudentsResult,
    );

    /** find not suspended and registered students full info
     * from student repository*/
    const notSuspendedRegisteredStudents = await getStudentsByIds(
      notSuspendedRegisteredStudentsId,
      this.studentRepository,
    );

    /** get the email for the not suspended and registered students */
    const notSuspendedRegisteredStudentsEmail = notSuspendedRegisteredStudents.map(
      student => student.email,
    );

    /** combine mentioned student with not suspended and registered student */
    const recipients = [
      ...mentionedNotSuspendedStudentsEmail,
      ...notSuspendedRegisteredStudentsEmail,
    ];

    /** remove duplicate in email recipient list*/
    const filteredRecipients = recipients.filter((keyword, index) => {
      return recipients.lastIndexOf(keyword) === index;
    });

    // /** send it out!*/
    return JSON.stringify({recipients: filteredRecipients});
  }
}
