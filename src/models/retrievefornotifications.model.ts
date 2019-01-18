import {Model, model, property} from '@loopback/repository';

@model()
export class RetrieveForNotifications extends Model {
  @property({
    type: 'string',
    required: true,
  })
  teacher: string;

  @property({
    type: 'string',
    required: true,
  })
  notification: string;

  constructor(data?: Partial<RetrieveForNotifications>) {
    super(data);
  }
}
