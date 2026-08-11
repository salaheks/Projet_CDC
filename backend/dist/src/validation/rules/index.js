"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_RULES = void 0;
const network_rules_1 = require("./network/network.rules");
const security_rules_1 = require("./security/security.rules");
const architecture_rules_1 = require("./architecture/architecture.rules");
exports.ALL_RULES = [
    new network_rules_1.CidrOverlapRule(),
    new network_rules_1.MissingNatRule(),
    new network_rules_1.RoutingLoopRule(),
    new network_rules_1.SubnetOutsideVpcRule(),
    new security_rules_1.SshOpenToWorldRule(),
    new security_rules_1.ComputeWithoutSgRule(),
    new security_rules_1.PublicDatabaseRule(),
    new architecture_rules_1.SinglePointOfFailureRule(),
    new architecture_rules_1.OrphanNodeRule(),
];
//# sourceMappingURL=index.js.map