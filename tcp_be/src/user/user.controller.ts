import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  
  @Get('/userinfo/:userId')
  async getMyInfo(@Param('userId') userId: number) {
    const getUserListings = await this.userService.getUserListings(userId);
    const getUserSubscribedItems = await this.userService.getUserSubscribedItems(userId);
    return {
      listings: getUserListings,
      subscribedItems: getUserSubscribedItems,
    };
  }
}
