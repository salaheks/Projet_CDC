"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphController = void 0;
const common_1 = require("@nestjs/common");
const graph_service_1 = require("./graph.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let GraphController = class GraphController {
    graphService;
    constructor(graphService) {
        this.graphService = graphService;
    }
    getFullGraph(projectId, versionNum) {
        return this.graphService.getFullGraph(projectId, parseInt(versionNum, 10));
    }
    getNodes(versionId) {
        return this.graphService.getNodes(versionId);
    }
    addNode(versionId, body) {
        return this.graphService.addNode(versionId, body);
    }
    updateNode(nodeId, body) {
        return this.graphService.updateNode(nodeId, body);
    }
    deleteNode(nodeId) {
        return this.graphService.deleteNode(nodeId);
    }
    getEdges(versionId) {
        return this.graphService.getEdges(versionId);
    }
    addEdge(versionId, body) {
        return this.graphService.addEdge(versionId, body);
    }
    deleteEdge(edgeId) {
        return this.graphService.deleteEdge(edgeId);
    }
    syncGraph(versionId, payload) {
        return this.graphService.syncGraph(versionId, payload);
    }
};
exports.GraphController = GraphController;
__decorate([
    (0, common_1.Get)('project/:projectId/version/:versionNum'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('versionNum')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], GraphController.prototype, "getFullGraph", null);
__decorate([
    (0, common_1.Get)(':versionId/nodes'),
    __param(0, (0, common_1.Param)('versionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GraphController.prototype, "getNodes", null);
__decorate([
    (0, common_1.Post)(':versionId/nodes'),
    __param(0, (0, common_1.Param)('versionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], GraphController.prototype, "addNode", null);
__decorate([
    (0, common_1.Put)('nodes/:nodeId'),
    __param(0, (0, common_1.Param)('nodeId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], GraphController.prototype, "updateNode", null);
__decorate([
    (0, common_1.Delete)('nodes/:nodeId'),
    __param(0, (0, common_1.Param)('nodeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GraphController.prototype, "deleteNode", null);
__decorate([
    (0, common_1.Get)(':versionId/edges'),
    __param(0, (0, common_1.Param)('versionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GraphController.prototype, "getEdges", null);
__decorate([
    (0, common_1.Post)(':versionId/edges'),
    __param(0, (0, common_1.Param)('versionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], GraphController.prototype, "addEdge", null);
__decorate([
    (0, common_1.Delete)('edges/:edgeId'),
    __param(0, (0, common_1.Param)('edgeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GraphController.prototype, "deleteEdge", null);
__decorate([
    (0, common_1.Put)(':versionId/sync'),
    __param(0, (0, common_1.Param)('versionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], GraphController.prototype, "syncGraph", null);
exports.GraphController = GraphController = __decorate([
    (0, common_1.Controller)('graph'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [graph_service_1.GraphService])
], GraphController);
//# sourceMappingURL=graph.controller.js.map