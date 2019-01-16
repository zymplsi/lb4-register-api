import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Teacher} from './teacher.model';

@model()
export class Registration extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  id?: number;

  @belongsTo(() => Teacher)
  teacherId?: number;

  getId() {
    return this.id;
  }

  constructor(data?: Partial<Registration>) {
    super(data);
  }
}
