import {
  createStubInstance,
  sinon,
  StubbedInstanceWithSinonAccessor,
} from '@loopback/testlab';
import {
  RegistrationRepository,
  TeacherRepository,
  StudentRepository,
} from '../../../src/repositories';
import {RegisterController} from '../../../src/controllers';
import {Register, Teacher, Student} from '../../../src/models';
import {
  givenTeacher,
  givenStudents,
  givenStudent,
  givenRegister,
} from '../../helpers';

describe('Register Controller (unit)', () => {
  let registrationRepository: StubbedInstanceWithSinonAccessor<
    RegistrationRepository
  >;
  let teacherRepository: StubbedInstanceWithSinonAccessor<TeacherRepository>;
  let studentRepository: StubbedInstanceWithSinonAccessor<StudentRepository>;

  let registerController: RegisterController;
  let register: Register;
  let teacher: Teacher;
  let student: Student;
  let students: Student[];

  beforeEach(givenStubbedRegistrationRepository);
  beforeEach(() => {
    registerController = new RegisterController(
      registrationRepository,
      teacherRepository,
      studentRepository,
    );
    teacher = givenTeacher();
    register = givenRegister();
    students = givenStudents();
    register = givenRegister();
  });

  describe('register()', () => {
    it('find the specified teacher in teacher repository', async () => {
      /** resolve, find specified teacher */
      teacherRepository.stubs.findOne.resolves(teacher);

      /** POST register students with specified teacher */
      await registerController.create(register);

      /** assert find teacher by email in teacher respository */
      sinon.assert.calledWithMatch(teacherRepository.stubs.findOne, {
        where: {email: {eq: teacher.email}},
      });
    });

    it('find all specified students in student repository', async () => {
      /** resolve, find specified teacher */
      teacherRepository.stubs.findOne.resolves(teacher);

      /** call 0-2 - find specified students in student repository */
      studentRepository.stubs.findOne
        .onCall(0)
        .resolves(students[0])
        .onCall(1)
        .resolves(students[1])
        .onCall(2)
        .resolves(students[2]);

      /** POST register students with specified teacher */
      await registerController.create(register);

      /** assert find students by email in student respository */
      sinon.assert.calledWithMatch(studentRepository.stubs.findOne, {
        where: {email: {eq: students[0].email}},
      });
      sinon.assert.calledWithMatch(studentRepository.stubs.findOne, {
        where: {email: {eq: students[1].email}},
      });
      sinon.assert.calledWithMatch(studentRepository.stubs.findOne, {
        where: {email: {eq: students[2].email}},
      });
    });

    it('create specified student not exist in student repository', async () => {
      /** given a new student */
      student = givenStudent({
        suspended: false,
      });

      /** resolve, find specified teacher */
      teacherRepository.stubs.findOne.resolves(teacher);

      /** resolve, find specified student -> dont exist */
      studentRepository.stubs.findOne.resolves(null);

      /** POST register students with specified teacher */
      await registerController.create(register);

      /** assert create a new student in student repository   */
      sinon.assert.calledWithMatch(studentRepository.stubs.create, student);
    });

    it('find student and teacher pair in registration repository', async () => {
      /** resolve, find specified teacher */
      teacherRepository.stubs.findOne.resolves(teacher);

      /** Call 0 - resolve, find specified student -> id 1 */
      studentRepository.stubs.findOne.onCall(0).resolves(students[0]);

      /** POST register students with specified teacher */
      await registerController.create(register);

      /** assert find student and teacher pair in registration repository */
      sinon.assert.calledWithMatch(registrationRepository.stubs.find, {
        where: {
          and: [{studentId: students[0].id}, {teacherId: teacher.id}],
        },
      });
    });

    it('register new student with teacher', async () => {
      /** resolve, find specified teacher */
      teacherRepository.stubs.findOne.resolves(teacher);

      /** Call 0 - resolve, find specified student -> id 1 */
      studentRepository.stubs.findOne.onCall(0).resolves(students[0]);

      /** POST register students with specified teacher */
      await registerController.create(register);

      /** assert create student and teacher pair in registration repository */
      sinon.assert.calledWithMatch(registrationRepository.stubs.create, {
        studentId: students[0].id,
        teacherId: teacher.id,
      });
    });
  });

  function givenStubbedRegistrationRepository() {
    registrationRepository = createStubInstance(RegistrationRepository);
    teacherRepository = createStubInstance(TeacherRepository);
    studentRepository = createStubInstance(StudentRepository);
  }
});
