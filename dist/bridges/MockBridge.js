"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
class MockBridge {
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
        const timeout = 1000 * 60 * 5;
        clearTimeout(this.autostopTimeout);
        this.autostopTimeout = setTimeout(() => this.autoStop.next(parameters), timeout);
        return {
            success: true,
            data: {
                sessionId: '0x01'
            }
        };
    }
    async stop(parameters) {
        clearTimeout(this.autostopTimeout);
        return {
            success: true,
            data: {}
        };
    }
    async cdr(parameters) {
        return {
            price: 100
        };
    }
}
exports.default = MockBridge;
//# sourceMappingURL=MockBridge.js.map