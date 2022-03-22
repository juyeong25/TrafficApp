import {
    Controller,
    Get,
    Post,
    Body,
    UsePipes,
    ValidationPipe,
    Req,
    UseGuards, Res, Request
} from '@nestjs/common';
import {UserService} from './user.service';
import {CreateUserDto} from './dto/create-user.dto';
import {AuthGuard} from "@nestjs/passport";
import {
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse,
    ApiOperation,
    ApiTags
} from "@nestjs/swagger";
const request = require('request');


@Controller('user')
@ApiTags('유저 API')
export class UserController {
    constructor(private readonly userService: UserService) {
    }

    @ApiOperation({ summary: '유저 생성 API', description: '유저 생성' })
    @ApiBody({description: '유저 생성 시 요청 Body', type: CreateUserDto})
    @Post('/create')
    @UsePipes(ValidationPipe)
    create(@Body() createUserDto: CreateUserDto): Promise<void> {
        return this.userService.createUser(createUserDto);
    }


    @ApiOperation({ summary: '유저 JWT 토큰 발행 API', description: '유저 JWT 토큰 발행' })
    @ApiBody({description: 'JWT 토큰 발행시 필요한 정보', type: CreateUserDto})
    @ApiCreatedResponse({description : 'JWT 토큰'})
    @Post('/accessToken')
    @UseGuards(AuthGuard('local'))
    @UsePipes(ValidationPipe)
    async getToken(
        @Body() createUserDto: CreateUserDto,
        @Res({passthrough: true}) response
    ) {
        console.log('토큰 요청됨')
        const access_token = await (await (this.userService.signIn(createUserDto)))
        await response.cookie('Authorization', access_token.accessToken, {
            // httpOnly: true, // true 시에 쿠키 전달이 안됨 ... 왜그런지 모르겠음
        })
        return access_token
    }

    @ApiOperation({ summary: 'JWT 으로 유저 반환 API', description: 'JWT 으로 유저 객체 반환 & 오른쪽 자물쇠 Bearer tokken 작성 필수!!' })
    @ApiBearerAuth('access-token')
    @ApiCreatedResponse({description: '유저 객체의 userId 반환', type: String})
    @UseGuards(AuthGuard('jwt'))
    @Get('/login')
    async getProfile(@Request() req, @Req() client_req) {
        //req.user -> AuthGuard에서 넘어온 유저 객체, client_req -> 클라이언트에서 넘어온 값
        return {
            userId: req.user.userId
        };
    }

    @Get('/streamTest')
    mjpegStreaming(
        @Res() res,
        @Req() req
    ) {
        var request_options = {
            url: 'http://61.211.241.239/nphMotionJpeg?Resolution=320x240&Quality=Standard',
            timeout: 1500
        };
        var req_pipe = request(request_options);
        req_pipe.pipe(res);

        setTimeout(function () {
            req_pipe.pause();
        }, 1000*60*3);

        req_pipe.on('error', function (e) {
            console.log(e)
            res.status(404).end();
        });
        req.on('end', function () {
            console.log(`pipe on end url`)
            req_pipe.abort();
        });
        req.on('close', function () {
            console.log(`pipe on close url`)
            req_pipe.abort()

        })

    }
}
