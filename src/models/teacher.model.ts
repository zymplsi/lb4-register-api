import {Entity, model, property} from '@loopback/repository';

@model()
export class Teacher extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
  })
  email: string;

  constructor(data?: Partial<Teacher>) {
    super(data);
  }
}
