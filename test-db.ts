import supabase from "./src/lib/supabaseClient";

async function run() {
    console.log("Fetching client_inquiries...");
    const { data: inq, error: inqErr } = await supabase.from('client_inquiries').select('*').limit(5);
    console.log("Inquiries:", inq?.length, "Error:", inqErr);
    if (inq?.length) {
        console.log("Sample inquiry client_id:", inq[0].client_id);

        console.log("Fetching profile for client_id:", inq[0].client_id);
        const { data: prof, error: profErr } = await supabase.from('profiles').select('*').eq('id', inq[0].client_id).single();
        if (profErr) console.log("Profile error:", profErr);
        else console.log("Profile found:", prof?.email);

        console.log("Testing join...");
        const { data: joinData, error: joinErr } = await supabase.from('client_inquiries').select('client_id, profiles(*)').limit(5);
        console.log("Join result:", joinData?.[0], joinErr);
    }
}

run();
