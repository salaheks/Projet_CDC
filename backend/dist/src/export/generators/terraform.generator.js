"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TerraformGeneratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerraformGeneratorService = void 0;
const common_1 = require("@nestjs/common");
let TerraformGeneratorService = class TerraformGeneratorService {
    static { TerraformGeneratorService_1 = this; }
    static PROVIDER_MAP = {
        aws: {
            vpc: { terraform: 'aws_vpc', pulumi: 'aws.ec2.Vpc' },
            subnet: { terraform: 'aws_subnet', pulumi: 'aws.ec2.Subnet' },
            'internet-gateway': {
                terraform: 'aws_internet_gateway',
                pulumi: 'aws.ec2.InternetGateway',
            },
            'nat-gateway': {
                terraform: 'aws_nat_gateway',
                pulumi: 'aws.ec2.NatGateway',
            },
            'route-table': {
                terraform: 'aws_route_table',
                pulumi: 'aws.ec2.RouteTable',
            },
            'virtual-machine': {
                terraform: 'aws_instance',
                pulumi: 'aws.ec2.Instance',
            },
            'container-cluster': {
                terraform: 'aws_ecs_cluster',
                pulumi: 'aws.ecs.Cluster',
            },
            'serverless-function': {
                terraform: 'aws_lambda_function',
                pulumi: 'aws.lambda.Function',
            },
            'security-group': {
                terraform: 'aws_security_group',
                pulumi: 'aws.ec2.SecurityGroup',
            },
            waf: { terraform: 'aws_wafv2_web_acl', pulumi: 'aws.wafv2.WebAcl' },
            'relational-database': {
                terraform: 'aws_db_instance',
                pulumi: 'aws.rds.Instance',
            },
            'object-storage': {
                terraform: 'aws_s3_bucket',
                pulumi: 'aws.s3.Bucket',
            },
            'load-balancer': { terraform: 'aws_lb', pulumi: 'aws.lb.LoadBalancer' },
            cdn: {
                terraform: 'aws_cloudfront_distribution',
                pulumi: 'aws.cloudfront.Distribution',
            },
            'dns-zone': { terraform: 'aws_route53_zone', pulumi: 'aws.route53.Zone' },
        },
        gcp: {
            vpc: {
                terraform: 'google_compute_network',
                pulumi: 'gcp.compute.Network',
            },
            subnet: {
                terraform: 'google_compute_subnetwork',
                pulumi: 'gcp.compute.Subnetwork',
            },
            'virtual-machine': {
                terraform: 'google_compute_instance',
                pulumi: 'gcp.compute.Instance',
            },
            'relational-database': {
                terraform: 'google_sql_database_instance',
                pulumi: 'gcp.sql.DatabaseInstance',
            },
            firewall: {
                terraform: 'google_compute_firewall',
                pulumi: 'gcp.compute.Firewall',
            },
            'load-balancer': {
                terraform: 'google_compute_forwarding_rule',
                pulumi: 'gcp.compute.ForwardingRule',
            },
            'object-storage': {
                terraform: 'google_storage_bucket',
                pulumi: 'gcp.storage.Bucket',
            },
        },
        azure: {
            vpc: {
                terraform: 'azurerm_virtual_network',
                pulumi: 'azure.network.VirtualNetwork',
            },
            subnet: { terraform: 'azurerm_subnet', pulumi: 'azure.network.Subnet' },
            'virtual-machine': {
                terraform: 'azurerm_linux_virtual_machine',
                pulumi: 'azure.compute.LinuxVirtualMachine',
            },
            'relational-database': {
                terraform: 'azurerm_postgresql_flexible_server',
                pulumi: 'azure.postgresql.FlexibleServer',
            },
            'security-group': {
                terraform: 'azurerm_network_security_group',
                pulumi: 'azure.network.NetworkSecurityGroup',
            },
        },
    };
    generate(graph) {
        const files = [];
        const resources = this.resolveAll(graph);
        const sorted = this.topologicalSort(resources);
        files.push({
            filename: 'provider.tf',
            content: this.generateProvider(graph.provider),
            language: 'hcl',
        });
        files.push({
            filename: 'variables.tf',
            content: this.generateVariables(graph.provider),
            language: 'hcl',
        });
        const mainBlocks = [
            `# ════════════════════════════════════════════════════`,
            `# main.tf — Generated by ArchPlatform IaC Compiler`,
            `# Project: ${graph.projectId}`,
            `# Date:    ${new Date().toISOString()}`,
            `# ════════════════════════════════════════════════════`,
            '',
        ];
        for (const resource of sorted) {
            mainBlocks.push(this.generateResourceBlock(resource, sorted));
        }
        files.push({
            filename: 'main.tf',
            content: mainBlocks.join('\n'),
            language: 'hcl',
        });
        files.push({
            filename: 'outputs.tf',
            content: this.generateOutputs(sorted),
            language: 'hcl',
        });
        return files;
    }
    resolveAll(graph) {
        const resources = [];
        for (const node of graph.nodes) {
            const mapping = TerraformGeneratorService_1.PROVIDER_MAP[node.provider]?.[node.resourceType];
            if (!mapping) {
                continue;
            }
            resources.push({
                node,
                terraformType: mapping.terraform,
                resolvedProperties: this.resolveProperties(node),
                dependsOn: this.inferDependencies(node, graph),
                outputs: this.inferOutputs(node, mapping.terraform),
            });
        }
        return resources;
    }
    resolveProperties(node) {
        const p = node.properties;
        const resolvers = {
            'aws/vpc': (props) => ({
                cidr_block: props.cidr,
                enable_dns_hostnames: props.dnsHostnames ?? true,
                enable_dns_support: props.dnsSupport ?? true,
            }),
            'aws/subnet': (props) => ({
                cidr_block: props.cidr,
                availability_zone: props.az,
                map_public_ip_on_launch: props.isPublic ?? false,
            }),
            'aws/virtual-machine': (props) => ({
                ami: props.ami ?? 'ami-0c55b159cbfafe1f0',
                instance_type: props.instanceType ?? 't3.micro',
                key_name: props.keyPair,
            }),
            'aws/relational-database': (props) => ({
                engine: props.engine ?? 'postgres',
                engine_version: props.engineVersion ?? '15.4',
                instance_class: props.instanceClass ?? 'db.t3.micro',
                allocated_storage: props.storage ?? 20,
                db_name: props.dbName,
                username: props.masterUsername ?? 'admin',
                skip_final_snapshot: true,
            }),
            'aws/security-group': (props) => ({
                name: props.name,
                description: props.description,
            }),
            'aws/object-storage': (props) => ({
                bucket: props.bucketName,
            }),
            'aws/load-balancer': (props) => ({
                internal: props.scheme === 'internal',
                load_balancer_type: props.lbType ?? 'application',
            }),
            'gcp/vpc': (props) => ({
                name: props.name,
                auto_create_subnetworks: props.autoCreateSubnetworks ?? false,
                routing_mode: props.routingMode ?? 'REGIONAL',
            }),
            'gcp/virtual-machine': (props) => ({
                machine_type: props.machineType ?? 'e2-micro',
                zone: props.zone ?? 'europe-west1-b',
            }),
        };
        const key = `${node.provider}/${node.resourceType}`;
        const resolver = resolvers[key];
        return resolver ? resolver(p) : p;
    }
    inferDependencies(node, graph) {
        const deps = [];
        if (node.parentId) {
            deps.push(node.parentId);
        }
        for (const edge of graph.edges) {
            if (edge.targetId === node.id && edge.edgeType === 'secures') {
                deps.push(edge.sourceId);
            }
        }
        return deps;
    }
    inferOutputs(node, tfType) {
        const name = this.sanitizeName(node.logicalName);
        const outputs = [];
        if (tfType === 'aws_instance') {
            outputs.push({
                name: `${name}_public_ip`,
                expression: `${tfType}.${name}.public_ip`,
            });
        }
        if (tfType === 'aws_vpc') {
            outputs.push({
                name: `${name}_id`,
                expression: `${tfType}.${name}.id`,
            });
        }
        if (tfType === 'aws_db_instance') {
            outputs.push({
                name: `${name}_endpoint`,
                expression: `${tfType}.${name}.endpoint`,
            });
        }
        return outputs;
    }
    topologicalSort(resources) {
        const inDegree = new Map();
        const adjacency = new Map();
        const resourceMap = new Map();
        for (const res of resources) {
            resourceMap.set(res.node.id, res);
            inDegree.set(res.node.id, 0);
            adjacency.set(res.node.id, []);
        }
        for (const res of resources) {
            for (const depId of res.dependsOn) {
                if (resourceMap.has(depId)) {
                    adjacency.get(depId).push(res.node.id);
                    inDegree.set(res.node.id, (inDegree.get(res.node.id) || 0) + 1);
                }
            }
        }
        const queue = [];
        for (const [id, degree] of inDegree) {
            if (degree === 0)
                queue.push(id);
        }
        const sorted = [];
        while (queue.length > 0) {
            const current = queue.shift();
            sorted.push(resourceMap.get(current));
            for (const neighbor of adjacency.get(current) || []) {
                const newDegree = (inDegree.get(neighbor) || 0) - 1;
                inDegree.set(neighbor, newDegree);
                if (newDegree === 0)
                    queue.push(neighbor);
            }
        }
        if (sorted.length !== resources.length) {
            const sortedIds = new Set(sorted.map((r) => r.node.id));
            for (const res of resources) {
                if (!sortedIds.has(res.node.id))
                    sorted.push(res);
            }
        }
        return sorted;
    }
    generateResourceBlock(resource, allResources) {
        const { terraformType, node, resolvedProperties, dependsOn } = resource;
        const name = this.sanitizeName(node.logicalName);
        const lines = [];
        lines.push(`resource "${terraformType}" "${name}" {`);
        for (const [key, value] of Object.entries(resolvedProperties)) {
            if (value === undefined || value === null)
                continue;
            lines.push(`  ${key} = ${this.hclValue(value)}`);
        }
        for (const depId of dependsOn) {
            const depResource = allResources.find((r) => r.node.id === depId);
            if (depResource) {
                const refAttr = this.inferReferenceAttribute(resource, depResource);
                if (refAttr) {
                    const depName = this.sanitizeName(depResource.node.logicalName);
                    lines.push(`  ${refAttr.property} = ${depResource.terraformType}.${depName}.${refAttr.attribute}`);
                }
            }
        }
        if (terraformType === 'aws_security_group') {
            const ingress = node.properties.ingressRules || [];
            const egress = node.properties.egressRules || [];
            for (const rule of ingress) {
                lines.push('');
                lines.push('  ingress {');
                lines.push(`    from_port   = ${rule.port ?? 0}`);
                lines.push(`    to_port     = ${rule.port ?? 0}`);
                lines.push(`    protocol    = "${rule.protocol ?? 'tcp'}"`);
                lines.push(`    cidr_blocks = [${this.hclValue(rule.source ?? '0.0.0.0/0')}]`);
                lines.push('  }');
            }
            for (const rule of egress) {
                lines.push('');
                lines.push('  egress {');
                lines.push(`    from_port   = ${rule.port ?? 0}`);
                lines.push(`    to_port     = ${rule.port ?? 0}`);
                lines.push(`    protocol    = "${rule.protocol ?? '-1'}"`);
                lines.push(`    cidr_blocks = [${this.hclValue(rule.source ?? '0.0.0.0/0')}]`);
                lines.push('  }');
            }
        }
        if (node.tags && Object.keys(node.tags).length > 0) {
            lines.push('');
            lines.push('  tags = {');
            for (const [k, v] of Object.entries(node.tags)) {
                lines.push(`    ${k} = "${v}"`);
            }
            lines.push('    ManagedBy = "archplatform"');
            lines.push('  }');
        }
        else {
            lines.push('');
            lines.push('  tags = {');
            lines.push(`    Name      = "${node.logicalName}"`);
            lines.push('    ManagedBy = "archplatform"');
            lines.push('  }');
        }
        lines.push('}');
        lines.push('');
        return lines.join('\n');
    }
    inferReferenceAttribute(child, parent) {
        const refMap = {
            aws_subnet: {
                aws_vpc: { property: 'vpc_id', attribute: 'id' },
            },
            aws_instance: {
                aws_subnet: { property: 'subnet_id', attribute: 'id' },
                aws_security_group: {
                    property: 'vpc_security_group_ids',
                    attribute: 'id',
                },
            },
            aws_security_group: {
                aws_vpc: { property: 'vpc_id', attribute: 'id' },
            },
            aws_internet_gateway: {
                aws_vpc: { property: 'vpc_id', attribute: 'id' },
            },
            aws_nat_gateway: {
                aws_subnet: { property: 'subnet_id', attribute: 'id' },
            },
            aws_route_table: {
                aws_vpc: { property: 'vpc_id', attribute: 'id' },
            },
            aws_db_instance: {
                aws_security_group: {
                    property: 'vpc_security_group_ids',
                    attribute: 'id',
                },
            },
            aws_lb: {
                aws_subnet: { property: 'subnets', attribute: 'id' },
                aws_security_group: {
                    property: 'security_groups',
                    attribute: 'id',
                },
            },
            google_compute_subnetwork: {
                google_compute_network: { property: 'network', attribute: 'id' },
            },
            google_compute_instance: {
                google_compute_subnetwork: {
                    property: 'subnetwork',
                    attribute: 'id',
                },
            },
        };
        return (refMap[child.terraformType]?.[parent.terraformType] ?? null);
    }
    generateProvider(provider) {
        const providers = {
            aws: `terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}`,
            gcp: `terraform {
  required_version = ">= 1.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}`,
            azure: `terraform {
  required_version = ">= 1.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}`,
        };
        return providers[provider] ?? providers['aws'];
    }
    generateVariables(provider) {
        const vars = {
            aws: `variable "aws_region" {
  description = "Région AWS pour le déploiement"
  type        = string
  default     = "eu-west-3"
}

variable "environment" {
  description = "Environnement de déploiement"
  type        = string
  default     = "production"
}`,
            gcp: `variable "gcp_project_id" {
  description = "ID du projet GCP"
  type        = string
}

variable "gcp_region" {
  description = "Région GCP"
  type        = string
  default     = "europe-west1"
}

variable "environment" {
  description = "Environnement de déploiement"
  type        = string
  default     = "production"
}`,
        };
        return vars[provider] ?? vars['aws'];
    }
    generateOutputs(resources) {
        const lines = [];
        for (const res of resources) {
            for (const output of res.outputs) {
                lines.push(`output "${output.name}" {`);
                lines.push(`  value = ${output.expression}`);
                lines.push('}');
                lines.push('');
            }
        }
        return lines.length > 0
            ? lines.join('\n')
            : '# No outputs generated';
    }
    hclValue(value) {
        if (typeof value === 'string')
            return `"${value}"`;
        if (typeof value === 'boolean')
            return value.toString();
        if (typeof value === 'number')
            return value.toString();
        if (Array.isArray(value))
            return `[${value.map((v) => this.hclValue(v)).join(', ')}]`;
        return JSON.stringify(value);
    }
    sanitizeName(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '_')
            .replace(/^_+|_+$/g, '')
            .replace(/_+/g, '_');
    }
};
exports.TerraformGeneratorService = TerraformGeneratorService;
exports.TerraformGeneratorService = TerraformGeneratorService = TerraformGeneratorService_1 = __decorate([
    (0, common_1.Injectable)()
], TerraformGeneratorService);
//# sourceMappingURL=terraform.generator.js.map