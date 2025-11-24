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
exports.PuzzleController = void 0;
const common_1 = require("@nestjs/common");
const puzzle_service_1 = require("./puzzle.service");
let PuzzleController = class PuzzleController {
    constructor(svc) {
        this.svc = svc;
    }
    getSession(id, img) {
        const imageUrl = img || 'http://localhost:3000/puzzle.jpg';
        return this.svc.createSession(id, imageUrl);
    }
};
exports.PuzzleController = PuzzleController;
__decorate([
    (0, common_1.Get)('session/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('img')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Object)
], PuzzleController.prototype, "getSession", null);
exports.PuzzleController = PuzzleController = __decorate([
    (0, common_1.Controller)('puzzle'),
    __metadata("design:paramtypes", [puzzle_service_1.PuzzleService])
], PuzzleController);
//# sourceMappingURL=puzzle.controller.js.map