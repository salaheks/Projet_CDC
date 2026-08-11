import type { ValidationRule } from './rule.interface';
import { CidrOverlapRule, MissingNatRule, RoutingLoopRule, SubnetOutsideVpcRule } from './network/network.rules';
import { SshOpenToWorldRule, ComputeWithoutSgRule, PublicDatabaseRule } from './security/security.rules';
import { SinglePointOfFailureRule, OrphanNodeRule } from './architecture/architecture.rules';

/**
 * Registry of all validation rules.
 * To add a new rule, create it and add it here.
 */
export const ALL_RULES: ValidationRule[] = [
  // Network rules
  new CidrOverlapRule(),
  new MissingNatRule(),
  new RoutingLoopRule(),
  new SubnetOutsideVpcRule(),

  // Security rules
  new SshOpenToWorldRule(),
  new ComputeWithoutSgRule(),
  new PublicDatabaseRule(),

  // Architecture rules
  new SinglePointOfFailureRule(),
  new OrphanNodeRule(),
];
