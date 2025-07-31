import { IsNotEmpty, IsString, MaxLength, IsOptional, IsNumber, Min } from 'class-validator';

export class CreatePlayerShowDto {
  @IsNotEmpty()
  @IsString()
  inventoryId!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  content!: string;
}

export class GetPlayerShowListDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 12;

  @IsOptional()
  @IsString()
  sort?: string = 'latest';
}
