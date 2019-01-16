import {
  DefaultCrudRepository,
  juggler,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {Student, Registration} from '../models';
// import {RegisterDbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {RegistrationRepository} from './registration.repository';

export class StudentRepository extends DefaultCrudRepository<
  Student,
  typeof Student.prototype.id
> {
  public readonly registrations: HasManyRepositoryFactory<
    Registration,
    typeof Student.prototype.id
  >;

  constructor(
    @inject('datasources.registerDb') dataSource: juggler.DataSource,
    @repository.getter('RegistrationRepository')
    protected readonly registrationGetterRepository: Getter<
      RegistrationRepository
    >,
  ) {
    super(Student, dataSource);
    this.registrations = this.createHasManyRepositoryFactoryFor(
      'registrations',
      registrationGetterRepository,
    );
  }
}
