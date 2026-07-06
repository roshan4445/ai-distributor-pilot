//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-CMAL_08v.js
var manifest = {
	"05111cb4dc0dfbc69001eef6c578b62c0a4023d39ddfc550bac26dbe77b2bdf3": {
		functionName: "getDashboardData_createServerFn_handler",
		importer: () => import("./_ssr/db-queries-CWeuscmc.mjs")
	},
	"0df44c5bf79110b5a00d5780cba55d0c047e594f553b5bf934da4b7488eecb9c": {
		functionName: "getInvoices_createServerFn_handler",
		importer: () => import("./_ssr/db-queries-CWeuscmc.mjs")
	},
	"160e7ae9174a603e77d65ed4f5f344f1c68066916a10396e1c14b467e2574939": {
		functionName: "getInventory_createServerFn_handler",
		importer: () => import("./_ssr/db-queries-CWeuscmc.mjs")
	},
	"1add7590a731b7676b12ef782edf51bbdeb7c8fb4e6871a5241e23ce157d1d67": {
		functionName: "createProductAction_createServerFn_handler",
		importer: () => import("./_ssr/db-queries-CWeuscmc.mjs")
	},
	"324cebcc405a3a820673ccf8c52131c0718ba74def2f45813cf6129b9478fda9": {
		functionName: "getOrders_createServerFn_handler",
		importer: () => import("./_ssr/db-queries-CWeuscmc.mjs")
	},
	"3f40dfc2f61aac9bdd5ef8731130beb04c79f2c749b3f8fa68c64d36ad103961": {
		functionName: "recordPaymentAction_createServerFn_handler",
		importer: () => import("./_ssr/db-queries-CWeuscmc.mjs")
	},
	"40bdd966f3f2c98addf6e52eed21c3b97bd0609175fcd7877ab21a664e9653c9": {
		functionName: "askAiQuery_createServerFn_handler",
		importer: () => import("./_ssr/db-queries-CWeuscmc.mjs")
	},
	"4952efa378471e65ff8974d5e30c5a90b84a4462c516961a593afaeb9e76d8fc": {
		functionName: "getDealerById_createServerFn_handler",
		importer: () => import("./_ssr/db-queries-CWeuscmc.mjs")
	},
	"4bec6dab155c913b7b559a31daf36c04badbc4060ff237aa62de10385f983788": {
		functionName: "getAiDuesAnalysis_createServerFn_handler",
		importer: () => import("./_ssr/db-queries-CWeuscmc.mjs")
	},
	"551efb6e66dedd4bd35381073fd33092bc87c389cffebd15e5893958286d2fd8": {
		functionName: "updateOrderStatusAction_createServerFn_handler",
		importer: () => import("./_ssr/db-queries-CWeuscmc.mjs")
	},
	"a93459f40ed57879576bbb8d833f2529b31550f38fbd15ed2d8cde79609fa7a5": {
		functionName: "getDealers_createServerFn_handler",
		importer: () => import("./_ssr/db-queries-CWeuscmc.mjs")
	},
	"b687c8418aff9e30782bab47a2db6ad96b0063bc2002cba93bec54404a6a3a2e": {
		functionName: "getConversationsList_createServerFn_handler",
		importer: () => import("./_ssr/db-queries-CWeuscmc.mjs")
	},
	"c4275c6fdcd661da7f62251ddba5e62f1c77b04ac18857505404e10bd4a02f64": {
		functionName: "getDues_createServerFn_handler",
		importer: () => import("./_ssr/db-queries-CWeuscmc.mjs")
	},
	"dac0af18dd7a207dd487ace5324820112b0f518605b6b6f3e0bcd689773bb53b": {
		functionName: "getInvoiceDetailsAction_createServerFn_handler",
		importer: () => import("./_ssr/db-queries-CWeuscmc.mjs")
	},
	"dac4f83fef137d06125b0abf89f0d3ad91f279aa85751ac2611a46f3c2c94dd3": {
		functionName: "postMessage_createServerFn_handler",
		importer: () => import("./_ssr/db-queries-CWeuscmc.mjs")
	},
	"df3730a57ac74b53bcb44c9be3d14e934ccf8d756bf665658d2d7e53537ec1a9": {
		functionName: "confirmOrderAction_createServerFn_handler",
		importer: () => import("./_ssr/db-queries-CWeuscmc.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
