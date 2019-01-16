import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {Registration} from '../models';
import {RegisterDbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class RegistrationRepository extends DefaultCrudRepository<
  Registration,
  typeof Registration.prototype.id
> {
  constructor(
    @inject('datasources.registerDb') dataSource: RegisterDbDataSource,
  ) {
    super(Registration, dataSource);
  }
}
