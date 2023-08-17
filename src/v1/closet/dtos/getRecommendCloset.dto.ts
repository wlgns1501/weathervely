import { ApiProperty } from '@nestjs/swagger';

export class GetRecommendClosetDto {
  @ApiProperty({
    example: '2023-08-17 23:00',
    description: '조회시간',
  })
  dateTime: string;
}
