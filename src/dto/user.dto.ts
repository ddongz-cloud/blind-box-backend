import { Rule, RuleType } from '@midwayjs/validate';

export class UpdateProfileDto {
  @Rule(RuleType.string().optional().max(50))
  nickname?: string;

  @Rule(RuleType.string().optional().uri())
  avatar?: string;
}
