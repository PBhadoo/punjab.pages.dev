/**
 * Vi (Vodafone Idea) Number Verification API
 * Cloudflare Worker that calls Vi's prepaid recharge validation API
 * 
 * Usage: /viapi/[number]
 * Returns: { isVi: true/false, brand, circle, subscriberType, status, ... }
 * 
 * Encryption: AES-128-CBC with PBKDF2 key derivation (SHA1, 100 iterations)
 * 
 * Updated: Uses new wildfly API endpoint with multipart/form-data
 * and methodname header (replaces old /bin/selected/prepaidrechargevalidation)
 */

// Circle ID to name mapping for Vi
const VI_CIRCLES = {
    '0001': 'Andhra Pradesh',
    '0002': 'Assam', 
    '0003': 'Bihar',
    '0004': 'Chennai',
    '0005': 'Delhi',
    '0006': 'Gujarat',
    '0007': 'Haryana',
    '0008': 'Himachal Pradesh',
    '0009': 'Jammu & Kashmir',
    '0010': 'Karnataka',
    '0011': 'Kerala',
    '0012': 'Punjab',
    '0013': 'Kolkata',
    '0014': 'Madhya Pradesh',
    '0015': 'Maharashtra',
    '0016': 'Mumbai',
    '0017': 'North East',
    '0018': 'Orissa',
    '0019': 'Rajasthan',
    '0020': 'Tamil Nadu',
    '0021': 'UP East',
    '0022': 'UP West',
    '0023': 'West Bengal'
};

// Generate random bytes
function randomBytes(length) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
}

// Convert bytes to hex string
function bytesToHex(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// PBKDF2 with SHA1 - Web Crypto implementation
async function pbkdf2(password, salt, iterations, keyLength) {
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);
    
    const key = await crypto.subtle.importKey(
        'raw',
        passwordBytes,
        'PBKDF2',
        false,
        ['deriveBits']
    );
    
    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: iterations,
            hash: 'SHA-1'
        },
        key,
        keyLength * 8
    );
    
    return new Uint8Array(derivedBits);
}

// AES-CBC encryption using Web Crypto
async function aesEncrypt(plaintext, key, iv) {
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'AES-CBC' },
        false,
        ['encrypt']
    );
    
    const plaintextBytes = new TextEncoder().encode(plaintext);
    
    // Web Crypto adds PKCS7 padding automatically
    const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-CBC', iv: iv },
        cryptoKey,
        plaintextBytes
    );
    
    return new Uint8Array(ciphertext);
}

// Encrypt payload for Vi API
async function encryptViPayload(dataToEncrypt) {
    // Generate random values (16 bytes each)
    const salt = randomBytes(16);
    const iv = randomBytes(16);
    const passphrase = randomBytes(16);
    
    // Convert passphrase to hex string
    const passphraseHex = bytesToHex(passphrase);
    
    // Derive key using PBKDF2 (SHA1, 100 iterations, 16 bytes key)
    const key = await pbkdf2(passphraseHex, salt, 100, 16);
    
    // Encrypt with AES-CBC
    const ciphertext = await aesEncrypt(dataToEncrypt, key, iv);
    
    // Return in Vi's format
    return {
        params: btoa(String.fromCharCode(...ciphertext)),
        sl: bytesToHex(salt),
        algf: bytesToHex(iv),
        sps: bytesToHex(passphrase)
    };
}

// Generate a random multipart boundary
function generateBoundary() {
    return '----WebKitFormBoundary' + bytesToHex(randomBytes(8));
}

// Call Vi API using the new wildfly endpoint with multipart/form-data
async function checkViNumber(phoneNumber) {
    // Prepare payload
    const payload = JSON.stringify({ mobNumber: phoneNumber });
    
    // Encrypt
    const encrypted = await encryptViPayload(payload);
    
    // Build multipart/form-data body (matching what Vi website sends)
    const boundary = generateBoundary();
    const body = `--${boundary}\r\nContent-Disposition: form-data; name="mobile"\r\n\r\n${JSON.stringify(encrypted)}\r\n--${boundary}--\r\n`;
    
    const headers = {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Origin': 'https://www.myvi.in',
        'Referer': 'https://www.myvi.in/prepaid/online-mobile-recharge',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
        'methodname': 'numberValidation',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
    };
    
    const response = await fetch('https://www.myvi.in/wildfly/consumer/api/vodafoneidea/web', {
        method: 'POST',
        headers: headers,
        body: body
    });
    
    if (!response.ok) {
        throw new Error(`Vi API HTTP error: ${response.status}`);
    }
    
    return await response.json();
}

export async function onRequest(context) {
    const { params, request } = context;
    // [[number]] catch-all route returns an array, get the first element
    const number = Array.isArray(params.number) ? params.number[0] : params.number;
    
    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };
    
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }
    
    // Validate number
    if (!number || !/^\d{10}$/.test(number)) {
        return new Response(JSON.stringify({
            error: 'Invalid phone number',
            message: 'Please provide a 10-digit Indian mobile number'
        }), { status: 400, headers: corsHeaders });
    }
    
    // Server-side retry logic - retry up to 3 times with fresh encryption each time
    const maxRetries = 3;
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const responseData = await checkViNumber(number);
            
            // Check if we got a valid response structure
            // New API: outer STATUS is always SUCCESS for HTTP 200
            // Inner data.status tells us if the number is Vi or not
            if (responseData && responseData.STATUS === 'SUCCESS' && responseData.data) {
                const innerData = responseData.data;
                const isVi = innerData.status === 'SUCCESS';
                
                const result = {
                    number: number,
                    isVi: isVi,
                    status: innerData.status || responseData.STATUS,
                    brand: innerData.brand || null,
                    subscriberType: innerData.subscriberType || null,
                    circle: innerData.circle || null,
                    circleId: innerData.circleId || null,
                    circleName: VI_CIRCLES[innerData.circleId] || null,
                    custStatus: innerData.customerStatus || null,
                    isMigrated: innerData.isMigrated || null,
                    timestamp: new Date().toISOString(),
                    source: 'vi-api',
                    attempt: attempt
                };
                
                return new Response(JSON.stringify(result), { headers: corsHeaders });
            }
            
            // If we got a response but STATUS is FAILURE or missing data, retry
            // This handles the intermittent FAILURE responses from Vi
            if (responseData && responseData.STATUS === 'FAILURE') {
                lastError = new Error('Vi API returned FAILURE status');
                continue; // retry
            }
            
            // Unexpected response structure - still return what we have
            const result = {
                number: number,
                isVi: false,
                status: responseData?.STATUS || 'UNKNOWN',
                brand: null,
                subscriberType: null,
                circle: null,
                circleId: null,
                circleName: null,
                custStatus: null,
                isMigrated: null,
                timestamp: new Date().toISOString(),
                source: 'vi-api',
                attempt: attempt,
                rawStatus: responseData?.STATUS
            };
            
            return new Response(JSON.stringify(result), { headers: corsHeaders });
            
        } catch (error) {
            lastError = error;
            // Only retry on network/parsing errors, not on clear responses
            if (attempt < maxRetries) {
                // Small delay before retry (50ms * attempt)
                await new Promise(resolve => setTimeout(resolve, 50 * attempt));
            }
        }
    }
    
    // All retries exhausted
    return new Response(JSON.stringify({
        error: 'API Error',
        message: lastError?.message || 'Vi API failed after all retries',
        number: number,
        retries: maxRetries
    }), { status: 500, headers: corsHeaders });
}