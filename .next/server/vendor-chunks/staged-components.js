"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/staged-components";
exports.ids = ["vendor-chunks/staged-components"];
exports.modules = {

/***/ "(ssr)/./node_modules/staged-components/index.js":
/*!*************************************************!*\
  !*** ./node_modules/staged-components/index.js ***!
  \*************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nvar __importDefault = (this && this.__importDefault) || function (mod) {\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.staged = void 0;\nconst react_1 = __importDefault(__webpack_require__(/*! react */ \"(ssr)/./node_modules/next/dist/server/future/route-modules/app-page/vendored/ssr/react.js\"));\nfunction processNext(next) {\n    if (typeof next === 'function') {\n        return (react_1.default.createElement(Stage, { stage: next }));\n    }\n    else {\n        return next;\n    }\n}\nfunction Stage(props) {\n    const next = props.stage();\n    return processNext(next);\n}\nfunction staged(stage) {\n    return function Staged(props, ref) {\n        const next = stage(props, ref);\n        return processNext(next);\n    };\n}\nexports.staged = staged;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvc3RhZ2VkLWNvbXBvbmVudHMvaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQWE7QUFDYjtBQUNBLDZDQUE2QztBQUM3QztBQUNBLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCxjQUFjO0FBQ2QsZ0NBQWdDLG1CQUFPLENBQUMsd0dBQU87QUFDL0M7QUFDQTtBQUNBLHVEQUF1RCxhQUFhO0FBQ3BFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9tZXJpZGlhbi8uL25vZGVfbW9kdWxlcy9zdGFnZWQtY29tcG9uZW50cy9pbmRleC5qcz85ZTA1Il0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5zdGFnZWQgPSB2b2lkIDA7XG5jb25zdCByZWFjdF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJyZWFjdFwiKSk7XG5mdW5jdGlvbiBwcm9jZXNzTmV4dChuZXh0KSB7XG4gICAgaWYgKHR5cGVvZiBuZXh0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiAocmVhY3RfMS5kZWZhdWx0LmNyZWF0ZUVsZW1lbnQoU3RhZ2UsIHsgc3RhZ2U6IG5leHQgfSkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgfVxufVxuZnVuY3Rpb24gU3RhZ2UocHJvcHMpIHtcbiAgICBjb25zdCBuZXh0ID0gcHJvcHMuc3RhZ2UoKTtcbiAgICByZXR1cm4gcHJvY2Vzc05leHQobmV4dCk7XG59XG5mdW5jdGlvbiBzdGFnZWQoc3RhZ2UpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gU3RhZ2VkKHByb3BzLCByZWYpIHtcbiAgICAgICAgY29uc3QgbmV4dCA9IHN0YWdlKHByb3BzLCByZWYpO1xuICAgICAgICByZXR1cm4gcHJvY2Vzc05leHQobmV4dCk7XG4gICAgfTtcbn1cbmV4cG9ydHMuc3RhZ2VkID0gc3RhZ2VkO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/staged-components/index.js\n");

/***/ })

};
;