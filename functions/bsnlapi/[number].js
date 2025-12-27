// Cloudflare Pages Function to proxy BSNL API
// Route: /bsnlapi/:number

export async function onRequest(context) {
    const { params } = context;
    const number = params.number;

    // Validate phone number (10 digits, starts with 6-9)
    if (!number || !/^[6-9]\d{9}$/.test(number)) {
        return new Response(JSON.stringify({
            error: true,
            errorCode: "INVALID_NUMBER",
            errorMessage: "Invalid phone number format. Must be 10 digits starting with 6-9."
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache'
            }
        });
    }

    try {
        const bsnlApiUrl = `https://bsnlrechargeapi.pyrogroup.com/bsnl-api/fetch-operator?mobile=${number}`;
        
        const response = await fetch(bsnlApiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/xml, text/xml, */*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const xmlText = await response.text();
        
        // Parse XML to JSON
        const jsonData = parseXmlToJson(xmlText);

        // Check if it's a BSNL number
        if (jsonData.status === 'SUCCESS') {
            return new Response(JSON.stringify({
                isBsnl: true,
                number: number,
                operatorName: jsonData.operatorName || 'BSNL',
                operatorCode: jsonData.operatorCode || 'BSNL',
                circle: jsonData.circleCode || null,
                circleCode: jsonData.circle_code || null,
                zoneCode: jsonData.zone_code || null,
                activePlan: jsonData.active_plan || null,
                expiryDate: jsonData.Expiry_date || null,
                topPlans: jsonData.topPlans || [],
                recommendedPlansStatus: jsonData.recommended_plans_status || null
            }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, max-age=3600'
                }
            });
        } else {
            return new Response(JSON.stringify({
                isBsnl: false,
                number: number,
                message: jsonData.message || "Not a BSNL number or number not found"
            }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, max-age=3600'
                }
            });
        }

    } catch (error) {
        return new Response(JSON.stringify({
            error: true,
            errorCode: "API_ERROR",
            errorMessage: "Failed to fetch data from BSNL API",
            details: error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache'
            }
        });
    }
}

// Simple XML to JSON parser for the BSNL API response
function parseXmlToJson(xml) {
    const result = {};
    
    // Extract simple tags
    const simpleTagRegex = /<(\w+)>([^<]*)<\/\1>/g;
    let match;
    
    while ((match = simpleTagRegex.exec(xml)) !== null) {
        const tagName = match[1];
        const value = match[2].trim();
        
        // Skip topplans as we'll handle them separately
        if (tagName !== 'topplans' && !['rech_type_desc', 'amount', 'rech_type', 'description', 'validity', 'short_desc'].includes(tagName)) {
            result[tagName] = value;
        }
    }
    
    // Extract topplans array
    const topPlans = [];
    const topplansRegex = /<topplans>([\s\S]*?)<\/topplans>/g;
    let planMatch;
    
    while ((planMatch = topplansRegex.exec(xml)) !== null) {
        const planXml = planMatch[1];
        const plan = {};
        
        const planTagRegex = /<(\w+)>([^<]*)<\/\1>/g;
        let tagMatch;
        
        while ((tagMatch = planTagRegex.exec(planXml)) !== null) {
            plan[tagMatch[1]] = tagMatch[2].trim();
        }
        
        if (Object.keys(plan).length > 0) {
            topPlans.push({
                type: plan.rech_type || null,
                typeDesc: plan.rech_type_desc || null,
                amount: plan.amount ? parseInt(plan.amount) : null,
                description: plan.description || null,
                validity: plan.validity || null,
                shortDesc: plan.short_desc || null
            });
        }
    }
    
    if (topPlans.length > 0) {
        result.topPlans = topPlans;
    }
    
    return result;
}
