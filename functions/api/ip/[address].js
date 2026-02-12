// Cloudflare Pages Function - IP Address Lookup Proxy
// Uses multiple sources including Cloudflare's own data

export async function onRequestGet(context) {
    const { params } = context;
    const ip = params.address;

    if (!ip || ip === 'undefined') {
        return new Response(JSON.stringify({ error: 'No IP address provided' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
    }

    const results = {};

    // 1. ip-api.com - comprehensive free data
    try {
        const r1 = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query`);
        const d1 = await r1.json();
        if (d1.status === 'success') results.ipapi = d1;
    } catch (e) {}

    // 2. ipwho.is - additional security/VPN data
    try {
        const r2 = await fetch(`https://ipwho.is/${ip}`);
        const d2 = await r2.json();
        if (d2.success !== false) results.ipwho = d2;
    } catch (e) {}

    // 3. ipapi.co - network, languages, currency details
    try {
        const r3 = await fetch(`https://ipapi.co/${ip}/json/`);
        const d3 = await r3.json();
        if (!d3.error) results.ipapico = d3;
    } catch (e) {}

    // 4. Cloudflare Radar (if API token is set as environment variable)
    const cfToken = context.env.CF_API_TOKEN;
    if (cfToken) {
        // ASN/Network info from Cloudflare Radar
        try {
            // Get ASN info if we have ASN from other sources
            let asn = null;
            if (results.ipapi && results.ipapi.as) {
                asn = results.ipapi.as.replace(/^AS/, '').split(' ')[0];
            }
            if (asn) {
                const r4 = await fetch(`https://api.cloudflare.com/client/v4/radar/entities/asns/${asn}`, {
                    headers: { 'Authorization': `Bearer ${cfToken}`, 'Content-Type': 'application/json' }
                });
                const d4 = await r4.json();
                if (d4.success) results.cfRadarASN = d4.result;
            }
        } catch (e) {}

        // Cloudflare Radar IP overview
        try {
            const r5 = await fetch(`https://api.cloudflare.com/client/v4/radar/netflows/top/ases?dateRange=7d&limit=5&location=${results.ipapi?.countryCode || ''}`, {
                headers: { 'Authorization': `Bearer ${cfToken}`, 'Content-Type': 'application/json' }
            });
            const d5 = await r5.json();
            if (d5.success) results.cfRadarTop = d5.result;
        } catch (e) {}
    }

    // 5. Use Cloudflare's own cf- headers info (from the request itself, for the requester's IP)
    const cfData = {
        cfRay: context.request.headers.get('cf-ray'),
        cfCountry: context.request.headers.get('cf-ipcountry'),
        cfConnectingIP: context.request.headers.get('cf-connecting-ip'),
    };
    results.cloudflare = cfData;

    return new Response(JSON.stringify(results), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
}