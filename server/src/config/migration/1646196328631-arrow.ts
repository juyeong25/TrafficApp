import {MigrationInterface, QueryRunner} from "typeorm";

export class arrow1646196328631 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("INSERT INTO arrow (arrow_id, arrow_image) VALUES (1, '1.png');\n")
        await queryRunner.query("INSERT INTO arrow (arrow_id, arrow_image) VALUES (2, '2.png');\n")
        await queryRunner.query("INSERT INTO arrow (arrow_id, arrow_image) VALUES (3, '3.png');\n")
        await queryRunner.query("INSERT INTO arrow (arrow_id, arrow_image) VALUES (4, '4.png');\n")
        await queryRunner.query("INSERT INTO arrow (arrow_id, arrow_image) VALUES (5, '5.png');\n")
        await queryRunner.query("INSERT INTO arrow (arrow_id, arrow_image) VALUES (6, '6.png');\n")
        await queryRunner.query("INSERT INTO arrow (arrow_id, arrow_image) VALUES (7, '7.png');\n")
        await queryRunner.query("INSERT INTO arrow (arrow_id, arrow_image) VALUES (8, '8.png');\n")
        await queryRunner.query("INSERT INTO arrow (arrow_id, arrow_image) VALUES (9, '9.png');\n")
        await queryRunner.query("INSERT INTO arrow (arrow_id, arrow_image) VALUES (10, '10.png');\n")
        await queryRunner.query("INSERT INTO arrow (arrow_id, arrow_image) VALUES (11, '11.png');\n")
        await queryRunner.query("INSERT INTO arrow (arrow_id, arrow_image) VALUES (12, '12.png');\n")
        await queryRunner.query("INSERT INTO arrow (arrow_id, arrow_image) VALUES (13, '13.png');\n")
        await queryRunner.query("INSERT INTO arrow (arrow_id, arrow_image) VALUES (14, '14.png');\n")
        await queryRunner.query("INSERT INTO arrow (arrow_id, arrow_image) VALUES (15, '15.png');\n")
        await queryRunner.query("INSERT INTO arrow (arrow_id, arrow_image) VALUES (16, '16.png');\n")
        await queryRunner.query("INSERT INTO arrow (arrow_id, arrow_image) VALUES (17, '17.png');\n")
        await queryRunner.query("INSERT INTO arrow (arrow_id, arrow_image) VALUES (18, '18.png');\n")
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
