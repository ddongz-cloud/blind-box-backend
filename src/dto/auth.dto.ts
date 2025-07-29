import { Rule, RuleType } from '@midwayjs/validate';

export class RegisterDto {
  @Rule(RuleType.string().required().min(3).max(50))
  username!: string;

  @Rule(RuleType.string().required().email())
  email!: string;

  @Rule(RuleType.string().required().min(6).max(100))
  password!: string;
}
