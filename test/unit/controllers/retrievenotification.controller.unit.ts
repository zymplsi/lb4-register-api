import {
  createStubInstance,
  sinon,
  StubbedInstanceWithSinonAccessor,
  expect,
} from '@loopback/testlab';
import {
  RegistrationRepository,
  TeacherRepository,
  StudentRepository,
} from '../../../src/repositories';
import {RetrieveForNotificationsController} from '../../../src/controllers';
import {
  Teacher,
  Student,
  Registration,
  RetrieveForNotifications,
} from '../../../src/models';
import {
  givenTeachers,
  givenRegistrations,
  givenStudents,
  givenNotifications,
} from '../../helpers';

describe('Retrieve Notification Controller (unit)', () => {
  let registrationRepository: StubbedInstanceWithSinonAccessor<
    RegistrationRepository
  >;
  let teacherRepository: StubbedInstanceWithSinonAccessor<TeacherRepository>;
  let studentRepository: StubbedInstanceWithSinonAccessor<StudentRepository>;
  let retrieveForNotificationsController: RetrieveForNotificationsController;
  let teachers: Teacher[];
  let students: Student[];
  let registrations: Registration[];
  let retrieveForNotifications: RetrieveForNotifications[];
  let notSuspendedStudents: Student[];

  beforeEach(givenStubbedRegistrationRepository);
  beforeEach(() => {
    retrieveForNotificationsController = new RetrieveForNotificationsController(
      registrationRepository,
      teacherRepository,
      studentRepository,
    );
    teachers = givenTeachers();
    students = givenStudents();
    notSuspendedStudents = students.map(std => {
      return Object.assign({}, {suspended: false}, std);
    });
    retrieveForNotifications = givenNotifications();
    registrations = givenRegistrations();
  });

  describe('retrieveForNotifications()', () => {
    it('find all not suspended students', async () => {
      /** resolve, find all not suspended students -> id 0,1,2 */
      studentRepository.stubs.find.resolves(notSuspendedStudents);

      /** POST request with mentioned student 1 and specified teacher 1 */
      await retrieveForNotificationsController.create(
        retrieveForNotifications[0],
      );

      /** assert find not suspended studenst in students repository */
      sinon.assert.calledWithMatch(studentRepository.stubs.find, {
        where: {suspended: {eq: false}},
      });
    });

    it('find specified teacher info', async () => {
      /** resolve, find all not suspended students -> id 0,1,2 */
      studentRepository.stubs.find.resolves(notSuspendedStudents);

      /** resolve, find specified teacher info */
      teacherRepository.stubs.findOne.resolves(teachers[0]);

      /** POST request with mentioned student 1 and specified teacher 1 */
      await retrieveForNotificationsController.create(
        retrieveForNotifications[0],
      );

      /** assert find specified teacher via email in teachers repository */
      sinon.assert.calledWithMatch(teacherRepository.stubs.findOne, {
        where: {email: {eq: teachers[0].email}},
      });
    });

    it('find not suspended student registered with specified teacher', async () => {
      /** call 0-2 - resolve, find not suspended student registered
       *             with specified teacher -> id 0,1 */
      registrationRepository.stubs.find
        .onCall(0)
        .resolves([registrations[0]])
        .onCall(1)
        .resolves([registrations[1]])
        .onCall(2)
        .resolves([]);

      /** resolve, find all not suspended students -> id 0,1,2 */
      studentRepository.stubs.find.resolves(notSuspendedStudents);

      /** resolve, find specified teacher info */
      teacherRepository.stubs.findOne.resolves(teachers[0]);

      /** POST request with mentioned student 1 and specified teacher 1 */
      await retrieveForNotificationsController.create(
        retrieveForNotifications[0],
      );

      /** assert find not suspended student with specified teacher
       *  in registration repository*/
      sinon.assert.calledWithMatch(registrationRepository.stubs.find, {
        where: {
          and: [
            {studentId: notSuspendedStudents[0].id},
            {teacherId: teachers[0].id},
          ],
        },
      });
    });

    it('find registered and not suspended students full info from their registration ids', async () => {
      /** call 0-2 - resolve, find not suspended student registered
       *             with specified teacher -> id 0,1,2 */
      registrationRepository.stubs.find
        .onCall(0)
        .resolves([registrations[0]])
        .onCall(1)
        .resolves([registrations[1]])
        .onCall(2)
        .resolves([registrations[2]]);

      /** call 0 - resolve, find all not suspended students -> id 0,1,2 */
      /** call 1 - resolve, find not suspended and registered students
       *           full infos from student repository -> id 0,1,2  */
      studentRepository.stubs.find
        .onCall(0)
        .resolves(notSuspendedStudents)
        .onCall(1)
        .resolves(students);

      /** resolve, find specified teacher info */
      teacherRepository.stubs.findOne.resolves(teachers[0]);

      /**  POST request with mentioned student 1 and specified teacher 1 */
      await retrieveForNotificationsController.create(
        retrieveForNotifications[0],
      );

      /** assert find students by ids pull from registration in student repository*/
      sinon.assert.calledWith(studentRepository.stubs.find, {
        where: {id: {inq: students.map(s => s.id)}},
      });
    });

    it('combine mentioned student with not suspended and registered student, and send out', async () => {
      /** call 0 - resolve, find all not suspended students -> id 0,1,2 */
      /** call 1 - resolve, find not suspended and registered students
       *           full infos from student repository -> id 0,1  */
      studentRepository.stubs.find
        .onCall(0)
        .resolves(notSuspendedStudents)
        .onCall(1)
        .resolves([students[0], students[1]]);

      /** resolve, find specified teacher info */
      teacherRepository.stubs.findOne.resolves(teachers[0]);

      /** call 0-2 - resolve, find not suspended student registered
       *             with specified teacher -> id 0 */
      registrationRepository.stubs.find
        .onCall(0)
        .resolves([])
        .onCall(1)
        .resolves([])
        .onCall(2)
        .resolves([registrations[0]]);

      /**  POST request with mentioned student 1 and specified teacher 1 */
      const result = await retrieveForNotificationsController.create(
        retrieveForNotifications[0],
      );

      /** result will be combined of mentioned with not suspended registered student */
      expect(result).to.eql(
        JSON.stringify({recipients: ['student1@abc.com', 'student2@abc.com']}),
      );
    });
  });

  function givenStubbedRegistrationRepository() {
    registrationRepository = createStubInstance(RegistrationRepository);
    teacherRepository = createStubInstance(TeacherRepository);
    studentRepository = createStubInstance(StudentRepository);
  }
});
