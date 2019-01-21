import {Entity, model, property, hasMany} from '@loopback/repository';
import {Registration} from './registration.model';

@model()
export class Student extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'boolean',
  })
  suspended?: boolean;

  @hasMany(() => Registration)
  registrations: Registration[];

  constructor(data?: Partial<Student>) {
    super(data);
  }
}
