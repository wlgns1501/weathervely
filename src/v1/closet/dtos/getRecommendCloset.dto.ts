import { ApiProperty } from '@nestjs/swagger';

export class GetRecommendClosetDto {
  @ApiProperty({
    description:
      'API 콜 기준 2일전까지만 기상청 api 데이터 제공하므로 테스트시 어제 or 오늘 (미래는 안됨) 정각시간으로 보내면됨 - ex) 2023-07-20 23:00',
  })
  dateTime: string;
}
