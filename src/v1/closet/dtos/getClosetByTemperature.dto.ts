import { ApiProperty } from '@nestjs/swagger';

export class GetClosetByTemperatureDto {
  @ApiProperty({
    example: '2023-08-17 23:00',
    description: '조회시간',
  })
  dateTime: string;

  @ApiProperty({
    example: 7,
    description: '(메인에서 호출시 사용) - 선택한 옷의 ID',
    required: false,
  })
  closet_id: number;
}
