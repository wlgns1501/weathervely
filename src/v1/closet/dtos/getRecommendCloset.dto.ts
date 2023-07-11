import { ApiProperty } from '@nestjs/swagger';

export class GetRecommendClosetDto {
  @ApiProperty({ description: 'datetime' })
  dateTime: string;
}
