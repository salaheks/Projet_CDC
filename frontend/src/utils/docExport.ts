import { useEditorStore } from '../stores/editorStore';

export const exportDocumentationToMarkdown = (projectName: string) => {
  const { nodes, edges, reportSettings } = useEditorStore.getState();

  const date = new Date().toLocaleDateString('fr-FR');
  const clientName = reportSettings.clientName || 'Client';

  let markdown = `# Documentation Technique : ${projectName}\n\n`;
  markdown += `**Client** : ${clientName}\n`;
  markdown += `**Date** : ${date}\n\n`;
  markdown += `---\n\n`;

  // Inventory
  markdown += `## 1. Inventaire des Équipements\n\n`;
  
  if (nodes.length === 0) {
    markdown += `*Aucun équipement défini.*\n\n`;
  } else {
    markdown += `| ID | Nom | Type | Adresse IP | VLAN |\n`;
    markdown += `|---|---|---|---|---|\n`;
    
    nodes.forEach(node => {
      const type = node.data.type || 'Inconnu';
      const label = node.data.label || 'Sans nom';
      const ip = node.data.ip || '-';
      const vlan = node.data.vlan || '-';
      markdown += `| \`${node.id}\` | **${label}** | ${type} | ${ip} | ${vlan} |\n`;
    });
    markdown += `\n`;
  }

  // Connections
  markdown += `## 2. Topologie et Flux Réseau (Connexions)\n\n`;
  
  if (edges.length === 0) {
    markdown += `*Aucune connexion définie.*\n\n`;
  } else {
    markdown += `| Source | Destination | Type de lien | Nom du lien |\n`;
    markdown += `|---|---|---|---|\n`;
    
    edges.forEach(edge => {
      // Find source and target labels
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      const sourceLabel = sourceNode ? sourceNode.data.label : edge.source;
      const targetLabel = targetNode ? targetNode.data.label : edge.target;
      
      const linkType = edge.data?.type || 'Standard';
      const linkLabel = edge.label || '-';
      
      markdown += `| ${sourceLabel} | ${targetLabel} | ${linkType} | ${linkLabel} |\n`;
    });
    markdown += `\n`;
  }

  // Footer
  markdown += `---\n`;
  markdown += `*Généré automatiquement par ArchiFlow.*\n`;

  // Trigger download
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${projectName.replace(/\s+/g, '_')}_documentation.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
