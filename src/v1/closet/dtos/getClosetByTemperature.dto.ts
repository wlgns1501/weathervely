import { ApiProperty } from '@nestjs/swagger';

export class GetClosetByTemperatureDto {
  @ApiProperty({
    description:
      'API 콜 기준 어제 자정 ~ 현재 시각 - 정각단위 - ex) 2023-07-20 23:00',
  })
  dateTime: string;

  @ApiProperty({
    description: '메인에서 체감온도 모달 open - 클릭한 closet의 id - ex) 7',
    required: false,
  })
  closet_id: number;
}
