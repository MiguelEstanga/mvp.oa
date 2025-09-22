import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { UpdateMvpDto  } from "./dto/update-mvp";
import { UpdatePersonalityDto  } from "./dto/update-personality";
import { UpdateUserDto } from "./dto/update-user";
import { UpdateDescriptionDto } from "./dto/update-description.dto";
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Get('all')
  async getAllUsers() {
    return'test';
  }

  @Get(":firebase_uid")
  async getUserByFirebaseUid(@Param('firebase_uid') firebase_uid: string) {
    return this.userService.getUserByFirebaseUid(firebase_uid);
  }

  @Get(":email")
  async getUserByEmail(@Param('email') email: string) {
    return this.userService.getUserByEmail(email);
  }

  @Post()
  async editMvpType(@Param() body: UpdateMvpDto) {
    return this.userService.editMvpType(body);
  }

  @Post("personality")
  async editPersonality(@Body () body: UpdatePersonalityDto) {
    console.log(body);
    return this.userService.editPersonality(body);
  }

  @Post("update")
  async editUser(@Body () body: UpdateUserDto) {
    console.log(body);
    return this.userService.editUser(body);
  }

  @Post("description")
  async editDescription(@Body () body: UpdateDescriptionDto) {
    console.log(body);
    return this.userService.editDescription(body);
  }
}