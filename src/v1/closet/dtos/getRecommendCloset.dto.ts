import { ApiProperty } from '@nestjs/swagger';

export class GetRecommendClosetDto {
  @ApiProperty({ description: 'ex) 2023-07-10 23:00' })
  dateTime: string;
}
