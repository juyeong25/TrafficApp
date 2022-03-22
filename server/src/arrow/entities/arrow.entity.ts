import {BaseEntity, Column, Entity, PrimaryColumn} from "typeorm";

@Entity()
export class Arrow extends BaseEntity {
    @PrimaryColumn()
    arrow_id: number;

    @Column()
    arrow_image: string;
}
