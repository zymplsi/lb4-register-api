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
import {CommonStudentsController} from '../../../src/controllers';
import {Teacher, Student, Registration} from '../../../src/models';
import {givenTeachers, givenRegistrations, givenStudents} from '../../helpers';

describe('Common Students Controller (unit)', () => {
  let registrationRepository: StubbedInstanceWithSinonAccessor<
    RegistrationRepository
  >;
  let teacherRepository: StubbedInstanceWithSinonAccessor<TeacherRepository>;
  let studentRepository: StubbedInstanceWithSinonAccessor<StudentRepository>;
  let commonstudentsController: CommonStudentsController;
  let teachers: Teacher[];
  let teachersEmail: string[];
  let students: Student[];
  let registrations: Registration[];
  let response: string;

  beforeEach(givenStubbedRegistrationRepository);
  beforeEach(() => {
    commonstudentsController = new CommonStudentsController(
      registrationRepository,
      teacherRepository,
      studentRepository,
    );

    students = givenStudents();
    teachers = givenTeachers();
    teachersEmail = teachers.filter(t => t).map(t => t.email);
    registrations = givenRegistrations();
  });

  describe('commonstudents()', () => {
    it('find all specified teachers', async () => {
      /** resolve, find all teachers */
      teacherRepository.stubs.find.resolves(teachers);

      /** GET common students by teachers' email */
      await commonstudentsController.find(teachersEmail);

      /** assert find teachers via emails*/
      sinon.assert.calledWithMatch(teacherRepository.stubs.find, {
        where: {
          email: {inq: teachersEmail},
        },
      });
    });

    it('find specified teachers in registration repository', async () => {
      /** resolve, find all teachers */
      teacherRepository.stubs.find.resolves(teachers);

      /** call 0-2 - resolve, find specified teachers in registration repository -> 1,2,3 */
      registrationRepository.stubs.find
        .onCall(0)
        .resolves([registrations[0]])
        .onCall(1)
        .resolves([registrations[1]])
        .onCall(2)
        .resolves([registrations[2]]);

      /** GET common students by teachers' email */
      response = await commonstudentsController.find(teachersEmail);

      /** assert each find for teacher in registration repository */
      sinon.assert.callCount(registrationRepository.stubs.find, 3);
      sinon.assert.calledWithMatch(registrationRepository.stubs.find, {
        where: {teacherId: {eq: teachers[0].id}},
      });
    });

    it('no students registered to a teacher found, return empty list', async () => {
      expect(JSON.parse(response)).to.eql({students: []});
    });

    it('find identifed common students from the student repository ', async () => {
      let registrationStudent1 = registrations[0];
      let registrationTeacher1 = Object.assign({}, registrationStudent1, {
        teacherId: 1,
      });
      let registrationTeacher2 = Object.assign({}, registrationStudent1, {
        teacherId: 2,
      });
      let registrationTeacher3 = Object.assign({}, registrationStudent1, {
        teacherId: 3,
      });

      /** resolve, find all teachers */
      teacherRepository.stubs.find.resolves(teachers);

      /** call 0-2 - resolve, find specified teachers in registration repository -> 1 */
      registrationRepository.stubs.find
        .onCall(0)
        .resolves([registrationTeacher1])
        .onCall(1)
        .resolves([registrationTeacher2])
        .onCall(2)
        .resolves([registrationTeacher3]);

      /** resolve, find identifed common students from the student repository -> 1*/
      studentRepository.stubs.find.resolves([students[0]]);

      /** GET common students by teachers' email */
      response = await commonstudentsController.find(teachersEmail);

      /** assert each find for teacher in registration repository */
      sinon.assert.callCount(registrationRepository.stubs.find, 3);
      sinon.assert.calledWithMatch(registrationRepository.stubs.find, {
        where: {teacherId: {eq: teachers[0].id}},
      });
    });

    it('common students registered to list of teachers found, send list', async () => {
      expect(JSON.parse(response)).to.eql({students: ['student1@abc.com']});
    });
  });

  function givenStubbedRegistrationRepository() {
    registrationRepository = createStubInstance(RegistrationRepository);
    teacherRepository = createStubInstance(TeacherRepository);
    studentRepository = createStubInstance(StudentRepository);
  }
});
