module.exports = {

"[project]/src/hooks/usePageBackground.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "usePageBackground": (()=>usePageBackground)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
function usePageBackground(imageUrl) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const body = document.body;
        body.style.backgroundImage = `url(${imageUrl})`;
        return ()=>{
        // Optional: Reset background when component unmounts
        // body.style.backgroundImage = '';
        };
    }, [
        imageUrl
    ]);
}
}}),
"[project]/src/components/ui/card.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "Card": (()=>Card),
    "CardContent": (()=>CardContent),
    "CardDescription": (()=>CardDescription),
    "CardFooter": (()=>CardFooter),
    "CardHeader": (()=>CardHeader),
    "CardTitle": (()=>CardTitle)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
;
;
;
const Card = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("rounded-lg border bg-card text-card-foreground shadow-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 9,
        columnNumber: 3
    }, this));
Card.displayName = "Card";
const CardHeader = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex flex-col space-y-1.5 p-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 24,
        columnNumber: 3
    }, this));
CardHeader.displayName = "CardHeader";
const CardTitle = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("text-2xl font-semibold leading-none tracking-tight", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 36,
        columnNumber: 3
    }, this));
CardTitle.displayName = "CardTitle";
const CardDescription = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("text-sm text-muted-foreground", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 51,
        columnNumber: 3
    }, this));
CardDescription.displayName = "CardDescription";
const CardContent = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("p-6 pt-0", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 63,
        columnNumber: 3
    }, this));
CardContent.displayName = "CardContent";
const CardFooter = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex items-center p-6 pt-0", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 71,
        columnNumber: 3
    }, this));
CardFooter.displayName = "CardFooter";
;
}}),
"[project]/src/components/ui/table.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "Table": (()=>Table),
    "TableBody": (()=>TableBody),
    "TableCaption": (()=>TableCaption),
    "TableCell": (()=>TableCell),
    "TableFooter": (()=>TableFooter),
    "TableHead": (()=>TableHead),
    "TableHeader": (()=>TableHeader),
    "TableRow": (()=>TableRow)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
;
;
;
const Table = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative w-full overflow-auto",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
            ref: ref,
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("w-full caption-bottom text-sm", className),
            ...props
        }, void 0, false, {
            fileName: "[project]/src/components/ui/table.tsx",
            lineNumber: 10,
            columnNumber: 5
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ui/table.tsx",
        lineNumber: 9,
        columnNumber: 3
    }, this));
Table.displayName = "Table";
const TableHeader = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("[&_tr]:border-b", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/table.tsx",
        lineNumber: 23,
        columnNumber: 3
    }, this));
TableHeader.displayName = "TableHeader";
const TableBody = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("[&_tr:last-child]:border-0", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/table.tsx",
        lineNumber: 31,
        columnNumber: 3
    }, this));
TableBody.displayName = "TableBody";
const TableFooter = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tfoot", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/table.tsx",
        lineNumber: 43,
        columnNumber: 3
    }, this));
TableFooter.displayName = "TableFooter";
const TableRow = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/table.tsx",
        lineNumber: 58,
        columnNumber: 3
    }, this));
TableRow.displayName = "TableRow";
const TableHead = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/table.tsx",
        lineNumber: 73,
        columnNumber: 3
    }, this));
TableHead.displayName = "TableHead";
const TableCell = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("p-4 align-middle [&:has([role=checkbox])]:pr-0", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/table.tsx",
        lineNumber: 88,
        columnNumber: 3
    }, this));
TableCell.displayName = "TableCell";
const TableCaption = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("caption", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("mt-4 text-sm text-muted-foreground", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/table.tsx",
        lineNumber: 100,
        columnNumber: 3
    }, this));
