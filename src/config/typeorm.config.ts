import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'run-jamaica',
  password: 'run-jamaica',
  database: 'run-jamaica',
  autoLoadEntities: true,
  synchronize: true,
};
