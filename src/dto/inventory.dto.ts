import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class UpdateFavoriteDto {
  @IsBoolean()
  @IsNotEmpty()
  isFavorite!: boolean;
}

export class UpdateDisplayDto {
  @IsBoolean()
  @IsNotEmpty()
  isDisplayed!: boolean;
}

export class GetInventoryQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  rarity?: string;
}
