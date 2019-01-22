import {
  RegistrationRepository,
  TeacherRepository,
  StudentRepository,
} from '../repositories';
import {Teacher, Student} from '../models';

export const getTeacherByEmail = async (
  email: string,
  teacherRepository: TeacherRepository,
) => await teacherRepository.findOne({where: {email: {eq: email}}});

export const getStudentByEmail = async (
  email: string,
  studentRepository: StudentRepository,
) => await studentRepository.findOne({where: {email: {eq: email}}});

export const getStudentsByIds = async (
  studentIds: number[],
  studentRepository: StudentRepository,
) => await studentRepository.find({where: {id: {inq: studentIds}}});

export const getStudentsRegisteredWithTeacher = async (
  student: Student | null,
  teacher: Teacher | null,
  registrationRepository: RegistrationRepository,
) => {
  if (!student) return [];
  if (!teacher) return [];
  return await registrationRepository.find({
    where: {and: [{studentId: student.id}, {teacherId: teacher.id}]},
  });
};

export const getStudentFromIdList = async (
  ids: (number | undefined)[],
  studentRepository: StudentRepository,
) => await studentRepository.find({where: {id: {inq: ids}}});

export const getTeacherIdsByEmail = async (
  emails: string[],
  teacherRepository: TeacherRepository,
) => {
  if (Array.isArray(emails)) {
    return teacherRepository.find({where: {email: {inq: emails}}});
  }
  return teacherRepository.find({where: {email: {eq: emails}}});
};

export const getTeacherRegistrationsById = async (
  teacherId: number | undefined,
  registrationRepository: RegistrationRepository,
) => await registrationRepository.find({where: {teacherId: {eq: teacherId}}});

export const parseMentionedeMails = (message: string) => {
  const phrase = message.split(' ');
  return phrase
    .filter(str => {
      return str[0] === '@';
    })
    .map(email => {
      return email.slice(1);
    });
};

export const getCommonNumber = (all_arr: Array<number | undefined>[]) => {
  const safe_box: number[] = [];

  if (!all_arr[0]) return safe_box;

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
