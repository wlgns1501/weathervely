import { ApiProperty } from '@nestjs/swagger';

export class GetRecommendClosetDto {
  @ApiProperty({
    description:
      'API 콜 기준 오늘 자정 ~ 내일 23:00 시로 보내면됨 - ex) 2023-07-20 23:00',
  })
  dateTime: string;
}
