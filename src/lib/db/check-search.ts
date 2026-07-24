import * as dotenv from "dotenv";
dotenv.config();

import { searchService } from "../../services/searchService";

console.log("🔍 Running searchService.search({ query: 'basquet' }) [without accent]...");
const queryResults1 = await searchService.search({ query: "basquet" });
console.log(`Results for 'basquet': ${queryResults1.length} items (${queryResults1[0]?.title || 'none'}).`);

console.log("\n🔍 Running searchService.search({ query: 'plantacion' }) [without accent]...");
const queryResults2 = await searchService.search({ query: "plantacion" });
console.log(`Results for 'plantacion': ${queryResults2.length} items (${queryResults2[0]?.title || 'none'}).`);

console.log("\n🔍 Running searchService.search({ when: 'sábado' })...");
const queryResults3 = await searchService.search({ when: "sábado" });
console.log(`Results for when='sábado': ${queryResults3.length} items.`);

process.exit(0);
