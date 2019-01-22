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
  });

  describe('commonstudents()', () => {
    it('find all teacher Ids', async () => {
      teachers = givenTeachers();
      teachersEmail = teachers.filter(t => t).map(t => t.email);

      await teacherRepository.stubs.find.resolves(teachers);
      await commonstudentsController.find(teachersEmail);
      sinon.assert.calledWithMatch(teacherRepository.stubs.find, {
        where: {
          email: {inq: teachersEmail},
        },
      });
    });

    it('find specified teachers with students registered in registration repository', async () => {
      teachers = givenTeachers();
      teachersEmail = teachers.filter(t => t).map(t => t.email);
      registrations = givenRegistrations();

      await teacherRepository.stubs.find.resolves(teachers);
      await registrationRepository.stubs.find
        .onCall(0)
        .resolves([registrations[0]])
        .onCall(1)
        .resolves([registrations[1]])
        .onCall(2)
        .resolves([registrations[2]]);
      response = await commonstudentsController.find(teachersEmail);
      sinon.assert.callCount(registrationRepository.stubs.find, 3);
      sinon.assert.calledWithMatch(registrationRepository.stubs.find, {
        where: {teacherId: {eq: teachers[0].id}},
      });
    });

    it('no students registered to a teacher found, return empty list', async () => {
      expect(JSON.parse(response)).to.eql({students: []});
    });

    it('find identifed common students from the student repository ', async () => {
      students = givenStudents();
      teachers = givenTeachers();
      teachersEmail = teachers.filter(t => t).map(t => t.email);
      registrations = givenRegistrations();

      await teacherRepository.stubs.find.resolves(teachers);
      await registrationRepository.stubs.find
        .onCall(0)
        .resolves([registrations[0]])
        .onCall(1)
        .resolves([registrations[0]])
        .onCall(2)
        .resolves([registrations[0]]);
      await studentRepository.stubs.find.resolves(students);
      await commonstudentsController.find(teachersEmail);
      sinon.assert.callCount(registrationRepository.stubs.find, 3);
      sinon.assert.calledWithMatch(registrationRepository.stubs.find, {
        where: {teacherId: {eq: teachers[0].id}},
      });
    });
  });

  function givenStubbedRegistrationRepository() {
    registrationRepository = createStubInstance(RegistrationRepository);
    teacherRepository = createStubInstance(TeacherRepository);
    studentRepository = createStubInstance(StudentRepository);
  }
});
