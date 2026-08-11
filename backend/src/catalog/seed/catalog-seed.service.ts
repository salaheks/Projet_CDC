import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/** Seed data for the component catalog */
@Injectable()
export class CatalogSeedService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const count = await this.prisma.catalogCategory.count();
    if (count > 0) return; // Already seeded
    await this.seed();
  }

  async seed() {
    // ── Categories ──
    const categories = await Promise.all([
      this.prisma.catalogCategory.create({
        data: { name: 'Networking', icon: 'Network', sortOrder: 1 },
      }),
      this.prisma.catalogCategory.create({
        data: { name: 'Compute', icon: 'Server', sortOrder: 2 },
      }),
      this.prisma.catalogCategory.create({
        data: { name: 'Security', icon: 'Shield', sortOrder: 3 },
      }),
      this.prisma.catalogCategory.create({
        data: { name: 'Storage', icon: 'Database', sortOrder: 4 },
      }),
      this.prisma.catalogCategory.create({
        data: { name: 'Load Balancing', icon: 'GitBranch', sortOrder: 5 },
      }),
    ]);

    const [networking, compute, security, storage, loadBalancing] = categories;

    // ── AWS Components ──
    const awsComponents = [
      // Networking
      {
        categoryId: networking.id,
        name: 'VPC',
        type: 'vpc',
        provider: 'aws',
        description: 'Amazon Virtual Private Cloud — réseau isolé',
        icon: 'Cloud',
        propertySchema: JSON.stringify([
          { key: 'cidr', label: 'CIDR Block', type: 'cidr', required: true, placeholder: '10.0.0.0/16' },
          { key: 'dnsHostnames', label: 'DNS Hostnames', type: 'boolean', defaultValue: true },
          { key: 'dnsSupport', label: 'DNS Support', type: 'boolean', defaultValue: true },
        ]),
      },
      {
        categoryId: networking.id,
        name: 'Subnet',
        type: 'subnet',
        provider: 'aws',
        description: 'Sous-réseau dans un VPC',
        icon: 'LayoutGrid',
        propertySchema: JSON.stringify([
          { key: 'cidr', label: 'CIDR Block', type: 'cidr', required: true, placeholder: '10.0.1.0/24' },
          { key: 'az', label: 'Availability Zone', type: 'select', options: ['eu-west-3a', 'eu-west-3b', 'eu-west-3c'] },
          { key: 'isPublic', label: 'Public Subnet', type: 'boolean', defaultValue: false },
        ]),
      },
      {
        categoryId: networking.id,
        name: 'Internet Gateway',
        type: 'internet-gateway',
        provider: 'aws',
        description: 'Passerelle vers Internet',
        icon: 'Globe',
        propertySchema: JSON.stringify([]),
      },
      {
        categoryId: networking.id,
        name: 'NAT Gateway',
        type: 'nat-gateway',
        provider: 'aws',
        description: 'Passerelle NAT pour subnets privés',
        icon: 'ArrowUpDown',
        propertySchema: JSON.stringify([
          { key: 'allocateElasticIp', label: 'Elastic IP', type: 'boolean', defaultValue: true },
        ]),
      },
      {
        categoryId: networking.id,
        name: 'Route Table',
        type: 'route-table',
        provider: 'aws',
        description: 'Table de routage',
        icon: 'Route',
        propertySchema: JSON.stringify([]),
      },
      // Compute
      {
        categoryId: compute.id,
        name: 'EC2 Instance',
        type: 'virtual-machine',
        provider: 'aws',
        description: 'Machine virtuelle Elastic Compute Cloud',
        icon: 'Server',
        propertySchema: JSON.stringify([
          { key: 'instanceType', label: 'Type d\'instance', type: 'select', options: ['t3.micro', 't3.small', 't3.medium', 't3.large', 'm5.large', 'm5.xlarge', 'c5.large'], defaultValue: 't3.micro' },
          { key: 'ami', label: 'AMI ID', type: 'string', placeholder: 'ami-0c55b159cbfafe1f0' },
          { key: 'keyPair', label: 'Key Pair', type: 'string' },
          { key: 'os', label: 'Système d\'exploitation', type: 'select', options: ['Amazon Linux 2023', 'Ubuntu 22.04', 'Ubuntu 24.04', 'Windows Server 2022', 'Red Hat 9'] },
        ]),
      },
      {
        categoryId: compute.id,
        name: 'ECS Cluster',
        type: 'container-cluster',
        provider: 'aws',
        description: 'Cluster de conteneurs ECS',
        icon: 'Container',
        propertySchema: JSON.stringify([
          { key: 'capacityProvider', label: 'Capacity Provider', type: 'select', options: ['FARGATE', 'FARGATE_SPOT', 'EC2'] },
        ]),
      },
      {
        categoryId: compute.id,
        name: 'Lambda Function',
        type: 'serverless-function',
        provider: 'aws',
        description: 'Fonction serverless Lambda',
        icon: 'Zap',
        propertySchema: JSON.stringify([
          { key: 'runtime', label: 'Runtime', type: 'select', options: ['nodejs20.x', 'python3.12', 'java21', 'go1.x'] },
          { key: 'memory', label: 'Mémoire (MB)', type: 'number', min: 128, max: 10240, defaultValue: 256 },
          { key: 'timeout', label: 'Timeout (s)', type: 'number', min: 1, max: 900, defaultValue: 30 },
        ]),
      },
      // Security
      {
        categoryId: security.id,
        name: 'Security Group',
        type: 'security-group',
        provider: 'aws',
        description: 'Groupe de sécurité (firewall virtuel)',
        icon: 'Shield',
        propertySchema: JSON.stringify([
          { key: 'description', label: 'Description', type: 'string' },
        ]),
      },
      {
        categoryId: security.id,
        name: 'WAF',
        type: 'waf',
        provider: 'aws',
        description: 'Web Application Firewall',
        icon: 'ShieldCheck',
        propertySchema: JSON.stringify([
          { key: 'scope', label: 'Scope', type: 'select', options: ['REGIONAL', 'CLOUDFRONT'] },
        ]),
      },
      // Storage
      {
        categoryId: storage.id,
        name: 'RDS (PostgreSQL)',
        type: 'relational-database',
        provider: 'aws',
        description: 'Base de données relationnelle managée',
        icon: 'Database',
        propertySchema: JSON.stringify([
          { key: 'engine', label: 'Moteur', type: 'select', options: ['postgres', 'mysql', 'mariadb', 'oracle-ee', 'sqlserver-ee'], defaultValue: 'postgres' },
          { key: 'engineVersion', label: 'Version', type: 'string', defaultValue: '15.4' },
          { key: 'instanceClass', label: 'Classe', type: 'select', options: ['db.t3.micro', 'db.t3.small', 'db.t3.medium', 'db.r5.large'], defaultValue: 'db.t3.micro' },
          { key: 'storage', label: 'Stockage (Go)', type: 'number', min: 20, max: 65536, defaultValue: 20 },
          { key: 'dbName', label: 'Nom de la base', type: 'string' },
          { key: 'masterUsername', label: 'Utilisateur admin', type: 'string', defaultValue: 'admin' },
          { key: 'multiAz', label: 'Multi-AZ', type: 'boolean', defaultValue: false },
        ]),
      },
      {
        categoryId: storage.id,
        name: 'S3 Bucket',
        type: 'object-storage',
        provider: 'aws',
        description: 'Stockage objet S3',
        icon: 'FolderArchive',
        propertySchema: JSON.stringify([
          { key: 'versioning', label: 'Versioning', type: 'boolean', defaultValue: false },
          { key: 'encryption', label: 'Chiffrement', type: 'select', options: ['AES256', 'aws:kms'], defaultValue: 'AES256' },
        ]),
      },
      // Load Balancing
      {
        categoryId: loadBalancing.id,
        name: 'Application Load Balancer',
        type: 'load-balancer',
        provider: 'aws',
        description: 'Répartiteur de charge applicatif (L7)',
        icon: 'GitBranch',
        propertySchema: JSON.stringify([
          { key: 'scheme', label: 'Schéma', type: 'select', options: ['internet-facing', 'internal'], defaultValue: 'internet-facing' },
          { key: 'lbType', label: 'Type', type: 'select', options: ['application', 'network', 'gateway'], defaultValue: 'application' },
        ]),
      },
    ];

    // ── GCP Components ──
    const gcpComponents = [
      {
        categoryId: networking.id,
        name: 'VPC Network',
        type: 'vpc',
        provider: 'gcp',
        description: 'Google Cloud VPC Network',
        icon: 'Cloud',
        propertySchema: JSON.stringify([
          { key: 'autoCreateSubnetworks', label: 'Auto-create subnets', type: 'boolean', defaultValue: false },
          { key: 'routingMode', label: 'Routing Mode', type: 'select', options: ['REGIONAL', 'GLOBAL'], defaultValue: 'REGIONAL' },
        ]),
      },
      {
        categoryId: compute.id,
        name: 'Compute Engine VM',
        type: 'virtual-machine',
        provider: 'gcp',
        description: 'Machine virtuelle Compute Engine',
        icon: 'Server',
        propertySchema: JSON.stringify([
          { key: 'machineType', label: 'Type de machine', type: 'select', options: ['e2-micro', 'e2-small', 'e2-medium', 'n2-standard-2', 'n2-standard-4'] },
          { key: 'image', label: 'Image', type: 'string', placeholder: 'debian-cloud/debian-12' },
          { key: 'zone', label: 'Zone', type: 'select', options: ['europe-west1-b', 'europe-west1-c', 'us-central1-a'] },
        ]),
      },
      {
        categoryId: storage.id,
        name: 'Cloud SQL',
        type: 'relational-database',
        provider: 'gcp',
        description: 'Base de données relationnelle managée Google',
        icon: 'Database',
        propertySchema: JSON.stringify([
          { key: 'databaseVersion', label: 'Version', type: 'select', options: ['POSTGRES_15', 'POSTGRES_14', 'MYSQL_8_0'], defaultValue: 'POSTGRES_15' },
          { key: 'tier', label: 'Tier', type: 'select', options: ['db-f1-micro', 'db-g1-small', 'db-custom-2-4096'] },
        ]),
      },
      {
        categoryId: security.id,
        name: 'Firewall Rule',
        type: 'firewall',
        provider: 'gcp',
        description: 'Règle de pare-feu GCP',
        icon: 'Shield',
        propertySchema: JSON.stringify([
          { key: 'direction', label: 'Direction', type: 'select', options: ['INGRESS', 'EGRESS'], defaultValue: 'INGRESS' },
          { key: 'priority', label: 'Priorité', type: 'number', min: 0, max: 65535, defaultValue: 1000 },
        ]),
      },
    ];

    // ── On-Premise Components ──
    const onPremComponents = [
      {
        categoryId: networking.id,
        name: 'Routeur Physique',
        type: 'physical-router',
        provider: 'on-premise',
        description: 'Routeur réseau physique',
        icon: 'Router',
        propertySchema: JSON.stringify([
          { key: 'ip', label: 'Adresse IP', type: 'ip', required: true },
          { key: 'manufacturer', label: 'Constructeur', type: 'select', options: ['Cisco', 'Juniper', 'MikroTik', 'Ubiquiti'] },
          { key: 'model', label: 'Modèle', type: 'string' },
        ]),
      },
      {
        categoryId: networking.id,
        name: 'Switch L2/L3',
        type: 'physical-switch',
        provider: 'on-premise',
        description: 'Commutateur réseau physique',
        icon: 'SwitchCamera',
        propertySchema: JSON.stringify([
          { key: 'ip', label: 'Adresse IP', type: 'ip' },
          { key: 'vlan', label: 'VLAN ID', type: 'number', min: 1, max: 4094 },
          { key: 'ports', label: 'Nombre de ports', type: 'number', defaultValue: 24 },
        ]),
      },
      {
        categoryId: compute.id,
        name: 'Serveur Physique',
        type: 'physical-server',
        provider: 'on-premise',
        description: 'Serveur bare-metal',
        icon: 'Server',
        propertySchema: JSON.stringify([
          { key: 'ip', label: 'Adresse IP', type: 'ip', required: true },
          { key: 'cpu', label: 'CPU (cœurs)', type: 'number', min: 1, max: 128 },
          { key: 'ram', label: 'RAM (Go)', type: 'number', min: 1, max: 2048 },
          { key: 'os', label: 'Système', type: 'select', options: ['Ubuntu Server 24.04', 'RHEL 9', 'Windows Server 2022', 'Proxmox VE', 'ESXi 8'] },
        ]),
      },
      {
        categoryId: security.id,
        name: 'Firewall Physique',
        type: 'firewall',
        provider: 'on-premise',
        description: 'Pare-feu réseau physique (FortiGate, pfSense, etc.)',
        icon: 'ShieldCheck',
        propertySchema: JSON.stringify([
          { key: 'ip', label: 'Adresse IP', type: 'ip', required: true },
          { key: 'manufacturer', label: 'Constructeur', type: 'select', options: ['Fortinet', 'Palo Alto', 'pfSense', 'Sophos'] },
          { key: 'model', label: 'Modèle', type: 'string' },
        ]),
      },
    ];

    // Insert all components
    const allComponents = [...awsComponents, ...gcpComponents, ...onPremComponents];
    for (const comp of allComponents) {
      await this.prisma.catalogComponent.create({ data: comp });
    }

    console.log(`✅ Catalog seeded: ${categories.length} categories, ${allComponents.length} components`);
  }
}
