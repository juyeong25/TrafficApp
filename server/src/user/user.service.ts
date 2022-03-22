import {Injectable, UnauthorizedException} from '@nestjs/common';
import {CreateUserDto} from './dto/create-user.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {UserRepository} from "./user.repository";
import * as bcrypt from 'bcryptjs'
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        private jwtService: JwtService,
    ) {
    }
    async createUser(createUserDto: CreateUserDto): Promise<void> {
        return this.userRepository.createUser(createUserDto);
    }

    async signIn(createUserDto: CreateUserDto): Promise<{ accessToken: string }>{
        const {userId, password} = createUserDto;
        const user = await this.userRepository.findOne({userId});

        if (user && (await bcrypt.compare(password, user.password))){
            // 유저 토큰 생성
            const payload = { userId };
            const accessToken = await this.jwtService.signAsync(payload)
            return {accessToken: accessToken};
        }else{
            throw new UnauthorizedException('login failed')
        }
    }




    async validateUser(userId: string, password: string): Promise<any> {
        const user = await this.userRepository.findOne({where: { userId: userId}})
        if (!user || (user && !bcrypt.compare(password, user.password)))
            return null;
        return await this.userRepository.findUserId(userId); // select * from user where id = user.id;
    }
}
