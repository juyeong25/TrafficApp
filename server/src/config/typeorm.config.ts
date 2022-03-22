import {TypeOrmModuleOptions} from "@nestjs/typeorm";

// export  const typeORMConfig: TypeOrmModuleOptions = {
const typeORMConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: '14.51.232.239',
    port: 5432,
    username: 'postgres',
    password: 'xhdtlsqhdks1',
    database: 'tcs_database',
    entities: [__dirname+'/../**/*.entity.{js,ts}'],
    synchronize: true,
    // migrations: ['dist/config/migration/*{.ts,.js}'],
    // migrationsRun: true,
    migrations: ["dist/config/migration/*{.ts,.js}"],
    migrationsRun: false,
    cli: {
        migrationsDir: "src/config/migration",
    },
}

export default typeORMConfig