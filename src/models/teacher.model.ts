import {Entity, model, property, hasMany} from '@loopback/repository';
import {Registration} from './registration.model';

@model()
export class Teacher extends Entity {
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

  @hasMany(() => Registration)
  registrations: Registration[];

  constructor(data?: Partial<Teacher>) {
    super(data);
  }
}
