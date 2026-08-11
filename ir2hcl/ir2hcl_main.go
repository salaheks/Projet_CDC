package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"regexp"
	"strings"

	"github.com/hashicorp/hcl/v2/hclwrite"
)

// IR types (minimal)
type Node struct {
	ID             string                 `json:"id"`
	Type           string                 `json:"type"`
	Provider       string                 `json:"provider,omitempty"`
	Meta           map[string]interface{} `json:"meta,omitempty"`
	Interfaces     []Interface            `json:"interfaces,omitempty"`
	SecurityGroups []string               `json:"security_groups,omitempty"`
}

type Interface struct {
	ID       string `json:"id"`
	SubnetID string `json:"subnet_id"`
	PrivateIP string `json:"private_ip,omitempty"`
}

type IR struct {
	Nodes []Node `json:"nodes"`
	Edges []Edge `json:"edges,omitempty"`
}

type Edge struct {
	ID   string `json:"id"`
	From string `json:"from"`
	To   string `json:"to"`
	Type string `json:"type"`
}

// sanitize a resource name to HCL label safe
func sanitizeName(s string) string {
	re := regexp.MustCompile(`[^a-zA-Z0-9_]`)
	return re.ReplaceAllString(strings.ReplaceAll(s, "-", "_"), "_")
}

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run main.go ir.json > main.tf")
		os.Exit(1)
	}
	raw, err := ioutil.ReadFile(os.Args[1])
	if err != nil {
		panic(err)
	}
	var ir IR
	if err := json.Unmarshal(raw, &ir); err != nil {
		panic(err)
	}

	f := hclwrite.NewEmptyFile()
	rootBody := f.Body()

	// provider stub
	rootBody.AppendNewline()
	rootBody.AppendUnstructuredTokens(hclwrite.TokensForIdentifier([]byte("// provider must be configured by user\n")))

	// map nodes by id for lookups
	nodes := map[string]Node{}
	for _, n := range ir.Nodes {
		nodes[n.ID] = n
	}

	for _, n := range ir.Nodes {
		switch n.Type {
		case "network.vpc":
			name := "vpc_" + sanitizeName(n.ID)
			b := rootBody.AppendNewBlock("resource", []string{"aws_vpc", name})
			bBody := b.Body()
			if cidr, ok := n.Meta["cidr"].(string); ok {
				bBody.SetAttributeRaw("cidr_block", []byte(fmt.Sprintf("%q", cidr)))
			}
			// tags
			if nm, ok := n.Meta["name"].(string); ok {
				bBody.SetAttributeRaw("tags", []byte(fmt.Sprintf("{ Name = %q }", nm)))
			}
			rootBody.AppendNewline()

		case "network.subnet":
			name := "subnet_" + sanitizeName(n.ID)
			b := rootBody.AppendNewBlock("resource", []string{"aws_subnet", name})
			bBody := b.Body()
			if cidr, ok := n.Meta["cidr"].(string); ok {
				bBody.SetAttributeRaw("cidr_block", []byte(fmt.Sprintf("%q", cidr)))
			}
			// vpc reference
			if vpcID, ok := n.Meta["vpc"].(string); ok {
				ref := fmt.Sprintf("${aws_vpc.vpc_%s.id}", sanitizeName(vpcID))
				bBody.SetAttributeRaw("vpc_id", []byte(ref))
			}
			rootBody.AppendNewline()

		case "security.group":
			name := "sg_" + sanitizeName(n.ID)
			b := rootBody.AppendNewBlock("resource", []string{"aws_security_group", name})
			bBody := b.Body()
			if nm, ok := n.Meta["name"].(string); ok {
				bBody.SetAttributeRaw("name", []byte(fmt.Sprintf("%q", nm)))
			}
			if desc, ok := n.Meta["description"].(string); ok {
				bBody.SetAttributeRaw("description", []byte(fmt.Sprintf("%q", desc)))
			}
			// ingress rules (array of maps expected)
			if rules, ok := n.Meta["ingress"].([]interface{}); ok {
				for _, r := range rules {
					if rm, ok := r.(map[string]interface{}); ok {
						ing := bBody.AppendNewBlock("ingress", nil)
						ib := ing.Body()
						if proto, ok := rm["proto"].(string); ok {
							ib.SetAttributeRaw("protocol", []byte(fmt.Sprintf("%q", proto)))
						}
						if port, ok := rm["port"].(float64); ok {
							ib.SetAttributeRaw("from_port", []byte(fmt.Sprintf("%d", int(port))))
							ib.SetAttributeRaw("to_port", []byte(fmt.Sprintf("%d", int(port))))
						}
						if cidr, ok := rm["cidr"].(string); ok {
							ib.SetAttributeRaw("cidr_blocks", []byte(fmt.Sprintf("[%q]", cidr)))
						}
					}
				}
			}
			rootBody.AppendNewline()

		case "compute.instance":
			name := "inst_" + sanitizeName(n.ID)
			b := rootBody.AppendNewBlock("resource", []string{"aws_instance", name})
			bBody := b.Body()
			if ami, ok := n.Meta["ami"].(string); ok {
				bBody.SetAttributeRaw("ami", []byte(fmt.Sprintf("%q", ami)))
			}
			if it, ok := n.Meta["instance_type"].(string); ok {
				bBody.SetAttributeRaw("instance_type", []byte(fmt.Sprintf("%q", it)))
			}
			// subnet reference from first interface
			if len(n.Interfaces) > 0 {
				sub := n.Interfaces[0].SubnetID
				ref := fmt.Sprintf("${aws_subnet.subnet_%s.id}", sanitizeName(sub))
				bBody.SetAttributeRaw("subnet_id", []byte(ref))
			}
			// security groups (by ids in SecurityGroups)
			if len(n.SecurityGroups) > 0 {
				refs := []string{}
				for _, sgid := range n.SecurityGroups {
					refs = append(refs, fmt.Sprintf("${aws_security_group.sg_%s.id}", sanitizeName(sgid)))
				}
				bBody.SetAttributeRaw("vpc_security_group_ids", []byte(fmt.Sprintf("[%s]", strings.Join(refs, ", "))))
			}
			rootBody.AppendNewline()
		default:
			// unknown types can be mapped later
		}
	}

	_, err = f.WriteTo(os.Stdout)
	if err != nil {
		panic(err)
	}
}
