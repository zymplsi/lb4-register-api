import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Teacher} from './teacher.model';
import {Student} from './student.model';

@model()
export class Registration extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @belongsTo(() => Teacher)
  teacherId?: number;

  @belongsTo(() => Student)
  studentId?: number;

  getId() {
    return this.id;
  }

  constructor(data?: Partial<Registration>) {
    super(data);
  }
}
