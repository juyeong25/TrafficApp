import {MigrationInterface, QueryRunner} from "typeorm";

export class event1644553010079 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("INSERT INTO event_code (event_code, event_name) VALUES (0, '제어기 통신상태');\n")
        await queryRunner.query("INSERT INTO event_code (event_code, event_name) VALUES (1, 'CAN 상태');\n")
        await queryRunner.query("INSERT INTO event_code (event_code, event_name) VALUES (2, 'LTE 통신상태');\n")
        await queryRunner.query("INSERT INTO event_code (event_code, event_name) VALUES (3, '예비_03');\n")
        await queryRunner.query("INSERT INTO event_code (event_code, event_name) VALUES (4, '예비_04');\n")
        await queryRunner.query("INSERT INTO event_code (event_code, event_name) VALUES (5, '조광제어');\n")
        await queryRunner.query("INSERT INTO event_code (event_code, event_name) VALUES (6, 'SCU 통신');\n")
        await queryRunner.query("INSERT INTO event_code (event_code, event_name) VALUES (7, 'Power Fail');\n")
        await queryRunner.query("INSERT INTO event_code (event_code, event_name) VALUES (8, 'DATABASE');\n")
        await queryRunner.query("INSERT INTO event_code (event_code, event_name) VALUES (9, '점멸');\n")
        await queryRunner.query("INSERT INTO event_code (event_code, event_name) VALUES (10, '소등');\n")
        await queryRunner.query("INSERT INTO event_code (event_code, event_name) VALUES (11, '모순');\n")
        await queryRunner.query("INSERT INTO event_code (event_code, event_name) VALUES (12, '소등 스위치');\n")
        await queryRunner.query("INSERT INTO event_code (event_code, event_name) VALUES (13, '점멸 스위치');\n")
        await queryRunner.query("INSERT INTO event_code (event_code, event_name) VALUES (14, '수동 스위치');\n")
        await queryRunner.query("INSERT INTO event_code (event_code, event_name) VALUES (15, '수동진행 스위치');\n")
        await queryRunner.query("INSERT INTO event_code (event_code, event_name) VALUES (16, 'DOOR');\n")
        await queryRunner.query("INSERT INTO event_code (event_code, event_name) VALUES (17, '모순검지');\n")
        await queryRunner.query("INSERT INTO event_code (event_code, event_name) VALUES (18, '수동제어');\n")
        await queryRunner.query("INSERT INTO event_code (event_code, event_name) VALUES (19, '시차제');\n")
        await queryRunner.query("INSERT INTO event_code (event_code, event_name) VALUES (20, '예비_20');\n")
        await queryRunner.query("INSERT INTO event_code (event_code, event_name) VALUES (21, '예비_21');\n")
        await queryRunner.query("INSERT INTO event_code (event_code, event_name) VALUES (22, '예비_22');\n")
        await queryRunner.query("INSERT INTO event_code (event_code, event_name) VALUES (23, '푸쉬버튼');\n")
        await queryRunner.query("INSERT INTO event_code (event_code, event_name) VALUES (24, '예비_24');\n")
        await queryRunner.query("INSERT INTO event_code (event_code, event_name) VALUES (25, '검지기 1번');\n")
        await queryRunner.query("INSERT INTO event_code (event_code, event_name) VALUES (26, '예비_26');\n")
        await queryRunner.query("INSERT INTO event_code (event_code, event_name) VALUES (27, '검지기 2번');\n")
        await queryRunner.query("INSERT INTO event_code (event_code, event_name) VALUES (99, 'RESTART');")
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
