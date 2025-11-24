"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PuzzleService = void 0;
var common_1 = require("@nestjs/common");
var jigsaw_1 = require("./jigsaw");
var PuzzleService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var PuzzleService = _classThis = /** @class */ (function () {
        function PuzzleService_1() {
        }
        PuzzleService_1.prototype.createSession = function (sessionId, imageUrl, rows, cols) {
            if (rows === void 0) { rows = 6; }
            if (cols === void 0) { cols = 10; }
            // В реале подтяните width/height изображения (через probe) — здесь фиксируем для демо
            var width = 960;
            var height = 540;
            var stageWidth = 960;
            var stageHeight = 540 + 220;
            var seed = 42;
            var meta = { imageUrl: imageUrl, width: width, height: height, rows: rows, cols: cols, seed: seed, stageWidth: stageWidth, stageHeight: stageHeight };
            var pieces = (0, jigsaw_1.generateJigsaw)({ width: width, height: height, rows: rows, cols: cols, seed: seed }).pieces;
            var initial = pieces.map(function (p) {
                var targetX = p.bbox.x;
                var targetY = p.bbox.y;
                // Раскладываем низом под полотном (случайно по X)
                var currentX = Math.random() * (stageWidth - p.bbox.w);
                var currentY = height + 20 + Math.random() * (stageHeight - height - p.bbox.h - 30);
                return {
                    id: p.id,
                    row: p.row,
                    col: p.col,
                    targetX: targetX,
                    targetY: targetY,
                    rotation: 0,
                    currentX: currentX,
                    currentY: currentY,
                    currentRotation: 0,
                    placed: false,
                    path: p.path,
                    clipBBox: { x: p.bbox.x, y: p.bbox.y, w: p.bbox.w, h: p.bbox.h }
                };
            });
            return { meta: meta, pieces: initial };
        };
        return PuzzleService_1;
    }());
    __setFunctionName(_classThis, "PuzzleService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PuzzleService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PuzzleService = _classThis;
}();
exports.PuzzleService = PuzzleService;
