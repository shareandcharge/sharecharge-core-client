"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
class ErrorBridge {
    constructor() {
        this.autoStop = new rxjs_1.Subject();
        this.autoStop$ = this.autoStop.asObservable();
    }
    get name() {
        return this.constructor.name;
    }
    async health() {
        return true;
    }
    async start(parameters) {
        throw Error('Could not start');
    }
    async stop(parameters) {
        return { data: 50 };
    }
    async cdr(parameters) {
        return {
            price: 0
        };
    }
}
exports.default = ErrorBridge;
//# sourceMappingURL=ErrorBridge.js.map