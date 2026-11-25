import { Controller, Post, Body, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FamilyService } from './family.service';
import { AddMemberDto } from './dto/add-member.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Family')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('family')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post('members')
  @ApiOperation({ summary: 'Add family member for vehicle sharing' })
  addMember(@CurrentUser('id') ownerId: string, @Body() dto: AddMemberDto) {
    return this.familyService.addMember(ownerId, dto);
  }

  @Get('members')
  @ApiOperation({ summary: 'Get family members' })
  getMembers(@CurrentUser('id') ownerId: string) {
    return this.familyService.getMembers(ownerId);
  }

  @Delete('members/:id')
  @ApiOperation({ summary: 'Remove family member' })
  removeMember(@Param('id') id: string, @CurrentUser('id') ownerId: string) {
    return this.familyService.removeMember(id, ownerId);
  }
}
