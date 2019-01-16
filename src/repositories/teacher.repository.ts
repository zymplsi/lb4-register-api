import {
  DefaultCrudRepository,
  juggler,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {Teacher, Registration} from '../models';
// import {RegisterDbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {RegistrationRepository} from './registration.repository';

export class TeacherRepository extends DefaultCrudRepository<
  Teacher,
  typeof Teacher.prototype.id
> {
  public readonly registrations: HasManyRepositoryFactory<
    Registration,
    typeof Teacher.prototype.id
  >;

  constructor(
    @inject('datasources.registerDb') dataSource: juggler.DataSource,
    @repository.getter('RegistrationRepository')
    protected readonly registrationGetterRepository: Getter<
      RegistrationRepository
    >,
  ) {
    super(Teacher, dataSource);
    this.registrations = this.createHasManyRepositoryFactoryFor(
      'registrations',
      registrationGetterRepository,
    );
  }
}
