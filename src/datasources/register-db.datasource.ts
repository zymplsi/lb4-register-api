import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './register-db.datasource.json';

export class RegisterDbDataSource extends juggler.DataSource {
  static dataSourceName = 'registerDb';

  constructor(
    @inject('datasources.config.registerDb', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
