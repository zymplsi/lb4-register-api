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
  });

  describe('register()', () => {
    it('finds the specified teacher in teacher repository', async () => {
      teacher = givenTeacher();
      register = givenRegister();

      teacherRepository.stubs.findOne.resolves(teacher);
      await registerController.create(register);
      sinon.assert.calledWithMatch(teacherRepository.stubs.findOne, {
        where: {email: {eq: teacher.email}},
      });
    });

    it('find all specified students in student repository', async () => {
      teacher = givenTeacher();
      students = givenStudents();
      register = givenRegister();

      teacherRepository.stubs.findOne.resolves(teacher);
      studentRepository.stubs.findOne
        .onCall(0)
        .resolves(students[0])
        .onCall(1)
        .resolves(students[1])
        .onCall(2)
        .resolves(students[2]);

      await registerController.create(register);

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
      student = givenStudent({
        suspended: false,
      });
      teacherRepository.stubs.findOne.resolves(teacher);
      studentRepository.stubs.findOne.resolves(null);
      await registerController.create(register);
      sinon.assert.calledWithMatch(studentRepository.stubs.create, student);
    });

    it('find student and teacher pair in registration repository', async () => {
      students = givenStudents();
      teacher = givenTeacher();
      register = givenRegister();

      teacherRepository.stubs.findOne.resolves(teacher);
      studentRepository.stubs.findOne.onCall(0).resolves(students[0]);
      await registerController.create(register);
      sinon.assert.calledWithMatch(registrationRepository.stubs.find, {
        where: {
          and: [{studentId: students[0].id}, {teacherId: teacher.id}],
        },
      });
    });

    it('register new student with teacher', async () => {
      students = givenStudents();
      teacher = givenTeacher();
      register = givenRegister();

      teacherRepository.stubs.findOne.resolves(teacher);
      studentRepository.stubs.findOne.onCall(0).resolves(students[0]);
      await registerController.create(register);
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
