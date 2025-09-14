import { IsString } from "class-validator";

export class UpdateMvpDto {
    @IsString()
    mvp_type: string;

    @IsString({
        message: 'El firebase_uid es requerido',
    })
    firebase_uid: string;
}