TableCaption.displayName = "TableCaption";
;
}}),
"[project]/src/lib/question-data/basic-addition.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "basicAdditionQuestions": (()=>basicAdditionQuestions)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/questions.ts [app-ssr] (ecmascript)");
;
const basicAdditionQuestions = {
    'basic-addition-plus-4': [
        {
            text: '1 + 1 + 2 + 4',
            answer: 8,
            options: []
        },
        {
            text: '2 + 2 - 3 + 4',
            answer: 5,
            options: []
        },
        {
            text: '3 + 4 + 2 - 9',
            answer: 0,
            options: []
        },
        {
            text: '3 + 5 - 5 + 4',
            answer: 7,
            options: []
        },
        {
            text: '9 - 4 + 3 - 5',
            answer: 3,
            options: []
        },
        {
            text: '1 + 2 - 1 + 4',
            answer: 6,
            options: []
        },
        {
            text: '7 - 5 + 2 + 4',
            answer: 8,
            options: []
        },
        {
            text: '2 + 4 + 3 - 1',
            answer: 8,
            options: []
        },
        {
            text: '1 + 1 + 1 + 4',
            answer: 7,
            options: []
        },
        {
            text: '2 - 2 + 3 + 4',
            answer: 7,
            options: []
        },
        {
            text: '1 + 3 + 4 - 5',
            answer: 3,
            options: []
        },
        {
            text: '69 - 5 + 4 - 3',
            answer: 65,
            options: []
        },
        {
            text: '5 + 3 - 7 + 4',
            answer: 5,
            options: []
        },
        {
            text: '3 + 4 - 2 - 5',
            answer: 0,
            options: []
        },
        {
            text: '2 + 4 + 1 + 1',
            answer: 8,
            options: []
        },
        {
            text: '14 + 4 - 3 + 1',
            answer: 16,
            options: []
        },
        {
            text: '55 - 5 + 3 + 4',
            answer: 57,
            options: []
        },
        {
            text: '12 + 4 - 5 + 3',
            answer: 14,
            options: []
        },
        {
            text: '21 + 4 + 4 - 9',
            answer: 20,
            options: []
        },
        {
            text: '2 + 2 + 4 - 3',
            answer: 5,
            options: []
        },
        {
            text: '37 - 6 + 4 + 3',
            answer: 38,
            options: []
        },
        {
            text: '22 + 4 + 3 - 8',
            answer: 21,
            options: []
        },
        {
            text: '99 - 5 + 4 - 6',
            answer: 92,
            options: []
        },
        {
            text: '53 + 4 + 1 - 2',
            answer: 56,
            options: []
        },
        {
            text: '63 + 4 - 2 + 4',
            answer: 69,
            options: []
        },
        {
            text: '67 - 1 - 5 + 4',
            answer: 65,
            options: []
        },
        {
            text: '56 - 6 + 4 + 4',
            answer: 58,
            options: []
        },
        {
            text: '17 - 6 + 4 + 4',
            answer: 19,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'basic-addition-plus-40': [
        {
            text: '20 + 20 + 40',
            answer: 80,
            options: []
        },
        {
            text: '30 + 40 + 10',
            answer: 80,
            options: []
        },
        {
            text: '90 - 70 + 40',
            answer: 60,
            options: []
        },
        {
            text: '80 - 60 + 40',
            answer: 60,
            options: []
        },
        {
            text: '60 - 50 + 40',
            answer: 50,
            options: []
        },
        {
            text: '30 + 10 + 40',
            answer: 80,
            options: []
        },
        {
            text: '10 + 20 + 40',
            answer: 70,
            options: []
        },
        {
            text: '40 + 40 + 10',
            answer: 90,
            options: []
        },
        {
            text: '10 + 40 + 30',
            answer: 80,
            options: []
        },
        {
            text: '20 - 10 + 40',
            answer: 50,
            options: []
        },
        {
            text: '50 - 50 + 40',
            answer: 40,
            options: []
        },
        {
            text: '70 - 60 + 40',
            answer: 50,
            options: []
        },
        {
            text: '10 + 40 + 40',
            answer: 90,
            options: []
        },
        {
            text: '30 - 10 + 40',
            answer: 60,
            options: []
        },
        {
            text: '40 - 30 + 40',
            answer: 50,
            options: []
        },
        {
            text: '12 + 34 + 43',
            answer: 89,
            options: []
        },
        {
            text: '33 - 11 + 24',
            answer: 46,
            options: []
        },
        {
            text: '25 + 42 + 22',
            answer: 89,
            options: []
        },
        {
            text: '43 + 44 - 52',
            answer: 35,
            options: []
        },
        {
            text: '53 + 34 - 65',
            answer: 22,
            options: []
        },
        {
            text: '76 - 55 + 24',
            answer: 45,
            options: []
        },
        {
            text: '21 + 54 - 20',
            answer: 55,
            options: []
        },
        {
            text: '82 - 32 + 44',
            answer: 94,
            options: []
        },
        {
            text: '65 - 15 + 37',
            answer: 87,
            options: []
        },
        {
            text: '91 + 4 - 75',
            answer: 20,
            options: []
        },
        {
            text: '34 + 44 - 57',
            answer: 21,
            options: []
        },
        {
            text: '99 - 88 + 44',
            answer: 55,
            options: []
        },
        {
            text: '29 - 15 + 34',
            answer: 48,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'basic-addition-plus-3': [
        {
            text: '8 - 5 + 4 + 2',
            answer: 9,
            options: []
        },
        {
            text: '8 - 5 + 3 + 3',
            answer: 9,
            options: []
        },
        {
            text: '4 + 3 - 6 + 4',
            answer: 5,
            options: []
        },
        {
            text: '2 + 2 + 3 - 2',
            answer: 5,
            options: []
        },
        {
            text: '7 - 6 + 4 - 5',
            answer: 0,
            options: []
        },
        {
            text: '5 + 3 - 6 + 3',
            answer: 5,
            options: []
        },
        {
            text: '3 + 3 + 3 - 6',
            answer: 3,
            options: []
        },
        {
            text: '6 - 5 + 4 + 3',
            answer: 8,
            options: []
        },
        {
            text: '2 + 1 + 3 + 2',
            answer: 8,
            options: []
        },
        {
            text: '3 + 4 - 5 + 3',
            answer: 5,
            options: []
        },
        {
            text: '9 - 5 + 3 - 2',
            answer: 5,
            options: []
        },
        {
            text: '7 + 2 - 7 + 3',
            answer: 5,
            options: []
        },
        {
            text: '4 - 2 + 3 + 4',
            answer: 9,
            options: []
        },
        {
            text: '2 - 2 + 3 + 3',
            answer: 6,
            options: []
        },
        {
            text: '2 + 3 - 5 + 7',
            answer: 7,
            options: []
        },
        {
            text: '57 - 7 + 2 + 3',
            answer: 55,
            options: []
        },
        {
            text: '78 - 7 + 4 + 4',
            answer: 79,
            options: []
        },
        {
            text: '29 - 2 + 5 - 3',
            answer: 29,
            options: []
        },
        {
            text: '34 + 4 - 6 + 3',
            answer: 35,
            options: []
        },
        {
            text: '13 + 3 - 5 + 3',
            answer: 14,
            options: []
        },
        {
            text: '33 + 3 - 1 + 4',
            answer: 39,
            options: []
        },
        {
            text: '53 + 3 - 5 + 4',
            answer: 55,
            options: []
        },
        {
            text: '22 + 4 - 5 + 4',
            answer: 25,
            options: []
        },
        {
            text: '23 + 3 - 6 + 7',
            answer: 27,
            options: []
        },
        {
            text: '24 + 4 - 6 + 3',
            answer: 25,
            options: []
        },
        {
            text: '55 - 5 + 2 + 3',
            answer: 55,
            options: []
        },
        {
            text: '12 + 3 + 4 - 2',
            answer: 17,
            options: []
        },
        {
            text: '67 - 5 + 3 + 2',
            answer: 67,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'basic-addition-plus-30': [
        {
            text: '20 + 30 + 20',
            answer: 70,
            options: []
        },
        {
            text: '60 - 50 + 40',
            answer: 50,
            options: []
        },
        {
            text: '90 - 60 + 30',
            answer: 60,
            options: []
        },
        {
            text: '80 - 60 + 30',
            answer: 50,
            options: []
        },
        {
            text: '40 + 30 + 10',
            answer: 80,
            options: []
        },
        {
            text: '30 + 30 + 30',
            answer: 90,
            options: []
        },
        {
            text: '10 + 10 + 30',
            answer: 50,
            options: []
        },
        {
            text: '30 + 10 + 40',
            answer: 80,
            options: []
        },
        {
            text: '40 - 10 + 30',
            answer: 60,
            options: []
        },
        {
            text: '20 + 20 + 40',
            answer: 80,
            options: []
        },
        {
            text: '20 + 20 + 30',
            answer: 70,
            options: []
        },
        {
            text: '80 - 50 + 30',
            answer: 60,
            options: []
        },
        {
            text: '90 - 70 + 40',
            answer: 60,
            options: []
        },
        {
            text: '40 + 30 - 20',
            answer: 50,
            options: []
        },
        {
            text: '40 - 20 + 30',
            answer: 50,
            options: []
        },
        {
            text: '32 + 34 - 55',
            answer: 11,
            options: []
        },
        {
            text: '67 - 52 + 34',
            answer: 49,
            options: []
        },
        {
            text: '58 - 55 + 23',
            answer: 26,
            options: []
        },
        {
            text: '42 + 43 - 75',
            answer: 10,
            options: []
        },
        {
            text: '20 + 43 + 23',
            answer: 86,
            options: []
        },
        {
            text: '33 + 33 + 33',
            answer: 99,
            options: []
        },
        {
            text: '34 + 43 - 11',
            answer: 66,
            options: []
        },
        {
            text: '86 - 55 + 34',
            answer: 65,
            options: []
        },
        {
            text: '32 + 32 - 53',
            answer: 11,
            options: []
        },
        {
            text: '88 - 66 + 34',
            answer: 56,
            options: []
        },
        {
            text: '11 + 22 + 34',
            answer: 67,
            options: []
        },
        {
            text: '47 - 15 + 43',
            answer: 75,
            options: []
        },
        {
            text: '24 - 12 + 43',
            answer: 55,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'basic-addition-plus-2': [
        {
            text: '5 - 5 + 4 + 2',
            answer: 6,
            options: []
        },
        {
            text: '4 + 2 + 3 - 9',
            answer: 0,
            options: []
        },
        {
            text: '3 + 2 - 5 + 2',
            answer: 2,
            options: []
        },
        {
            text: '8 - 5 + 2 + 1',
            answer: 6,
            options: []
        },
        {
            text: '7 + 2 - 5 + 3',
            answer: 7,
            options: []
        },
        {
            text: '2 + 2 + 4 - 6',
            answer: 2,
            options: []
        },
        {
            text: '9 - 7 + 2 + 3',
            answer: 7,
            options: []
        },
        {
            text: '1 + 6 - 5 + 3',
            answer: 5,
            options: []
        },
        {
            text: '6 + 3 - 6 + 2',
            answer: 5,
            options: []
        },
        {
            text: '9 - 8 + 2 + 2',
            answer: 5,
            options: []
        },
        {
            text: '5 + 4 - 5 + 4',
            answer: 8,
            options: []
        },
        {
            text: '8 - 7 + 3 + 2',
            answer: 6,
            options: []
        },
        {
            text: '2 + 2 + 2 - 6',
            answer: 0,
            options: []
        },
        {
            text: '6 + 3 - 5 + 3',
            answer: 7,
            options: []
        },
        {
            text: '5 + 4 - 6 + 4',
            answer: 7,
            options: []
        },
        {
            text: '43 + 2 - 5 + 9',
            answer: 49,
            options: []
        },
        {
            text: '52 + 2 + 2 - 6',
            answer: 50,
            options: []
        },
        {
            text: '71 + 8 - 5 + 2',
            answer: 76,
            options: []
        },
        {
            text: '27 - 6 + 3 + 4',
            answer: 28,
            options: []
        },
        {
            text: '93 + 3 - 9 + 2',
            answer: 89,
            options: []
        },
        {
            text: '18 - 7 + 1 + 2',
            answer: 14,
            options: []
        },
        {
            text: '22 + 2 + 2 - 5',
            answer: 21,
            options: []
        },
        {
            text: '11 + 3 + 2 - 6',
            answer: 10,
            options: []
        },
        {
            text: '82 + 1 + 2 + 4',
            answer: 89,
            options: []
        },
        {
            text: '63 + 6 - 8 + 4',
            answer: 65,
            options: []
        },
        {
            text: '24 + 3 - 7 + 9',
            answer: 29,
            options: []
        },
        {
            text: '29 - 6 + 2 + 1',
            answer: 26,
            options: []
        },
        {
            text: '73 + 2 + 3 - 7',
            answer: 71,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'basic-addition-plus-20': [
        {
            text: '20 + 20 + 20',
            answer: 60,
            options: []
        },
        {
            text: '70 + 20 - 40',
            answer: 50,
            options: []
        },
        {
            text: '30 + 20 - 50',
            answer: 0,
            options: []
        },
        {
            text: '90 - 70 + 20',
            answer: 40,
            options: []
        },
        {
            text: '30 + 20 + 10',
            answer: 60,
            options: []
        },
        {
            text: '80 - 50 + 20',
            answer: 50,
            options: []
        },
        {
            text: '10 + 30 + 20',
            answer: 60,
            options: []
        },
        {
            text: '40 - 10 + 30',
            answer: 60,
            options: []
        },
        {
            text: '90 - 60 + 20',
            answer: 50,
            options: []
        },
        {
            text: '40 + 40 - 10',
            answer: 70,
            options: []
        },
        {
            text: '40 - 10 + 20',
            answer: 50,
            options: []
        },
        {
            text: '50 - 50 + 40',
            answer: 40,
            options: []
        },
        {
            text: '30 + 20 + 40',
            answer: 90,
            options: []
        },
        {
            text: '20 + 10 + 20',
            answer: 50,
            options: []
        },
        {
            text: '20 + 30 + 20',
            answer: 70,
            options: []
        },
        {
            text: '47 - 15 + 23',
            answer: 55,
            options: []
        },
        {
            text: '99 - 55 + 22',
            answer: 66,
            options: []
        },
        {
            text: '34 + 43 - 11',
            answer: 66,
            options: []
        },
        {
            text: '12 + 31 + 42',
            answer: 85,
            options: []
        },
        {
            text: '76 - 55 + 24',
            answer: 45,
            options: []
        },
        {
            text: '49 - 15 + 24',
            answer: 58,
            options: []
        },
        {
            text: '22 + 22 + 22',
            answer: 66,
            options: []
        },
        {
            text: '32 + 34 - 55',
            answer: 11,
            options: []
        },
        {
            text: '27 + 22 + 20',
            answer: 69,
            options: []
        },
        {
            text: '87 - 56 + 24',
            answer: 55,
            options: []
        },
        {
            text: '97 - 52 + 42',
            answer: 87,
            options: []
        },
        {
            text: '88 - 55 + 22',
            answer: 55,
            options: []
        },
        {
            text: '19 + 30 + 20',
            answer: 69,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'basic-addition-plus-1': [
        {
            text: '3 + 6 - 5 + 1',
            answer: 5,
            options: []
        },
        {
            text: '9 - 5 + 1 + 3',
            answer: 8,
            options: []
        },
        {
            text: '2 + 3 - 5 + 9',
            answer: 9,
            options: []
        },
        {
            text: '5 + 2 - 6 + 4',
            answer: 5,
            options: []
        },
        {
            text: '4 + 1 + 3 - 5',
            answer: 3,
            options: []
        },
        {
            text: '3 + 2 - 5 + 7',
            answer: 7,
            options: []
        },
        {
            text: '9 - 5 + 1 + 1',
            answer: 6,
            options: []
        },
        {
            text: '2 + 2 + 1 + 4',
            answer: 9,
            options: []
        },
        {
            text: '4 + 1 + 3 - 8',
            answer: 0,
            options: []
        },
        {
            text: '7 - 5 + 2 + 1',
            answer: 5,
            options: []
        },
        {
            text: '1 + 8 - 5 + 1',
            answer: 5,
            options: []
        },
        {
            text: '8 - 5 + 2 + 4',
            answer: 9,
            options: []
        },
        {
            text: '4 + 1 + 4 - 9',
            answer: 0,
            options: []
        },
        {
            text: '3 - 3 + 4 + 1',
            answer: 5,
            options: []
        },
        {
            text: '6 - 5 + 4 + 4',
            answer: 9,
            options: []
        },
        {
            text: '33 - 3 + 4 + 1',
            answer: 35,
            options: []
        },
        {
            text: '26 - 5 + 3 + 1',
            answer: 25,
            options: []
        },
        {
            text: '71 + 5 - 5 + 4',
            answer: 75,
            options: []
        },
        {
            text: '54 + 0 + 1 + 3',
            answer: 58,
            options: []
        },
        {
            text: '55 - 5 + 4 + 1',
            answer: 55,
            options: []
        },
        {
            text: '63 + 2 + 4 - 9',
            answer: 60,
            options: []
        },
        {
            text: '86 + 3 - 5 + 1',
            answer: 85,
            options: []
        },
        {
            text: '93 + 2 + 4 - 1',
            answer: 98,
            options: []
        },
        {
            text: '11 + 2 + 1 + 1',
            answer: 15,
            options: []
        },
        {
            text: '77 - 6 + 3 + 4',
            answer: 78,
            options: []
        },
        {
            text: '22 + 2 + 1 + 4',
            answer: 29,
            options: []
        },
        {
            text: '89 - 6 + 2 - 5',
            answer: 80,
            options: []
        },
        {
            text: '44 + 1 - 5 + 5',
            answer: 45,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'basic-addition-plus-10': [
        {
            text: '80 - 50 + 10',
            answer: 40,
            options: []
        },
        {
            text: '40 + 10 - 50',
            answer: 0,
            options: []
        },
        {
            text: '90 - 70 + 40',
            answer: 60,
            options: []
        },
        {
            text: '40 + 10 + 40',
            answer: 90,
            options: []
        },
        {
            text: '40 + 10 + 20',
            answer: 70,
            options: []
        },
        {
            text: '10 + 30 + 20',
            answer: 60,
            options: []
        },
        {
            text: '40 + 10 + 10',
            answer: 60,
            options: []
        },
        {
            text: '30 + 10 + 50',
            answer: 90,
            options: []
        },
        {
            text: '20 + 30 + 20',
            answer: 70,
            options: []
        },
        {
            text: '20 + 20 + 10',
            answer: 50,
            options: []
        },
        {
            text: '10 + 30 + 10',
            answer: 50,
            options: []
        },
        {
            text: '40 + 40 - 10',
            answer: 70,
            options: []
        },
        {
            text: '90 - 50 + 10',
            answer: 50,
            options: []
        },
        {
            text: '40 + 10 + 30',
            answer: 80,
            options: []
        },
        {
            text: '90 - 60 + 20',
            answer: 50,
            options: []
        },
        {
            text: '44 + 11 + 33',
            answer: 88,
            options: []
        },
        {
            text: '99 - 55 + 11',
            answer: 55,
            options: []
        },
        {
            text: '32 + 34 - 55',
            answer: 11,
            options: []
        },
        {
            text: '49 - 25 + 21',
            answer: 45,
            options: []
        },
        {
            text: '97 - 52 + 12',
            answer: 57,
            options: []
        },
        {
            text: '53 + 44 - 52',
            answer: 45,
            options: []
        },
        {
            text: '97 - 55 + 11',
            answer: 53,
            options: []
        },
        {
            text: '47 - 15 + 24',
            answer: 56,
            options: []
        },
        {
            text: '33 + 11 + 11',
            answer: 55,
            options: []
        },
        {
            text: '99 - 75 + 21',
            answer: 45,
            options: []
        },
        {
            text: '38 + 11 - 33',
            answer: 16,
            options: []
        },
        {
            text: '34 + 44 - 57',
            answer: 21,
            options: []
        },
        {
            text: '74 + 21 - 40',
            answer: 55,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        }))
};
}}),
"[project]/src/lib/question-data/basic-subtraction.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "basicSubtractionQuestions": (()=>basicSubtractionQuestions)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/questions.ts [app-ssr] (ecmascript)");
;
const basicSubtractionQuestions = {
    'basic-subtraction-minus-4': [
        {
            text: '8 - 4 + 3 + 1',
            answer: 8,
            options: []
        },
        {
            text: '2 + 2 + 2 + 2',
            answer: 8,
            options: []
        },
        {
            text: '6 - 4 + 7 - 4',
            answer: 5,
            options: []
        },
        {
            text: '4 - 4 + 4 + 5',
            answer: 9,
            options: []
        },
        {
            text: '1 + 3 + 5 - 4',
            answer: 5,
            options: []
        },
        {
            text: '4 + 5 - 3 - 4',
            answer: 2,
            options: []
        },
        {
            text: '3 + 6 - 4 - 4',
            answer: 1,
            options: []
        },
        {
            text: '4 - 3 + 4 - 4',
            answer: 1,
            options: []
        },
        {
            text: '7 - 5 + 3 - 4',
            answer: 1,
            options: []
        },
        {
            text: '5 - 4 + 3 + 2',
            answer: 6,
            options: []
        },
        {
            text: '1 + 8 - 4 - 4',
            answer: 1,
            options: []
        },
        {
            text: '2 + 3 - 4 + 7',
            answer: 8,
            options: []
        },
        {
            text: '7 - 4 + 1 + 1',
            answer: 5,
            options: []
        },
        {
            text: '6 - 2 - 4 + 1',
            answer: 1,
            options: []
        },
        {
            text: '4 + 3 - 4 + 6',
            answer: 9,
            options: []
        },
        {
            text: '88 - 4 + 1 + 3',
            answer: 88,
            options: []
        },
        {
            text: '59 - 3 - 4 + 7',
            answer: 59,
            options: []
        },
        {
            text: '76 - 4 + 3 + 3',
            answer: 78,
            options: []
        },
        {
            text: '75 - 4 + 2 + 2',
            answer: 75,
            options: []
        },
        {
            text: '24 + 1 - 4 + 7',
            answer: 28,
            options: []
        },
        {
            text: '12 + 3 - 4 + 6',
            answer: 17,
            options: []
        },
        {
            text: '43 + 2 - 4 + 8',
            answer: 49,
            options: []
        },
        {
            text: '34 + 1 + 3 - 4',
            answer: 34,
            options: []
        },
        {
            text: '32 + 6 - 4 + 5',
            answer: 39,
            options: []
        },
        {
            text: '85 - 4 + 3 + 1',
            answer: 85,
            options: []
        },
        {
            text: '89 - 4 - 4 + 6',
            answer: 87,
            options: []
        },
        {
            text: '43 + 5 - 4 + 5',
            answer: 49,
            options: []
        },
        {
            text: '56 - 1 - 4 + 7',
            answer: 58,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'basic-subtraction-minus-40': [
        {
            text: '80 - 40 + 30',
            answer: 70,
            options: []
        },
        {
            text: '20 + 30 - 40',
            answer: 10,
            options: []
        },
        {
            text: '60 - 40 + 70',
            answer: 90,
            options: []
        },
        {
            text: '40 + 40 - 40',
            answer: 40,
            options: []
        },
        {
            text: '50 - 40 + 20',
            answer: 30,
            options: []
        },
        {
            text: '40 + 30 - 40',
            answer: 30,
            options: []
        },
        {
            text: '70 - 40 + 50',
            answer: 80,
            options: []
        },
        {
            text: '10 + 40 - 40',
            answer: 10,
            options: []
        },
        {
            text: '20 + 30 + 40',
            answer: 90,
            options: []
        },
        {
            text: '40 + 30 - 20',
            answer: 50,
            options: []
        },
        {
            text: '30 + 50 - 40',
            answer: 40,
            options: []
        },
        {
            text: '60 - 40 + 60',
            answer: 80,
            options: []
        },
        {
            text: '10 + 80 - 40',
            answer: 50,
            options: []
        },
        {
            text: '20 + 30 + 30',
            answer: 80,
            options: []
        },
        {
            text: '60 + 20 - 40',
            answer: 40,
            options: []
        },
        {
            text: '45 - 34 + 62',
            answer: 73,
            options: []
        },
        {
            text: '98 - 54 + 32',
            answer: 76,
            options: []
        },
        {
            text: '78 - 24 + 21',
            answer: 75,
            options: []
        },
        {
            text: '67 - 44 + 22',
            answer: 45,
            options: []
        },
        {
            text: '69 - 54 + 30',
            answer: 45,
            options: []
        },
        {
            text: '22 + 15 - 24',
            answer: 13,
            options: []
        },
        {
            text: '44 + 23 - 14',
            answer: 53,
            options: []
        },
        {
            text: '34 + 13 - 24',
            answer: 23,
            options: []
        },
        {
            text: '92 - 41 + 34',
            answer: 85,
            options: []
        },
        {
            text: '39 - 38 + 24',
            answer: 25,
            options: []
        },
        {
            text: '50 + 28 - 24',
            answer: 54,
            options: []
        },
        {
            text: '41 + 54 - 34',
            answer: 61,
            options: []
        },
        {
            text: '46 - 44 + 32',
            answer: 34,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'basic-subtraction-minus-3': [
        {
            text: '5 - 3 + 6 - 3',
            answer: 5,
            options: []
        },
        {
            text: '8 - 4 + 5 - 3',
            answer: 6,
            options: []
        },
        {
            text: '9 - 3 - 3 + 6',
            answer: 9,
            options: []
        },
        {
            text: '2 + 3 - 4 + 5',
            answer: 6,
            options: []
        },
        {
            text: '6 - 3 + 6 - 7',
            answer: 2,
            options: []
        },
        {
            text: '8 - 4 + 3 + 1',
            answer: 8,
            options: []
        },
        {
            text: '3 + 5 - 2 - 3',
            answer: 3,
            options: []
        },
        {
            text: '5 - 4 + 3 + 2',
            answer: 6,
            options: []
        },
        {
            text: '7 - 5 + 3 - 3',
            answer: 2,
            options: []
        },
        {
            text: '3 + 5 - 1 - 3',
            answer: 4,
            options: []
        },
        {
            text: '1 + 6 - 3 - 2',
            answer: 2,
            options: []
        },
        {
            text: '4 + 3 - 4 + 6',
            answer: 9,
            options: []
        },
        {
            text: '4 + 2 - 5 + 3',
            answer: 4,
            options: []
        },
        {
            text: '5 + 3 - 7 + 5',
            answer: 6,
            options: []
        },
        {
            text: '7 - 5 + 3 - 4',
            answer: 1,
            options: []
        },
        {
            text: '65 - 3 + 4 - 3',
            answer: 63,
            options: []
        },
        {
            text: '74 - 4 + 1 - 4',
            answer: 67,
            options: []
        },
        {
            text: '44 + 2 - 3 + 2',
            answer: 45,
            options: []
        },
        {
            text: '75 - 3 + 3 - 4',
            answer: 71,
            options: []
        },
        {
            text: '43 - 3 + 2 + 7',
            answer: 49,
            options: []
        },
        {
            text: '12 + 5 - 3 + 2',
            answer: 16,
            options: []
        },
        {
            text: '24 - 4 + 1 - 7',
            answer: 14,
            options: []
        },
        {
            text: '56 - 3 + 6 - 9',
            answer: 50,
            options: []
        },
        {
            text: '54 - 1 - 3 + 6',
            answer: 56,
            options: []
        },
        {
            text: '32 + 7 - 4 - 3',
            answer: 32,
            options: []
        },
        {
            text: '22 + 3 - 3 + 6',
            answer: 28,
            options: []
        },
        {
            text: '32 + 5 - 3 - 2',
            answer: 32,
            options: []
        },
        {
            text: '24 - 2 + 3 + 2',
            answer: 27,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'basic-subtraction-minus-30': [
        {
            text: '50 - 30 + 20',
            answer: 40,
            options: []
        },
        {
            text: '40 + 20 - 30',
            answer: 30,
            options: []
        },
        {
            text: '70 - 30 + 50',
            answer: 90,
            options: []
        },
        {
            text: '60 - 30 + 20',
            answer: 50,
            options: []
        },
        {
            text: '30 + 40 - 30',
            answer: 40,
            options: []
        },
        {
            text: '20 + 40 - 30',
            answer: 30,
            options: []
        },
        {
            text: '10 + 60 - 30',
            answer: 40,
            options: []
        },
        {
            text: '50 - 30 + 60',
            answer: 80,
            options: []
        },
        {
            text: '40 + 10 - 30',
            answer: 20,
            options: []
        },
        {
            text: '60 - 40 + 70',
            answer: 90,
            options: []
        },
        {
            text: '40 + 10 - 40',
            answer: 10,
            options: []
        },
        {
            text: '60 - 40 + 50',
            answer: 70,
            options: []
        },
        {
            text: '50 - 30 + 50',
            answer: 70,
            options: []
        },
        {
            text: '20 + 30 - 40',
            answer: 10,
            options: []
        },
        {
            text: '70 - 30 - 20',
            answer: 20,
            options: []
        },
        {
            text: '11 + 55 - 33',
            answer: 33,
            options: []
        },
        {
            text: '66 - 33 + 11',
            answer: 44,
            options: []
        },
        {
            text: '33 + 22 - 33',
            answer: 22,
            options: []
        },
        {
            text: '56 - 31 + 24',
            answer: 49,
            options: []
        },
        {
            text: '43 - 31 + 24',
            answer: 36,
            options: []
        },
        {
            text: '53 - 32 + 57',
            answer: 78,
            options: []
        },
        {
            text: '57 - 44 + 55',
            answer: 68,
            options: []
        },
        {
            text: '14 + 42 - 46',
            answer: 10,
            options: []
        },
        {
            text: '36 + 32 - 34',
            answer: 34,
            options: []
        },
        {
            text: '43 + 22 - 34',
            answer: 31,
            options: []
        },
        {
            text: '86 - 41 + 54',
            answer: 99,
            options: []
        },
        {
            text: '28 + 51 - 30',
            answer: 49,
            options: []
        },
        {
            text: '26 + 32 - 38',
            answer: 20,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'basic-subtraction-minus-2': [
        {
            text: '8 - 4 + 4 - 2',
            answer: 6,
            options: []
        },
        {
            text: '5 - 2 + 6 - 5',
            answer: 4,
            options: []
        },
        {
            text: '9 - 3 - 2 + 5',
            answer: 9,
            options: []
        },
        {
            text: '6 - 2 + 3 - 1',
            answer: 6,
            options: []
        },
        {
            text: '4 - 2 + 3 - 2',
            answer: 3,
            options: []
        },
        {
            text: '5 - 4 + 3 + 2',
            answer: 6,
            options: []
        },
        {
            text: '8 - 3 - 2 + 1',
            answer: 4,
            options: []
        },
        {
            text: '6 - 3 + 2 - 2',
            answer: 3,
            options: []
        },
        {
            text: '3 + 5 - 1 - 3',
            answer: 4,
            options: []
        },
        {
            text: '7 - 4 + 2 - 2',
            answer: 3,
            options: []
        },
        {
            text: '8 - 4 + 5 - 3',
            answer: 6,
            options: []
        },
        {
            text: '1 + 3 + 5 - 4',
            answer: 5,
            options: []
        },
        {
            text: '5 - 3 + 7 - 5',
            answer: 4,
            options: []
        },
        {
            text: '2 + 2 + 5 - 2',
            answer: 7,
            options: []
        },
        {
            text: '1 + 5 - 2 - 2',
            answer: 2,
            options: []
        },
        {
            text: '78 - 3 - 2 + 6',
            answer: 79,
            options: []
        },
        {
            text: '61 + 5 - 2 - 4',
            answer: 60,
            options: []
        },
        {
            text: '38 - 4 + 3 - 2',
            answer: 35,
            options: []
        },
        {
            text: '44 + 1 - 4 + 7',
            answer: 48,
            options: []
        },
        {
            text: '79 - 3 - 2 + 5',
            answer: 79,
            options: []
        },
        {
            text: '55 - 2 + 6 - 7',
            answer: 52,
            options: []
        },
        {
            text: '18 - 4 + 5 - 3',
            answer: 16,
            options: []
        },
        {
            text: '64 + 3 - 2 - 2',
            answer: 63,
            options: []
        },
        {
            text: '32 + 7 - 4 - 3',
            answer: 32,
            options: []
        },
        {
            text: '43 + 2 - 3 + 7',
            answer: 49,
            options: []
        },
        {
            text: '21 + 7 - 4 + 3',
            answer: 27,
            options: []
        },
        {
            text: '99 - 4 - 2 + 1',
            answer: 94,
            options: []
        },
        {
            text: '42 + 3 - 2 + 1',
            answer: 44,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'basic-subtraction-minus-20': [
        {
            text: '90 - 40 - 20',
            answer: 30,
            options: []
        },
        {
            text: '80 - 20 + 20',
            answer: 80,
            options: []
        },
        {
            text: '80 - 30 - 20',
            answer: 30,
            options: []
        },
        {
            text: '50 - 20 + 20',
            answer: 50,
            options: []
        },
        {
            text: '60 - 20 + 40',
            answer: 80,
            options: []
        },
        {
            text: '70 - 40 + 50',
            answer: 80,
            options: []
        },
        {
            text: '50 - 20 + 40',
            answer: 70,
            options: []
        },
        {
            text: '50 - 20 + 30',
            answer: 60,
            options: []
        },
        {
            text: '60 - 30 + 20',
            answer: 50,
            options: []
        },
        {
            text: '20 + 30 - 20',
            answer: 30,
            options: []
        },
        {
            text: '10 + 80 - 40',
            answer: 50,
            options: []
        },
        {
            text: '90 - 30 + 20',
            answer: 80,
            options: []
        },
        {
            text: '40 + 20 - 30',
            answer: 30,
            options: []
        },
        {
            text: '40 + 10 - 30',
            answer: 20,
            options: []
        },
        {
            text: '20 + 30 - 30',
            answer: 20,
            options: []
        },
        {
            text: '44 + 23 - 14',
            answer: 53,
            options: []
        },
        {
            text: '46 + 20 - 22',
            answer: 44,
            options: []
        },
        {
            text: '87 - 32 - 22',
            answer: 33,
            options: []
        },
        {
            text: '99 - 44 - 25',
            answer: 30,
            options: []
        },
        {
            text: '68 - 23 + 51',
            answer: 96,
            options: []
        },
        {
            text: '88 - 44 + 55',
            answer: 99,
            options: []
        },
        {
            text: '70 + 25 - 42',
            answer: 53,
            options: []
        },
        {
            text: '45 - 32 + 75',
            answer: 88,
            options: []
        },
        {
            text: '56 - 31 + 24',
            answer: 49,
            options: []
        },
        {
            text: '93 - 42 - 30',
            answer: 21,
            options: []
        },
        {
            text: '42 + 53 - 52',
            answer: 43,
            options: []
        },
        {
            text: '35 - 22 + 12',
            answer: 25,
            options: []
        },
        {
            text: '88 - 33 - 22',
            answer: 33,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'basic-subtraction-minus-1': [
        {
            text: '2 + 5 - 2 - 1',
            answer: 4,
            options: []
        },
        {
            text: '4 - 1 + 1 + 3',
            answer: 7,
            options: []
        },
        {
            text: '9 - 4 - 1 + 2',
            answer: 6,
            options: []
        },
        {
            text: '1 - 1 + 5 - 1',
            answer: 4,
            options: []
        },
        {
            text: '4 + 4 - 4 + 5',
            answer: 9,
            options: []
        },
        {
            text: '3 + 2 - 1 - 2',
            answer: 2,
            options: []
        },
        {
            text: '2 + 3 - 1 - 1',
            answer: 3,
            options: []
        },
        {
            text: '6 - 2 + 3 - 1',
            answer: 6,
            options: []
        },
        {
            text: '5 - 1 + 3 - 7',
            answer: 0,
            options: []
        },
        {
            text: '7 - 2 - 1 + 2',
            answer: 6,
            options: []
        },
        {
            text: '6 - 3 + 6 - 7',
            answer: 2,
            options: []
        },
        {
            text: '8 - 4 - 1 - 3',
            answer: 0,
            options: []
        },
        {
            text: '7 - 5 - 1 + 4',
            answer: 5,
            options: []
        },
        {
            text: '4 + 4 - 1 - 1',
            answer: 6,
            options: []
        },
        {
            text: '4 + 3 - 4 + 6',
            answer: 9,
            options: []
        },
        {
            text: '14 - 1 - 1 + 3',
            answer: 15,
            options: []
        },
        {
            text: '28 - 3 - 1 + 2',
            answer: 26,
            options: []
        },
        {
            text: '85 - 1 - 4 + 1',
            answer: 81,
            options: []
        },
        {
            text: '39 - 7 + 3 - 1',
            answer: 34,
            options: []
        },
        {
            text: '43 + 5 - 4 + 5',
            answer: 49,
            options: []
        },
        {
            text: '44 + 2 - 3 + 2',
            answer: 45,
            options: []
        },
        {
            text: '33 + 2 - 1 - 1',
            answer: 33,
            options: []
        },
        {
            text: '59 - 3 - 4 + 7',
            answer: 59,
            options: []
        },
        {
            text: '61 + 4 - 1 + 1',
            answer: 65,
            options: []
        },
        {
            text: '64 + 3 - 2 - 2',
            answer: 63,
            options: []
        },
        {
            text: '69 - 8 - 4 - 1',
            answer: 56,
            options: []
        },
        {
            text: '78 - 3 - 2 + 6',
            answer: 79,
            options: []
        },
        {
            text: '34 + 1 - 3 + 6',
            answer: 38,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'basic-subtraction-minus-10': [
        {
            text: '50 - 10 - 10',
            answer: 30,
            options: []
        },
        {
            text: '20 + 30 - 10',
            answer: 40,
            options: []
        },
        {
            text: '50 - 10 + 20',
            answer: 60,
            options: []
        },
        {
            text: '30 + 20 - 10',
            answer: 40,
            options: []
        },
        {
            text: '70 - 40 + 50',
            answer: 80,
            options: []
        },
        {
            text: '50 - 10 + 40',
            answer: 80,
            options: []
        },
        {
            text: '20 + 30 - 20',
            answer: 30,
            options: []
        },
        {
            text: '40 + 30 + 20',
            answer: 90,
            options: []
        },
        {
            text: '10 + 40 - 10',
            answer: 40,
            options: []
        },
        {
            text: '20 + 30 - 40',
            answer: 10,
            options: []
        },
        {
            text: '60 - 10 - 10',
            answer: 40,
            options: []
        },
        {
            text: '10 + 40 - 40',
            answer: 10,
            options: []
        },
        {
            text: '90 - 40 - 10',
            answer: 40,
            options: []
        },
        {
            text: '80 - 30 - 10',
            answer: 40,
            options: []
        },
        {
            text: '90 - 40 - 20',
            answer: 30,
            options: []
        },
        {
            text: '15 - 11 + 42',
            answer: 46,
            options: []
        },
        {
            text: '33 - 33 + 55',
            answer: 55,
            options: []
        },
        {
            text: '68 - 23 + 51',
            answer: 96,
            options: []
        },
        {
            text: '23 + 32 - 11',
            answer: 44,
            options: []
        },
        {
            text: '69 - 54 - 11',
            answer: 4,
            options: []
        },
        {
            text: '67 - 12 - 13',
            answer: 42,
            options: []
        },
        {
            text: '42 + 53 - 52',
            answer: 43,
            options: []
        },
        {
            text: '35 - 21 + 32',
            answer: 46,
            options: []
        },
        {
            text: '77 - 22 - 31',
            answer: 24,
            options: []
        },
        {
            text: '56 - 31 + 24',
            answer: 49,
            options: []
        },
        {
            text: '25 - 11 + 55',
            answer: 69,
            options: []
        },
        {
            text: '93 - 43 + 12',
            answer: 62,
            options: []
        },
        {
            text: '22 + 15 - 24',
            answer: 13,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        }))
};
}}),
"[project]/src/lib/question-data/big-brother-addition.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "bigBrotherAdditionQuestions": (()=>bigBrotherAdditionQuestions)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/questions.ts [app-ssr] (ecmascript)");
;
const bigBrotherAdditionQuestions = {
    'big-brother-addition-plus-9': [
        {
            text: '9 + 9 + 9 - 2',
            answer: 25,
            options: []
        },
        {
            text: '3 + 2 - 5 + 9',
            answer: 9,
            options: []
        },
        {
            text: '+2 + 4 + 9 - 2',
            answer: 13,
            options: []
        },
        {
            text: '5 + 4 + 9 + 9',
            answer: 27,
            options: []
        },
        {
            text: '1 + 5 - 3 + 9',
            answer: 12,
            options: []
        },
        {
            text: '4 + 2 + 9 - 1',
            answer: 14,
            options: []
        },
        {
            text: '+3 - 3 + 9 - 9',
            answer: 0,
            options: []
        },
        {
            text: '2 + 3 - 1 + 9',
            answer: 13,
            options: []
        },
        {
            text: '6 + 9 - 4 + 9',
            answer: 20,
            options: []
        },
        {
            text: '9 - 4 - 3 + 9',
            answer: 11,
            options: []
        },
        {
            text: '+7 + 9 + 9 - 1',
            answer: 24,
            options: []
        },
        {
            text: '5 - 3 + 9 + 3',
            answer: 14,
            options: []
        },
        {
            text: '8 + 9 + 9 + 9',
            answer: 35,
            options: []
        },
        {
            text: '5 + 4 + 9 + 9',
            answer: 27,
            options: []
        },
        {
            text: '4 + 9 + 2 - 1',
            answer: 14,
            options: []
        },
        {
            text: '10 + 9 + 9 + 9',
            answer: 37,
            options: []
        },
        {
            text: '67 + 9 - 3 + 9',
            answer: 82,
            options: []
        },
        {
            text: '28 - 3 + 4 + 9',
            answer: 38,
            options: []
        },
        {
            text: '47 + 2 + 9 - 8',
            answer: 50,
            options: []
        },
        {
            text: '88 + 9 - 7 + 9',
            answer: 99,
            options: []
        },
        {
            text: '99 - 9 + 5 + 4',
            answer: 99,
            options: []
        },
        {
            text: '70 + 2 + 3 + 4',
            answer: 79,
            options: []
        },
        {
            text: '50 + 5 + 3 + 9',
            answer: 67,
            options: []
        },
        {
            text: '38 + 9 - 3 - 4',
            answer: 40,
            options: []
        },
        {
            text: '22 + 9 + 9 + 9',
            answer: 49,
            options: []
        },
        {
            text: '75 + 4 + 9 - 7',
            answer: 81,
            options: []
        },
        {
            text: '66 + 3 - 9 + 9',
            answer: 69,
            options: []
        },
        {
            text: '12 + 2 + 4 + 9',
            answer: 27,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-addition-plus-90': [
        {
            text: '10 + 90 + 22',
            answer: 122,
            options: []
        },
        {
            text: '40 + 90 + 90',
            answer: 220,
            options: []
        },
        {
            text: '47 + 9 + 40',
            answer: 96,
            options: []
        },
        {
            text: '97 - 80 + 90',
            answer: 107,
            options: []
        },
        {
            text: '45 + 90 + 90',
            answer: 225,
            options: []
        },
        {
            text: '32 + 20 - 31',
            answer: 21,
            options: []
        },
        {
            text: '85 - 45 + 90',
            answer: 130,
            options: []
        },
        {
            text: '99 + 90 - 30',
            answer: 159,
            options: []
        },
        {
            text: '21 + 90 - 10',
            answer: 101,
            options: []
        },
        {
            text: '67 + 92 + 40',
            answer: 199,
            options: []
        },
        {
            text: '91 + 92 - 82',
            answer: 101,
            options: []
        },
        {
            text: '25 + 54 + 99',
            answer: 178,
            options: []
        },
        {
            text: '64 + 29 + 90',
            answer: 183,
            options: []
        },
        {
            text: '15 + 90 + 94',
            answer: 199,
            options: []
        },
        {
            text: '92 + 91 + 92',
            answer: 275,
            options: []
        },
        {
            text: '40 + 59 + 99',
            answer: 198,
            options: []
        },
        {
            text: '82 + 90 + 97',
            answer: 269,
            options: []
        },
        {
            text: '14 + 90 + 55',
            answer: 159,
            options: []
        },
        {
            text: '93 + 91 - 34',
            answer: 150,
            options: []
        },
        {
            text: '46 + 93 + 20',
            answer: 159,
            options: []
        },
        {
            text: '49 - 9 + 10',
            answer: 50,
            options: []
        },
        {
            text: '58 + 41 + 90',
            answer: 189,
            options: []
        },
        {
            text: '29 + 90 - 9',
            answer: 110,
            options: []
        },
        {
            text: '30 + 50 - 40',
            answer: 40,
            options: []
        },
        {
            text: '94 + 95 - 84',
            answer: 105,
            options: []
        },
        {
            text: '59 - 28 + 33',
            answer: 64,
            options: []
        },
        {
            text: '28 + 71 + 99',
            answer: 198,
            options: []
        },
        {
            text: '45 + 54 + 99',
            answer: 198,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-addition-plus-8': [
        {
            text: '3 + 8 + 5 - 2',
            answer: 14,
            options: []
        },
        {
            text: '1 + 8 + 8 - 7',
            answer: 10,
            options: []
        },
        {
            text: '4 + 2 + 3 + 8',
            answer: 17,
            options: []
        },
        {
            text: '5 + 4 + 8 - 3',
            answer: 14,
            options: []
        },
        {
            text: '6 + 2 + 8 - 5',
            answer: 11,
            options: []
        },
        {
            text: '9 + 8 - 7 + 8',
            answer: 18,
            options: []
        },
        {
            text: '2 + 8 + 6 - 2',
            answer: 14,
            options: []
        },
        {
            text: '7 + 8 + 4 + 8',
            answer: 27,
            options: []
        },
        {
            text: '3 + 5 + 8 - 1',
            answer: 15,
            options: []
        },
        {
            text: '8 + 8 - 5 + 8',
            answer: 19,
            options: []
        },
        {
            text: '2 + 7 + 8 + 8',
            answer: 25,
            options: []
        },
        {
            text: '6 + 3 + 8 - 3',
            answer: 14,
            options: []
        },
        {
            text: '9 + 2 + 8 + 3',
            answer: 22,
            options: []
        },
        {
            text: '4 + 8 + 3 - 5',
            answer: 10,
            options: []
        },
        {
            text: '1 + 7 + 8 - 1',
            answer: 15,
            options: []
        },
        {
            text: '66 + 3 + 8 + 8',
            answer: 85,
            options: []
        },
        {
            text: '78 + 8 - 3 + 8',
            answer: 91,
            options: []
        },
        {
            text: '72 + 8 + 8 - 8',
            answer: 80,
            options: []
        },
        {
            text: '34 + 4 + 8 - 3',
            answer: 43,
            options: []
        },
        {
            text: '33 + 3 - 6 + 8',
            answer: 38,
            options: []
        },
        {
            text: '79 + 8 - 7 + 4',
            answer: 84,
            options: []
        },
        {
            text: '67 + 8 - 3 + 4',
            answer: 76,
            options: []
        },
        {
            text: '28 + 7 - 3 + 8',
            answer: 40,
            options: []
        },
        {
            text: '48 + 8 + 9 - 2',
            answer: 63,
            options: []
        },
        {
            text: '57 + 9 + 3 + 8',
            answer: 77,
            options: []
        },
        {
            text: '32 + 8 + 9 + 9',
            answer: 58,
            options: []
        },
        {
            text: '89 + 8 - 7 + 9',
            answer: 99,
            options: []
        },
        {
            text: '51 + 9 + 3 + 8',
            answer: 71,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-addition-plus-80': [
        {
            text: '52 + 31 + 80',
            answer: 163,
            options: []
        },
        {
            text: '35 + 84 + 40',
            answer: 159,
            options: []
        },
        {
            text: '62 + 92 - 31',
            answer: 123,
            options: []
        },
        {
            text: '21 + 33 + 45',
            answer: 99,
            options: []
        },
        {
            text: '64 + 15 + 80',
            answer: 159,
            options: []
        },
        {
            text: '88 - 33 + 24',
            answer: 79,
            options: []
        },
        {
            text: '23 + 82 + 74',
            answer: 179,
            options: []
        },
        {
            text: '34 + 81 + 62',
            answer: 177,
            options: []
        },
        {
            text: '14 + 41 + 24',
            answer: 79,
            options: []
        },
        {
            text: '59 + 29 + 81',
            answer: 169,
            options: []
        },
        {
            text: '24 + 31 + 43',
            answer: 98,
            options: []
        },
        {
            text: '35 + 92 + 88',
            answer: 215,
            options: []
        },
        {
            text: '12 + 98 + 72',
            answer: 182,
            options: []
        },
        {
            text: '58 - 23 + 83',
            answer: 118,
            options: []
        },
        {
            text: '52 + 32 + 83',
            answer: 167,
            options: []
        },
        {
            text: '24 + 88 + 92',
            answer: 204,
            options: []
        },
        {
            text: '60 + 99 + 30',
            answer: 189,
            options: []
        },
        {
            text: '59 + 29 + 88',
            answer: 176,
            options: []
        },
        {
            text: '30 + 24 - 41',
            answer: 13,
            options: []
        },
        {
            text: '63 + 22 + 83',
            answer: 168,
            options: []
        },
        {
            text: '14 + 82 - 86',
            answer: 10,
            options: []
        },
        {
            text: '65 - 11 - 22',
            answer: 32,
            options: []
        },
        {
            text: '27 + 88 + 82',
            answer: 197,
            options: []
        },
        {
            text: '34 + 31 - 15',
            answer: 50,
            options: []
        },
        {
            text: '84 + 89 - 33',
            answer: 140,
            options: []
        },
        {
            text: '13 + 99 + 82',
            answer: 194,
            options: []
        },
        {
            text: '73 + 88 - 41',
            answer: 120,
            options: []
        },
        {
            text: '36 + 81 + 98',
            answer: 215,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-addition-plus-7': [
        {
            text: '3 + 7 + 4 + 1',
            answer: 15,
            options: []
        },
        {
            text: '2 + 7 - 5 + 7',
            answer: 11,
            options: []
        },
        {
            text: '6 + 2 + 7 - 3',
            answer: 12,
            options: []
        },
        {
            text: '1 + 8 + 7 - 1',
            answer: 15,
            options: []
        },
        {
            text: '4 + 3 + 2 + 7',
            answer: 16,
            options: []
        },
        {
            text: '8 + 7 - 1 + 7',
            answer: 21,
            options: []
        },
        {
            text: '7 - 3 + 4 + 7',
            answer: 15,
            options: []
        },
        {
            text: '3 + 5 + 7 + 4',
            answer: 19,
            options: []
        },
        {
            text: '9 - 5 + 2 + 3',
            answer: 9,
            options: []
        },
        {
            text: '1 + 4 + 4 + 7',
            answer: 16,
            options: []
        },
        {
            text: '2 + 3 + 3 + 7',
            answer: 15,
            options: []
        },
        {
            text: '4 + 2 + 2 + 7',
            answer: 15,
            options: []
        },
        {
            text: '6 - 2 + 7 - 1',
            answer: 10,
            options: []
        },
        {
            text: '8 + 8 + 9 + 4',
            answer: 29,
            options: []
        },
        {
            text: '9 + 7 + 2 + 8',
            answer: 26,
            options: []
        },
        {
            text: '14 + 1 + 4 + 7',
            answer: 26,
            options: []
        },
        {
            text: '91 + 4 - 2 + 3',
            answer: 96,
            options: []
        },
        {
            text: '23 + 2 - 1 + 9',
            answer: 33,
            options: []
        },
        {
            text: '86 + 3 + 7 - 6',
            answer: 90,
            options: []
        },
        {
            text: '34 + 5 + 9 + 8',
            answer: 56,
            options: []
        },
        {
            text: '72 + 8 + 9 + 7',
            answer: 96,
            options: []
        },
        {
            text: '44 + 5 - 6 + 7',
            answer: 50,
            options: []
        },
        {
            text: '61 + 4 - 1 + 7',
            answer: 71,
            options: []
        },
        {
            text: '56 - 2 + 7 + 4',
            answer: 65,
            options: []
        },
        {
            text: '17 + 8 + 4 + 9',
            answer: 38,
            options: []
        },
        {
            text: '69 + 8 - 7 + 7',
            answer: 77,
            options: []
        },
        {
            text: '23 + 2 + 3 + 7',
            answer: 35,
            options: []
        },
        {
            text: '72 + 3 - 2 + 7',
            answer: 80,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-addition-plus-70': [
        {
            text: '81 + 73 - 52',
            answer: 102,
            options: []
        },
        {
            text: '65 + 24 + 79',
            answer: 168,
            options: []
        },
        {
            text: '32 - 22 + 79',
            answer: 89,
            options: []
        },
        {
            text: '55 + 32 + 72',
            answer: 159,
            options: []
        },
        {
            text: '62 - 61 + 90',
            answer: 91,
            options: []
        },
        {
            text: '70 + 24 + 75',
            answer: 169,
            options: []
        },
        {
            text: '12 + 20 + 72',
            answer: 104,
            options: []
        },
        {
            text: '44 + 77 - 11',
            answer: 110,
            options: []
        },
        {
            text: '68 + 31 + 70',
            answer: 169,
            options: []
        },
        {
            text: '79 - 78 + 72',
            answer: 73,
            options: []
        },
        {
            text: '90 + 72 - 50',
            answer: 112,
            options: []
        },
        {
            text: '30 + 10 + 79',
            answer: 119,
            options: []
        },
        {
            text: '99 + 77 - 65',
            answer: 111,
            options: []
        },
        {
            text: '10 + 83 + 71',
            answer: 164,
            options: []
        },
        {
            text: '23 - 21 + 75',
            answer: 77,
            options: []
        },
        {
            text: '24 + 15 + 70',
            answer: 109,
            options: []
        },
        {
            text: '88 + 77 - 54',
            answer: 111,
            options: []
        },
        {
            text: '57 + 38 + 74',
            answer: 169,
            options: []
        },
        {
            text: '62 - 52 + 34',
            answer: 44,
            options: []
        },
        {
            text: '75 - 44 + 74',
            answer: 105,
            options: []
        },
        {
            text: '20 + 14 + 71',
            answer: 105,
            options: []
        },
        {
            text: '84 + 73 - 41',
            answer: 116,
            options: []
        },
        {
            text: '33 + 77 + 74',
            answer: 184,
            options: []
        },
        {
            text: '70 + 19 + 70',
            answer: 159,
            options: []
        },
        {
            text: '59 - 23 + 72',
            answer: 108,
            options: []
        },
        {
            text: '81 - 41 + 78',
            answer: 118,
            options: []
        },
        {
            text: '77 - 41 + 73',
            answer: 109,
            options: []
        },
        {
            text: '16 + 73 + 78',
            answer: 167,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-addition-plus-6': [
        {
            text: '7 + 8 + 4 + 6',
            answer: 25,
            options: []
        },
        {
            text: '4 + 6 - 5 + 5',
            answer: 10,
            options: []
        },
        {
            text: '8 + 9 + 2 + 6',
            answer: 25,
            options: []
        },
        {
            text: '2 + 3 + 4 + 6',
            answer: 15,
            options: []
        },
        {
            text: '9 + 8 + 9 + 3',
            answer: 29,
            options: []
        },
        {
            text: '3 + 1 + 6 + 4',
            answer: 14,
            options: []
        },
        {
            text: '1 + 9 + 4 + 6',
            answer: 20,
            options: []
        },
        {
            text: '6 - 1 + 4 + 6',
            answer: 15,
            options: []
        },
        {
            text: '8 + 1 - 5 + 6',
            answer: 10,
            options: []
        },
        {
            text: '2 + 7 + 6 - 3',
            answer: 12,
            options: []
        },
        {
            text: '3 + 2 + 4 + 6',
            answer: 15,
            options: []
        },
        {
            text: '9 + 6 - 1 + 6',
            answer: 20,
            options: []
        },
        {
            text: '5 - 4 + 3 + 6',
            answer: 10,
            options: []
        },
        {
            text: '4 + 6 + 9 - 8',
            answer: 11,
            options: []
        },
        {
            text: '6 + 9 - 1 + 6',
            answer: 20,
            options: []
        },
        {
            text: '15 + 4 + 6 - 1',
            answer: 24,
            options: []
        },
        {
            text: '22 + 3 + 4 - 4',
            answer: 25,
            options: []
        },
        {
            text: '34 + 6 + 9 - 8',
            answer: 41,
            options: []
        },
        {
            text: '49 + 6 - 1 + 6',
            answer: 60,
            options: []
        },
        {
            text: '57 + 8 + 4 + 6',
            answer: 75,
            options: []
        },
        {
            text: '65 + 4 + 6 - 1',
            answer: 74,
            options: []
        },
        {
            text: '79 + 8 + 2 + 6',
            answer: 95,
            options: []
        },
        {
            text: '88 - 8 + 4 + 6',
            answer: 90,
            options: []
        },
        {
            text: '62 + 8 + 6 - 4',
            answer: 72,
            options: []
        },
        {
            text: '14 + 6 + 5 - 4',
            answer: 21,
            options: []
        },
        {
            text: '27 + 9 - 5 + 8',
            answer: 39,
            options: []
        },
        {
            text: '38 + 1 + 6 - 1',
            answer: 44,
            options: []
        },
        {
            text: '45 - 5 + 4 + 6',
            answer: 50,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-addition-plus-60': [
        {
            text: '90 + 61 - 31',
            answer: 120,
            options: []
        },
        {
            text: '60 + 35 + 63',
            answer: 158,
            options: []
        },
        {
            text: '32 + 61 + 64',
            answer: 157,
            options: []
        },
        {
            text: '21 + 24 + 60',
            answer: 105,
            options: []
        },
        {
            text: '96 - 50 + 63',
            answer: 109,
            options: []
        },
        {
            text: '85 - 44 + 69',
            answer: 110,
            options: []
        },
        {
            text: '49 + 68 + 52',
            answer: 169,
            options: []
        },
        {
            text: '10 + 35 + 63',
            answer: 108,
            options: []
        },
        {
            text: '23 + 24 + 61',
            answer: 108,
            options: []
        },
        {
            text: '35 + 13 + 61',
            answer: 109,
            options: []
        },
        {
            text: '90 - 50 + 60',
            answer: 100,
            options: []
        },
        {
            text: '66 + 33 + 66',
            answer: 165,
            options: []
        },
        {
            text: '21 + 20 + 64',
            answer: 105,
            options: []
        },
        {
            text: '74 - 31 + 61',
            answer: 104,
            options: []
        },
        {
            text: '40 + 69 + 50',
            answer: 159,
            options: []
        },
        {
            text: '89 - 44 + 64',
            answer: 109,
            options: []
        },
        {
            text: '15 + 32 + 62',
            answer: 109,
            options: []
        },
        {
            text: '99 - 55 + 62',
            answer: 106,
            options: []
        },
        {
            text: '75 - 32 + 60',
            answer: 103,
            options: []
        },
        {
            text: '88 - 43 + 60',
            answer: 105,
            options: []
        },
        {
            text: '40 + 60 + 10',
            answer: 110,
            options: []
        },
        {
            text: '45 + 60 - 5',
            answer: 100,
            options: []
        },
        {
            text: '54 + 43 + 62',
            answer: 159,
            options: []
        },
        {
            text: '84 - 41 + 63',
            answer: 106,
            options: []
        },
        {
            text: '30 + 10 + 65',
            answer: 105,
            options: []
        },
        {
            text: '47 + 62 + 80',
            answer: 189,
            options: []
        },
        {
            text: '91 - 50 + 65',
            answer: 106,
            options: []
        },
        {
            text: '45 + 63 + 11',
            answer: 119,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-addition-plus-5': [
        {
            text: '4 + 5 + 5 + 6',
            answer: 20,
            options: []
        },
        {
            text: '4 + 9 + 2 + 5',
            answer: 20,
            options: []
        },
        {
            text: '2 + 3 + 4 - 5',
            answer: 4,
            options: []
        },
        {
            text: '7 + 8 + 5 + 9',
            answer: 29,
            options: []
        },
        {
            text: '3 + 5 - 4 + 5',
            answer: 9,
            options: []
        },
        {
            text: '7 + 5 + 3 - 1',
            answer: 14,
            options: []
        },
        {
            text: '9 - 8 + 4 + 5',
            answer: 10,
            options: []
        },
        {
            text: '9 + 9 + 9 + 5',
            answer: 32,
            options: []
        },
        {
            text: '7 + 8 + 5 + 7',
            answer: 27,
            options: []
        },
        {
            text: '5 + 5 + 5 + 5',
            answer: 20,
            options: []
        },
        {
            text: '9 + 9 + 8 + 5',
            answer: 31,
            options: []
        },
        {
            text: '5 + 5 + 5 - 4',
            answer: 11,
            options: []
        },
        {
            text: '4 - 3 + 5 + 5',
            answer: 11,
            options: []
        },
        {
            text: '8 + 8 + 5 + 1',
            answer: 22,
            options: []
        },
        {
            text: '1 + 9 + 5 + 5',
            answer: 20,
            options: []
        },
        {
            text: '73 + 7 + 5 + 5',
            answer: 90,
            options: []
        },
        {
            text: '49 + 5 + 9 + 8',
            answer: 71,
            options: []
        },
        {
            text: '87 - 5 + 5 + 5',
            answer: 92,
            options: []
        },
        {
            text: '28 + 5 + 3 - 4',
            answer: 32,
            options: []
        },
        {
            text: '83 + 5 + 5 + 2',
            answer: 95,
            options: []
        },
        {
            text: '83 + 5 + 5 + 1',
            answer: 94,
            options: []
        },
        {
            text: '41 + 5 + 5 + 9',
            answer: 60,
            options: []
        },
        {
            text: '64 + 1 + 3 + 1',
            answer: 69,
            options: []
        },
        {
            text: '59 + 5 + 3 - 7',
            answer: 60,
            options: []
        },
        {
            text: '47 + 8 + 5 + 9',
            answer: 69,
            options: []
        },
        {
            text: '69 + 6 + 5 - 10',
            answer: 70,
            options: []
        },
        {
            text: '58 + 5 - 3 + 5',
            answer: 65,
            options: []
        },
        {
            text: '43 + 5 + 5 + 5',
            answer: 58,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-addition-plus-50': [
        {
            text: '50 + 50 + 50',
            answer: 150,
            options: []
        },
        {
            text: '65 + 55 + 22',
            answer: 142,
            options: []
        },
        {
            text: '82 + 53 + 75',
            answer: 210,
            options: []
        },
        {
            text: '95 - 55 - 20',
            answer: 20,
            options: []
        },
        {
            text: '55 + 55 + 89',
            answer: 199,
            options: []
        },
        {
            text: '79 + 50 - 21',
            answer: 108,
            options: []
        },
        {
            text: '32 + 57 + 58',
            answer: 147,
            options: []
        },
        {
            text: '13 + 52 + 53',
            answer: 118,
            options: []
        },
        {
            text: '95 - 34 + 54',
            answer: 115,
            options: []
        },
        {
            text: '47 + 52 + 50',
            answer: 149,
            options: []
        },
        {
            text: '64 - 13 + 54',
            answer: 105,
            options: []
        },
        {
            text: '75 - 23 + 53',
            answer: 105,
            options: []
        },
        {
            text: '93 + 52 - 45',
            answer: 100,
            options: []
        },
        {
            text: '72 + 53 + 21',
            answer: 146,
            options: []
        },
        {
            text: '82 - 22 + 54',
            answer: 114,
            options: []
        },
        {
            text: '31 + 56 + 52',
            answer: 139,
            options: []
        },
        {
            text: '49 - 38 + 55',
            answer: 66,
            options: []
        },
        {
            text: '30 + 27 + 52',
            answer: 109,
            options: []
        },
        {
            text: '94 + 64 + 51',
            answer: 209,
            options: []
        },
        {
            text: '73 + 23 - 54',
            answer: 42,
            options: []
        },
        {
            text: '46 + 53 + 55',
            answer: 154,
            options: []
        },
        {
            text: '51 + 23 + 54',
            answer: 128,
            options: []
        },
        {
            text: '25 - 14 + 50',
            answer: 61,
            options: []
        },
        {
            text: '82 + 57 + 25',
            answer: 164,
            options: []
        },
        {
            text: '62 + 59 + 74',
            answer: 195,
            options: []
        },
        {
            text: '24 + 54 + 21',
            answer: 99,
            options: []
        },
        {
            text: '31 + 29 + 39',
            answer: 99,
            options: []
        },
        {
            text: '72 + 53 - 14',
            answer: 111,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-addition-plus-4': [
        {
            text: '9 + 4 - 3 + 6',
            answer: 16,
            options: []
        },
        {
            text: '6 + 5 + 4 - 3',
            answer: 12,
            options: []
        },
        {
            text: '4 + 4 + 4 + 4',
            answer: 16,
            options: []
        },
        {
            text: '5 + 5 + 6 + 4',
            answer: 20,
            options: []
        },
        {
            text: '3 + 7 + 7 + 4',
            answer: 21,
            options: []
        },
        {
            text: '7 + 2 - 3 + 4',
            answer: 10,
            options: []
        },
        {
            text: '6 + 5 + 4 + 2',
            answer: 17,
            options: []
        },
        {
            text: '8 - 6 + 4 + 4',
            answer: 10,
            options: []
        },
        {
            text: '6 + 9 + 2 + 4',
            answer: 21,
            options: []
        },
        {
            text: '2 + 3 + 4 + 4',
            answer: 13,
            options: []
        },
        {
            text: '4 + 1 + 3 + 4',
            answer: 12,
            options: []
        },
        {
            text: '3 + 6 + 4 + 2',
            answer: 15,
            options: []
        },
        {
            text: '1 + 8 + 6 + 4',
            answer: 19,
            options: []
        },
        {
            text: '7 + 4 - 1 + 7',
            answer: 17,
            options: []
        },
        {
            text: '4 + 4 - 4 + 4',
            answer: 8,
            options: []
        },
        {
            text: '45 - 1 + 5 + 4',
            answer: 53,
            options: []
        },
        {
            text: '59 + 9 + 8 + 4',
            answer: 80,
            options: []
        },
        {
            text: '82 + 8 + 6 + 3',
            answer: 99,
            options: []
        },
        {
            text: '21 + 5 + 4 + 4',
            answer: 34,
            options: []
        },
        {
            text: '39 + 4 + 2 + 1',
            answer: 46,
            options: []
        },
        {
            text: '47 + 4 + 4 - 5',
            answer: 50,
            options: []
        },
        {
            text: '76 + 4 + 8 + 4',
            answer: 92,
            options: []
        },
        {
            text: '74 + 6 + 6 + 3',
            answer: 89,
            options: []
        },
        {
            text: '99 - 9 + 4 - 2',
            answer: 92,
            options: []
        },
        {
            text: '54 + 5 + 4 - 3',
            answer: 60,
            options: []
        },
        {
            text: '61 + 4 + 4 + 4',
            answer: 73,
            options: []
        },
        {
            text: '13 + 2 + 2 + 4',
            answer: 21,
            options: []
        },
        {
            text: '95 + 4 - 7 + 4',
            answer: 96,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-addition-plus-40': [
        {
            text: '75 + 45 - 20',
            answer: 100,
            options: []
        },
        {
            text: '53 + 22 + 44',
            answer: 119,
            options: []
        },
        {
            text: '34 + 54 + 44',
            answer: 132,
            options: []
        },
        {
            text: '95 - 34 + 44',
            answer: 105,
            options: []
        },
        {
            text: '23 + 56 + 40',
            answer: 119,
            options: []
        },
        {
            text: '59 + 10 + 45',
            answer: 114,
            options: []
        },
        {
            text: '72 + 10 + 49',
            answer: 131,
            options: []
        },
        {
            text: '49 + 50 + 48',
            answer: 147,
            options: []
        },
        {
            text: '63 + 42 + 21',
            answer: 126,
            options: []
        },
        {
            text: '84 - 24 + 40',
            answer: 100,
            options: []
        },
        {
            text: '52 + 13 + 41',
            answer: 106,
            options: []
        },
        {
            text: '74 + 14 + 40',
            answer: 128,
            options: []
        },
        {
            text: '95 + 45 + 30',
            answer: 170,
            options: []
        },
        {
            text: '24 + 55 - 61',
            answer: 18,
            options: []
        },
        {
            text: '40 + 54 + 42',
            answer: 136,
            options: []
        },
        {
            text: '83 + 10 + 42',
            answer: 135,
            options: []
        },
        {
            text: '16 + 53 + 44',
            answer: 113,
            options: []
        },
        {
            text: '55 + 32 + 44',
            answer: 131,
            options: []
        },
        {
            text: '78 + 41 + 10',
            answer: 129,
            options: []
        },
        {
            text: '97 - 32 + 45',
            answer: 110,
            options: []
        },
        {
            text: '45 + 54 + 44',
            answer: 143,
            options: []
        },
        {
            text: '34 + 51 + 40',
            answer: 125,
            options: []
        },
        {
            text: '46 + 50 + 40',
            answer: 136,
            options: []
        },
        {
            text: '27 + 52 + 44',
            answer: 123,
            options: []
        },
        {
            text: '66 + 44 + 22',
            answer: 132,
            options: []
        },
        {
            text: '30 + 59 + 49',
            answer: 138,
            options: []
        },
        {
            text: '67 + 42 + 10',
            answer: 119,
            options: []
        },
        {
            text: '44 + 55 + 40',
            answer: 139,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-addition-plus-3': [
        {
            text: '2 + 5 + 3 + 9',
            answer: 19,
            options: []
        },
        {
            text: '3 - 1 + 5 + 3',
            answer: 10,
            options: []
        },
        {
            text: '4 + 7 + 8 + 3',
            answer: 22,
            options: []
        },
        {
            text: '6 + 9 - 3 + 5',
            answer: 17,
            options: []
        },
        {
            text: '4 + 3 + 3 + 3',
            answer: 13,
            options: []
        },
        {
            text: '4 + 5 + 3 - 2',
            answer: 10,
            options: []
        },
        {
            text: '3 + 3 + 3 + 3',
            answer: 12,
            options: []
        },
        {
            text: '6 + 2 + 3 - 1',
            answer: 10,
            options: []
        },
        {
            text: '4 + 1 - 1 + 3',
            answer: 7,
            options: []
        },
        {
            text: '9 - 7 + 5 + 3',
            answer: 10,
            options: []
        },
        {
            text: '5 + 5 + 7 + 3',
            answer: 20,
            options: []
        },
        {
            text: '4 + 3 + 3 + 8',
            answer: 18,
            options: []
        },
        {
            text: '1 + 4 + 3 + 3',
            answer: 11,
            options: []
        },
        {
            text: '6 - 2 + 5 + 3',
            answer: 12,
            options: []
        },
        {
            text: '1 + 8 - 2 + 3',
            answer: 10,
            options: []
        },
        {
            text: '84 + 5 + 3 + 3',
            answer: 95,
            options: []
        },
        {
            text: '65 + 2 + 3 + 9',
            answer: 79,
            options: []
        },
        {
            text: '48 - 1 + 3 + 4',
            answer: 54,
            options: []
        },
        {
            text: '57 + 3 + 9 - 7',
            answer: 62,
            options: []
        },
        {
            text: '33 + 5 - 1 + 3',
            answer: 40,
            options: []
        },
        {
            text: '72 + 2 + 5 + 3',
            answer: 82,
            options: []
        },
        {
            text: '64 + 3 + 2',
            answer: 69,
            options: []
        },
        {
            text: '87 - 3 + 5 + 3',
            answer: 92,
            options: []
        },
        {
            text: '23 + 2 + 2 + 3',
            answer: 30,
            options: []
        },
        {
            text: '46 + 3 + 3 - 2',
            answer: 50,
            options: []
        },
        {
            text: '12 + 2 + 5 + 3',
            answer: 22,
            options: []
        },
        {
            text: '75 - 1 + 5 + 3',
            answer: 82,
            options: []
        },
        {
            text: '43 - 2 + 5 + 1',
            answer: 47,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-addition-plus-30': [
        {
            text: '74 + 31 + 35',
            answer: 140,
            options: []
        },
        {
            text: '61 + 28 + 30',
            answer: 119,
            options: []
        },
        {
            text: '82 + 33 - 11',
            answer: 104,
            options: []
        },
        {
            text: '22 + 35 + 32',
            answer: 89,
            options: []
        },
        {
            text: '12 + 63 + 34',
            answer: 109,
            options: []
        },
        {
            text: '63 - 33 + 33',
            answer: 63,
            options: []
        },
        {
            text: '79 + 33 - 12',
            answer: 100,
            options: []
        },
        {
            text: '55 + 23 + 35',
            answer: 113,
            options: []
        },
        {
            text: '23 + 64 + 33',
            answer: 120,
            options: []
        },
        {
            text: '78 + 11 + 39',
            answer: 128,
            options: []
        },
        {
            text: '57 + 33 + 30',
            answer: 120,
            options: []
        },
        {
            text: '34 + 71 + 31',
            answer: 136,
            options: []
        },
        {
            text: '96 - 23 + 32',
            answer: 105,
            options: []
        },
        {
            text: '81 - 11 + 35',
            answer: 105,
            options: []
        },
        {
            text: '12 + 83 + 35',
            answer: 130,
            options: []
        },
        {
            text: '82 + 33 - 15',
            answer: 100,
            options: []
        },
        {
            text: '12 + 83 + 34',
            answer: 129,
            options: []
        },
        {
            text: '93 - 21 + 37',
            answer: 109,
            options: []
        },
        {
            text: '35 + 75 + 39',
            answer: 149,
            options: []
        },
        {
            text: '43 + 55 + 33',
            answer: 131,
            options: []
        },
        {
            text: '21 + 73 + 31',
            answer: 125,
            options: []
        },
        {
            text: '98 - 24 + 34',
            answer: 108,
            options: []
        },
        {
            text: '76 + 33 + 49',
            answer: 158,
            options: []
        },
        {
            text: '23 + 65 + 38',
            answer: 126,
            options: []
        },
        {
            text: '33 + 77 + 77',
            answer: 187,
            options: []
        },
        {
            text: '53 + 22 + 33',
            answer: 108,
            options: []
        },
        {
            text: '96 - 13 + 33',
            answer: 116,
            options: []
        },
        {
            text: '65 + 24 + 36',
            answer: 125,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-addition-plus-2': [
        {
            text: '1 + 2 + 2 + 2',
            answer: 7,
            options: []
        },
        {
            text: '7 + 8 + 3 + 2',
            answer: 20,
            options: []
        },
        {
            text: '4 + 4 + 2 + 9',
            answer: 19,
            options: []
        },
        {
            text: '1 - 1 + 8 + 2',
            answer: 10,
            options: []
        },
        {
            text: '4 + 4 + 4 + 8',
            answer: 20,
            options: []
        },
        {
            text: '4 + 4 + 5 + 5',
            answer: 18,
            options: []
        },
        {
            text: '1 + 7 + 2 + 3',
            answer: 13,
            options: []
        },
        {
            text: '9 + 9 + 2 + 2',
            answer: 22,
            options: []
        },
        {
            text: '6 + 3 - 1 + 2',
            answer: 10,
            options: []
        },
        {
            text: '9 + 2 + 4 - 3',
            answer: 12,
            options: []
        },
        {
            text: '7 + 2 + 2 + 4',
            answer: 15,
            options: []
        },
        {
            text: '5 + 5 + 8 + 2',
            answer: 20,
            options: []
        },
        {
            text: '4 - 1 + 5 + 2',
            answer: 10,
            options: []
        },
        {
            text: '3 + 5 + 2 + 1',
            answer: 11,
            options: []
        },
        {
            text: '8 + 2 + 5 - 4',
            answer: 11,
            options: []
        },
        {
            text: '29 - 1 + 2 + 3',
            answer: 33,
            options: []
        },
        {
            text: '35 - 1 + 5 + 2',
            answer: 41,
            options: []
        },
        {
            text: '44 + 4 + 2 + 3',
            answer: 53,
            options: []
        },
        {
            text: '68 + 2 + 5 - 4',
            answer: 71,
            options: []
        },
        {
            text: '41 + 7 + 2 + 5',
            answer: 55,
            options: []
        },
        {
            text: '33 + 5 + 2 + 1',
            answer: 41,
            options: []
        },
        {
            text: '69 + 2 + 4 - 1',
            answer: 74,
            options: []
        },
        {
            text: '87 + 2 + 3 + 2',
            answer: 94,
            options: []
        },
        {
            text: '58 + 2 + 3 + 2',
            answer: 65,
            options: []
        },
        {
            text: '43 + 5 + 2 + 7',
            answer: 57,
            options: []
        },
        {
            text: '18 + 2 + 4 - 3',
            answer: 21,
            options: []
        },
        {
            text: '64 + 1 + 3 + 2',
            answer: 70,
            options: []
        },
        {
            text: '11 + 4 + 3 + 2',
            answer: 20,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-addition-plus-20': [
        {
            text: '24 + 24 + 51',
            answer: 99,
            options: []
        },
        {
            text: '15 + 84 + 25',
            answer: 124,
            options: []
        },
        {
            text: '57 - 22 + 54',
            answer: 89,
            options: []
        },
        {
            text: '62 + 34 + 21',
            answer: 117,
            options: []
        },
        {
            text: '75 + 14 + 22',
            answer: 111,
            options: []
        },
        {
            text: '20 + 74 + 25',
            answer: 119,
            options: []
        },
        {
            text: '84 + 21 + 34',
            answer: 139,
            options: []
        },
        {
            text: '49 - 42 + 22',
            answer: 29,
            options: []
        },
        {
            text: '76 + 13 + 23',
            answer: 112,
            options: []
        },
        {
            text: '13 + 82 + 24',
            answer: 119,
            options: []
        },
        {
            text: '39 + 29 + 31',
            answer: 99,
            options: []
        },
        {
            text: '16 + 73 + 23',
            answer: 112,
            options: []
        },
        {
            text: '41 - 11 + 54',
            answer: 84,
            options: []
        },
        {
            text: '75 + 24 + 23',
            answer: 122,
            options: []
        },
        {
            text: '77 + 21 + 21',
            answer: 119,
            options: []
        },
        {
            text: '81 + 23 + 56',
            answer: 160,
            options: []
        },
        {
            text: '73 + 15 + 22',
            answer: 110,
            options: []
        },
        {
            text: '52 + 33 + 21',
            answer: 106,
            options: []
        },
        {
            text: '65 + 25 + 24',
            answer: 114,
            options: []
        },
        {
            text: '24 + 71 + 24',
            answer: 119,
            options: []
        },
        {
            text: '32 + 53 + 25',
            answer: 110,
            options: []
        },
        {
            text: '82 + 22 + 32',
            answer: 136,
            options: []
        },
        {
            text: '55 + 44 + 22',
            answer: 121,
            options: []
        },
        {
            text: '32 + 55 + 22',
            answer: 109,
            options: []
        },
        {
            text: '24 + 61 + 25',
            answer: 110,
            options: []
        },
        {
            text: '92 - 12 + 24',
            answer: 104,
            options: []
        },
        {
            text: '20 + 69 + 20',
            answer: 109,
            options: []
        },
        {
            text: '44 + 44 + 22',
            answer: 110,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-addition-plus-1': [
        {
            text: '3 + 6 + 1 + 9',
            answer: 19,
            options: []
        },
        {
            text: '7 + 9 + 3 + 1',
            answer: 20,
            options: []
        },
        {
            text: '8 - 3 + 4 + 1',
            answer: 10,
            options: []
        },
        {
            text: '4 + 4 + 1 + 1',
            answer: 10,
            options: []
        },
        {
            text: '6 + 4 + 9 + 1',
            answer: 20,
            options: []
        },
        {
            text: '1 - 1 + 9 + 1',
            answer: 10,
            options: []
        },
        {
            text: '9 + 1 + 8 + 2',
            answer: 20,
            options: []
        },
        {
            text: '7 - 3 + 5 + 1',
            answer: 10,
            options: []
        },
        {
            text: '3 + 6 + 1 + 7',
            answer: 17,
            options: []
        },
        {
            text: '6 + 2 + 8 + 3',
            answer: 19,
            options: []
        },
        {
            text: '2 + 5 + 2 + 1',
            answer: 10,
            options: []
        },
        {
            text: '8 + 2 + 9 + 1',
            answer: 20,
            options: []
        },
        {
            text: '4 + 4 + 1 + 9',
            answer: 18,
            options: []
        },
        {
            text: '3 + 5 + 4 + 1',
            answer: 13,
            options: []
        },
        {
            text: '6 - 1 + 4 + 1',
            answer: 10,
            options: []
        },
        {
            text: '29 + 1 + 7 - 3',
            answer: 34,
            options: []
        },
        {
            text: '56 - 3 + 6 + 1',
            answer: 60,
            options: []
        },
        {
            text: '34 + 3 + 2 + 1',
            answer: 40,
            options: []
        },
        {
            text: '15 - 1 + 5 + 1',
            answer: 20,
            options: []
        },
        {
            text: '53 + 6 + 1 + 7',
            answer: 67,
            options: []
        },
        {
            text: '37 + 8 + 4 + 1',
            answer: 50,
            options: []
        },
        {
            text: '46 + 9 - 1 + 5',
            answer: 59,
            options: []
        },
        {
            text: '78 + 1 + 1 + 9',
            answer: 89,
            options: []
        },
        {
            text: '86 + 4 + 8 + 1',
            answer: 99,
            options: []
        },
        {
            text: '32 + 7 + 1 + 8',
            answer: 48,
            options: []
        },
        {
            text: '44 - 3 + 8 + 1',
            answer: 50,
            options: []
        },
        {
            text: '53 + 2 + 4 + 1',
            answer: 60,
            options: []
        },
        {
            text: '61 + 9 + 9 + 1',
            answer: 80,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-addition-plus-10': [
        {
            text: '90 + 10',
            answer: 100,
            options: []
        },
        {
            text: '43 + 52 + 13',
            answer: 108,
            options: []
        },
        {
            text: '76 + 22 + 18',
            answer: 116,
            options: []
        },
        {
            text: '66 + 34',
            answer: 100,
            options: []
        },
        {
            text: '37 + 63',
            answer: 100,
            options: []
        },
        {
            text: '99 - 85 + 93',
            answer: 107,
            options: []
        },
        {
            text: '45 + 54 + 11',
            answer: 110,
            options: []
        },
        {
            text: '72 + 23 + 13',
            answer: 108,
            options: []
        },
        {
            text: '32 + 67 + 12',
            answer: 111,
            options: []
        },
        {
            text: '59 + 41',
            answer: 100,
            options: []
        },
        {
            text: '86 + 12 + 12',
            answer: 110,
            options: []
        },
        {
            text: '19 + 81',
            answer: 100,
            options: []
        },
        {
            text: '77 - 33 + 55',
            answer: 99,
            options: []
        },
        {
            text: '64 + 35 + 11',
            answer: 110,
            options: []
        },
        {
            text: '24 + 71 + 14',
            answer: 109,
            options: []
        },
        {
            text: '89 + 11',
            answer: 100,
            options: []
        },
        {
            text: '66 + 33 + 13',
            answer: 112,
            options: []
        },
        {
            text: '24 + 72 + 14',
            answer: 110,
            options: []
        },
        {
            text: '99 + 18 - 13',
            answer: 104,
            options: []
        },
        {
            text: '69 + 31',
            answer: 100,
            options: []
        },
        {
            text: '33 + 62 + 12',
            answer: 107,
            options: []
        },
        {
            text: '79 - 39 + 92',
            answer: 132,
            options: []
        },
        {
            text: '47 + 12 + 21',
            answer: 80,
            options: []
        },
        {
            text: '64 + 32 + 13',
            answer: 109,
            options: []
        },
        {
            text: '83 + 12 + 13',
            answer: 108,
            options: []
        },
        {
            text: '25 + 25 + 25',
            answer: 75,
            options: []
        },
        {
            text: '78 + 22',
            answer: 100,
            options: []
        },
        {
            text: '88 + 10 + 11',
            answer: 109,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        }))
};
}}),
"[project]/src/lib/question-data/big-brother-subtraction.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "bigBrotherSubtractionQuestions": (()=>bigBrotherSubtractionQuestions)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/questions.ts [app-ssr] (ecmascript)");
;
const bigBrotherSubtractionQuestions = {
    'big-brother-subtraction-minus-9': [
        {
            text: "5 + 4 - 9 + 9",
            answer: 9,
            options: []
        },
        {
            text: "4 + 7 - 4 - 9",
            answer: -2,
            options: []
        },
        {
            text: "7 + 4 - 9 + 3",
            answer: 5,
            options: []
        },
        {
            text: "8 + 7 - 9 - 2",
            answer: 4,
            options: []
        },
        {
            text: "6 + 9 - 9 + 4",
            answer: 10,
            options: []
        },
        {
            text: "3 + 7 - 9 + 9",
            answer: 10,
            options: []
        },
        {
            text: "2 + 7 + 3 - 9",
            answer: 3,
            options: []
        },
        {
            text: "9 + 8 - 9 - 4",
            answer: 4,
            options: []
        },
        {
            text: "7 + 3 + 6 - 9",
            answer: 7,
            options: []
        },
        {
            text: "3 + 7 - 9 + 8",
            answer: 9,
            options: []
        },
        {
            text: "4 + 7 - 9 - 9",
            answer: -7,
            options: []
        },
        {
            text: "5 + 5 - 9 + 9",
            answer: 10,
            options: []
        },
        {
            text: "3 + 2 - 3 + 8",
            answer: 10,
            options: []
        },
        {
            text: "6 + 3 - 9 + 9",
            answer: 9,
            options: []
        },
        {
            text: "4 + 2 + 4 - 9",
            answer: 1,
            options: []
        },
        {
            text: "32 + 8 - 9 + 3",
            answer: 34,
            options: []
        },
        {
            text: "64 + 7 - 9 + 2",
            answer: 64,
            options: []
        },
        {
            text: "78 + 2 - 9 + 4",
            answer: 75,
            options: []
        },
        {
            text: "92 + 8 - 9 - 9",
            answer: 82,
            options: []
        },
        {
            text: "75 + 5 + 4 - 9",
            answer: 75,
            options: []
        },
        {
            text: "64 + 6 - 9 + 8",
            answer: 69,
            options: []
        },
        {
            text: "22 + 8 - 9 + 3",
            answer: 24,
            options: []
        },
        {
            text: "98 - 4 + 6 - 9",
            answer: 91,
            options: []
        },
        {
            text: "49 + 6 + 5 - 9",
            answer: 51,
            options: []
        },
        {
            text: "59 + 9 - 9 - 9",
            answer: 50,
            options: []
        },
        {
            text: "54 + 8 + 7 - 9",
            answer: 60,
            options: []
        },
        {
            text: "78 + 3 + 5 - 9",
            answer: 77,
            options: []
        },
        {
            text: "86 - 2 + 7 - 9",
            answer: 82,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-subtraction-minus-90': [
        {
            text: '99 + 66 - 93',
            answer: 72,
            options: []
        },
        {
            text: '72 + 82 - 94',
            answer: 60,
            options: []
        },
        {
            text: '31 + 49 - 30',
            answer: 50,
            options: []
        },
        {
            text: '96 + 94 - 90',
            answer: 100,
            options: []
        },
        {
            text: '95 - 94 + 73',
            answer: 74,
            options: []
        },
        {
            text: '97 + 39 - 91',
            answer: 45,
            options: []
        },
        {
            text: '51 + 25 + 94',
            answer: 170,
            options: []
        },
        {
            text: '73 + 82 - 93',
            answer: 62,
            options: []
        },
        {
            text: '93 + 62 - 95',
            answer: 60,
            options: []
        },
        {
            text: '80 + 24 - 94',
            answer: 10,
            options: []
        },
        {
            text: '64 + 31 - 92',
            answer: 3,
            options: []
        },
        {
            text: '72 + 41 - 99',
            answer: 14,
            options: []
        },
        {
            text: '90 + 74 - 90',
            answer: 74,
            options: []
        },
        {
            text: '63 + 45 - 97',
            answer: 11,
            options: []
        },
        {
            text: '57 - 32 + 85',
            answer: 110,
            options: []
        },
        {
            text: '52 + 53 - 91',
            answer: 14,
            options: []
        },
        {
            text: '64 + 43 - 93',
            answer: 14,
            options: []
        },
        {
            text: '123 - 93 + 63',
            answer: 93,
            options: []
        },
        {
            text: '70 + 80 - 90',
            answer: 60,
            options: []
        },
        {
            text: '51 + 53 - 91',
            answer: 13,
            options: []
        },
        {
            text: '42 + 43 + 95',
            answer: 180,
            options: []
        },
        {
            text: '64 + 93 - 92',
            answer: 65,
            options: []
        },
        {
            text: '50 + 59 - 90',
            answer: 19,
            options: []
        },
        {
            text: '178 - 94 + 73',
            answer: 157,
            options: []
        },
        {
            text: '132 - 91 + 44',
            answer: 85,
            options: []
        },
        {
            text: '52 + 54 - 96',
            answer: 10,
            options: []
        },
        {
            text: '160 - 90 + 80',
            answer: 150,
            options: []
        },
        {
            text: '181 + 90 + 91',
            answer: 362,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-subtraction-minus-8': [
        {
            text: '22 + 20 - 8 - 5',
            answer: 29,
            options: []
        },
        {
            text: '20 - 8 + 5 + 2',
            answer: 19,
            options: []
        },
        {
            text: '31 + 5 - 8 + 1',
            answer: 29,
            options: []
        },
        {
            text: '45 - 8 + 2 - 6',
            answer: 33,
            options: []
        },
        {
            text: '50 + 3 + 6 - 8',
            answer: 51,
            options: []
        },
        {
            text: '11 + 5 - 8 + 1',
            answer: 9,
            options: []
        },
        {
            text: '7 - 6 + 8 - 8',
            answer: 1,
            options: []
        },
        {
            text: '4 + 7 - 8 + 2',
            answer: 5,
            options: []
        },
        {
            text: '5 + 4 - 1 - 8',
            answer: 0,
            options: []
        },
        {
            text: '8 + 5 + 3 - 8',
            answer: 8,
            options: []
        },
        {
            text: '9 + 9 - 8 - 8',
            answer: 2,
            options: []
        },
        {
            text: '3 + 7 - 8 + 3',
            answer: 5,
            options: []
        },
        {
            text: '4 + 6 - 8 - 2',
            answer: 0,
            options: []
        },
        {
            text: '7 - 3 + 7 - 8',
            answer: 3,
            options: []
        },
        {
            text: '2 + 7 + 7 - 8',
            answer: 8,
            options: []
        },
        {
            text: '15 + 5 - 8 + 9',
            answer: 21,
            options: []
        },
        {
            text: '12 + 3 - 8 - 6',
            answer: 1,
            options: []
        },
        {
            text: '47 + 8 - 8 - 31',
            answer: 16,
            options: []
        },
        {
            text: '22 + 7 - 8 - 8',
            answer: 13,
            options: []
        },
        {
            text: '13 + 2 - 2 - 9',
            answer: 4,
            options: []
        },
        {
            text: '59 + 7 - 8 - 8',
            answer: 50,
            options: []
        },
        {
            text: '25 + 5 - 9 - 8',
            answer: 3,
            options: []
        },
        {
            text: '67 - 3 + 4 - 9',
            answer: 59,
            options: []
        },
        {
            text: '77 - 8 + 7 - 4',
            answer: 72,
            options: []
        },
        {
            text: '55 + 5 - 8 + 3',
            answer: 55,
            options: []
        },
        {
            text: '32 - 8 + 3 + 4',
            answer: 31,
            options: []
        },
        {
            text: '99 + 9 - 8 - 8',
            answer: 92,
            options: []
        },
        {
            text: '87 - 8 - 6 + 2',
            answer: 75,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-subtraction-minus-80': [
        {
            text: '122 - 88 + 24',
            answer: 58,
            options: []
        },
        {
            text: '97 + 88 - 85',
            answer: 100,
            options: []
        },
        {
            text: '74 + 42 - 86',
            answer: 30,
            options: []
        },
        {
            text: '36 + 74 - 89',
            answer: 21,
            options: []
        },
        {
            text: '22 + 81 - 81',
            answer: 22,
            options: []
        },
        {
            text: '66 + 99 - 82',
            answer: 83,
            options: []
        },
        {
            text: '37 + 78 - 81',
            answer: 34,
            options: []
        },
        {
            text: '73 + 42 - 85',
            answer: 30,
            options: []
        },
        {
            text: '88 + 37 - 84',
            answer: 41,
            options: []
        },
        {
            text: '41 + 46 - 82',
            answer: 5,
            options: []
        },
        {
            text: '53 + 52 - 84',
            answer: 21,
            options: []
        },
        {
            text: '49 + 8 + 53',
            answer: 110,
            options: []
        },
        {
            text: '87 + 24 - 81',
            answer: 30,
            options: []
        },
        {
            text: '99 + 30 - 89',
            answer: 40,
            options: []
        },
        {
            text: '24 + 97 - 81',
            answer: 40,
            options: []
        },
        {
            text: '42 + 72 - 83',
            answer: 31,
            options: []
        },
        {
            text: '72 + 93 - 81',
            answer: 84,
            options: []
        },
        {
            text: '64 + 55 - 87',
            answer: 32,
            options: []
        },
        {
            text: '40 + 67 - 84',
            answer: 23,
            options: []
        },
        {
            text: '97 + 24 - 81',
            answer: 40,
            options: []
        },
        {
            text: '61 - 51 + 87',
            answer: 97,
            options: []
        },
        {
            text: '75 + 51 - 86',
            answer: 40,
            options: []
        },
        {
            text: '81 + 74 - 84',
            answer: 71,
            options: []
        },
        {
            text: '23 + 92 - 85',
            answer: 30,
            options: []
        },
        {
            text: '36 + 75 - 89',
            answer: 22,
            options: []
        },
        {
            text: '46 + 61 - 83',
            answer: 24,
            options: []
        },
        {
            text: '51 + 57 - 84',
            answer: 24,
            options: []
        },
        {
            text: '26 + 99 - 85',
            answer: 40,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-subtraction-minus-7': [
        {
            text: '9 - 8 + 7 - 7',
            answer: 1,
            options: []
        },
        {
            text: '1 + 2 + 8 - 7',
            answer: 4,
            options: []
        },
        {
            text: '7 + 2 + 6 - 7',
            answer: 8,
            options: []
        },
        {
            text: '6 + 5 - 7 + 1',
            answer: 5,
            options: []
        },
        {
            text: '9 + 8 - 1 - 7',
            answer: 9,
            options: []
        },
        {
            text: '8 + 8 - 7 - 9',
            answer: 0,
            options: []
        },
        {
            text: '5 + 1 + 5 - 7',
            answer: 4,
            options: []
        },
        {
            text: '3 + 3 + 4 - 7',
            answer: 3,
            options: []
        },
        {
            text: '9 + 2 + 5 - 7',
            answer: 9,
            options: []
        },
        {
            text: '4 + 5 + 2 - 7',
            answer: 4,
            options: []
        },
        {
            text: '5 + 2 + 9 - 7',
            answer: 9,
            options: []
        },
        {
            text: '6 + 9 - 7 + 8',
            answer: 16,
            options: []
        },
        {
            text: '15 + 5 - 7 + 6',
            answer: 19,
            options: []
        },
        {
            text: '12 + 2 + 5 - 7',
            answer: 12,
            options: []
        },
        {
            text: '13 + 4 + 9 - 7',
            answer: 19,
            options: []
        },
        {
            text: '98 - 7 - 7 + 9',
            answer: 93,
            options: []
        },
        {
            text: '77 + 8 - 7 + 7',
            answer: 85,
            options: []
        },
        {
            text: '42 + 8 - 3 - 7',
            answer: 40,
            options: []
        },
        {
            text: '53 - 3 - 7 + 5',
            answer: 48,
            options: []
        },
        {
            text: '67 - 2 - 7 - 5',
            answer: 53,
            options: []
        },
        {
            text: '91 - 7 + 9 + 2',
            answer: 95,
            options: []
        },
        {
            text: '82 + 3 - 7 - 2',
            answer: 76,
            options: []
        },
        {
            text: '44 + 2 - 7 - 6',
            answer: 33,
            options: []
        },
        {
            text: '13 - 9 - 4 + 7',
            answer: 7,
            options: []
        },
        {
            text: '33 + 7 - 7 + 7',
            answer: 40,
            options: []
        },
        {
            text: '92 + 8 + 7 - 2',
            answer: 105,
            options: []
        },
        {
            text: '42 + 3 - 7 + 8',
            answer: 46,
            options: []
        },
        {
            text: '69 + 2 - 7 + 1',
            answer: 65,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-subtraction-minus-70': [
        {
            text: '89 + 28 - 71',
            answer: 46,
            options: []
        },
        {
            text: '77 + 88 - 77',
            answer: 88,
            options: []
        },
        {
            text: '24 + 83 - 73',
            answer: 34,
            options: []
        },
        {
            text: '35 + 75 - 79',
            answer: 31,
            options: []
        },
        {
            text: '76 - 33 + 72',
            answer: 115,
            options: []
        },
        {
            text: '19 + 98 - 72',
            answer: 45,
            options: []
        },
        {
            text: '28 + 82 - 70',
            answer: 40,
            options: []
        },
        {
            text: '49 + 66 - 75',
            answer: 40,
            options: []
        },
        {
            text: '31 + 88 - 77',
            answer: 42,
            options: []
        },
        {
            text: '39 + 51 - 79',
            answer: 11,
            options: []
        },
        {
            text: '29 + 90 - 74',
            answer: 45,
            options: []
        },
        {
            text: '24 + 44 + 44',
            answer: 112,
            options: []
        },
        {
            text: '96 - 76 + 87',
            answer: 107,
            options: []
        },
        {
            text: '87 + 55 + 72',
            answer: 214,
            options: []
        },
        {
            text: '56 + 59 - 74',
            answer: 41,
            options: []
        },
        {
            text: '98 + 64 - 72',
            answer: 90,
            options: []
        },
        {
            text: '12 + 92 - 73',
            answer: 31,
            options: []
        },
        {
            text: '87 + 28 - 75',
            answer: 40,
            options: []
        },
        {
            text: '72 + 44 - 72',
            answer: 44,
            options: []
        },
        {
            text: '65 + 45 - 79',
            answer: 31,
            options: []
        },
        {
            text: '51 + 53 - 73',
            answer: 31,
            options: []
        },
        {
            text: '95 + 72 - 73',
            answer: 94,
            options: []
        },
        {
            text: '45 + 65 - 79',
            answer: 31,
            options: []
        },
        {
            text: '12 + 94 - 71',
            answer: 35,
            options: []
        },
        {
            text: '14 + 94 - 77',
            answer: 31,
            options: []
        },
        {
            text: '77 - 77 + 77',
            answer: 77,
            options: []
        },
        {
            text: '58 - 52 + 73',
            answer: 79,
            options: []
        },
        {
            text: '85 + 34 - 79',
            answer: 40,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-subtraction-minus-6': [
        {
            "text": "7 + 4 - 1 - 6",
            "answer": 4,
            "options": []
        },
        {
            "text": "3 + 7 - 6 + 1",
            "answer": 5,
            "options": []
        },
        {
            "text": "6 + 9 - 6 + 4",
            "answer": 13,
            "options": []
        },
        {
            "text": "9 + 6 - 6 + 7",
            "answer": 16,
            "options": []
        },
        {
            "text": "4 + 7 - 1 - 6",
            "answer": 4,
            "options": []
        },
        {
            "text": "1 + 9 - 6 + 3",
            "answer": 7,
            "options": []
        },
        {
            "text": "2 + 8 - 6 + 2",
            "answer": 6,
            "options": []
        },
        {
            "text": "9 + 2 + 4 - 6",
            "answer": 9,
            "options": []
        },
        {
            "text": "3 + 7 - 6 + 6",
            "answer": 10,
            "options": []
        },
        {
            "text": "8 + 7 + 5 - 6",
            "answer": 14,
            "options": []
        },
        {
            "text": "5 + 5 - 6 + 1",
            "answer": 5,
            "options": []
        },
        {
            "text": "8 + 2 - 6 + 2",
            "answer": 6,
            "options": []
        },
        {
            "text": "5 + 5 - 6 + 3",
            "answer": 7,
            "options": []
        },
        {
            "text": "4 + 6 - 6 + 7",
            "answer": 11,
            "options": []
        },
        {
            "text": "7 - 2 + 5 - 6",
            "answer": 4,
            "options": []
        },
        {
            "text": "74 + 1 - 6 + 1",
            "answer": 70,
            "options": []
        },
        {
            "text": "37 - 7 - 6 + 9",
            "answer": 33,
            "options": []
        },
        {
            "text": "96 - 6 + 7 + 8",
            "answer": 105,
            "options": []
        },
        {
            "text": "47 + 33 - 6 - 4",
            "answer": 70,
            "options": []
        },
        {
            "text": "18 + 2 - 6 + 6",
            "answer": 20,
            "options": []
        },
        {
            "text": "19 + 1 + 5 - 6",
            "answer": 19,
            "options": []
        },
        {
            "text": "82 - 2 - 6 + 3",
            "answer": 77,
            "options": []
        },
        {
            "text": "26 + 4 - 10 - 6",
            "answer": 14,
            "options": []
        },
        {
            "text": "77 + 3 + 5 - 6",
            "answer": 79,
            "options": []
        },
        {
            "text": "45 + 5 + 15 - 6",
            "answer": 59,
            "options": []
        },
        {
            "text": "72 + 3 + 5 - 6",
            "answer": 74,
            "options": []
        },
        {
            "text": "45 - 6 + 3 + 3",
            "answer": 45,
            "options": []
        },
        {
            "text": "37 + 3 - 6 + 1",
            "answer": 35,
            "options": []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-subtraction-minus-60': [
        {
            text: '86 + 74 - 60',
            answer: 100,
            options: []
        },
        {
            text: '34 + 74 - 68',
            answer: 40,
            options: []
        },
        {
            text: '70 + 39 - 65',
            answer: 44,
            options: []
        },
        {
            text: '91 - 61 + 34',
            answer: 64,
            options: []
        },
        {
            text: '20 + 84 - 60',
            answer: 44,
            options: []
        },
        {
            text: '79 + 80 - 69',
            answer: 90,
            options: []
        },
        {
            text: '56 + 50 - 66',
            answer: 40,
            options: []
        },
        {
            text: '48 + 60 - 68',
            answer: 40,
            options: []
        },
        {
            text: '90 + 55 - 45',
            answer: 100,
            options: []
        },
        {
            text: '12 + 93 - 65',
            answer: 40,
            options: []
        },
        {
            text: '64 + 44 - 64',
            answer: 44,
            options: []
        },
        {
            text: '58 + 51 - 61',
            answer: 48,
            options: []
        },
        {
            text: '54 + 54 - 64',
            answer: 44,
            options: []
        },
        {
            text: '27 + 82 - 66',
            answer: 43,
            options: []
        },
        {
            text: '61 + 94 - 65',
            answer: 90,
            options: []
        },
        {
            text: '90 + 64 - 64',
            answer: 90,
            options: []
        },
        {
            text: '73 - 62 + 11',
            answer: 22,
            options: []
        },
        {
            text: '48 + 61 - 64',
            answer: 45,
            options: []
        },
        {
            text: '65 + 43 - 64',
            answer: 44,
            options: []
        },
        {
            text: '29 + 80 + 65',
            answer: 174,
            options: []
        },
        {
            text: '92 - 61 + 71',
            answer: 102,
            options: []
        },
        {
            text: '57 + 52 - 63',
            answer: 46,
            options: []
        },
        {
            text: '43 + 62 - 64',
            answer: 41,
            options: []
        },
        {
            text: '98 + 61 - 64',
            answer: 95,
            options: []
        },
        {
            text: '20 + 83 - 62',
            answer: 41,
            options: []
        },
        {
            text: '15 + 92 - 63',
            answer: 44,
            options: []
        },
        {
            text: '60 + 99 - 69',
            answer: 90,
            options: []
        },
        {
            text: '71 + 84 - 65',
            answer: 90,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-subtraction-minus-5': [
        {
            text: "9 - 5 + 6 - 5",
            answer: 5,
            options: []
        },
        {
            text: "7 + 8 - 5 - 5",
            answer: 5,
            options: []
        },
        {
            text: "8 + 7 - 5 - 9",
            answer: 1,
            options: []
        },
        {
            text: "5 + 5 + 5 - 5",
            answer: 10,
            options: []
        },
        {
            text: "4 + 3 + 4 - 5",
            answer: 6,
            options: []
        },
        {
            text: "3 + 7 - 5 + 4",
            answer: 9,
            options: []
        },
        {
            text: "2 + 9 - 5 + 4",
            answer: 10,
            options: []
        },
        {
            text: "1 + 4 - 5 + 9",
            answer: 9,
            options: []
        },
        {
            text: "7 + 3 - 5 - 4",
            answer: 1,
            options: []
        },
        {
            text: "9 + 4 - 5 + 2",
            answer: 10,
            options: []
        },
        {
            text: "6 + 9 - 5 - 5",
            answer: 5,
            options: []
        },
        {
            text: "2 + 3 + 4 - 5",
            answer: 4,
            options: []
        },
        {
            text: "9 + 1 - 5 - 1",
            answer: 4,
            options: []
        },
        {
            text: "7 + 3 - 5 + 2",
            answer: 7,
            options: []
        },
        {
            text: "8 + 3 + 5 - 5",
            answer: 11,
            options: []
        },
        {
            text: "12 - 5 + 3 - 9",
            answer: 1,
            options: []
        },
        {
            text: "66 + 4 - 6 + 1",
            answer: 65,
            options: []
        },
        {
            text: "55 - 5 - 5 + 5",
            answer: 50,
            options: []
        },
        {
            text: "28 + 2 - 5 - 8",
            answer: 17,
            options: []
        },
        {
            text: "67 + 4 - 5 + 4",
            answer: 70,
            options: []
        },
        {
            text: "54 + 6 - 5 - 1",
            answer: 54,
            options: []
        },
        {
            text: "88 + 2 + 4 - 5",
            answer: 89,
            options: []
        },
        {
            text: "43 - 5 + 7 - 6",
            answer: 39,
            options: []
        },
        {
            text: "21 + 9 - 6 - 5",
            answer: 19,
            options: []
        },
        {
            text: "96 + 9 - 5 + 5",
            answer: 105,
            options: []
        },
        {
            text: "54 - 5 - 9 - 9",
            answer: 31,
            options: []
        },
        {
            text: "64 - 5 + 4 + 4",
            answer: 67,
            options: []
        },
        {
            text: "98 - 2 + 8 + 7",
            answer: 111,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-subtraction-minus-50': [
        {
            text: '97 + 44 - 55',
            answer: 86,
            options: []
        },
        {
            text: '67 + 53 - 59',
            answer: 61,
            options: []
        },
        {
            text: '44 + 33 - 57',
            answer: 20,
            options: []
        },
        {
            text: '88 - 55 + 33',
            answer: 66,
            options: []
        },
        {
            text: '57 + 53 - 50',
            answer: 60,
            options: []
        },
        {
            text: '37 + 83 - 59',
            answer: 61,
            options: []
        },
        {
            text: '85 - 57 - 15',
            answer: 13,
            options: []
        },
        {
            text: '19 + 91 - 56',
            answer: 54,
            options: []
        },
        {
            text: '24 + 81 - 54',
            answer: 51,
            options: []
        },
        {
            text: '86 + 34 - 50',
            answer: 70,
            options: []
        },
        {
            text: '74 + 54 - 58',
            answer: 70,
            options: []
        },
        {
            text: '54 + 51 - 53',
            answer: 52,
            options: []
        },
        {
            text: '61 + 49 - 58',
            answer: 52,
            options: []
        },
        {
            text: '54 + 52 - 54',
            answer: 52,
            options: []
        },
        {
            text: '37 + 80 - 57',
            answer: 60,
            options: []
        },
        {
            text: '32 + 53 - 54',
            answer: 31,
            options: []
        },
        {
            text: '65 + 45 - 50',
            answer: 60,
            options: []
        },
        {
            text: '36 + 24 - 59',
            answer: 1,
            options: []
        },
        {
            text: '54 + 54 - 58',
            answer: 50,
            options: []
        },
        {
            text: '47 + 63 - 50',
            answer: 60,
            options: []
        },
        {
            text: '26 + 84 - 56',
            answer: 54,
            options: []
        },
        {
            text: '49 + 61 - 58',
            answer: 52,
            options: []
        },
        {
            text: '34 + 74 - 58',
            answer: 50,
            options: []
        },
        {
            text: '41 + 71 - 52',
            answer: 60,
            options: []
        },
        {
            text: '58 - 52 + 53',
            answer: 59,
            options: []
        },
        {
            text: '99 + 11 - 55',
            answer: 55,
            options: []
        },
        {
            text: '83 + 22 - 51',
            answer: 54,
            options: []
        },
        {
            text: '38 + 72 - 55',
            answer: 55,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-subtraction-minus-4': [
        {
            text: "3 + 7 - 4 + 3",
            answer: 9,
            options: []
        },
        {
            text: "4 + 4 + 2 - 4",
            answer: 6,
            options: []
        },
        {
            text: "5 + 5 - 4 - 4",
            answer: 2,
            options: []
        },
        {
            text: "2 + 3 + 5 - 4",
            answer: 6,
            options: []
        },
        {
            text: "1 + 9 - 4 - 4",
            answer: 2,
            options: []
        },
        {
            text: "9 + 1 - 4 + 9",
            answer: 15,
            options: []
        },
        {
            text: "7 + 3 - 4 - 1",
            answer: 5,
            options: []
        },
        {
            text: "2 + 8 - 3 - 4",
            answer: 3,
            options: []
        },
        {
            text: "4 + 7 - 4 - 1",
            answer: 6,
            options: []
        },
        {
            text: "8 + 5 - 4 + 1",
            answer: 10,
            options: []
        },
        {
            text: "6 + 9 - 5 - 4",
            answer: 6,
            options: []
        },
        {
            text: "9 - 4 - 4 + 7",
            answer: 8,
            options: []
        },
        {
            text: "8 + 8 - 5 - 4",
            answer: 7,
            options: []
        },
        {
            text: "3 + 2 + 5 - 4",
            answer: 6,
            options: []
        },
        {
            text: "12 + 8 - 3 - 4",
            answer: 13,
            options: []
        },
        {
            text: "67 + 3 - 4 + 3",
            answer: 69,
            options: []
        },
        {
            text: "52 + 8 - 4 - 5",
            answer: 51,
            options: []
        },
        {
            text: "33 + 7 - 4 - 2",
            answer: 34,
            options: []
        },
        {
            text: "94 - 4 - 4 - 4",
            answer: 82,
            options: []
        },
        {
            text: "57 + 3 - 4 - 1",
            answer: 55,
            options: []
        },
        {
            text: "16 + 4 + 3 - 4",
            answer: 19,
            options: []
        },
        {
            text: "18 + 2 - 4 - 5",
            answer: 11,
            options: []
        },
        {
            text: "98 - 2 + 4 - 2",
            answer: 98,
            options: []
        },
        {
            text: "77 + 33 - 4 - 1",
            answer: 105,
            options: []
        },
        {
            text: "64 - 3 - 4 + 3",
            answer: 60,
            options: []
        },
        {
            text: "13 - 4 + 1 + 9",
            answer: 19,
            options: []
        },
        {
            text: "74 - 2 + 4 - 4",
            answer: 72,
            options: []
        },
        {
            text: "12 - 2 - 4 + 4",
            answer: 10,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-subtraction-minus-40': [
        {
            text: '16 + 92 - 44',
            answer: 64,
            options: []
        },
        {
            text: '29 + 99 - 44',
            answer: 84,
            options: []
        },
        {
            text: '40 + 66 - 43',
            answer: 63,
            options: []
        },
        {
            text: '73 + 55 - 49',
            answer: 79,
            options: []
        },
        {
            text: '63 + 42 - 44',
            answer: 61,
            options: []
        },
        {
            text: '91 + 14 - 41',
            answer: 64,
            options: []
        },
        {
            text: '23 + 82 - 46',
            answer: 59,
            options: []
        },
        {
            text: '27 + 93 - 47',
            answer: 73,
            options: []
        },
        {
            text: '77 + 33 - 44',
            answer: 66,
            options: []
        },
        {
            text: '66 + 49 - 47',
            answer: 68,
            options: []
        },
        {
            text: '45 + 65 - 49',
            answer: 61,
            options: []
        },
        {
            text: '35 + 75 - 46',
            answer: 64,
            options: []
        },
        {
            text: '38 + 78 - 44',
            answer: 72,
            options: []
        },
        {
            text: '14 + 94 - 41',
            answer: 67,
            options: []
        },
        {
            text: '18 + 92 - 44',
            answer: 66,
            options: []
        },
        {
            text: '44 + 88 - 44',
            answer: 88,
            options: []
        },
        {
            text: '84 + 24 - 41',
            answer: 67,
            options: []
        },
        {
            text: '30 + 79 - 49',
            answer: 60,
            options: []
        },
        {
            text: '10 + 97 - 42',
            answer: 65,
            options: []
        },
        {
            text: '12 + 98 - 49',
            answer: 61,
            options: []
        },
        {
            text: '20 + 97 - 47',
            answer: 70,
            options: []
        },
        {
            text: '45 + 65 - 48',
            answer: 62,
            options: []
        },
        {
            text: '65 + 45 - 44',
            answer: 66,
            options: []
        },
        {
            text: '90 + 10 - 40',
            answer: 60,
            options: []
        },
        {
            text: '50 + 50 - 40',
            answer: 60,
            options: []
        },
        {
            text: '38 + 82 - 44',
            answer: 76,
            options: []
        },
        {
            text: '31 + 82 - 44',
            answer: 69,
            options: []
        },
        {
            text: '25 + 94 - 49',
            answer: 70,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-subtraction-minus-3': [
        {
            text: '9 + 2 - 3 + 1',
            answer: 9,
            options: []
        },
        {
            text: '2 + 8 - 3 - 3',
            answer: 4,
            options: []
        },
        {
            text: '7 + 4 - 3 + 4',
            answer: 12,
            options: []
        },
        {
            text: '5 + 5 - 3 + 9',
            answer: 16,
            options: []
        },
        {
            text: '8 + 3 - 3 + 2',
            answer: 10,
            options: []
        },
        {
            text: '1 + 9 + 2 - 3',
            answer: 9,
            options: []
        },
        {
            text: '3 + 2 + 9 - 3',
            answer: 11,
            options: []
        },
        {
            text: '6 - 4 + 8 - 3',
            answer: 7,
            options: []
        },
        {
            text: '10 - 3 + 2 - 9',
            answer: 0,
            options: []
        },
        {
            text: '14 - 2 - 3 + 5',
            answer: 14,
            options: []
        },
        {
            text: '4 + 2 + 4 - 3',
            answer: 7,
            options: []
        },
        {
            text: '15 + 3 - 3 + 4',
            answer: 19,
            options: []
        },
        {
            text: '11 + 4 + 5 - 3',
            answer: 17,
            options: []
        },
        {
            text: '17 - 6 - 3 + 8',
            answer: 16,
            options: []
        },
        {
            text: '20 + 5 + 3 - 3',
            answer: 25,
            options: []
        },
        {
            text: '30 - 3 + 8 + 4',
            answer: 39,
            options: []
        },
        {
            text: '70 - 3 - 3 - 5',
            answer: 59,
            options: []
        },
        {
            text: '41 - 9 - 3 + 8',
            answer: 37,
            options: []
        },
        {
            text: '31 - 3 - 4 + 4',
            answer: 28,
            options: []
        },
        {
            text: '46 - 6 - 3 + 1',
            answer: 38,
            options: []
        },
        {
            text: '65 - 3 - 3 + 1',
            answer: 60,
            options: []
        },
        {
            text: '25 + 5 - 3 + 2',
            answer: 29,
            options: []
        },
        {
            text: '80 - 3 + 4 + 6',
            answer: 87,
            options: []
        },
        {
            text: '34 + 8 - 3 - 9',
            answer: 30,
            options: []
        },
        {
            text: '56 + 4 - 3 + 9',
            answer: 66,
            options: []
        },
        {
            text: '13 - 2 - 3 - 8',
            answer: 0,
            options: []
        },
        {
            text: '66 - 6 - 3 + 2',
            answer: 59,
            options: []
        },
        {
            text: '26 + 5 - 3 + 4',
            answer: 32,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-subtraction-minus-30': [
        {
            text: "94 + 15 - 33",
            answer: 76,
            options: []
        },
        {
            text: "39 + 99 - 38",
            answer: 100,
            options: []
        },
        {
            text: "56 + 54 - 33",
            answer: 77,
            options: []
        },
        {
            text: "36 + 74 - 39",
            answer: 71,
            options: []
        },
        {
            text: "83 + 22 - 33",
            answer: 72,
            options: []
        },
        {
            text: "71 + 82 - 31",
            answer: 122,
            options: []
        },
        {
            text: "27 + 82 - 35",
            answer: 74,
            options: []
        },
        {
            text: "28 + 82 + 32",
            answer: 142,
            options: []
        },
        {
            text: "89 + 28 - 33",
            answer: 84,
            options: []
        },
        {
            text: "31 + 97 + 30",
            answer: 158,
            options: []
        },
        {
            text: "19 + 91 - 34",
            answer: 76,
            options: []
        },
        {
            text: "48 + 68 - 36",
            answer: 80,
            options: []
        },
        {
            text: "74 + 33 - 33",
            answer: 74,
            options: []
        },
        {
            text: "64 + 54 - 32",
            answer: 86,
            options: []
        },
        {
            text: "78 + 32 - 30",
            answer: 80,
            options: []
        },
        {
            text: "38 + 91 - 39",
            answer: 90,
            options: []
        },
        {
            text: "19 + 91 - 30",
            answer: 80,
            options: []
        },
        {
            text: "20 + 80 - 30",
            answer: 70,
            options: []
        },
        {
            text: "58 + 52 - 39",
            answer: 71,
            options: []
        },
        {
            text: "14 + 99 - 35",
            answer: 78,
            options: []
        },
        {
            text: "35 + 85 - 35",
            answer: 85,
            options: []
        },
        {
            text: "63 + 42 - 36",
            answer: 69,
            options: []
        },
        {
            text: "92 + 18 - 38",
            answer: 72,
            options: []
        },
        {
            text: "22 + 88 - 30",
            answer: 80,
            options: []
        },
        {
            text: "27 + 83 - 35",
            answer: 75,
            options: []
        },
        {
            text: "77 + 33 - 33",
            answer: 77,
            options: []
        },
        {
            text: "66 - 33 - 33",
            answer: 0,
            options: []
        },
        {
            text: "45 + 65 - 37",
            answer: 73,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-subtraction-minus-2': [
        {
            text: "9 + 1 - 2 - 3",
            answer: 5,
            options: []
        },
        {
            text: "4 + 6 - 2 + 9",
            answer: 17,
            options: []
        },
        {
            text: "3 + 7 + 1 - 2",
            answer: 9,
            options: []
        },
        {
            text: "9 + 9 - 2 - 2",
            answer: 14,
            options: []
        },
        {
            text: "5 - 5 + 9 - 2",
            answer: 7,
            options: []
        },
        {
            text: "5 + 5 - 2 - 2",
            answer: 6,
            options: []
        },
        {
            text: "2 + 8 - 2 - 4",
            answer: 4,
            options: []
        },
        {
            text: "6 + 4 + 1 - 2",
            answer: 9,
            options: []
        },
        {
            text: "8 + 2 - 2 - 7",
            answer: 1,
            options: []
        },
        {
            text: "2 + 8 + 1 - 2",
            answer: 9,
            options: []
        },
        {
            text: "7 + 3 - 2 - 4",
            answer: 4,
            options: []
        },
        {
            text: "1 + 9 - 2 - 5",
            answer: 3,
            options: []
        },
        {
            text: "2 - 1 + 9 - 2",
            answer: 8,
            options: []
        },
        {
            text: "7 + 8 - 2 - 3",
            answer: 10,
            options: []
        },
        {
            text: "8 + 3 - 2 - 1",
            answer: 8,
            options: []
        },
        {
            text: "19 + 1 - 2 - 5",
            answer: 13,
            options: []
        },
        {
            text: "37 + 3 + 1 - 2",
            answer: 39,
            options: []
        },
        {
            text: "65 + 5 - 2 - 4",
            answer: 64,
            options: []
        },
        {
            text: "64 + 5 - 2 - 4",
            answer: 63,
            options: []
        },
        {
            text: "79 - 8 - 2 + 1",
            answer: 70,
            options: []
        },
        {
            text: "37 + 3 - 2 + 8",
            answer: 46,
            options: []
        },
        {
            text: "20 - 2 - 2 - 2",
            answer: 14,
            options: []
        },
        {
            text: "21 - 2 - 1 - 2",
            answer: 16,
            options: []
        },
        {
            text: "66 + 5 - 2 - 9",
            answer: 60,
            options: []
        },
        {
            text: "36 - 5 - 2 + 1",
            answer: 30,
            options: []
        },
        {
            text: "63 - 2 - 9 - 2",
            answer: 50,
            options: []
        },
        {
            text: "92 - 1 - 2 - 9",
            answer: 80,
            options: []
        },
        {
            text: "22 + 9 - 9 - 2",
            answer: 20,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-subtraction-minus-20': [
        {
            text: '48 + 62 - 22',
            answer: 88,
            options: []
        },
        {
            text: '16 + 91 - 20',
            answer: 87,
            options: []
        },
        {
            text: '28 + 91 - 20',
            answer: 99,
            options: []
        },
        {
            text: '32 + 78 - 29',
            answer: 81,
            options: []
        },
        {
            text: '33 + 77 - 27',
            answer: 83,
            options: []
        },
        {
            text: '54 + 53 - 20',
            answer: 87,
            options: []
        },
        {
            text: '67 + 43 - 20',
            answer: 90,
            options: []
        },
        {
            text: '25 + 85 - 29',
            answer: 81,
            options: []
        },
        {
            text: '20 + 99 - 24',
            answer: 95,
            options: []
        },
        {
            text: '82 + 28 - 26',
            answer: 84,
            options: []
        },
        {
            text: '14 + 96 - 28',
            answer: 82,
            options: []
        },
        {
            text: '51 + 59 - 29',
            answer: 81,
            options: []
        },
        {
            text: '54 + 54 - 24',
            answer: 84,
            options: []
        },
        {
            text: '74 + 44 - 28',
            answer: 90,
            options: []
        },
        {
            text: '41 + 69 - 20',
            answer: 90,
            options: []
        },
        {
            text: '88 + 22 - 20',
            answer: 90,
            options: []
        },
        {
            text: '93 + 17 - 28',
            answer: 82,
            options: []
        },
        {
            text: '41 + 69 - 26',
            answer: 84,
            options: []
        },
        {
            text: '25 + 94 - 29',
            answer: 90,
            options: []
        },
        {
            text: '69 + 55 - 22',
            answer: 102,
            options: []
        },
        {
            text: '34 + 74 - 22',
            answer: 86,
            options: []
        },
        {
            text: '18 + 92 - 20',
            answer: 90,
            options: []
        },
        {
            text: '49 - 29 - 12',
            answer: 8,
            options: []
        },
        {
            text: '69 + 41 - 98',
            answer: 12,
            options: []
        },
        {
            text: '34 + 73 - 23',
            answer: 84,
            options: []
        },
        {
            text: '19 + 91 - 24',
            answer: 86,
            options: []
        },
        {
            text: '49 + 69 - 21',
            answer: 97,
            options: []
        },
        {
            text: '54 + 59 - 24',
            answer: 89,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-subtraction-minus-1': [
        {
            text: '5 - 1 + 6 - 1',
            answer: 9,
            options: []
        },
        {
            text: '8 + 2 - 1 + 9',
            answer: 18,
            options: []
        },
        {
            text: '3 + 7 - 1 + 3',
            answer: 12,
            options: []
        },
        {
            text: '9 + 1 - 1 + 8',
            answer: 17,
            options: []
        },
        {
            text: '7 + 2 - 5 - 1',
            answer: 3,
            options: []
        },
        {
            text: '2 + 8 - 1 + 5',
            answer: 14,
            options: []
        },
        {
            text: '4 + 6 - 1 + 4',
            answer: 13,
            options: []
        },
        {
            text: '3 + 7 - 1 - 8',
            answer: 1,
            options: []
        },
        {
            text: '8 + 3 + 9 - 1',
            answer: 19,
            options: []
        },
        {
            text: '3 + 5 + 2 - 1',
            answer: 9,
            options: []
        },
        {
            text: '2 + 4 + 4 - 1',
            answer: 9,
            options: []
        },
        {
            text: '9 + 2 + 9 - 1',
            answer: 19,
            options: []
        },
        {
            text: '9 - 7 + 8 - 1',
            answer: 9,
            options: []
        },
        {
            text: '9 + 1 - 1 + 5',
            answer: 14,
            options: []
        },
        {
            text: '1 + 7 + 2 - 1',
            answer: 9,
            options: []
        },
        {
            text: '36 + 4 - 1 - 1',
            answer: 38,
            options: []
        },
        {
            text: '89 + 1 - 1 - 8',
            answer: 81,
            options: []
        },
        {
            text: '60 - 1 + 29',
            answer: 88,
            options: []
        },
        {
            text: '47 + 9 - 4 - 8',
            answer: 44,
            options: []
        },
        {
            text: '38 + 2 - 1 + 8',
            answer: 47,
            options: []
        },
        {
            text: '97 + 3 - 1 + 9',
            answer: 108,
            options: []
        },
        {
            text: '42 + 3 - 5 - 1',
            answer: 39,
            options: []
        },
        {
            text: '74 + 8 + 1 - 1',
            answer: 82,
            options: []
        },
        {
            text: '89 + 8 - 7 - 1',
            answer: 89,
            options: []
        },
        {
            text: '65 + 5 - 1 + 9',
            answer: 78,
            options: []
        },
        {
            text: '37 + 3 - 1 + 5',
            answer: 44,
            options: []
        },
        {
            text: '44 + 6 - 1 + 8',
            answer: 57,
            options: []
        },
        {
            text: '15 + 5 - 1 + 7',
            answer: 26,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'big-brother-subtraction-minus-10': [
        {
            text: "12 + 93 - 14",
            answer: 91,
            options: []
        },
        {
            text: "81 - 11 + 32",
            answer: 102,
            options: []
        },
        {
            text: "67 + 43 - 10",
            answer: 100,
            options: []
        },
        {
            text: "36 + 79 - 12",
            answer: 103,
            options: []
        },
        {
            text: "58 + 51 - 18",
            answer: 91,
            options: []
        },
        {
            text: "31 + 74 - 16",
            answer: 89,
            options: []
        },
        {
            text: "28 + 81 - 19",
            answer: 90,
            options: []
        },
        {
            text: "77 + 32 - 12",
            answer: 97,
            options: []
        },
        {
            text: "22 + 83 - 17",
            answer: 88,
            options: []
        },
        {
            text: "88 + 22 - 10",
            answer: 100,
            options: []
        },
        {
            text: "55 + 53 - 14",
            answer: 94,
            options: []
        },
        {
            text: "53 + 52 - 15",
            answer: 90,
            options: []
        },
        {
            text: "36 + 73 - 13",
            answer: 96,
            options: []
        },
        {
            text: "50 + 50 - 10",
            answer: 90,
            options: []
        },
        {
            text: "68 + 41 - 18",
            answer: 91,
            options: []
        },
        {
            text: "78 + 31 - 16",
            answer: 93,
            options: []
        },
        {
            text: "17 + 92 - 10",
            answer: 99,
            options: []
        },
        {
            text: "35 + 74 - 16",
            answer: 93,
            options: []
        },
        {
            text: "99 + 10 - 10",
            answer: 99,
            options: []
        },
        {
            text: "25 + 83 - 18",
            answer: 90,
            options: []
        },
        {
            text: "69 + 40 - 13",
            answer: 96,
            options: []
        },
        {
            text: "35 + 70 - 11",
            answer: 94,
            options: []
        },
        {
            text: "18 + 91 - 19",
            answer: 90,
            options: []
        },
        {
            text: "49 - 19 - 10",
            answer: 20,
            options: []
        },
        {
            text: "54 + 54 - 14",
            answer: 94,
            options: []
        },
        {
            text: "48 + 61 - 15",
            answer: 94,
            options: []
        },
        {
            text: "26 + 83 - 19",
            answer: 90,
            options: []
        },
        {
            text: "24 + 84 - 18",
            answer: 90,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        }))
};
}}),
"[project]/src/lib/question-data/combination-addition.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "combinationAdditionQuestions": (()=>combinationAdditionQuestions)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/questions.ts [app-ssr] (ecmascript)");
;
const combinationAdditionQuestions = {
    'combination-plus-6': [
        {
            text: '2 + 5 + 6 - 2',
            answer: 11,
            options: []
        },
        {
            text: '9 - 3 + 6 + 3',
            answer: 15,
            options: []
        },
        {
            text: '7 + 6 + 2 - 4',
            answer: 11,
            options: []
        },
        {
            text: '3 + 3 + 6 + 8',
            answer: 20,
            options: []
        },
        {
            text: '6 + 6 - 8 + 4',
            answer: 8,
            options: []
        },
        {
            text: '4 + 2 + 6 + 6',
            answer: 18,
            options: []
        },
        {
            text: '8 + 6 + 1 - 7',
            answer: 8,
            options: []
        },
        {
            text: '1 + 7 + 6 + 2',
            answer: 16,
            options: []
        },
        {
            text: '9 + 7 + 6 - 4',
            answer: 18,
            options: []
        },
        {
            text: '2 + 4 + 6 - 8',
            answer: 4,
            options: []
        },
        {
            text: '5 + 6 + 7 + 8',
            answer: 26,
            options: []
        },
        {
            text: '7 + 6 - 9 + 3',
            answer: 7,
            options: []
        },
        {
            text: '3 + 2 + 6 - 2',
            answer: 9,
            options: []
        },
        {
            text: '4 + 6 - 6 + 3',
            answer: 7,
            options: []
        },
        {
            text: '6 + 6 + 6 + 6',
            answer: 24,
            options: []
        },
        {
            text: '61 + 6 + 6 - 9',
            answer: 64,
            options: []
        },
        {
            text: '36 + 2 + 6 + 1',
            answer: 45,
            options: []
        },
        {
            text: '26 + 6 - 3 + 2',
            answer: 31,
            options: []
        },
        {
            text: '31 + 7 + 6 + 3',
            answer: 47,
            options: []
        },
        {
            text: '45 + 6 + 2 + 8',
            answer: 61,
            options: []
        },
        {
            text: '62 + 3 + 6 - 2',
            answer: 69,
            options: []
        },
        {
            text: '50 + 9 - 3 + 6',
            answer: 62,
            options: []
        },
        {
            text: '24 + 2 + 6 - 3',
            answer: 29,
            options: []
        },
        {
            text: '62 + 4 + 6 + 4',
            answer: 76,
            options: []
        },
        {
            text: '59 - 7 + 3 + 6',
            answer: 61,
            options: []
        },
        {
            text: '73 + 3 + 6 - 8',
            answer: 74,
            options: []
        },
        {
            text: '56 + 6 + 7 - 9',
            answer: 60,
            options: []
        },
        {
            text: '37 + 6 + 8 - 3',
            answer: 48,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'combination-plus-60': [
        {
            text: '10 + 60 + 60',
            answer: 130,
            options: []
        },
        {
            text: '90 - 20 + 60',
            answer: 130,
            options: []
        },
        {
            text: '40 + 60 + 60',
            answer: 160,
            options: []
        },
        {
            text: '90 - 80 + 60',
            answer: 70,
            options: []
        },
        {
            text: '70 - 10 + 60',
            answer: 120,
            options: []
        },
        {
            text: '70 + 60 + 20',
            answer: 150,
            options: []
        },
        {
            text: '50 + 60 - 10',
            answer: 100,
            options: []
        },
        {
            text: '40 + 10 + 60',
            answer: 110,
            options: []
        },
        {
            text: '50 + 60 + 20',
            answer: 130,
            options: []
        },
        {
            text: '20 + 60 + 60',
            answer: 140,
            options: []
        },
        {
            text: '60 + 60 + 70',
            answer: 190,
            options: []
        },
        {
            text: '90 - 30 + 60',
            answer: 120,
            options: []
        },
        {
            text: '80 + 60 + 10',
            answer: 150,
            options: []
        },
        {
            text: '30 + 20 + 60',
            answer: 110,
            options: []
        },
        {
            text: '60 + 60 + 60',
            answer: 180,
            options: []
        },
        {
            text: '38 + 16 - 22',
            answer: 32,
            options: []
        },
        {
            text: '57 - 21 + 36',
            answer: 72,
            options: []
        },
        {
            text: '15 + 66 - 44',
            answer: 37,
            options: []
        },
        {
            text: '27 + 31 + 66',
            answer: 124,
            options: []
        },
        {
            text: '38 - 22 + 36',
            answer: 52,
            options: []
        },
        {
            text: '80 - 27 + 26',
            answer: 79,
            options: []
        },
        {
            text: '57 + 26 - 52',
            answer: 31,
            options: []
        },
        {
            text: '15 + 36 - 32',
            answer: 19,
            options: []
        },
        {
            text: '18 + 56 - 12',
            answer: 62,
            options: []
        },
        {
            text: '79 - 53 + 16',
            answer: 42,
            options: []
        },
        {
            text: '43 + 65 - 35',
            answer: 73,
            options: []
        },
        {
            text: '39 - 33 + 46',
            answer: 52,
            options: []
        },
        {
            text: '44 - 22 + 66',
            answer: 88,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'combination-plus-7': [
        {
            text: '6 + 7 + 3 - 6',
            answer: 10,
            options: []
        },
        {
            text: '2 + 4 + 7 - 4',
            answer: 9,
            options: []
        },
        {
            text: '9 - 3 + 7 + 6',
            answer: 19,
            options: []
        },
        {
            text: '3 + 2 + 2 + 7',
            answer: 14,
            options: []
        },
        {
            text: '7 - 2 + 7 + 9',
            answer: 21,
            options: []
        },
        {
            text: '9 + 7 + 7 - 3',
            answer: 20,
            options: []
        },
        {
            text: '1 + 9 + 6 + 7',
            answer: 23,
            options: []
        },
        {
            text: '8 + 6 + 3 + 7',
            answer: 24,
            options: []
        },
        {
            text: '5 + 7 + 4 - 5',
            answer: 11,
            options: []
        },
        {
            text: '7 + 6 + 3 + 7',
            answer: 23,
            options: []
        },
        {
            text: '2 + 8 - 3 + 7',
            answer: 14,
            options: []
        },
        {
            text: '4 + 9 + 2 + 7',
            answer: 22,
            options: []
        },
        {
            text: '9 + 6 + 7 - 8',
            answer: 14,
            options: []
        },
        {
            text: '5 + 7 + 5 + 6',
            answer: 23,
            options: []
        },
        {
            text: '7 + 7 + 7 + 7',
            answer: 28,
            options: []
        },
        {
            text: '57 + 6 + 2 + 7',
            answer: 72,
            options: []
        },
        {
            text: '25 + 7 + 8 + 1',
            answer: 41,
            options: []
        },
        {
            text: '92 + 4 - 7 + 7',
            answer: 96,
            options: []
        },
        {
            text: '87 + 6 - 9 + 2',
            answer: 86,
            options: []
        },
        {
            text: '65 + 7 + 4 + 6',
            answer: 82,
            options: []
        },
        {
            text: '32 + 3 + 7 - 4',
            answer: 38,
            options: []
        },
        {
            text: '74 + 1 + 6 + 7',
            answer: 88,
            options: []
        },
        {
            text: '85 + 7 + 4 + 6',
            answer: 102,
            options: []
        },
        {
            text: '78 + 6 + 1 - 3',
            answer: 82,
            options: []
        },
        {
            text: '49 - 4 + 6 + 6',
            answer: 57,
            options: []
        },
        {
            text: '21 + 6 + 7 - 5',
            answer: 29,
            options: []
        },
        {
            text: '15 + 7 - 3 + 2',
            answer: 21,
            options: []
        },
        {
            text: '27 + 6 + 3 + 7',
            answer: 43,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'combination-plus-70': [
        {
            text: '50 + 70 + 60',
            answer: 180,
            options: []
        },
        {
            text: '60 + 70 + 10',
            answer: 140,
            options: []
        },
        {
            text: '70 + 70 + 70',
            answer: 210,
            options: []
        },
        {
            text: '20 + 30 + 70',
            answer: 120,
            options: []
        },
        {
            text: '10 + 60 + 70',
            answer: 140,
            options: []
        },
        {
            text: '90 - 30 + 70',
            answer: 130,
            options: []
        },
        {
            text: '30 + 20 + 60',
            answer: 110,
            options: []
        },
        {
            text: '20 + 20 - 20',
            answer: 20,
            options: []
        },
        {
            text: '60 + 60 + 60',
            answer: 180,
            options: []
        },
        {
            text: '80 - 20 + 70',
            answer: 130,
            options: []
        },
        {
            text: '70 - 20 + 70',
            answer: 120,
            options: []
        },
        {
            text: '40 + 10 + 70',
            answer: 120,
            options: []
        },
        {
            text: '70 + 60 - 90',
            answer: 40,
            options: []
        },
        {
            text: '60 - 10 + 70',
            answer: 120,
            options: []
        },
        {
            text: '30 + 20 + 70',
            answer: 120,
            options: []
        },
        {
            text: '57 + 76 - 25',
            answer: 108,
            options: []
        },
        {
            text: '92 - 39 + 75',
            answer: 128,
            options: []
        },
        {
            text: '34 + 23 + 77',
            answer: 134,
            options: []
        },
        {
            text: '54 + 73 - 27',
            answer: 100,
            options: []
        },
        {
            text: '76 + 17 - 62',
            answer: 31,
            options: []
        },
        {
            text: '49 + 72 + 17',
            answer: 138,
            options: []
        },
        {
            text: '38 - 33 + 56',
            answer: 61,
            options: []
        },
        {
            text: '69 - 14 + 67',
            answer: 122,
            options: []
        },
        {
            text: '75 + 37 - 84',
            answer: 28,
            options: []
        },
        {
            text: '26 + 57 - 72',
            answer: 11,
            options: []
        },
        {
            text: '59 - 33 + 27',
            answer: 53,
            options: []
        },
        {
            text: '24 + 31 + 76',
            answer: 131,
            options: []
        },
        {
            text: '16 + 27 - 32',
            answer: 11,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'combination-plus-8': [
        {
            text: '6 + 8 - 5 + 7',
            answer: 16,
            options: []
        },
        {
            text: '4 + 3 - 2 + 8',
            answer: 13,
            options: []
        },
        {
            text: '7 + 6 - 3 + 9',
            answer: 19,
            options: []
        },
        {
            text: '1 + 5 + 8 - 2',
            answer: 12,
            options: []
        },
        {
            text: '8 + 7 + 8 - 4',
            answer: 19,
            options: []
        },
        {
            text: '5 + 8 + 2 + 7',
            answer: 22,
            options: []
        },
        {
            text: '3 + 3 + 8 - 4',
            answer: 10,
            options: []
        },
        {
            text: '9 + 3 - 3 + 8',
            answer: 17,
            options: []
        },
        {
            text: '7 + 6 + 2 + 8',
            answer: 23,
            options: []
        },
        {
            text: '4 + 1 + 8 - 2',
            answer: 11,
            options: []
        },
        {
            text: '2 + 2 + 1 + 8',
            answer: 13,
            options: []
        },
        {
            text: '3 + 2 + 8 + 7',
            answer: 20,
            options: []
        },
        {
            text: '7 + 6 - 5 + 6',
            answer: 14,
            options: []
        },
        {
            text: '5 + 8 + 2 - 6',
            answer: 9,
            options: []
        },
        {
            text: '4 + 1 + 8 + 6',
            answer: 19,
            options: []
        },
        {
            text: '23 + 2 + 8 + 1',
            answer: 34,
            options: []
        },
        {
            text: '67 - 2 + 8 + 6',
            answer: 79,
            options: []
        },
        {
            text: '47 + 7 - 3 + 4',
            answer: 55,
            options: []
        },
        {
            text: '31 + 6 + 6 + 9',
            answer: 52,
            options: []
        },
        {
            text: '87 + 7 + 1 + 8',
            answer: 103,
            options: []
        },
        {
            text: '95 + 8 - 2 + 7',
            answer: 108,
            options: []
        },
        {
            text: '28 + 6 + 5 - 9',
            answer: 30,
            options: []
        },
        {
            text: '52 + 3 + 8 - 4',
            answer: 59,
            options: []
        },
        {
            text: '10 + 5 + 7 - 3',
            answer: 19,
            options: []
        },
        {
            text: '84 + 2 + 8 + 1',
            answer: 95,
            options: []
        },
        {
            text: '43 + 3 + 8 - 4',
            answer: 50,
            options: []
        },
        {
            text: '89 - 4 + 7 - 8',
            answer: 84,
            options: []
        },
        {
            text: '67 + 6 + 2 - 3',
            answer: 72,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'combination-plus-80': [
        {
            text: '30 + 60 - 70',
            answer: 20,
            options: []
        },
        {
            text: '10 + 80 - 40',
            answer: 50,
            options: []
        },
        {
            text: '70 - 20 + 80',
            answer: 130,
            options: []
        },
        {
            text: '50 + 80 - 10',
            answer: 120,
            options: []
        },
        {
            text: '90 - 40 + 80',
            answer: 130,
            options: []
        },
        {
            text: '60 + 80 + 60',
            answer: 200,
            options: []
        },
        {
            text: '30 + 20 + 60',
            answer: 110,
            options: []
        },
        {
            text: '40 + 30 + 70',
            answer: 140,
            options: []
        },
        {
            text: '80 + 80 + 80',
            answer: 240,
            options: []
        },
        {
            text: '50 + 80 - 30',
            answer: 100,
            options: []
        },
        {
            text: '70 - 10 + 80',
            answer: 140,
            options: []
        },
        {
            text: '90 - 30 + 80',
            answer: 140,
            options: []
        },
        {
            text: '60 + 80 - 20',
            answer: 120,
            options: []
        },
        {
            text: '40 + 10 + 60',
            answer: 110,
            options: []
        },
        {
            text: '20 + 30 + 80',
            answer: 130,
            options: []
        },
        {
            text: '37 + 17 + 82',
            answer: 136,
            options: []
        },
        {
            text: '87 + 28 + 18',
            answer: 133,
            options: []
        },
        {
            text: '69 - 14 + 88',
            answer: 143,
            options: []
        },
        {
            text: '28 + 56 - 72',
            answer: 12,
            options: []
        },
        {
            text: '53 + 82 + 68',
            answer: 203,
            options: []
        },
        {
            text: '25 + 28 + 62',
            answer: 115,
            options: []
        },
        {
            text: '76 + 76 - 38',
            answer: 114,
            options: []
        },
        {
            text: '93 + 35 + 86',
            answer: 214,
            options: []
        },
        {
            text: '22 + 33 + 67',
            answer: 122,
            options: []
        },
        {
            text: '61 - 28 + 26',
            answer: 59,
            options: []
        },
        {
            text: '72 + 73 - 35',
            answer: 110,
            options: []
        },
        {
            text: '89 - 23 + 58',
            answer: 124,
            options: []
        },
        {
            text: '99 - 44 + 68',
            answer: 123,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'combination-plus-9': [
        {
            text: '3 + 5 + 7 + 9',
            answer: 24,
            options: []
        },
        {
            text: '6 - 1 + 9 + 2',
            answer: 16,
            options: []
        },
        {
            text: '8 + 1 - 3 + 9',
            answer: 15,
            options: []
        },
        {
            text: '2 + 4 + 7 - 4',
            answer: 9,
            options: []
        },
        {
            text: '7 - 1 - 1 + 9',
            answer: 14,
            options: []
        },
        {
            text: '9 + 9 - 3 + 9',
            answer: 24,
            options: []
        },
        {
            text: '5 + 8 + 2 + 7',
            answer: 22,
            options: []
        },
        {
            text: '4 + 2 + 6 + 6',
            answer: 18,
            options: []
        },
        {
            text: '8 - 3 + 9 + 5',
            answer: 19,
            options: []
        },
        {
            text: '9 - 4 + 9 + 5',
            answer: 19,
            options: []
        },
        {
            text: '9 - 4 + 9 + 9',
            answer: 23,
            options: []
        },
        {
            text: '7 + 6 + 3 + 7',
            answer: 23,
            options: []
        },
        {
            text: '1 + 8 + 6 + 9',
            answer: 24,
            options: []
        },
        {
            text: '9 + 9 + 9 + 9',
            answer: 36,
            options: []
        },
        {
            text: '3 + 5 - 3 + 9',
            answer: 14,
            options: []
        },
        {
            text: '14 + 2 + 6 - 3',
            answer: 19,
            options: []
        },
        {
            text: '59 - 4 + 9 + 5',
            answer: 69,
            options: []
        },
        {
            text: '87 - 1 - 1 + 9',
            answer: 94,
            options: []
        },
        {
            text: '26 + 6 - 3 + 2',
            answer: 31,
            options: []
        },
        {
            text: '40 + 5 + 9 + 9',
            answer: 63,
            options: []
        },
        {
            text: '85 + 8 + 2 + 7',
            answer: 102,
            options: []
        },
        {
            text: '98 - 2 + 7 - 3',
            answer: 100,
            options: []
        },
        {
            text: '21 + 8 + 6 + 9',
            answer: 44,
            options: []
        },
        {
            text: '65 + 7 + 4 + 6',
            answer: 82,
            options: []
        },
        {
            text: '79 + 9 - 3 + 9',
            answer: 94,
            options: []
        },
        {
            text: '39 - 4 + 9 + 9',
            answer: 53,
            options: []
        },
        {
            text: '58 + 1 - 3 + 9',
            answer: 65,
            options: []
        },
        {
            text: '68 - 3 + 9 + 5',
            answer: 79,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'combination-plus-90': [
        {
            text: '50 + 90 + 60',
            answer: 200,
            options: []
        },
        {
            text: '60 - 10 + 90',
            answer: 140,
            options: []
        },
        {
            text: '50 + 90 + 10',
            answer: 150,
            options: []
        },
        {
            text: '90 + 90 + 90',
            answer: 270,
            options: []
        },
        {
            text: '30 + 60 - 70',
            answer: 20,
            options: []
        },
        {
            text: '70 - 20 + 90',
            answer: 140,
            options: []
        },
        {
            text: '10 + 80 + 90',
            answer: 180,
            options: []
        },
        {
            text: '80 - 30 + 90',
            answer: 140,
            options: []
        },
        {
            text: '40 + 10 + 70',
            answer: 120,
            options: []
        },
        {
            text: '50 + 90 - 10',
            answer: 130,
            options: []
        },
        {
            text: '80 - 20 + 90',
            answer: 150,
            options: []
        },
        {
            text: '50 + 90 + 30',
            answer: 170,
            options: []
        },
        {
            text: '20 + 60 + 60',
            answer: 140,
            options: []
        },
        {
            text: '60 - 10 + 90',
            answer: 140,
            options: []
        },
        {
            text: '50 + 90 + 20',
            answer: 160,
            options: []
        },
        {
            text: '54 + 29 - 55',
            answer: 28,
            options: []
        },
        {
            text: '31 + 28 + 93',
            answer: 152,
            options: []
        },
        {
            text: '69 - 14 + 99',
            answer: 154,
            options: []
        },
        {
            text: '47 + 12 + 95',
            answer: 154,
            options: []
        },
        {
            text: '39 - 24 + 79',
            answer: 94,
            options: []
        },
        {
            text: '93 + 22 + 59',
            answer: 174,
            options: []
        },
        {
            text: '12 + 13 + 69',
            answer: 94,
            options: []
        },
        {
            text: '15 + 49 - 62',
            answer: 2,
            options: []
        },
        {
            text: '71 + 74 + 39',
            answer: 184,
            options: []
        },
        {
            text: '56 + 27 - 32',
            answer: 51,
            options: []
        },
        {
            text: '88 + 66 + 92',
            answer: 246,
            options: []
        },
        {
            text: '25 + 29 - 32',
            answer: 22,
            options: []
        },
        {
            text: '89 + 29 + 26',
            answer: 144,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        }))
};
}}),
"[project]/src/lib/question-data/combination-subtraction.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "combinationSubtractionQuestions": (()=>combinationSubtractionQuestions)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/questions.ts [app-ssr] (ecmascript)");
;
const combinationSubtractionQuestions = {
    'combination-minus-6': [
        {
            text: "9 + 3 - 6 + 4",
            answer: 10,
            options: []
        },
        {
            text: "2 + 8 + 2 - 6",
            answer: 6,
            options: []
        },
        {
            text: "3 + 7 + 1 - 6",
            answer: 5,
            options: []
        },
        {
            text: "7 + 7 - 6 + 3",
            answer: 11,
            options: []
        },
        {
            text: "8 + 3 - 6 + 5",
            answer: 10,
            options: []
        },
        {
            text: "5 + 5 + 4 - 6",
            answer: 8,
            options: []
        },
        {
            text: "6 + 6 - 6 - 6",
            answer: 0,
            options: []
        },
        {
            text: "5 + 5 + 1 - 6",
            answer: 5,
            options: []
        },
        {
            text: "1 + 9 + 1 - 6",
            answer: 5,
            options: []
        },
        {
            text: "3 + 8 - 6 + 5",
            answer: 10,
            options: []
        },
        {
            text: "6 + 5 + 3 - 6",
            answer: 8,
            options: []
        },
        {
            text: "7 + 6 - 6 + 3",
            answer: 10,
            options: []
        },
        {
            text: "8 + 3 - 6 + 5",
            answer: 10,
            options: []
        },
        {
            text: "8 + 2 - 6 - 6",
            answer: -2,
            options: []
        },
        {
            text: "5 + 5 + 2 - 6",
            answer: 6,
            options: []
        },
        {
            text: "12 - 6 + 8 - 6",
            answer: 8,
            options: []
        },
        {
            text: "45 + 5 - 9 - 6",
            answer: 35,
            options: []
        },
        {
            text: "14 - 6 + 3 - 6",
            answer: 5,
            options: []
        },
        {
            text: "35 + 5 - 6 - 6",
            answer: 28,
            options: []
        },
        {
            text: "78 + 4 - 6 + 4",
            answer: 80,
            options: []
        },
        {
            text: "34 - 6 + 5 - 6",
            answer: 27,
            options: []
        },
        {
            text: "21 - 6 + 7 - 6",
            answer: 16,
            options: []
        },
        {
            text: "56 + 6 - 6 + 9",
            answer: 65,
            options: []
        },
        {
            text: "61 - 6 + 9 - 6",
            answer: 58,
            options: []
        },
        {
            text: "17 + 7 - 6 + 7",
            answer: 25,
            options: []
        },
        {
            text: "65 + 5 + 4 - 6",
            answer: 68,
            options: []
        },
        {
            text: "78 - 6 - 6 - 6",
            answer: 60,
            options: []
        },
        {
            text: "23 - 6 + 3 + 9",
            answer: 29,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'combination-minus-60': [
        {
            text: "80 + 30 - 60",
            answer: 50,
            options: []
        },
        {
            text: "20 + 87 - 61",
            answer: 46,
            options: []
        },
        {
            text: "50 + 55 - 69",
            answer: 36,
            options: []
        },
        {
            text: "60 + 84 - 63",
            answer: 81,
            options: []
        },
        {
            text: "90 + 37 - 66",
            answer: 61,
            options: []
        },
        {
            text: "89 + 29 - 65",
            answer: 53,
            options: []
        },
        {
            text: "90 + 19 - 60",
            answer: 49,
            options: []
        },
        {
            text: "92 + 53 - 65",
            answer: 80,
            options: []
        },
        {
            text: "85 + 54 - 69",
            answer: 70,
            options: []
        },
        {
            text: "69 + 80 - 64",
            answer: 85,
            options: []
        },
        {
            text: "45 + 92 - 65",
            answer: 72,
            options: []
        },
        {
            text: "42 + 93 - 69",
            answer: 66,
            options: []
        },
        {
            text: "98 + 51 - 65",
            answer: 84,
            options: []
        },
        {
            text: "85 + 55 - 68",
            answer: 72,
            options: []
        },
        {
            text: "52 + 58 - 66",
            answer: 44,
            options: []
        },
        {
            text: "65 + 82 - 68",
            answer: 79,
            options: []
        },
        {
            text: "32 + 99 - 69",
            answer: 62,
            options: []
        },
        {
            text: "10 + 27 + 66",
            answer: 103,
            options: []
        },
        {
            text: "75 + 73 - 65",
            answer: 83,
            options: []
        },
        {
            text: "43 + 82 - 63",
            answer: 62,
            options: []
        },
        {
            text: "33 + 77 - 64",
            answer: 46,
            options: []
        },
        {
            text: "75 + 55 - 65",
            answer: 65,
            options: []
        },
        {
            text: "98 + 51 - 60",
            answer: 89,
            options: []
        },
        {
            text: "49 + 90 - 69",
            answer: 70,
            options: []
        },
        {
            text: "12 + 98 - 60",
            answer: 50,
            options: []
        },
        {
            text: "32 + 88 - 69",
            answer: 51,
            options: []
        },
        {
            text: "54 + 56 - 69",
            answer: 41,
            options: []
        },
        {
            text: "43 + 97 - 68",
            answer: 72,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'combination-minus-7': [
        {
            text: '3 + 9 - 7 + 5',
            answer: 10,
            options: []
        },
        {
            text: '7 + 7 - 7 + 8',
            answer: 15,
            options: []
        },
        {
            text: '6 + 5 - 7 - 2',
            answer: 2,
            options: []
        },
        {
            text: '9 + 3 - 7 + 4',
            answer: 9,
            options: []
        },
        {
            text: '4 + 8 - 7 + 5',
            answer: 10,
            options: []
        },
        {
            text: '7 + 7 - 7 + 3',
            answer: 10,
            options: []
        },
        {
            text: '3 + 9 - 7 + 2',
            answer: 7,
            options: []
        },
        {
            text: '5 + 5 - 7 - 2',
            answer: 1,
            options: []
        },
        {
            text: '6 + 8 - 7 - 7',
            answer: 0,
            options: []
        },
        {
            text: '1 + 9 - 7 + 7',
            answer: 10,
            options: []
        },
        {
            text: '9 + 1 - 7 + 2',
            answer: 5,
            options: []
        },
        {
            text: '4 + 8 - 7 + 5',
            answer: 10,
            options: []
        },
        {
            text: '7 + 7 - 7 + 8',
            answer: 15,
            options: []
        },
        {
            text: '6 + 2 - 5 + 7',
            answer: 10,
            options: []
        },
        {
            text: '2 + 8 - 7 - 2',
            answer: 1,
            options: []
        },
        {
            text: '25 + 5 - 7 + 7',
            answer: 30,
            options: []
        },
        {
            text: '69 - 7 + 7 - 7',
            answer: 62,
            options: []
        },
        {
            text: '34 - 8 + 1 - 7',
            answer: 20,
            options: []
        },
        {
            text: '18 + 5 - 7 + 9',
            answer: 25,
            options: []
        },
        {
            text: '15 + 5 - 7 - 7',
            answer: 6,
            options: []
        },
        {
            text: '59 + 5 - 7 + 8',
            answer: 65,
            options: []
        },
        {
            text: '56 + 7 - 7 + 9',
            answer: 65,
            options: []
        },
        {
            text: '38 + 2 - 7 - 7',
            answer: 26,
            options: []
        },
        {
            text: '88 + 5 - 7 - 3',
            answer: 83,
            options: []
        },
        {
            text: '42 - 7 - 2 - 7',
            answer: 26,
            options: []
        },
        {
            text: '22 - 7 - 4 - 6',
            answer: 5,
            options: []
        },
        {
            text: '53 - 6 + 8 - 1',
            answer: 54,
            options: []
        },
        {
            text: '83 - 7 + 9 - 2',
            answer: 83,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'combination-minus-70': [
        {
            text: '80 + 60 - 70',
            answer: 70,
            options: []
        },
        {
            text: '30 + 90 - 70',
            answer: 50,
            options: []
        },
        {
            text: '90 + 30 - 10',
            answer: 110,
            options: []
        },
        {
            text: '50 + 80 - 70',
            answer: 60,
            options: []
        },
        {
            text: '90 + 50 - 60',
            answer: 80,
            options: []
        },
        {
            text: '70 + 70 - 70',
            answer: 70,
            options: []
        },
        {
            text: '20 + 50 + 70',
            answer: 140,
            options: []
        },
        {
            text: '50 + 70 - 60',
            answer: 60,
            options: []
        },
        {
            text: '60 + 60 - 70',
            answer: 50,
            options: []
        },
        {
            text: '70 + 60 - 70',
            answer: 60,
            options: []
        },
        {
            text: '40 + 90 - 70',
            answer: 60,
            options: []
        },
        {
            text: '20 + 40 + 60',
            answer: 120,
            options: []
        },
        {
            text: '80 + 30 - 60',
            answer: 50,
            options: []
        },
        {
            text: '90 + 70 - 70',
            answer: 90,
            options: []
        },
        {
            text: '70 + 80 - 70',
            answer: 80,
            options: []
        },
        {
            text: '45 + 32 - 27',
            answer: 50,
            options: []
        },
        {
            text: '79 + 45 - 73',
            answer: 51,
            options: []
        },
        {
            text: '31 - 16 + 23',
            answer: 38,
            options: []
        },
        {
            text: '77 + 72 - 76',
            answer: 73,
            options: []
        },
        {
            text: '96 + 37 - 77',
            answer: 56,
            options: []
        },
        {
            text: '61 + 65 - 71',
            answer: 55,
            options: []
        },
        {
            text: '88 + 44 - 77',
            answer: 55,
            options: []
        },
        {
            text: '23 + 44 + 75',
            answer: 142,
            options: []
        },
        {
            text: '49 + 91 - 74',
            answer: 66,
            options: []
        },
        {
            text: '92 + 54 - 74',
            answer: 72,
            options: []
        },
        {
            text: '44 + 88 - 74',
            answer: 58,
            options: []
        },
        {
            text: '49 + 99 - 78',
            answer: 70,
            options: []
        },
        {
            text: '78 + 75 - 70',
            answer: 83,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'combination-minus-8': [
        {
            text: '1 + 9 + 3 - 8',
            answer: 5,
            options: []
        },
        {
            text: '5 + 5 + 4 - 8',
            answer: 6,
            options: []
        },
        {
            text: '2 + 8 + 3 - 8',
            answer: 5,
            options: []
        },
        {
            text: '8 - 8 + 8 + 8',
            answer: 16,
            options: []
        },
        {
            text: '3 + 1 + 9 - 8',
            answer: 5,
            options: []
        },
        {
            text: '9 - 5 + 8 + 4',
            answer: 16,
            options: []
        },
        {
            text: '7 - 3 + 8 + 9',
            answer: 21,
            options: []
        },
        {
            text: '2 + 8 + 8 - 5',
            answer: 13,
            options: []
        },
        {
            text: '4 + 9 - 8 - 2',
            answer: 3,
            options: []
        },
        {
            text: '3 + 5 + 2 - 8',
            answer: 2,
            options: []
        },
        {
            text: '8 + 5 - 8 + 5',
            answer: 10,
            options: []
        },
        {
            text: '6 + 5 + 2 - 8',
            answer: 5,
            options: []
        },
        {
            text: '2 + 9 + 9 - 8',
            answer: 12,
            options: []
        },
        {
            text: '9 + 6 - 8 - 5',
            answer: 2,
            options: []
        },
        {
            text: '9 - 5 + 8 - 8',
            answer: 4,
            options: []
        },
        {
            text: '98 - 5 - 8 - 2',
            answer: 83,
            options: []
        },
        {
            text: '55 - 2 - 8 - 2',
            answer: 43,
            options: []
        },
        {
            text: '30 - 7 - 8 + 5',
            answer: 20,
            options: []
        },
        {
            text: '20 - 7 - 8 + 9',
            answer: 14,
            options: []
        },
        {
            text: '43 - 8 + 7 - 8',
            answer: 34,
            options: []
        },
        {
            text: '99 + 4 - 8 + 8',
            answer: 103,
            options: []
        },
        {
            text: '87 + 7 - 8 - 6',
            answer: 80,
            options: []
        },
        {
            text: '44 - 8 - 9 + 7',
            answer: 34,
            options: []
        },
        {
            text: '24 - 8 + 4 - 6',
            answer: 14,
            options: []
        },
        {
            text: '40 + 3 - 8 + 5',
            answer: 40,
            options: []
        },
        {
            text: '35 - 2 - 8 - 7',
            answer: 18,
            options: []
        },
        {
            text: '69 - 5 - 8 + 4',
            answer: 60,
            options: []
        },
        {
            text: '78 + 5 - 8 - 8',
            answer: 67,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'combination-minus-80': [
        {
            text: '98 + 51 - 89',
            answer: 60,
            options: []
        },
        {
            text: '55 + 40 - 95',
            answer: 0,
            options: []
        },
        {
            text: '80 + 54 - 83',
            answer: 51,
            options: []
        },
        {
            text: '20 + 97 - 85',
            answer: 32,
            options: []
        },
        {
            text: '43 + 92 - 85',
            answer: 50,
            options: []
        },
        {
            text: '87 + 53 - 89',
            answer: 51,
            options: []
        },
        {
            text: '76 + 70 - 88',
            answer: 58,
            options: []
        },
        {
            text: '12 + 33 + 65',
            answer: 110,
            options: []
        },
        {
            text: '86 + 54 - 68',
            answer: 72,
            options: []
        },
        {
            text: '76 + 70 - 89',
            answer: 57,
            options: []
        },
        {
            text: '89 + 59 - 88',
            answer: 60,
            options: []
        },
        {
            text: '82 + 63 - 85',
            answer: 60,
            options: []
        },
        {
            text: '66 + 80 - 85',
            answer: 61,
            options: []
        },
        {
            text: '95 + 52 - 87',
            answer: 60,
            options: []
        },
        {
            text: '79 + 70 + 84',
            answer: 233,
            options: []
        },
        {
            text: '53 + 82 - 85',
            answer: 50,
            options: []
        },
        {
            text: '87 + 56 - 86',
            answer: 57,
            options: []
        },
        {
            text: '75 + 72 - 88',
            answer: 59,
            options: []
        },
        {
            text: '63 + 82 - 87',
            answer: 58,
            options: []
        },
        {
            text: '97 + 44 - 87',
            answer: 54,
            options: []
        },
        {
            text: '67 + 83 - 86',
            answer: 64,
            options: []
        },
        {
            text: '54 + 94 - 89',
            answer: 59,
            options: []
        },
        {
            text: '98 + 51 - 89',
            answer: 60,
            options: []
        },
        {
            text: '85 + 55 - 81',
            answer: 59,
            options: []
        },
        {
            text: '87 + 57 - 88',
            answer: 56,
            options: []
        },
        {
            text: '45 + 52 - 87',
            answer: 10,
            options: []
        },
        {
            text: '55 + 94 - 85',
            answer: 64,
            options: []
        },
        {
            text: '69 + 80 - 89',
            answer: 60,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'combination-minus-9': [
        {
            text: "8 + 6 - 9 + 5",
            answer: 10,
            options: []
        },
        {
            text: "3 + 1 + 6 - 9",
            answer: 1,
            options: []
        },
        {
            text: "9 + 5 - 9 + 2",
            answer: 7,
            options: []
        },
        {
            text: "5 + 6 + 6 - 9",
            answer: 8,
            options: []
        },
        {
            text: "3 + 2 + 9 - 9",
            answer: 5,
            options: []
        },
        {
            text: "7 + 7 - 9 + 5",
            answer: 10,
            options: []
        },
        {
            text: "2 + 8 - 9 + 8",
            answer: 9,
            options: []
        },
        {
            text: "5 + 5 - 6 + 5",
            answer: 9,
            options: []
        },
        {
            text: "6 + 8 - 9 + 5",
            answer: 10,
            options: []
        },
        {
            text: "4 + 5 + 5 - 9",
            answer: 5,
            options: []
        },
        {
            text: "4 + 2 + 8 - 9",
            answer: 5,
            options: []
        },
        {
            text: "3 + 7 + 4 - 9",
            answer: 5,
            options: []
        },
        {
            text: "8 + 6 - 9 + 7",
            answer: 12,
            options: []
        },
        {
            text: "9 + 5 - 9 + 5",
            answer: 10,
            options: []
        },
        {
            text: "3 + 7 + 4 - 9",
            answer: 5,
            options: []
        },
        {
            text: "93 - 9 - 9 - 3",
            answer: 72,
            options: []
        },
        {
            text: "38 + 6 - 9 + 5",
            answer: 40,
            options: []
        },
        {
            text: "46 + 8 - 9 - 7",
            answer: 38,
            options: []
        },
        {
            text: "37 + 7 - 9 - 2",
            answer: 33,
            options: []
        },
        {
            text: "95 + 4 + 5 - 9",
            answer: 95,
            options: []
        },
        {
            text: "46 + 8 - 9 + 5",
            answer: 50,
            options: []
        },
        {
            text: "15 + 9 - 9 + 5",
            answer: 20,
            options: []
        },
        {
            text: "28 + 6 - 9 + 8",
            answer: 33,
            options: []
        },
        {
            text: "51 + 3 - 9 + 4",
            answer: 49,
            options: []
        },
        {
            text: "97 + 7 - 9 - 4",
            answer: 91,
            options: []
        },
        {
            text: "48 + 6 - 9 + 2",
            answer: 47,
            options: []
        },
        {
            text: "78 + 1 - 5 - 9",
            answer: 65,
            options: []
        },
        {
            text: "96 - 2 - 9 + 9",
            answer: 94,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        })),
    'combination-minus-90': [
        {
            text: '74 + 73 - 92',
            answer: 55,
            options: []
        },
        {
            text: '58 + 91 - 94',
            answer: 55,
            options: []
        },
        {
            text: '64 + 84 - 94',
            answer: 54,
            options: []
        },
        {
            text: '83 + 62 - 95',
            answer: 50,
            options: []
        },
        {
            text: '59 + 50 - 99',
            answer: 10,
            options: []
        },
        {
            text: '89 + 60 - 92',
            answer: 57,
            options: []
        },
        {
            text: '95 + 54 - 95',
            answer: 54,
            options: []
        },
        {
            text: '50 + 94 - 93',
            answer: 51,
            options: []
        },
        {
            text: '68 + 81 - 99',
            answer: 50,
            options: []
        },
        {
            text: '89 + 60 - 91',
            answer: 58,
            options: []
        },
        {
            text: '98 + 51 - 97',
            answer: 52,
            options: []
        },
        {
            text: '69 + 80 - 97',
            answer: 52,
            options: []
        },
        {
            text: '84 + 64 - 94',
            answer: 54,
            options: []
        },
        {
            text: '89 + 60 - 98',
            answer: 51,
            options: []
        },
        {
            text: '82 + 63 - 95',
            answer: 50,
            options: []
        },
        {
            text: '78 + 71 - 94',
            answer: 55,
            options: []
        },
        {
            text: '63 + 82 - 95',
            answer: 50,
            options: []
        },
        {
            text: '58 + 91 - 92',
            answer: 57,
            options: []
        },
        {
            text: '67 + 82 - 99',
            answer: 50,
            options: []
        },
        {
            text: '78 + 71 - 91',
            answer: 58,
            options: []
        },
        {
            text: '98 + 51 - 98',
            answer: 51,
            options: []
        },
        {
            text: '68 + 81 - 95',
            answer: 54,
            options: []
        },
        {
            text: '89 + 60 - 95',
            answer: 54,
            options: []
        },
        {
            text: '40 + 69 - 69',
            answer: 40,
            options: []
        },
        {
            text: '65 + 84 - 95',
            answer: 54,
            options: []
        },
        {
            text: '70 + 73 - 99',
            answer: 44,
            options: []
        },
        {
            text: '78 + 71 - 91',
            answer: 58,
            options: []
        },
        {
            text: '67 + 81 - 91',
            answer: 57,
            options: []
        }
    ].map((q)=>({
            ...q,
            options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateOptions"])(q.answer)
        }))
};
}}),
"[project]/src/lib/questions.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "generateGameQuestions": (()=>generateGameQuestions),
    "generateOptions": (()=>generateOptions),
    "generateTest": (()=>generateTest),
    "getTestSettings": (()=>getTestSettings)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$basic$2d$addition$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/question-data/basic-addition.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$basic$2d$subtraction$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/question-data/basic-subtraction.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$big$2d$brother$2d$addition$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/question-data/big-brother-addition.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$big$2d$brother$2d$subtraction$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/question-data/big-brother-subtraction.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$combination$2d$addition$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/question-data/combination-addition.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$combination$2d$subtraction$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/question-data/combination-subtraction.ts [app-ssr] (ecmascript)");
;
;
;
;
;
;
const masteryMixQuestions = {
    'mastery-mix-1': [
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$basic$2d$addition$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["basicAdditionQuestions"]['basic-addition-plus-4'],
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$basic$2d$subtraction$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["basicSubtractionQuestions"]['basic-subtraction-minus-1']
    ],
    'mastery-mix-2': [
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$basic$2d$addition$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["basicAdditionQuestions"]['basic-addition-plus-3'],
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$basic$2d$subtraction$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["basicSubtractionQuestions"]['basic-subtraction-minus-2']
    ],
    'mastery-mix-3': [
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$basic$2d$addition$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["basicAdditionQuestions"]['basic-addition-plus-2'],
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$basic$2d$subtraction$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["basicSubtractionQuestions"]['basic-subtraction-minus-3']
    ],
    'mastery-mix-4': [
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$basic$2d$addition$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["basicAdditionQuestions"]['basic-addition-plus-1'],
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$basic$2d$subtraction$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["basicSubtractionQuestions"]['basic-subtraction-minus-4']
    ],
    'mastery-mix-5': [
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$big$2d$brother$2d$addition$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bigBrotherAdditionQuestions"]['big-brother-addition-plus-9'],
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$big$2d$brother$2d$subtraction$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bigBrotherSubtractionQuestions"]['big-brother-subtraction-minus-9']
    ],
    'mastery-mix-6': [
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$big$2d$brother$2d$addition$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bigBrotherAdditionQuestions"]['big-brother-addition-plus-8'],
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$big$2d$brother$2d$subtraction$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bigBrotherSubtractionQuestions"]['big-brother-subtraction-minus-8']
    ],
    'mastery-mix-7': [
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$big$2d$brother$2d$addition$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bigBrotherAdditionQuestions"]['big-brother-addition-plus-7'],
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$big$2d$brother$2d$subtraction$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bigBrotherSubtractionQuestions"]['big-brother-subtraction-minus-7']
    ],
    'mastery-mix-8': [
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$big$2d$brother$2d$addition$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bigBrotherAdditionQuestions"]['big-brother-addition-plus-6'],
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$big$2d$brother$2d$subtraction$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bigBrotherSubtractionQuestions"]['big-brother-subtraction-minus-6']
    ],
    'mastery-mix-9': [
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$combination$2d$addition$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combinationAdditionQuestions"]['combination-plus-9'],
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$combination$2d$subtraction$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combinationSubtractionQuestions"]['combination-minus-9']
    ],
    'mastery-mix-10': [
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$combination$2d$addition$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combinationAdditionQuestions"]['combination-plus-8'],
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$combination$2d$subtraction$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combinationSubtractionQuestions"]['combination-minus-8']
    ],
    'mastery-mix-11': [
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$combination$2d$addition$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combinationAdditionQuestions"]['combination-plus-7'],
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$combination$2d$subtraction$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combinationSubtractionQuestions"]['combination-minus-7']
    ],
    'mastery-mix-12': [
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$combination$2d$addition$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combinationAdditionQuestions"]['combination-plus-6'],
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$combination$2d$subtraction$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combinationSubtractionQuestions"]['combination-minus-6']
    ]
};
const TEST_CONFIG = {
    'beads-identify': {
        easy: {
            numQuestions: 20,
            timeLimit: 0,
            title: 'Identify Beads Value',
            icon: 'eye'
        }
    },
    'beads-set': {
        easy: {
            numQuestions: 20,
            timeLimit: 0,
            title: 'Set Beads Value',
            icon: 'puzzle'
        }
    },
    'addition-subtraction': {
        easy: {
            numQuestions: 50,
            timeLimit: 300,
            title: 'Addition & Subtraction (Easy)',
            icon: 'brain-circuit'
        },
        medium: {
            numQuestions: 100,
            timeLimit: 600,
            title: 'Addition & Subtraction (Medium)',
            icon: 'brain-circuit'
        },
        hard: {
            numQuestions: 150,
            timeLimit: 900,
            title: 'Addition & Subtraction (Hard)',
            icon: 'brain-circuit'
        }
    },
    multiplication: {
        easy: {
            numQuestions: 50,
            timeLimit: 300,
            title: 'Multiplication (Easy)',
            icon: 'x'
        },
        medium: {
            numQuestions: 100,
            timeLimit: 600,
            title: 'Multiplication (Medium)',
            icon: 'x'
        },
        hard: {
            numQuestions: 150,
            timeLimit: 900,
            title: 'Multiplication (Hard)',
            icon: 'x'
        }
    },
    division: {
        easy: {
            numQuestions: 50,
            timeLimit: 300,
            title: 'Division (Easy)',
            icon: 'divide'
        },
        medium: {
            numQuestions: 100,
            timeLimit: 600,
            title: 'Division (Medium)',
            icon: 'divide'
        },
        hard: {
            numQuestions: 150,
            timeLimit: 900,
            title: 'Division (Hard)',
            icon: 'divide'
        }
    },
    'basic-addition-plus-4': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +4 = +5 - 1',
            icon: 'puzzle'
        }
    },
    'basic-addition-plus-40': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +40 = +50 - 10',
            icon: 'puzzle'
        }
    },
    'basic-addition-plus-3': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +3 = +5 - 2',
            icon: 'puzzle'
        }
    },
    'basic-addition-plus-30': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +30 = +50 - 20',
            icon: 'puzzle'
        }
    },
    'basic-addition-plus-2': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +2 = +5 - 3',
            icon: 'puzzle'
        }
    },
    'basic-addition-plus-20': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +20 = +50 - 30',
            icon: 'puzzle'
        }
    },
    'basic-addition-plus-1': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +1 = +5 - 4',
            icon: 'puzzle'
        }
    },
    'basic-addition-plus-10': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +10 = +50 - 40',
            icon: 'puzzle'
        }
    },
    'basic-subtraction-minus-4': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -4 = -5 + 1',
            icon: 'puzzle'
        }
    },
    'basic-subtraction-minus-40': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -40 = -50 + 10',
            icon: 'puzzle'
        }
    },
    'basic-subtraction-minus-3': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -3 = -5 + 2',
            icon: 'puzzle'
        }
    },
    'basic-subtraction-minus-30': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -30 = -50 + 20',
            icon: 'puzzle'
        }
    },
    'basic-subtraction-minus-2': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -2 = -5 + 3',
            icon: 'puzzle'
        }
    },
    'basic-subtraction-minus-20': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -20 = -50 + 30',
            icon: 'puzzle'
        }
    },
    'basic-subtraction-minus-1': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -1 = -5 + 4',
            icon: 'puzzle'
        }
    },
    'basic-subtraction-minus-10': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -10 = -50 + 40',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-9': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +9 = +10 - 1',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-90': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +90 = +100 - 10',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-8': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +8 = +10 - 2',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-80': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +80 = +100 - 20',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-7': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +7 = +10 - 3',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-70': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +70 = +100 - 30',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-6': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +6 = +10 - 4',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-60': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +60 = +100 - 40',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-5': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +5 = +10 - 5',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-50': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +50 = +100 - 50',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-4': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +4 = +10 - 6',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-40': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +40 = +100 - 60',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-3': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +3 = +10 - 7',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-30': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +30 = +100 - 70',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-2': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +2 = +10 - 8',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-20': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +20 = +100 - 80',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-1': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +1 = +10 - 9',
            icon: 'puzzle'
        }
    },
    'big-brother-addition-plus-10': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +10 = +100 - 90',
            icon: 'puzzle'
        }
    },
    'big-brother-subtraction-minus-9': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -9 = -10 + 1',
            icon: 'puzzle'
        }
    },
    'big-brother-subtraction-minus-90': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -90 = -100 + 10',
            icon: 'puzzle'
        }
    },
    'big-brother-subtraction-minus-8': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -8 = -10 + 2',
            icon: 'puzzle'
        }
    },
    'big-brother-subtraction-minus-80': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -80 = -100 + 20',
            icon: 'puzzle'
        }
    },
    'big-brother-subtraction-minus-7': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -7 = -10 + 3',
            icon: 'puzzle'
        }
    },
    'big-brother-subtraction-minus-70': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -70 = -100 + 30',
            icon: 'puzzle'
        }
    },
    'big-brother-subtraction-minus-6': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -6 = -10 + 4',
            icon: 'puzzle'
        }
    },
    'big-brother-subtraction-minus-60': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -60 = -100 + 40',
            icon: 'puzzle'
        }
    },
    'big-brother-subtraction-minus-5': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -5 = -10 + 5',
            icon: 'puzzle'
        }
    },
    'big-brother-subtraction-minus-50': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -50 = -100 + 50',
            icon: 'puzzle'
        }
    },
    'big-brother-subtraction-minus-4': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -4 = -10 + 6',
            icon: 'puzzle'
        }
    },
    'big-brother-subtraction-minus-40': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -40 = -100 + 60',
            icon: 'puzzle'
        }
    },
    'big-brother-subtraction-minus-3': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -3 = -10 + 7',
            icon: 'puzzle'
        }
    },
    'big-brother-subtraction-minus-30': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -30 = -100 + 70',
            icon: 'puzzle'
        }
    },
    'big-brother-subtraction-minus-2': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -2 = -10 + 8',
            icon: 'puzzle'
        }
    },
    'big-brother-subtraction-minus-20': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -20 = -100 + 80',
            icon: 'puzzle'
        }
    },
    'big-brother-subtraction-minus-1': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -1 = -10 + 9',
            icon: 'puzzle'
        }
    },
    'big-brother-subtraction-minus-10': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -10 = -100 + 90',
            icon: 'puzzle'
        }
    },
    'combination-plus-6': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +6 = +10 - 5 + 1',
            icon: 'puzzle'
        }
    },
    'combination-plus-60': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +60 = +100 - 50 + 10',
            icon: 'puzzle'
        }
    },
    'combination-plus-7': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +7 = +10 - 5 + 2',
            icon: 'puzzle'
        }
    },
    'combination-plus-70': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +70 = +100 - 50 + 20',
            icon: 'puzzle'
        }
    },
    'combination-plus-8': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +8 = +10 - 5 + 3',
            icon: 'puzzle'
        }
    },
    'combination-plus-80': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +80 = +100 - 50 + 30',
            icon: 'puzzle'
        }
    },
    'combination-plus-9': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +9 = +10 - 5 + 4',
            icon: 'puzzle'
        }
    },
    'combination-plus-90': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: +90 = +100 - 50 + 40',
            icon: 'puzzle'
        }
    },
    'combination-minus-6': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -6 = -10 + 5 - 1',
            icon: 'puzzle'
        }
    },
    'combination-minus-60': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -60 = -100 + 50 - 10',
            icon: 'puzzle'
        }
    },
    'combination-minus-7': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -7 = -10 + 5 - 2',
            icon: 'puzzle'
        }
    },
    'combination-minus-70': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -70 = -100 + 50 - 20',
            icon: 'puzzle'
        }
    },
    'combination-minus-8': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -8 = -10 + 5 - 3',
            icon: 'puzzle'
        }
    },
    'combination-minus-80': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -80 = -100 + 50 - 30',
            icon: 'puzzle'
        }
    },
    'combination-minus-9': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -9 = -10 + 5 - 4',
            icon: 'puzzle'
        }
    },
    'combination-minus-90': {
        easy: {
            numQuestions: 28,
            timeLimit: 480,
            title: 'Formula: -90 = -100 + 50 - 40',
            icon: 'puzzle'
        }
    }
};
const preDefinedQuestions = {
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$basic$2d$addition$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["basicAdditionQuestions"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$basic$2d$subtraction$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["basicSubtractionQuestions"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$big$2d$brother$2d$addition$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bigBrotherAdditionQuestions"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$big$2d$brother$2d$subtraction$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bigBrotherSubtractionQuestions"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$combination$2d$addition$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combinationAdditionQuestions"],
    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$combination$2d$subtraction$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combinationSubtractionQuestions"],
    ...masteryMixQuestions
};
const smallSisterKeys = Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$basic$2d$addition$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["basicAdditionQuestions"]).concat(Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$basic$2d$subtraction$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["basicSubtractionQuestions"]));
const bigBrotherKeys = Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$big$2d$brother$2d$addition$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bigBrotherAdditionQuestions"]).concat(Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$big$2d$brother$2d$subtraction$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["bigBrotherSubtractionQuestions"]));
const combinationKeys = Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$combination$2d$addition$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combinationAdditionQuestions"]).concat(Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$question$2d$data$2f$combination$2d$subtraction$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["combinationSubtractionQuestions"]));
const gameQuestionMap = {
    'small-sister-plus-4': [
        'basic-addition-plus-4'
    ],
    'small-sister-plus-3': [
        'basic-addition-plus-3'
    ],
    'small-sister-plus-2': [
        'basic-addition-plus-2'
    ],
    'small-sister-plus-1': [
        'basic-addition-plus-1'
    ],
    'small-sister-minus-4': [
        'basic-subtraction-minus-4'
    ],
    'small-sister-minus-3': [
        'basic-subtraction-minus-3'
    ],
    'small-sister-minus-2': [
        'basic-subtraction-minus-2'
    ],
    'small-sister-minus-1': [
        'basic-subtraction-minus-1'
    ],
    'small-sister-all': smallSisterKeys,
    'big-brother-plus-9': [
        'big-brother-addition-plus-9'
    ],
    'big-brother-plus-8': [
        'big-brother-addition-plus-8'
    ],
    'big-brother-plus-7': [
        'big-brother-addition-plus-7'
    ],
    'big-brother-plus-6': [
        'big-brother-addition-plus-6'
    ],
    'big-brother-plus-5': [
        'big-brother-addition-plus-5'
    ],
    'big-brother-plus-4': [
        'big-brother-addition-plus-4'
    ],
    'big-brother-plus-3': [
        'big-brother-addition-plus-3'
    ],
    'big-brother-plus-2': [
        'big-brother-addition-plus-2'
    ],
    'big-brother-plus-1': [
        'big-brother-addition-plus-1'
    ],
    'big-brother-minus-9': [
        'big-brother-subtraction-minus-9'
    ],
    'big-brother-minus-8': [
        'big-brother-subtraction-minus-8'
    ],
    'big-brother-minus-7': [
        'big-brother-subtraction-minus-7'
    ],
    'big-brother-minus-6': [
        'big-brother-subtraction-minus-6'
    ],
    'big-brother-minus-5': [
        'big-brother-subtraction-minus-5'
    ],
    'big-brother-minus-4': [
        'big-brother-subtraction-minus-4'
    ],
    'big-brother-minus-3': [
        'big-brother-subtraction-minus-3'
    ],
    'big-brother-minus-2': [
        'big-brother-subtraction-minus-2'
    ],
    'big-brother-minus-1': [
        'big-brother-subtraction-minus-1'
    ],
    'big-brother-all': bigBrotherKeys,
    'combination-plus-9': [
        'combination-plus-9'
    ],
    'combination-plus-8': [
        'combination-plus-8'
    ],
    'combination-plus-7': [
        'combination-plus-7'
    ],
    'combination-plus-6': [
        'combination-plus-6'
    ],
    'combination-minus-9': [
        'combination-minus-9'
    ],
    'combination-minus-8': [
        'combination-minus-8'
    ],
    'combination-minus-7': [
        'combination-minus-7'
    ],
    'combination-minus-6': [
        'combination-minus-6'
    ],
    'combination-all': combinationKeys,
    'general-practice': [],
    ...Object.keys(masteryMixQuestions).reduce((acc, key)=>{
        acc[key] = [
            key
        ];
        return acc;
    }, {})
};
function getTestSettings(testId, difficulty) {
    return TEST_CONFIG[testId]?.[difficulty];
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function shuffleArray(array) {
    for(let i = array.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [
            array[j],
            array[i]
        ];
    }
    return array;
}
function generateOptions(correctAnswer) {
    const options = new Set([
        correctAnswer
    ]);
    const range = Math.max(10, Math.abs(Math.floor(correctAnswer * 0.2)));
    while(options.size < 4){
        let wrongAnswer;
        if (correctAnswer < 10 && correctAnswer >= 0) {
            wrongAnswer = getRandomInt(0, 9);
        } else {
            const minOption = Math.max(0, correctAnswer - range);
            const maxOption = correctAnswer + range;
            wrongAnswer = getRandomInt(minOption, maxOption);
        }
        if (wrongAnswer !== correctAnswer) {
            options.add(wrongAnswer);
        }
    }
    return shuffleArray(Array.from(options));
}
function generateGameQuestions(level) {
    const questionKeys = gameQuestionMap[level];
    let allQuestions = [];
    if (level === 'general-practice') {
        allQuestions = Object.values(preDefinedQuestions).flat();
    } else {
        questionKeys.forEach((key)=>{
            if (preDefinedQuestions[key]) {
                allQuestions.push(...preDefinedQuestions[key]);
            }
        });
    }
    return shuffleArray(allQuestions).slice(0, 20); // Limit to 20 questions per game level
}
function generateTest(testId, difficulty) {
    const settings = getTestSettings(testId, difficulty);
    if (!settings) {
        return [];
    }
    if (preDefinedQuestions[testId]) {
        const allQuestions = preDefinedQuestions[testId];
        // For formula tests, we want to ensure variety by shuffling.
        return shuffleArray([
            ...allQuestions
        ]).slice(0, settings.numQuestions);
    }
    const questions = [];
    if (testId === 'beads-identify' || testId === 'beads-set') {
        const questionType = testId === 'beads-identify' ? 'identify' : 'set';
        // 5 questions from 1-9
        for(let i = 0; i < 5; i++)questions.push({
            text: '',
            answer: getRandomInt(1, 9),
            options: [],
            questionType
        });
        // 5 questions from 10-99
        for(let i = 0; i < 5; i++)questions.push({
            text: '',
            answer: getRandomInt(10, 99),
            options: [],
            questionType
        });
        // 10 questions from 100-999
        for(let i = 0; i < 10; i++)questions.push({
            text: '',
            answer: getRandomInt(100, 999),
            options: [],
            questionType
        });
        return shuffleArray(questions);
    }
    const [min, max] = getNumberRange(difficulty);
    for(let i = 0; i < settings.numQuestions; i++){
        let questionText;
        let answer;
        switch(testId){
            case 'addition-subtraction':
                {
                    const numTerms = 4;
                    let numbers = [];
                    let tempResult = getRandomInt(min, max);
                    numbers.push(tempResult);
                    for(let j = 0; j < numTerms - 1; j++){
                        let op = getRandomInt(0, 1) === 0 ? '+' : '-';
                        const nextNum = getRandomInt(min, max);
                        if (op === '-' && tempResult < nextNum) {
                            op = '+';
                        }
                        numbers.push(op);
                        numbers.push(nextNum);
                        if (op === '+') {
                            tempResult += nextNum;
                        } else {
                            tempResult -= nextNum;
                        }
                    }
                    questionText = numbers.join(' ');
                    answer = tempResult;
                    break;
                }
            case 'multiplication':
                const m1_max = difficulty === 'easy' ? 9 : difficulty === 'medium' ? 99 : 999;
                const m2_max = difficulty === 'hard' ? 99 : 9;
                const m1 = getRandomInt(min, m1_max);
                const m2 = getRandomInt(1, m2_max);
                answer = m1 * m2;
                questionText = `${m1} × ${m2}`;
                break;
            case 'division':
                const divisor = getRandomInt(2, 9);
                const [answer_min, answer_max] = getNumberRange(difficulty);
                answer = getRandomInt(answer_min, answer_max);
                const dividend = divisor * answer;
                questionText = `${dividend} ÷ ${divisor}`;
                break;
            default:
                // Fallback for any formula tests without predefined questions yet
                questionText = "1 + 1";
                answer = 2;
                break;
        }
        questions.push({
            text: questionText,
            options: generateOptions(answer),
            answer: answer
        });
    }
    return questions;
}
function getNumberRange(difficulty) {
    switch(difficulty){
        case 'easy':
            return [
                1,
                9
            ];
        case 'medium':
            return [
                10,
                99
            ];
        case 'hard':
            return [
                100,
                999
            ];
        default:
            return [
                1,
                9
            ];
    }
}
}}),
"[project]/src/app/progress/page.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>ProgressReportPage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useAuth.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$usePageBackground$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/usePageBackground.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/index.mjs [app-ssr] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/firestore/dist/index.node.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/table.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$LineChart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/chart/LineChart.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Line$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/Line.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/XAxis.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/YAxis.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/CartesianGrid.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Tooltip.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Legend$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/Legend.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/component/ResponsiveContainer.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$ReferenceLine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/recharts/es6/cartesian/ReferenceLine.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/skeleton.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/date-fns/format.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/badge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trending-up.js [app-ssr] (ecmascript) <export default as TrendingUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/activity.js [app-ssr] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/target.js [app-ssr] (ecmascript) <export default as Target>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-ssr] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/star.js [app-ssr] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/questions.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const TEST_NAME_MAP = {
    'addition-subtraction': 'Add/Subtract',
    'multiplication': 'Multiplication',
    'division': 'Division',
    'basic-addition-plus-4': 'Small Sister: +4',
    'basic-addition-plus-40': 'Small Sister: +40',
    'basic-addition-plus-3': 'Small Sister: +3',
    'basic-addition-plus-30': 'Small Sister: +30',
    'basic-addition-plus-2': 'Small Sister: +2',
    'basic-addition-plus-20': 'Small Sister: +20',
    'basic-addition-plus-1': 'Small Sister: +1',
    'basic-addition-plus-10': 'Small Sister: +10',
    'basic-subtraction-minus-4': 'Small Sister: -4',
    'basic-subtraction-minus-40': 'Small Sister: -40',
    'basic-subtraction-minus-3': 'Small Sister: -3',
    'basic-subtraction-minus-30': 'Small Sister: -30',
    'basic-subtraction-minus-2': 'Small Sister: -2',
    'basic-subtraction-minus-20': 'Small Sister: -20',
    'basic-subtraction-minus-1': 'Small Sister: -1',
    'basic-subtraction-minus-10': 'Small Sister: -10',
    'big-brother-addition-plus-9': 'Big Brother: +9',
    'big-brother-addition-plus-90': 'Big Brother: +90',
    'big-brother-addition-plus-8': 'Big Brother: +8',
    'big-brother-addition-plus-80': 'Big Brother: +80',
    'big-brother-addition-plus-7': 'Big Brother: +7',
    'big-brother-addition-plus-70': 'Big Brother: +70',
    'big-brother-addition-plus-6': 'Big Brother: +6',
    'big-brother-addition-plus-60': 'Big Brother: +60',
    'big-brother-addition-plus-5': 'Big Brother: +5',
    'big-brother-addition-plus-50': 'Big Brother: +50',
    'big-brother-addition-plus-4': 'Big Brother: +4',
    'big-brother-addition-plus-40': 'Big Brother: +40',
    'big-brother-addition-plus-3': 'Big Brother: +3',
    'big-brother-addition-plus-30': 'Big Brother: +30',
    'big-brother-addition-plus-2': 'Big Brother: +2',
    'big-brother-addition-plus-20': 'Big Brother: +20',
    'big-brother-addition-plus-1': 'Big Brother: +1',
    'big-brother-addition-plus-10': 'Big Brother: +10',
    'big-brother-subtraction-minus-9': 'Big Brother: -9',
    'big-brother-subtraction-minus-90': 'Big Brother: -90',
    'big-brother-subtraction-minus-8': 'Big Brother: -8',
    'big-brother-subtraction-minus-80': 'Big Brother: -80',
    'big-brother-subtraction-minus-7': 'Big Brother: -7',
    'big-brother-subtraction-minus-70': 'Big Brother: -70',
    'big-brother-subtraction-minus-6': 'Big Brother: -6',
    'big-brother-subtraction-minus-60': 'Big Brother: -60',
    'big-brother-subtraction-minus-5': 'Big Brother: -5',
    'big-brother-subtraction-minus-50': 'Big Brother: -50',
    'big-brother-subtraction-minus-4': 'Big Brother: -4',
    'big-brother-subtraction-minus-40': 'Big Brother: -40',
    'big-brother-subtraction-minus-3': 'Big Brother: -3',
    'big-brother-subtraction-minus-30': 'Big Brother: -30',
    'big-brother-subtraction-minus-2': 'Big Brother: -2',
    'big-brother-subtraction-minus-20': 'Big Brother: -20',
    'big-brother-subtraction-minus-1': 'Big Brother: -1',
    'big-brother-subtraction-minus-10': 'Big Brother: -10',
    'combination-plus-6': 'Combination: +6',
    'combination-plus-60': 'Combination: +60',
    'combination-plus-7': 'Combination: +7',
    'combination-plus-70': 'Combination: +70',
    'combination-plus-8': 'Combination: +8',
    'combination-plus-80': 'Combination: +80',
    'combination-plus-9': 'Combination: +9',
    'combination-plus-90': 'Combination: +90',
    'combination-minus-6': 'Combination: -6',
    'combination-minus-60': 'Combination: -60',
    'combination-minus-7': 'Combination: -7',
    'combination-minus-70': 'Combination: -70',
    'combination-minus-8': 'Combination: -8',
    'combination-minus-80': 'Combination: -80',
    'combination-minus-9': 'Combination: -9',
    'combination-minus-90': 'Combination: -90'
};
const CustomTooltip = ({ active, payload, label })=>{
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-4 bg-background/90 border border-border rounded-lg shadow-lg",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "font-bold text-foreground",
                    children: `${data.date}`
                }, void 0, false, {
                    fileName: "[project]/src/app/progress/page.tsx",
                    lineNumber: 99,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-primary",
                    children: `Accuracy: ${data.Accuracy}%`
                }, void 0, false, {
                    fileName: "[project]/src/app/progress/page.tsx",
                    lineNumber: 100,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-muted-foreground",
                    children: data.Test
                }, void 0, false, {
                    fileName: "[project]/src/app/progress/page.tsx",
                    lineNumber: 101,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-muted-foreground",
                    children: `Score: ${data.score}/${data.totalQuestions}`
                }, void 0, false, {
                    fileName: "[project]/src/app/progress/page.tsx",
                    lineNumber: 102,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/progress/page.tsx",
            lineNumber: 98,
            columnNumber: 7
        }, this);
    }
    return null;
};
function ProgressReportPage() {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$usePageBackground$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePageBackground"])('https://placehold.co/1920x1080/f3f4f6/111827?text=.');
    const { user, isLoading: isAuthLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [testHistory, setTestHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isAuthLoading && !user) {
            router.push('/login');
        }
    }, [
        isAuthLoading,
        user,
        router
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (user) {
            const fetchTestHistory = async ()=>{
                setIsLoading(true);
                const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFirestore"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["firebaseApp"]);
                const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["collection"])(db, 'testResults'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["where"])('userId', '==', user.uid), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'));
                const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDocs"])(q);
                const history = [];
                querySnapshot.forEach((doc)=>{
                    const data = doc.data();
                    history.push({
                        id: doc.id,
                        ...data,
                        createdAt: data.createdAt instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Timestamp"] ? data.createdAt.toDate() : new Date()
                    });
                });
                setTestHistory(history);
                setIsLoading(false);
            };
            fetchTestHistory();
        }
    }, [
        user
    ]);
    const chartData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return testHistory.slice().sort((a, b)=>a.createdAt.getTime() - b.createdAt.getTime()).map((result)=>{
            const settings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$questions$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getTestSettings"])(result.testId, result.difficulty);
            return {
                date: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(result.createdAt, 'MMM d'),
                Accuracy: parseFloat(result.accuracy.toFixed(1)),
                Test: settings ? settings.title : result.testId,
                score: result.score,
                totalQuestions: result.totalQuestions
            };
        }).slice(-15);
    }, [
        testHistory
    ]);
    const summaryStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (testHistory.length === 0) {
            return {
                testsTaken: 0,
                averageAccuracy: 0,
                bestAccuracy: 0,
                totalTime: '0m 0s'
            };
        }
        const totalTests = testHistory.length;
        const totalAccuracy = testHistory.reduce((acc, r)=>acc + r.accuracy, 0);
        const averageAccuracy = totalAccuracy / totalTests;
        const bestAccuracy = Math.max(...testHistory.map((r)=>r.accuracy));
        const totalSeconds = testHistory.reduce((acc, r)=>acc + r.timeSpent, 0);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return {
            testsTaken: totalTests,
            averageAccuracy: parseFloat(averageAccuracy.toFixed(1)),
            bestAccuracy: parseFloat(bestAccuracy.toFixed(1)),
            totalTime: `${minutes}m ${seconds}s`
        };
    }, [
        testHistory
    ]);
    if (isLoading || isAuthLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ProgressReportSkeleton, {}, void 0, false, {
            fileName: "[project]/src/app/progress/page.tsx",
            lineNumber: 194,
            columnNumber: 16
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardTitle"], {
                            className: "text-3xl font-headline flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trending$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__TrendingUp$3e$__["TrendingUp"], {
                                    className: "w-8 h-8 text-primary"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/progress/page.tsx",
                                    lineNumber: 202,
                                    columnNumber: 25
                                }, this),
                                "Progress Report"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/progress/page.tsx",
                            lineNumber: 201,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardDescription"], {
                            children: "Your performance summary and test history."
                        }, void 0, false, {
                            fileName: "[project]/src/app/progress/page.tsx",
                            lineNumber: 205,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/progress/page.tsx",
                    lineNumber: 200,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/progress/page.tsx",
                lineNumber: 199,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid md:grid-cols-2 lg:grid-cols-4 gap-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                                className: "flex flex-row items-center justify-between pb-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardTitle"], {
                                        className: "text-sm font-medium",
                                        children: "Tests Taken"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/progress/page.tsx",
                                        lineNumber: 212,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"], {
                                        className: "w-5 h-5 text-muted-foreground"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/progress/page.tsx",
                                        lineNumber: 213,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/progress/page.tsx",
                                lineNumber: 211,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-2xl font-bold",
                                    children: summaryStats.testsTaken
                                }, void 0, false, {
                                    fileName: "[project]/src/app/progress/page.tsx",
                                    lineNumber: 216,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/progress/page.tsx",
                                lineNumber: 215,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/progress/page.tsx",
                        lineNumber: 210,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                                className: "flex flex-row items-center justify-between pb-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardTitle"], {
                                        className: "text-sm font-medium",
                                        children: "Average Accuracy"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/progress/page.tsx",
                                        lineNumber: 221,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"], {
                                        className: "w-5 h-5 text-muted-foreground"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/progress/page.tsx",
                                        lineNumber: 222,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/progress/page.tsx",
                                lineNumber: 220,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-2xl font-bold",
                                    children: [
                                        summaryStats.averageAccuracy,
                                        "%"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/progress/page.tsx",
                                    lineNumber: 225,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/progress/page.tsx",
                                lineNumber: 224,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/progress/page.tsx",
                        lineNumber: 219,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                                className: "flex flex-row items-center justify-between pb-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardTitle"], {
                                        className: "text-sm font-medium",
                                        children: "Best Accuracy"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/progress/page.tsx",
                                        lineNumber: 230,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                        className: "w-5 h-5 text-muted-foreground"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/progress/page.tsx",
                                        lineNumber: 231,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/progress/page.tsx",
                                lineNumber: 229,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-2xl font-bold",
                                    children: [
                                        summaryStats.bestAccuracy,
                                        "%"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/progress/page.tsx",
                                    lineNumber: 234,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/progress/page.tsx",
                                lineNumber: 233,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/progress/page.tsx",
                        lineNumber: 228,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                                className: "flex flex-row items-center justify-between pb-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardTitle"], {
                                        className: "text-sm font-medium",
                                        children: "Total Practice Time"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/progress/page.tsx",
                                        lineNumber: 239,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                        className: "w-5 h-5 text-muted-foreground"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/progress/page.tsx",
                                        lineNumber: 240,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/progress/page.tsx",
                                lineNumber: 238,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-2xl font-bold",
                                    children: summaryStats.totalTime
                                }, void 0, false, {
                                    fileName: "[project]/src/app/progress/page.tsx",
                                    lineNumber: 243,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/progress/page.tsx",
                                lineNumber: 242,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/progress/page.tsx",
                        lineNumber: 237,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/progress/page.tsx",
                lineNumber: 209,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardTitle"], {
                                children: "Performance Trend (Last 15 Tests)"
                            }, void 0, false, {
                                fileName: "[project]/src/app/progress/page.tsx",
                                lineNumber: 250,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardDescription"], {
                                children: "Accuracy percentage over your most recent tests."
                            }, void 0, false, {
                                fileName: "[project]/src/app/progress/page.tsx",
                                lineNumber: 251,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/progress/page.tsx",
                        lineNumber: 249,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                        children: testHistory.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
                            width: "100%",
                            height: 300,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$LineChart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LineChart"], {
                                data: chartData,
                                margin: {
                                    top: 5,
                                    right: 20,
                                    left: -10,
                                    bottom: 5
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("linearGradient", {
                                            id: "colorUv",
                                            x1: "0",
                                            y1: "0",
                                            x2: "0",
                                            y2: "1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                                    offset: "5%",
                                                    stopColor: "hsl(var(--primary))",
                                                    stopOpacity: 0.8
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/progress/page.tsx",
                                                    lineNumber: 259,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                                    offset: "95%",
                                                    stopColor: "hsl(var(--primary))",
                                                    stopOpacity: 0
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/progress/page.tsx",
                                                    lineNumber: 260,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/progress/page.tsx",
                                            lineNumber: 258,
                                            columnNumber: 37
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/progress/page.tsx",
                                        lineNumber: 257,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                                        strokeDasharray: "3 3",
                                        stroke: "hsl(var(--border))"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/progress/page.tsx",
                                        lineNumber: 263,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["XAxis"], {
                                        dataKey: "date",
                                        stroke: "hsl(var(--muted-foreground))",
                                        fontSize: 12
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/progress/page.tsx",
                                        lineNumber: 264,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["YAxis"], {
                                        unit: "%",
                                        domain: [
                                            0,
                                            100
                                        ],
                                        stroke: "hsl(var(--muted-foreground))",
                                        fontSize: 12
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/progress/page.tsx",
                                        lineNumber: 265,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Tooltip"], {
                                        content: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CustomTooltip, {}, void 0, false, {
                                            fileName: "[project]/src/app/progress/page.tsx",
                                            lineNumber: 266,
                                            columnNumber: 51
                                        }, void 0),
                                        cursor: {
                                            stroke: 'hsl(var(--primary))',
                                            strokeWidth: 1,
                                            strokeDasharray: '3 3'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/progress/page.tsx",
                                        lineNumber: 266,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Legend$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Legend"], {}, void 0, false, {
                                        fileName: "[project]/src/app/progress/page.tsx",
                                        lineNumber: 267,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$ReferenceLine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReferenceLine"], {
                                        y: 90,
                                        label: {
                                            value: 'Excellent',
                                            position: 'insideTopLeft',
                                            fill: 'hsl(var(--foreground))',
                                            fontSize: 10
                                        },
                                        stroke: "hsl(var(--accent))",
                                        strokeDasharray: "3 3"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/progress/page.tsx",
                                        lineNumber: 268,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$ReferenceLine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReferenceLine"], {
                                        y: 75,
                                        label: {
                                            value: 'Good',
                                            position: 'insideTopLeft',
                                            fill: 'hsl(var(--foreground))',
                                            fontSize: 10
                                        },
                                        stroke: "hsl(var(--border))",
                                        strokeDasharray: "3 3"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/progress/page.tsx",
                                        lineNumber: 269,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$ReferenceLine$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReferenceLine"], {
                                        y: 50,
                                        label: {
                                            value: 'Passing',
                                            position: 'insideTopLeft',
                                            fill: 'hsl(var(--foreground))',
                                            fontSize: 10
                                        },
                                        stroke: "hsl(var(--border))",
                                        strokeDasharray: "3 3"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/progress/page.tsx",
                                        lineNumber: 270,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Line$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Line"], {
                                        type: "monotone",
                                        dataKey: "Accuracy",
                                        stroke: "hsl(var(--primary))",
                                        strokeWidth: 2,
                                        dot: {
                                            r: 4,
                                            fill: "hsl(var(--primary))"
                                        },
                                        activeDot: {
                                            r: 8,
                                            fill: "hsl(var(--primary))"
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/progress/page.tsx",
                                        lineNumber: 271,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/progress/page.tsx",
                                lineNumber: 256,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/progress/page.tsx",
                            lineNumber: 255,
                            columnNumber: 25
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-[300px] flex items-center justify-center text-muted-foreground",
                            children: "Complete a test to see your performance trend."
                        }, void 0, false, {
                            fileName: "[project]/src/app/progress/page.tsx",
                            lineNumber: 282,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/progress/page.tsx",
                        lineNumber: 253,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/progress/page.tsx",
                lineNumber: 248,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardTitle"], {
                                children: "Detailed Test History"
                            }, void 0, false, {
                                fileName: "[project]/src/app/progress/page.tsx",
                                lineNumber: 291,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardDescription"], {
                                children: "A log of all your completed practice tests."
                            }, void 0, false, {
                                fileName: "[project]/src/app/progress/page.tsx",
                                lineNumber: 292,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/progress/page.tsx",
                        lineNumber: 290,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Table"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TableHeader"], {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TableRow"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TableHead"], {
                                                children: "Date"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/progress/page.tsx",
                                                lineNumber: 298,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TableHead"], {
                                                children: "Test Type"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/progress/page.tsx",
                                                lineNumber: 299,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TableHead"], {
                                                children: "Difficulty"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/progress/page.tsx",
                                                lineNumber: 300,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TableHead"], {
                                                children: "Score"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/progress/page.tsx",
                                                lineNumber: 301,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TableHead"], {
                                                children: "Accuracy"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/progress/page.tsx",
                                                lineNumber: 302,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TableHead"], {
                                                children: "Time Spent"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/progress/page.tsx",
                                                lineNumber: 303,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/progress/page.tsx",
                                        lineNumber: 297,
                                        columnNumber: 29
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/progress/page.tsx",
                                    lineNumber: 296,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TableBody"], {
                                    children: testHistory.length > 0 ? testHistory.map((result)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TableRow"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TableCell"], {
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(result.createdAt, 'PPp')
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/progress/page.tsx",
                                                    lineNumber: 310,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TableCell"], {
                                                    children: TEST_NAME_MAP[result.testId] || result.testId
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/progress/page.tsx",
                                                    lineNumber: 311,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TableCell"], {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Badge"], {
                                                        variant: result.difficulty === 'hard' ? 'destructive' : result.difficulty === 'medium' ? 'secondary' : 'default',
                                                        className: "capitalize",
                                                        children: result.difficulty
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/progress/page.tsx",
                                                        lineNumber: 313,
                                                        columnNumber: 45
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/progress/page.tsx",
                                                    lineNumber: 312,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TableCell"], {
                                                    children: [
                                                        result.score,
                                                        "/",
                                                        result.totalQuestions
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/progress/page.tsx",
                                                    lineNumber: 318,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TableCell"], {
                                                    children: [
                                                        result.accuracy.toFixed(1),
                                                        "%"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/progress/page.tsx",
                                                    lineNumber: 319,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TableCell"], {
                                                    children: [
                                                        Math.floor(result.timeSpent / 60),
                                                        "m ",
                                                        result.timeSpent % 60,
                                                        "s"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/progress/page.tsx",
                                                    lineNumber: 320,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, result.id, true, {
                                            fileName: "[project]/src/app/progress/page.tsx",
                                            lineNumber: 309,
                                            columnNumber: 37
                                        }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TableRow"], {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TableCell"], {
                                            colSpan: 6,
                                            className: "text-center",
                                            children: "No test history found."
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/progress/page.tsx",
                                            lineNumber: 325,
                                            columnNumber: 37
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/progress/page.tsx",
                                        lineNumber: 324,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/progress/page.tsx",
                                    lineNumber: 306,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/progress/page.tsx",
                            lineNumber: 295,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/progress/page.tsx",
                        lineNumber: 294,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/progress/page.tsx",
                lineNumber: 289,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/progress/page.tsx",
        lineNumber: 198,
        columnNumber: 9
    }, this);
}
function ProgressReportSkeleton() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Skeleton"], {
                            className: "h-8 w-64"
                        }, void 0, false, {
                            fileName: "[project]/src/app/progress/page.tsx",
                            lineNumber: 341,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Skeleton"], {
                            className: "h-4 w-80"
                        }, void 0, false, {
                            fileName: "[project]/src/app/progress/page.tsx",
                            lineNumber: 342,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/progress/page.tsx",
                    lineNumber: 340,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/progress/page.tsx",
                lineNumber: 339,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid md:grid-cols-2 lg:grid-cols-4 gap-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Skeleton"], {
                        className: "h-28 w-full"
                    }, void 0, false, {
                        fileName: "[project]/src/app/progress/page.tsx",
                        lineNumber: 346,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Skeleton"], {
                        className: "h-28 w-full"
                    }, void 0, false, {
                        fileName: "[project]/src/app/progress/page.tsx",
                        lineNumber: 347,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Skeleton"], {
                        className: "h-28 w-full"
                    }, void 0, false, {
                        fileName: "[project]/src/app/progress/page.tsx",
                        lineNumber: 348,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Skeleton"], {
                        className: "h-28 w-full"
                    }, void 0, false, {
                        fileName: "[project]/src/app/progress/page.tsx",
                        lineNumber: 349,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/progress/page.tsx",
                lineNumber: 345,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Skeleton"], {
                                className: "h-6 w-72"
                            }, void 0, false, {
                                fileName: "[project]/src/app/progress/page.tsx",
                                lineNumber: 353,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Skeleton"], {
                                className: "h-4 w-96"
                            }, void 0, false, {
                                fileName: "[project]/src/app/progress/page.tsx",
                                lineNumber: 354,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/progress/page.tsx",
                        lineNumber: 352,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Skeleton"], {
                            className: "h-[300px] w-full"
                        }, void 0, false, {
                            fileName: "[project]/src/app/progress/page.tsx",
                            lineNumber: 357,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/progress/page.tsx",
                        lineNumber: 356,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/progress/page.tsx",
                lineNumber: 351,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Skeleton"], {
                                className: "h-6 w-56"
                            }, void 0, false, {
                                fileName: "[project]/src/app/progress/page.tsx",
                                lineNumber: 362,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Skeleton"], {
                                className: "h-4 w-72"
                            }, void 0, false, {
                                fileName: "[project]/src/app/progress/page.tsx",
                                lineNumber: 363,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/progress/page.tsx",
                        lineNumber: 361,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Skeleton"], {
                                    className: "h-12 w-full"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/progress/page.tsx",
                                    lineNumber: 367,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Skeleton"], {
                                    className: "h-10 w-full"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/progress/page.tsx",
                                    lineNumber: 368,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Skeleton"], {
                                    className: "h-10 w-full"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/progress/page.tsx",
                                    lineNumber: 369,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Skeleton"], {
                                    className: "h-10 w-full"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/progress/page.tsx",
                                    lineNumber: 370,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/progress/page.tsx",
                            lineNumber: 366,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/progress/page.tsx",
                        lineNumber: 365,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/progress/page.tsx",
                lineNumber: 360,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/progress/page.tsx",
        lineNumber: 338,
        columnNumber: 9
    }, this);
}
}}),

};

//# sourceMappingURL=src_2cb72078._.js.map