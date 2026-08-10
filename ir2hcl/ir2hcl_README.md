Prototype IR → HCL (Go)

Usage:
1. Install dependencies: go mod tidy
2. Generate HCL: go run ir2hcl_main.go ir2hcl_ir.json > main.tf
3. Add provider block to main.tf, then terraform init && terraform plan

Notes:
- Minimal prototype using github.com/hashicorp/hcl/v2/hclwrite
- Filenames prefixed with ir2hcl_ to avoid polluting repo root; can be moved into a dedicated folder later.
