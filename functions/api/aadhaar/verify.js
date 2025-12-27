/**
 * Aadhaar Verification API
 * Cloudflare Pages Function
 * 
 * POST /api/aadhaar/verify
 */

export async function onRequestPost(context) {
    try {
        const body = await context.request.json();
        
        const uid = (body.uid || '').replace(/\s/g, '');
        const captcha = body.captcha || '';
        const captchaTxnId = body.captchaTxnId || '';
        const transactionId = body.transactionId || '';

        if (!uid || !captcha || !captchaTxnId || !transactionId) {
            return new Response(JSON.stringify({
                status: 'Error',
                message: 'Missing required fields: uid, captcha, captchaTxnId, transactionId'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                }
            });
        }

        const headers = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en_IN',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
            'Origin': 'https://myaadhaar.uidai.gov.in',
            'Pragma': 'no-cache',
            'Referer': 'https://myaadhaar.uidai.gov.in/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'appid': 'MYAADHAAR',
            'x-request-id': transactionId,
        };

        const response = await fetch(
            'https://tathya.uidai.gov.in/uidVerifyRetrieveService/api/verifyUID',
            {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    uid: uid,
                    captchaTxnId: captchaTxnId,
                    captcha: captcha,
                    transactionId: transactionId,
                    captchaLogic: 'V3'
                })
            }
        );

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            status: 'Error',
            message: `Verification failed: ${error.message}`
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            }
        });
    }
}

// Handle OPTIONS for CORS preflight
export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400',
        }
    });
}
