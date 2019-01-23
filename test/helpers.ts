import {
  Teacher,
  Student,
  Registration,
  RetrieveForNotifications,
  Register,
} from '../src/models';

export function givenTeacher(teacher?: Partial<Teacher>) {
  const data = Object.assign(
    {
      email: 'teacher1@abc.com',
    },
    teacher,
  );
  return new Teacher(data);
}

export function givenStudent(student?: Partial<Student>) {
  const data = Object.assign(
    {
      email: 'student1@abc.com',
    },
    student,
  );
  return new Student(data);
}

export function givenRegistration(registration?: Partial<Registration>) {
  const data = Object.assign(
    {
      teacherId: 1,
      studentId: 1,
    },
    registration,
  );
  return new Registration(data);
}

export function givenTeachers(teacher?: Partial<Teacher>): Teacher[] {
  const teacher1 = Object.assign({id: 1, email: 'teacher1@abc.com'}, teacher);
  const teacher2 = Object.assign({id: 2, email: 'teacher2@abc.com'}, teacher);
  const teacher3 = Object.assign({id: 3, email: 'teacher3@abc.com'}, teacher);
  return [new Teacher(teacher1), new Teacher(teacher2), new Teacher(teacher3)];
}

export function givenStudents(student?: Partial<Student>) {
  const student1 = Object.assign({id: 1, email: 'student1@abc.com'}, student);
  const student2 = Object.assign({id: 2, email: 'student2@abc.com'}, student);
  const student3 = Object.assign({id: 3, email: 'student3@abc.com'}, student);
  return [new Student(student1), new Student(student2), new Student(student3)];
}

export function givenRegistrations(registration?: Partial<Registration>) {
  const registration1 = Object.assign(
    {
      teacherId: 1,
      studentId: 1,
    },
    registration,
  );
  const registration2 = Object.assign(
    {
      teacherId: 2,
      studentId: 2,
    },
    registration,
  );
  const registration3 = Object.assign(
    {
      teacherId: 3,
      studentId: 3,
    },
    registration,
  );
  return [
    new Registration(registration1),
    new Registration(registration2),
    new Registration(registration3),
  ];
}

export function givenNotifications(
  notification?: Partial<RetrieveForNotifications>,
) {
  const notification1 = Object.assign(
    {
      teacher: 'teacher1@abc.com',
      notification: '@student1@abc.com',
    },
    notification,
  );
  const notification2 = Object.assign(
    {
      teacher: 'teacher2@abc.com',
      notification: '@student2@abc.com',
    },
    notification,
  );
  const notification3 = Object.assign(
    {
      teacher: 'teacher3@abc.com',
      notification: '@student3@abc.com',
    },
    notification,
  );
  return [
    new RetrieveForNotifications(notification1),
    new RetrieveForNotifications(notification2),
    new RetrieveForNotifications(notification3),
  ];
}

export function givenRegister() {
  const teacher: Teacher = givenTeachers()[0];
  const studentEmails: string[] = givenStudents().map(s => s.email);
  return new Register({
    teacher: teacher.email,
    students: studentEmails,
  });
}
