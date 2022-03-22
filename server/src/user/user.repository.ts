import {EntityRepository, Repository} from "typeorm";
import {User} from "./entities/user.entity";
import {CreateUserDto} from "./dto/create-user.dto";
import {ConflictException, InternalServerErrorException} from "@nestjs/common";
import * as bcrypt from 'bcryptjs';

@EntityRepository(User)
export class UserRepository extends Repository<User>{
    async createUser(createUserDto: CreateUserDto): Promise<void>{
        const {userId, password, admin} = createUserDto;

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt)
        const newUser = this.create({userId, password: hashedPassword, admin})

        try {
            await this.save(newUser);
        }catch (err) {
            if (err.code === '23505') throw new ConflictException('Existing userId');
            else throw new InternalServerErrorException();
        }

    }
    async findUserId(userId: string){
        return this.createQueryBuilder('user')
            .select('userId')
            .where('user."userId" = :value', {value: userId});

    }
}