// import {
//   createStubInstance,
//   sinon,
//   StubbedInstanceWithSinonAccessor,
// } from '@loopback/testlab';
// import {
//   RegistrationRepository,
//   TeacherRepository,
//   StudentRepository,
// } from '../../../src/repositories';
// import {
//   RegisterController,
//   CommonStudentsController,
// } from '../../../src/controllers';
// import {Register, Teacher, Student} from '../../../src/models';

// describe('Common Students Controller (unit)', () => {
//   let registrationRepository: StubbedInstanceWithSinonAccessor<
//     RegistrationRepository
//   >;
//   let teacherRepository: StubbedInstanceWithSinonAccessor<TeacherRepository>;
//   let studentRepository: StubbedInstanceWithSinonAccessor<StudentRepository>;

//   beforeEach(givenStubbedRegistrationRepository);

//   describe('commonstudents()', () => {
//     it('finds the specified', async () => {
//       const commonStudentsController = new CommonStudentsController(
//         registrationRepository,
//         teacherRepository,
//         studentRepository,
//       );

//       const teacher = new Teacher({
//         email: 'teacher@abc.com',
//       });

//       const student1 = new Student({
//         email: 'student1@abc.com',
//       });

//       const student2 = new Student({
//         email: 'student2@abc.com',
//       });

//       const register = new Register({
//         teacher: teacher.email,
//         students: [student1.email, student2.email],
//       });

//       teacherRepository.stubs.findOne.resolves(teacher);
//       registerController.create(register);

//       sinon.assert.calledWithMatch(teacherRepository.stubs.findOne, {
//         where: teacher,
//       });
//     });
//   });

//   function givenStubbedRegistrationRepository() {
//     registrationRepository = createStubInstance(RegistrationRepository);
//     teacherRepository = createStubInstance(TeacherRepository);
//     studentRepository = createStubInstance(StudentRepository);
//   }
// });
