import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {Teacher} from '../models';
import {RegisterDbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class TeacherRepository extends DefaultCrudRepository<
  Teacher,
  typeof Teacher.prototype.email
> {
  constructor(
    @inject('datasources.registerDb') dataSource: RegisterDbDataSource,
  ) {
    super(Teacher, dataSource);
  }
}
