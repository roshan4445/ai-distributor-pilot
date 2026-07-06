var e={name:`Roshan`,business:`Kumar Electricals & Distribution`},t=e=>{let t=e.stock/e.min;return t<.5?{level:`critical`,text:`Restock urgently — will run out this week.`}:t<1?{level:`warning`,text:`Restock before Friday to avoid stockout.`}:t<1.5?{level:`watch`,text:`Monitor — trending down.`}:{level:`ok`,text:`Healthy stock levels.`}},n=[`Who hasn't paid in 30 days?`,`Which dealer should I follow up with today?`,`Which products are running low?`,`How much revenue did we make today?`,`Which dealer is most profitable this month?`,`Forecast next week's cash collection.`],r=[{q:`Who hasn't paid in 30 days?`,a:`3 dealers have crossed 30 days overdue:

• Raj Traders — ₹1,24,500 (42 days) — Trust score 62
• Vinayaka Electricals — ₹1,72,000 (21 days) — promise for Nov 12
• PowerTech Distributors — ₹2,18,000 (14 days) — Post-Diwali promise

Recommended: call Raj Traders first — highest risk, no payment promise yet.`}],i=e=>`₹`+e.toLocaleString(`en-IN`);export{t as a,e as i,n,i as r,r as t};