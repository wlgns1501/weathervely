import { ApiProperty } from '@nestjs/swagger';

export class PickClosetDto {
  @ApiProperty({
    description: 'closet_ids',
    required: false,
    example: [1, 2, 3],
  })
  closet_ids: number[];
}
