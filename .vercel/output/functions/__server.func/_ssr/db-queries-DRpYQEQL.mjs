import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-gAtJ3vby.mjs";
import { i as TSS_SERVER_FUNCTION, l as createServerFn } from "./esm-Dova13aH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/db-queries-DRpYQEQL.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getDashboardData = createServerFn({ method: "GET" }).handler(createSsrRpc("05111cb4dc0dfbc69001eef6c578b62c0a4023d39ddfc550bac26dbe77b2bdf3"));
var getDealers = createServerFn({ method: "GET" }).handler(createSsrRpc("a93459f40ed57879576bbb8d833f2529b31550f38fbd15ed2d8cde79609fa7a5"));
var getDealerById = createServerFn({ method: "GET" }).validator((id) => id).handler(createSsrRpc("4952efa378471e65ff8974d5e30c5a90b84a4462c516961a593afaeb9e76d8fc"));
var getInventory = createServerFn({ method: "GET" }).handler(createSsrRpc("160e7ae9174a603e77d65ed4f5f344f1c68066916a10396e1c14b467e2574939"));
var getInvoices = createServerFn({ method: "GET" }).handler(createSsrRpc("0df44c5bf79110b5a00d5780cba55d0c047e594f553b5bf934da4b7488eecb9c"));
var getOrders = createServerFn({ method: "GET" }).handler(createSsrRpc("324cebcc405a3a820673ccf8c52131c0718ba74def2f45813cf6129b9478fda9"));
var getConversationsList = createServerFn({ method: "GET" }).handler(createSsrRpc("b687c8418aff9e30782bab47a2db6ad96b0063bc2002cba93bec54404a6a3a2e"));
var postMessage = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("dac4f83fef137d06125b0abf89f0d3ad91f279aa85751ac2611a46f3c2c94dd3"));
createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("df3730a57ac74b53bcb44c9be3d14e934ccf8d756bf665658d2d7e53537ec1a9"));
createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("3f40dfc2f61aac9bdd5ef8731130beb04c79f2c749b3f8fa68c64d36ad103961"));
var askAiQuery = createServerFn({ method: "POST" }).validator((query) => query).handler(createSsrRpc("40bdd966f3f2c98addf6e52eed21c3b97bd0609175fcd7877ab21a664e9653c9"));
var getDues = createServerFn({ method: "GET" }).handler(createSsrRpc("c4275c6fdcd661da7f62251ddba5e62f1c77b04ac18857505404e10bd4a02f64"));
var getAiDuesAnalysis = createServerFn({ method: "POST" }).validator((dealersList) => dealersList).handler(createSsrRpc("4bec6dab155c913b7b559a31daf36c04badbc4060ff237aa62de10385f983788"));
var updateOrderStatusAction = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("551efb6e66dedd4bd35381073fd33092bc87c389cffebd15e5893958286d2fd8"));
var getInvoiceDetailsAction = createServerFn({ method: "POST" }).validator((invoiceId) => invoiceId).handler(createSsrRpc("dac0af18dd7a207dd487ace5324820112b0f518605b6b6f3e0bcd689773bb53b"));
var createProductAction = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("1add7590a731b7676b12ef782edf51bbdeb7c8fb4e6871a5241e23ce157d1d67"));
//#endregion
export { getDashboardData as a, getDues as c, getInvoices as d, getOrders as f, getConversationsList as i, getInventory as l, updateOrderStatusAction as m, createProductAction as n, getDealerById as o, postMessage as p, getAiDuesAnalysis as r, getDealers as s, askAiQuery as t, getInvoiceDetailsAction as u };
