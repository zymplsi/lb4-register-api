import {
  RegistrationRepository,
  TeacherRepository,
  StudentRepository,
} from '../repositories';
import {Teacher, Student} from '../models';
import {WhereBuilder} from '@loopback/repository';

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
