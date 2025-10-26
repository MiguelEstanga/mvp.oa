import { IsEmail, IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;


  @IsNotEmpty({ message: 'the old password is required' })
  oldPassword: string;

  @IsNotEmpty({ message: 'the new password is required' })
   
  newPassword: string;

}