/**
 * Aadhaar Captcha Generation API
 * Cloudflare Pages Function
 * 
 * POST /api/aadhaar/captcha
 */

export async function onRequestPost(context) {
    const requestId = crypto.randomUUID();
    
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
        'x-request-id': requestId,
    };

    try {
        const response = await fetch(
            'https://tathya.uidai.gov.in/audioCaptchaService/api/captcha/v3/generation',
            {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    captchaLength: '6',
                    captchaType: '2',
                    audioCaptchaRequired: true
                })
            }
        );

        const uidaiData = await response.json();
        
        // Build response with proper field mapping
        // UIDAI returns: imageBase64, audioBase64, transactionId
        // The transactionId from UIDAI is used as captchaTxnId for verification
        const responseData = {
            imageBase64: uidaiData.captchaBase64String || uidaiData.imageBase64,
            audioBase64: uidaiData.audioCaptchaBase64String || uidaiData.audioBase64,
            captchaTxnId: uidaiData.transactionId,  // UIDAI's transactionId IS the captchaTxnId
            transactionId: uidaiData.transactionId  // Use same ID for both
        };

        return new Response(JSON.stringify(responseData), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            status: 'Error',
            message: `Failed to fetch captcha: ${error.message}`
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
