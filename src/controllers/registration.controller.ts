import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getWhereSchemaFor,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import {Registration} from '../models';
import {RegistrationRepository} from '../repositories';

export class RegistrationController {
  constructor(
    @repository(RegistrationRepository)
    public registrationRepository : RegistrationRepository,
  ) {}

  @post('/registrations', {
    responses: {
      '200': {
        description: 'Registration model instance',
        content: {'application/json': {schema: {'x-ts-type': Registration}}},
      },
    },
  })
  async create(@requestBody() registration: Registration): Promise<Registration> {
    return await this.registrationRepository.create(registration);
  }

  @get('/registrations/count', {
    responses: {
      '200': {
        description: 'Registration model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Registration)) where?: Where,
  ): Promise<Count> {
    return await this.registrationRepository.count(where);
  }

  @get('/registrations', {
    responses: {
      '200': {
        description: 'Array of Registration model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': Registration}},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Registration)) filter?: Filter,
  ): Promise<Registration[]> {
    return await this.registrationRepository.find(filter);
  }

  @patch('/registrations', {
    responses: {
      '200': {
        description: 'Registration PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody() registration: Registration,
    @param.query.object('where', getWhereSchemaFor(Registration)) where?: Where,
  ): Promise<Count> {
    return await this.registrationRepository.updateAll(registration, where);
  }

  @get('/registrations/{id}', {
    responses: {
      '200': {
        description: 'Registration model instance',
        content: {'application/json': {schema: {'x-ts-type': Registration}}},
      },
    },
  })
  async findById(@param.path.number('id') id: number): Promise<Registration> {
    return await this.registrationRepository.findById(id);
  }

  @patch('/registrations/{id}', {
    responses: {
      '204': {
        description: 'Registration PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody() registration: Registration,
  ): Promise<void> {
    await this.registrationRepository.updateById(id, registration);
  }

  @put('/registrations/{id}', {
    responses: {
      '204': {
        description: 'Registration PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() registration: Registration,
  ): Promise<void> {
    await this.registrationRepository.replaceById(id, registration);
  }

  @del('/registrations/{id}', {
    responses: {
      '204': {
        description: 'Registration DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.registrationRepository.deleteById(id);
  }
}
