import {Model, model, property} from '@loopback/repository';

@model()
export class Register extends Model {
  @property({
    type: 'string',
    required: true,
  })
  teacher: string;

  @property({
    type: 'array',
    itemType: 'string',
    required: true,
  })
  students: string[];

  constructor(data?: Partial<Register>) {
    super(data);
  }
}
