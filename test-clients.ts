import { getAllClients } from "./src/services/admin.service";

async function run() {
    console.log("Fetching clients...");
    const result = await getAllClients();
    console.log(JSON.stringify(result, null, 2));
}

run();
