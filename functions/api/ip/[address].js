// Cloudflare Pages Function - IP Address Lookup
// PRIMARY: Cloudflare Radar API + VPN ASN Database
// SECONDARY: ip-api.com, ipwho.is for supplementary geolocation

export async function onRequestGet(context) {
    const { params, env } = context;
    const ip = params.address;

    if (!ip || ip === 'undefined') {
        return Response.json({ error: 'No IP address provided' }, { status: 400, headers: cors() });
    }

    const results = {};

    // ===== 1. CLOUDFLARE RADAR (PRIMARY) =====
    const cfToken = env.CF_API_TOKEN;
    if (cfToken) {
        // 1a. Get ASN for this IP via Cloudflare Radar
        try {
            const r = await fetch(`https://api.cloudflare.com/client/v4/radar/entities/ip?ip=${encodeURIComponent(ip)}`, {
                headers: { 'Authorization': `Bearer ${cfToken}`, 'Content-Type': 'application/json' }
            });
            const d = await r.json();
            if (d.success && d.result) {
                results.radarIP = d.result;
                // 1b. Get detailed ASN info
                const asn = d.result.asn;
                if (asn) {
                    try {
                        const r2 = await fetch(`https://api.cloudflare.com/client/v4/radar/entities/asns/${asn}`, {
                            headers: { 'Authorization': `Bearer ${cfToken}`, 'Content-Type': 'application/json' }
                        });
                        const d2 = await r2.json();
                        if (d2.success && d2.result) results.radarASN = d2.result;
                    } catch (e) {}
                }
            }
        } catch (e) {}
    }

    // ===== 2. VPN ASN DATABASE CHECK =====
    // Load VPN ASN database and check
    try {
        const vpnDB = await import('../../ip/vpn-asns.json', { assert: { type: 'json' } }).catch(() => null);
        if (vpnDB) {
            // Extract ASN number from results
            let asnNum = null;
            if (results.radarIP && results.radarIP.asn) {
                asnNum = String(results.radarIP.asn);
            }
            if (asnNum && vpnDB.default) {
                const db = vpnDB.default;
                if (db.vpn && db.vpn[asnNum]) {
                    results.vpnMatch = { ...db.vpn[asnNum], source: 'vpn_database', asn: asnNum };
                } else if (db.tor && db.tor[asnNum]) {
                    results.torMatch = { ...db.tor[asnNum], source: 'tor_database', asn: asnNum };
                } else if (db.proxy_commercial && db.proxy_commercial[asnNum]) {
                    results.proxyMatch = { ...db.proxy_commercial[asnNum], source: 'proxy_database', asn: asnNum };
                }
            }
        }
    } catch (e) {
        // VPN DB import may fail in some environments, fallback to inline check
        results.vpnDBError = e.message;
    }

    // Inline VPN ASN check as fallback (top 50 most common VPN ASNs)
    if (!results.vpnMatch && !results.torMatch && !results.proxyMatch) {
        const asnNum = results.radarIP?.asn ? String(results.radarIP.asn) : null;
        if (asnNum) {
            const VPN_ASNS = {
                '13335':'Cloudflare WARP','198093':'Mullvad VPN','212238':'NordVPN/Surfshark (Datacamp)',
                '209103':'ProtonVPN (Proton AG)','9009':'CyberGhost/HMA (M247)','55286':'PIA (B2 Net)',
                '22181':'VyprVPN/StrongVPN (Golden Frog)','60068':'HMA VPN (Datacamp)','62744':'AirVPN',
                '54600':'Windscribe VPN','394711':'ExpressVPN (Limenet)','63023':'ExpressVPN (Kape)',
                '53667':'TorGuard (FranTech/BuyVM)','36352':'ColoCrossing (VPN host)',
                '40676':'Psychz Networks (VPN host)','8100':'QuadraNet (VPN host)',
                '33438':'IPVanish (Highwinds/StackPath)','204428':'Surfshark (SS-Net)',
                '396356':'Atlas VPN (Maxihost)','210644':'AEZA GROUP (VPN host)',
                '44477':'Stark Industries (VPN/bulletproof)','200651':'Flokinet (privacy host)',
                '51396':'Pfcloud (VPN host)','62240':'Clouvider (VPN host)',
                '39351':'31173 Services (VPN Sweden)','213230':'ServerAstra (VPN host)',
                '56630':'Melbikomas (VPN host)','41378':'Kirino (VPN host)',
                '25820':'IT7 Networks (VPN host)','35913':'DediPath (VPN host)',
                '62904':'Eonix (VPN host)','3214':'xTom GmbH (VPN host)',
                '46844':'Sharktech (VPN host)','19624':'Data Room (CyberGhost)',
                '57858':'Inter Connects (VPN)','63473':'HostHatch (VPN host)',
                '60404':'Liteserver (VPN host)','203515':'Njalla (privacy host)',
                '206264':'Amarutu Technology (VPN)','209854':'Ownership change (VPN)',
                '46562':'Performive (VPN host)','397423':'Tier.Net (VPN host)',
                '32489':'Privax/HMA (Unmanaged)','60631':'VPN Consumer Ltd',
                '41665':'NForce Entertainment (VPN)','201106':'Spartan Host (VPN)',
                '399486':'Rackdog (VPN host)','63128':'VPN Innovations',
                '206238':'Freedom Internet (VPN)','34549':'meerfarbig (VPN host)',
                '142002':'Datacamp Secondary (NordVPN)','398493':'Datacamp US (NordVPN)'
            };
            if (VPN_ASNS[asnNum]) {
                results.vpnMatch = { name: VPN_ASNS[asnNum], provider: VPN_ASNS[asnNum], confidence: 'high', source: 'inline_database', asn: asnNum };
            }
        }
    }

    // ===== 3. SUPPLEMENTARY GEOLOCATION (ip-api.com + ipwho.is) =====
    // These provide detailed geo data that Radar doesn't always have
    const geoPromises = [];

    geoPromises.push(
        fetch(`http://ip-api.com/json/${ip}?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query`)
            .then(r => r.json())
            .then(d => { if (d.status === 'success') results.ipapi = d; })
            .catch(() => {})
    );

    geoPromises.push(
        fetch(`https://ipwho.is/${ip}`)
            .then(r => r.json())
            .then(d => { if (d.success !== false) results.ipwho = d; })
            .catch(() => {})
    );

    geoPromises.push(
        fetch(`https://ipapi.co/${ip}/json/`)
            .then(r => r.json())
            .then(d => { if (!d.error) results.ipapico = d; })
            .catch(() => {})
    );

    await Promise.allSettled(geoPromises);

    // ===== 4. ORG NAME VPN CHECK (backup if ASN DB didn't match) =====
    if (!results.vpnMatch && !results.torMatch) {
        const orgNames = [
            results.ipapi?.isp, results.ipapi?.org, results.ipapi?.asname,
            results.ipwho?.connection?.isp, results.ipwho?.connection?.org,
            results.radarASN?.asn?.name
        ].filter(Boolean).join('|').toLowerCase();

        const VPN_NAMES = /mullvad|nordvpn|nord\s*security|expressvpn|surfshark|protonvpn|proton\s*ag|cyberghost|private\s*internet\s*access|ipvanish|hotspot\s*shield|tunnelbear|windscribe|hide\.me|purevpn|vypr|strongvpn|astrill|torguard|airvpn|ivpn|mozilla\s*vpn|psiphon|ultrasurf|lantern|kaspersky\s*vpn|bitdefender\s*vpn|avast.*vpn|avg.*vpn|adguard\s*vpn|f-secure|warp|cloudflare\s*warp|1\.1\.1\.1/;
        
        if (VPN_NAMES.test(orgNames)) {
            results.vpnMatch = { name: 'Detected by org name pattern', provider: orgNames.split('|')[0], confidence: 'medium', source: 'name_pattern' };
        }
    }

    return Response.json(results, { headers: cors() });
}

function cors() {
    return { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=300' };
}