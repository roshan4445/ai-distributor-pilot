//#region node_modules/.nitro/vite/services/ssr/assets/mock-data-qUJ_xzNA.js
var owner = {
	name: "Roshan",
	business: "Kumar Electricals & Distribution"
};
var productRecommendation = (p) => {
	const ratio = p.stock / p.min;
	if (ratio < .5) return {
		level: "critical",
		text: "Restock urgently — will run out this week."
	};
	if (ratio < 1) return {
		level: "warning",
		text: "Restock before Friday to avoid stockout."
	};
	if (ratio < 1.5) return {
		level: "watch",
		text: "Monitor — trending down."
	};
	return {
		level: "ok",
		text: "Healthy stock levels."
	};
};
var askAiSuggestions = [
	"Who hasn't paid in 30 days?",
	"Which dealer should I follow up with today?",
	"Which products are running low?",
	"How much revenue did we make today?",
	"Which dealer is most profitable this month?",
	"Forecast next week's cash collection."
];
var askAiSeedChat = [{
	q: "Who hasn't paid in 30 days?",
	a: "3 dealers have crossed 30 days overdue:\n\n• Raj Traders — ₹1,24,500 (42 days) — Trust score 62\n• Vinayaka Electricals — ₹1,72,000 (21 days) — promise for Nov 12\n• PowerTech Distributors — ₹2,18,000 (14 days) — Post-Diwali promise\n\nRecommended: call Raj Traders first — highest risk, no payment promise yet."
}];
var fmt = (n) => "₹" + n.toLocaleString("en-IN");
//#endregion
export { productRecommendation as a, owner as i, askAiSuggestions as n, fmt as r, askAiSeedChat as t };
