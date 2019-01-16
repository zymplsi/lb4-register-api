import {
  DefaultCrudRepository,
  juggler,
  BelongsToAccessor,
  repository,
  // createBelongsToAccessor,
  // RelationType,
} from '@loopback/repository';
import {Registration, Teacher} from '../models';
// import {RegisterDbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {TeacherRepository} from './teacher.repository';

export class RegistrationRepository extends DefaultCrudRepository<
  Registration,
  typeof Registration.prototype.id
> {
  public readonly teacher: BelongsToAccessor<
    Teacher,
    typeof Registration.prototype.id
  >;

  constructor(
    @inject('datasources.registerDb') dataSource: juggler.DataSource,
    @repository.getter('Teacher')
    protected readonly teacherGetterRepository: Getter<TeacherRepository>,
  ) {
    super(Registration, dataSource);
    this.teacher = this.createBelongsToAccessorFor(
      'teacher',
      teacherGetterRepository,
    );
  }
}
