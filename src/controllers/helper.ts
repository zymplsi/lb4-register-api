import {
  RegistrationRepository,
  TeacherRepository,
  StudentRepository,
} from '../repositories';
import {Teacher, Student} from '../models';
import {WhereBuilder, Where} from '@loopback/repository';

export const getTeacher = async (
  email: string,
  teacherRepository: TeacherRepository,
) => {
  const whereTeacherEmailBuilder = new WhereBuilder();
  const whereTeacherEmail = whereTeacherEmailBuilder.eq('email', email);
  return await teacherRepository.findOne(whereTeacherEmail);
};

export const getStudent = async (
  email: string,
  studentRepository: StudentRepository,
) => {
  const whereStudentEmailBuilder = new WhereBuilder();
  const whereStudentEmail = whereStudentEmailBuilder.eq('email', email);
  return await studentRepository.findOne(whereStudentEmail);
};

export const getStudentsRegisteredWithTeacher = async (
  student: Student | null,
  teacher: Teacher,
  registrationRepository: RegistrationRepository,
) => {
  if (!student) return [];
  const whereRegisteredBuilder = new WhereBuilder();
  const whereRegistered = whereRegisteredBuilder.and([
    {studentId: student.id},
    {teacherId: teacher.id},
  ]);
  return await registrationRepository.find(whereRegistered);
};

export const getCommonNumber = (all_arr: Array<number | undefined>[]) => {
  const safe_box: number[] = [];

  let shortest_arr = all_arr[0];
  let all_arr_idx = all_arr.length - 1;
  while (all_arr_idx > 0) {
    let curr_length = all_arr[all_arr_idx].length;
    if (curr_length <= shortest_arr.length) {
      shortest_arr = all_arr[all_arr_idx];
    }
    all_arr_idx = all_arr_idx - 1;
  }

  shortest_arr.map((id: number) => {
    safe_box.push(id);
    all_arr.map(arr => {
      if (arr.includes(id) === false) {
        safe_box.pop();
      }
    });
  });

  return safe_box;
};

export const getStudentFromIdList = async (
  ids: (number | undefined)[],
  studentRepository: StudentRepository,
) => {
  const whereStudentIdBuilder = new WhereBuilder();
  const whereStudentId = whereStudentIdBuilder.inq('id', ids);
  return await studentRepository.find(whereStudentId);
};

export const getTeacherIds = async (
  emails: string[],
  teacherRepository: TeacherRepository,
) => {
  let whereEmails: Where;
  const whereEmailsBuilder = new WhereBuilder();
  if (Array.isArray(emails)) {
    whereEmails = whereEmailsBuilder.inq('email', emails);
  } else {
    whereEmails = whereEmailsBuilder.eq('email', emails);
  }
  return await teacherRepository.find(whereEmails);
};
