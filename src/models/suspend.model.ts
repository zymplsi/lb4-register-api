import {Entity, model, property} from '@loopback/repository';

@model()
export class Suspend extends Entity {
  @property({
    type: 'string',
    required: true,
  })
  email: string;

  constructor(data?: Partial<Suspend>) {
    super(data);
  }
}
