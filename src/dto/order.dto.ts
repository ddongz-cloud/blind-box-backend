import { Rule, RuleType } from '@midwayjs/validate';

export class CreateOrderDto {
  @Rule(RuleType.string().required().uuid())
  seriesId!: string;

  @Rule(RuleType.number().required().min(1).max(10))
  quantity!: number;
}
