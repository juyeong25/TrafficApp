import {IsNotEmpty, IsString, Matches, MaxLength, MinLength} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class CreateUserDto {
    @ApiProperty({example: 'userID', description: '유저 ID'})
    @IsNotEmpty()
    @IsString()
    @MaxLength(20)
    userId: string;

    @ApiProperty({example: 'password', description: '비밀번호 (대소문자 & 숫자)'})
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(25)
    @Matches(/^[a-zA-Z0-9]*$/, {
        message: 'password only accepts english and number'
    })
    // // 최소 8자 및 최대 16자, 하나 이상의 대문자, 하나의 소문자, 하나의 숫자 및 하나의 특수 문자
    // @Matches(
    //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/,
    //     {
    //         message: '비밀번호 양식에 맞게 작성하세요.',
    //     },
    // )
    password: string;

    @ApiProperty({example: true, description: 'bool 값'})
    @IsNotEmpty()
    admin: boolean;
}
