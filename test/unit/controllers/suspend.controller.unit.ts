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

import {Student} from '../../../src/models';
import {givenStudents} from '../../helpers';
import {SuspendController} from '../../../src/controllers/suspend.controller';
import {Suspend} from '../../../src/models/suspend.model';

describe('Suspend Controller (unit)', () => {
  let registrationRepository: StubbedInstanceWithSinonAccessor<
    RegistrationRepository
  >;
  let teacherRepository: StubbedInstanceWithSinonAccessor<TeacherRepository>;
  let studentRepository: StubbedInstanceWithSinonAccessor<StudentRepository>;
  let suspendController: SuspendController;

  let students: Student[];

  beforeEach(givenStubbedRegistrationRepository);
  beforeEach(() => {
    suspendController = new SuspendController(
      registrationRepository,
      teacherRepository,
      studentRepository,
    );

    students = givenStudents();
  });

  describe('suspend()', () => {
    it('find student to suspend', async () => {
      let student = students[0];
      let suspend = new Suspend({email: student.email});
      let suspendedStudent = new Student({...student, suspended: true});

      /** resolve, find student to suspend */
      studentRepository.stubs.findOne.resolves(student);

      /** POST a student to suspend */
      await suspendController.create(suspend);

      /** assert update student with suspended property true */
      sinon.assert.calledWithMatch(
        studentRepository.stubs.update,
        suspendedStudent,
      );
    });
    it('find student to suspend, student does not exist', async () => {
      let result = null;
      let student = students[0];
      let suspend = new Suspend({email: student.email});

      /** resolve, find student to suspend */
      studentRepository.stubs.findOne.resolves(null);

      /** student not found -> result = undefined  */
      try {
        result = await suspendController.create(suspend);
      } catch (e) {}
      expect(result).to.not.eql(undefined);
    });
  });

  function givenStubbedRegistrationRepository() {
    registrationRepository = createStubInstance(RegistrationRepository);
    teacherRepository = createStubInstance(TeacherRepository);
    studentRepository = createStubInstance(StudentRepository);
  }
});
