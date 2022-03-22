import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class User extends BaseEntity{
    @PrimaryGeneratedColumn()
    user_no: number;

    @Column({ unique: true })
    userId: string;

    @Column()
    password: string;

    @Column()
    admin: boolean;
}
