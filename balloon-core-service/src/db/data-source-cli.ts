import 'dotenv/config';
import { join } from 'node:path';
import { DataSource } from 'typeorm';
import type { DataSourceOptions } from 'typeorm';

const projectDirectory = process.cwd();

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.PG_DATABASE_HOST,
  port: Number(process.env.PG_DATABASE_PORT),
  username: process.env.PG_DATABASE_USERNAME,
  password: process.env.PG_DATABASE_PASSWORD,
  database: process.env.PG_DATABASE_NAME,
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
  logging: true,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;