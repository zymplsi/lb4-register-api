import {Entity, model, property} from '@loopback/repository';

@model()
export class Registration extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  id?: number;

  constructor(data?: Partial<Registration>) {
    super(data);
  }
}
