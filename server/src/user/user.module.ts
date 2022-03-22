import {Module} from '@nestjs/common';
import {UserService} from './user.service';
import {UserController} from './user.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserRepository} from "./user.repository";
import {JwtModule} from "@nestjs/jwt";
import {PassportModule} from "@nestjs/passport";
import {JwtStrategy} from "./jwt.strategy";
import {LocalStrategy} from "./local.strategy";


@Module({
    imports: [
        PassportModule.register({defaultStrategy: 'jwt'}),
        JwtModule.register({
            secret: 'dongbuict',
            signOptions: {
                expiresIn: 60*60*24,
            }
        }),
        TypeOrmModule.forFeature([UserRepository])
    ],
    controllers: [UserController],
    providers: [UserService, JwtStrategy, LocalStrategy],
    exports: [PassportModule, JwtStrategy]
})
export class UserModule {
}
