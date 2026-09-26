"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/@tootallnate";
exports.ids = ["vendor-chunks/@tootallnate"];
exports.modules = {

/***/ "(rsc)/./node_modules/@tootallnate/once/dist/index.js":
/*!******************************************************!*\
  !*** ./node_modules/@tootallnate/once/dist/index.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nfunction once(emitter, name, { signal } = {}) {\n    return new Promise((resolve, reject) => {\n        function cleanup() {\n            signal === null || signal === void 0 ? void 0 : signal.removeEventListener('abort', onAbort);\n            emitter.removeListener(name, onEvent);\n            emitter.removeListener('error', onError);\n        }\n        function onEvent(...args) {\n            cleanup();\n            resolve(args);\n        }\n        function onError(err) {\n            cleanup();\n            reject(err);\n        }\n        function onAbort() {\n            cleanup();\n            const err = new Error('The operation was aborted');\n            err.name = 'AbortError';\n            reject(err);\n        }\n        if (signal === null || signal === void 0 ? void 0 : signal.aborted) {\n            onAbort();\n            return;\n        }\n        signal === null || signal === void 0 ? void 0 : signal.addEventListener('abort', onAbort);\n        emitter.on(name, onEvent);\n        emitter.on('error', onError);\n    });\n}\nexports[\"default\"] = once;\n//# sourceMappingURL=index.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvQHRvb3RhbGxuYXRlL29uY2UvZGlzdC9pbmRleC5qcyIsIm1hcHBpbmdzIjoiQUFBYTtBQUNiLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCwrQkFBK0IsU0FBUyxJQUFJO0FBQzVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLGtCQUFlO0FBQ2YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9oYXphcmRodW50ZXJzLy4vbm9kZV9tb2R1bGVzL0B0b290YWxsbmF0ZS9vbmNlL2Rpc3QvaW5kZXguanM/MGQyYSJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmZ1bmN0aW9uIG9uY2UoZW1pdHRlciwgbmFtZSwgeyBzaWduYWwgfSA9IHt9KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgZnVuY3Rpb24gY2xlYW51cCgpIHtcbiAgICAgICAgICAgIHNpZ25hbCA9PT0gbnVsbCB8fCBzaWduYWwgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKCdhYm9ydCcsIG9uQWJvcnQpO1xuICAgICAgICAgICAgZW1pdHRlci5yZW1vdmVMaXN0ZW5lcihuYW1lLCBvbkV2ZW50KTtcbiAgICAgICAgICAgIGVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgb25FcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gb25FdmVudCguLi5hcmdzKSB7XG4gICAgICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgICAgICByZXNvbHZlKGFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIG9uRXJyb3IoZXJyKSB7XG4gICAgICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBvbkFib3J0KCkge1xuICAgICAgICAgICAgY2xlYW51cCgpO1xuICAgICAgICAgICAgY29uc3QgZXJyID0gbmV3IEVycm9yKCdUaGUgb3BlcmF0aW9uIHdhcyBhYm9ydGVkJyk7XG4gICAgICAgICAgICBlcnIubmFtZSA9ICdBYm9ydEVycm9yJztcbiAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzaWduYWwgPT09IG51bGwgfHwgc2lnbmFsID09PSB2b2lkIDAgPyB2b2lkIDAgOiBzaWduYWwuYWJvcnRlZCkge1xuICAgICAgICAgICAgb25BYm9ydCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNpZ25hbCA9PT0gbnVsbCB8fCBzaWduYWwgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHNpZ25hbC5hZGRFdmVudExpc3RlbmVyKCdhYm9ydCcsIG9uQWJvcnQpO1xuICAgICAgICBlbWl0dGVyLm9uKG5hbWUsIG9uRXZlbnQpO1xuICAgICAgICBlbWl0dGVyLm9uKCdlcnJvcicsIG9uRXJyb3IpO1xuICAgIH0pO1xufVxuZXhwb3J0cy5kZWZhdWx0ID0gb25jZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/@tootallnate/once/dist/index.js\n");

/***/ })

};
;