import {IsNotEmpty} from "class-validator";

export class CreateEventCodeDto {
    @IsNotEmpty()
    event_code: number;

    @IsNotEmpty()
    event_name: string;
}
