import {Model, model, property} from '@loopback/repository';

@model()
export class CommonStudents extends Model {
  @property({
    type: 'array',
    itemType: 'string',
    required: true,
  })
  students: string[];

  constructor(data?: Partial<CommonStudents>) {
    super(data);
  }
}
