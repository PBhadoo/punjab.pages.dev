/**
 * Vi (Vodafone Idea) Number Verification API
 * Cloudflare Worker that calls Vi's prepaid recharge validation API
 * 
 * Usage: /viapi/[number]
 * Returns: { isVi: true/false, brand, circle, subscriberType, status, ... }
 * 
 * Encryption: AES-128-CBC with PBKDF2 key derivation (SHA1, 100 iterations)
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

// Convert hex string to bytes
function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
}

// PKCS7 padding
function pkcs7Pad(data, blockSize) {
    const padding = blockSize - (data.length % blockSize);
    const padded = new Uint8Array(data.length + padding);
    padded.set(data);
    for (let i = data.length; i < padded.length; i++) {
        padded[i] = padding;
    }
    return padded;
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
// Web Crypto AES-CBC adds PKCS7 padding, but we need to verify output matches Python
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
    
    // Convert passphrase to hex string (Vi uses .toString() which gives hex)
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

// Call Vi API
async function checkViNumber(phoneNumber) {
    // Prepare payload - JSON.stringify produces no spaces by default
    const payload = JSON.stringify({ mobNumber: phoneNumber });
    
    // Encrypt
    const encrypted = await encryptViPayload(payload);
    
    const headers = {
        'Accept': '*/*',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': 'https://www.myvi.in',
        'Referer': 'https://www.myvi.in/prepaid/online-mobile-recharge',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'X-Requested-With': 'XMLHttpRequest',
    };
    
    const body = 'mobile=' + JSON.stringify(encrypted);
    
    const response = await fetch('https://www.myvi.in/bin/selected/prepaidrechargevalidation?timestamp=' + Date.now(), {
        method: 'POST',
        headers: headers,
        body: body
    });
    
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
    
    try {
        const data = await checkViNumber(number);
        
        const isVi = data.STATUS === 'SUCCESS';
        
        const result = {
            number: number,
            isVi: isVi,
            status: data.STATUS,
            brand: data.brand || null,
            subscriberType: data.subscriberType || null,
            circle: data.circle || null,
            circleId: data.circleId || null,
            circleName: VI_CIRCLES[data.circleId] || null,
            custStatus: data.cust_status || null,
            isMigrated: data.isMigrated || null,
            timestamp: new Date().toISOString(),
            source: 'vi-api'
        };
        
        return new Response(JSON.stringify(result), { headers: corsHeaders });
        
    } catch (error) {
        return new Response(JSON.stringify({
            error: 'API Error',
            message: error.message,
            number: number
        }), { status: 500, headers: corsHeaders });
    }
}
