import {Strategy} from 'passport-local';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {UserRepository} from "./user.repository";
import {UserService} from "./user.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        private userService: UserService

) {
        super({
            usernameField: 'userId',
            passwordField: 'password',
        });
    }

    async validate(userId: string, password: string): Promise<any> {
        const user = await this.userService.validateUser(userId,password)
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}