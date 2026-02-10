/**
 * Vi (Vodafone Idea) Number Verification API
 * Each request uses completely fresh encryption keys, boundary, and headers.
 * Retries up to 3 times with increasing delays and fresh crypto per attempt.
 */

const VI_CIRCLES = {
    '0001': 'Andhra Pradesh', '0002': 'Assam', '0003': 'Bihar',
    '0004': 'Chennai', '0005': 'Delhi', '0006': 'Gujarat',
    '0007': 'Haryana', '0008': 'Himachal Pradesh', '0009': 'Jammu & Kashmir',
    '0010': 'Karnataka', '0011': 'Kerala', '0012': 'Punjab',
    '0013': 'Kolkata', '0014': 'Madhya Pradesh', '0015': 'Maharashtra',
    '0016': 'Mumbai', '0017': 'North East', '0018': 'Orissa',
    '0019': 'Rajasthan', '0020': 'Tamil Nadu', '0021': 'UP East',
    '0022': 'UP West', '0023': 'West Bengal'
};

function randomBytes(length) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
}

function bytesToHex(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function pbkdf2(password, salt, iterations, keyLength) {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-1' }, key, keyLength * 8);
    return new Uint8Array(bits);
}

async function aesEncrypt(plaintext, key, iv) {
    const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'AES-CBC' }, false, ['encrypt']);
    const ct = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, cryptoKey, new TextEncoder().encode(plaintext));
    return new Uint8Array(ct);
}

// Fresh encryption for every single call
async function encryptPayload(dataToEncrypt) {
    const salt = randomBytes(16);
    const iv = randomBytes(16);
    const passphrase = randomBytes(16);
    const passphraseHex = bytesToHex(passphrase);
    const key = await pbkdf2(passphraseHex, salt, 100, 16);
    const ciphertext = await aesEncrypt(dataToEncrypt, key, iv);
    return {
        params: btoa(String.fromCharCode(...ciphertext)),
        sl: bytesToHex(salt),
        algf: bytesToHex(iv),
        sps: bytesToHex(passphrase)
    };
}

// Build a completely fresh HTTP request each time
async function makeViRequest(phoneNumber) {
    // Fresh encryption
    const payload = JSON.stringify({ mobNumber: phoneNumber });
    const encrypted = await encryptPayload(payload);
    
    // Fresh boundary
    const boundary = '----WebKitFormBoundary' + bytesToHex(randomBytes(8));
    const body = `--${boundary}\r\nContent-Disposition: form-data; name="mobile"\r\n\r\n${JSON.stringify(encrypted)}\r\n--${boundary}--\r\n`;

    // Fresh request with no caching
    const response = await fetch('https://www.myvi.in/wildfly/consumer/api/vodafoneidea/web', {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Origin': 'https://www.myvi.in',
            'Referer': 'https://www.myvi.in/prepaid/online-mobile-recharge',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
            'methodname': 'numberValidation',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
        },
        body: body,
        // Cloudflare Workers: ensure no response caching
        cf: { cacheTtl: 0, cacheEverything: false }
    });
    
    if (!response.ok) {
        throw new Error(`Vi API HTTP ${response.status}`);
    }
    
    return await response.json();
}

export async function onRequest(context) {
    const { params, request } = context;
    const number = Array.isArray(params.number) ? params.number[0] : params.number;
    
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
    };
    
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }
    
    if (!number || !/^\d{10}$/.test(number)) {
        return new Response(JSON.stringify({
            error: 'Invalid phone number',
            message: 'Please provide a 10-digit Indian mobile number'
        }), { status: 400, headers: corsHeaders });
    }
    
    // Retry up to 3 times with fresh encryption + increasing delays
    const maxRetries = 3;
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Each attempt gets completely fresh encryption, boundary, headers
            const responseData = await makeViRequest(number);
            
            if (responseData && responseData.STATUS === 'SUCCESS' && responseData.data) {
                const d = responseData.data;
                return new Response(JSON.stringify({
                    number, isVi: d.status === 'SUCCESS',
                    status: d.status || responseData.STATUS,
                    brand: d.brand || null,
                    subscriberType: d.subscriberType || null,
                    circle: d.circle || null,
                    circleId: d.circleId || null,
                    circleName: VI_CIRCLES[d.circleId] || null,
                    custStatus: d.customerStatus || null,
                    isMigrated: d.isMigrated || null,
                    timestamp: new Date().toISOString(),
                    source: 'vi-api', attempt
                }), { headers: corsHeaders });
            }
            
            // FAILURE status — retry with fresh request
            if (responseData && responseData.STATUS === 'FAILURE') {
                lastError = new Error('Vi API returned FAILURE');
                if (attempt < maxRetries) {
                    await new Promise(r => setTimeout(r, 500 * attempt)); // 500ms, 1000ms
                }
                continue;
            }
            
            // Unexpected response — return as-is
            return new Response(JSON.stringify({
                number, isVi: false,
                status: responseData?.STATUS || 'UNKNOWN',
                brand: null, subscriberType: null, circle: null,
                circleId: null, circleName: null, custStatus: null,
                isMigrated: null, timestamp: new Date().toISOString(),
                source: 'vi-api', attempt
            }), { headers: corsHeaders });
            
        } catch (error) {
            lastError = error;
            if (attempt < maxRetries) {
                await new Promise(r => setTimeout(r, 500 * attempt));
            }
        }
    }
    
    return new Response(JSON.stringify({
        error: 'API Error',
        message: lastError?.message || 'Vi API failed after all retries',
        number, retries: maxRetries
    }), { status: 500, headers: corsHeaders });
}