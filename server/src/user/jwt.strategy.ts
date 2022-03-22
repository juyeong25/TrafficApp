import {ExtractJwt, Strategy} from 'passport-jwt';
import {PassportStrategy} from "@nestjs/passport";
import {Injectable, UnauthorizedException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {UserRepository} from "./user.repository";
import {User} from "./entities/user.entity";
import {Request} from "express";

const fromAuthCookie = function () {
    return function (request: Request) {
        let token = null;
        if (request && request.cookies ) {
            token = request.cookies['Authorization'];
            console.log('token -> ',token)
        }
        return token;
    }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository
    ) {
        super({
            secretOrKey: 'dongbuict',
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
            // jwtFromRequest: fromAuthCookie(),
        });
    }

    async validate(payload){
        const { userId } = payload;
        const user: User = await this.userRepository.findOne({userId: userId})
        if (!user){
            throw new UnauthorizedException()
        }
        return user;
    }
}