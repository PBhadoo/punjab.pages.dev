// Cloudflare Pages Function to proxy Jio API
// Route: /reliancejioapi/:number

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
        const jioApiUrl = `https://www.jio.com/api/jio-recharge-service/recharge/mobility/number/${number}`;
        
        const response = await fetch(jioApiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.jio.com/',
                'Origin': 'https://www.jio.com'
            }
        });

        const data = await response.json();

        // Check if it's a Jio number
        if (data.errorCode || data.errorMessage === "NOT_SUBSCRIBED_USER") {
            return new Response(JSON.stringify({
                isJio: false,
                number: number,
                message: "Not a Jio number or number not found"
            }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, max-age=3600'
                }
            });
        }

        // It's a Jio number - extract relevant info
        const result = {
            isJio: true,
            number: number,
            billingType: data.primaryService?.billingType || 'UNKNOWN',
            isPrepaid: data.primaryService?.billingType === 'PREPAID',
            isPostpaid: data.primaryService?.billingType === 'POSTPAID',
            isPrimeMember: data.primaryService?.primeMember || false,
            productType: data.productType || 'MOBILITY',
            nextPage: data.nextPage || null
        };

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=3600'
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            error: true,
            errorCode: "API_ERROR",
            errorMessage: "Failed to fetch data from Jio API",
            details: error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

// Handle OPTIONS requests for CORS
export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400'
        }
    });
}
