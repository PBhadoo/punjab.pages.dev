/**
 * Airtel Number Verification API
 * Cloudflare Worker that proxies Airtel's getaccounts API and decrypts the response
 * 
 * Usage: /airtelapi/[number]
 * Returns: { airtel: true/false, circle: "XX", status: "ACTIV/INACTIVE", ... }
 * 
 * Note: Uses DES decryption - implementation based on CryptoJS DES ECB mode
 */

// Simplified DES implementation for Cloudflare Workers (ECB mode)
// Based on the DES algorithm specification

const SBOX = [
    [14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7,0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8,4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0,15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13],
    [15,1,8,14,6,11,3,4,9,7,2,13,12,0,5,10,3,13,4,7,15,2,8,14,12,0,1,10,6,9,11,5,0,14,7,11,10,4,13,1,5,8,12,6,9,3,2,15,13,8,10,1,3,15,4,2,11,6,7,12,0,5,14,9],
    [10,0,9,14,6,3,15,5,1,13,12,7,11,4,2,8,13,7,0,9,3,4,6,10,2,8,5,14,12,11,15,1,13,6,4,9,8,15,3,0,11,1,2,12,5,10,14,7,1,10,13,0,6,9,8,7,4,15,14,3,11,5,2,12],
    [7,13,14,3,0,6,9,10,1,2,8,5,11,12,4,15,13,8,11,5,6,15,0,3,4,7,2,12,1,10,14,9,10,6,9,0,12,11,7,13,15,1,3,14,5,2,8,4,3,15,0,6,10,1,13,8,9,4,5,11,12,7,2,14],
    [2,12,4,1,7,10,11,6,8,5,3,15,13,0,14,9,14,11,2,12,4,7,13,1,5,0,15,10,3,9,8,6,4,2,1,11,10,13,7,8,15,9,12,5,6,3,0,14,11,8,12,7,1,14,2,13,6,15,0,9,10,4,5,3],
    [12,1,10,15,9,2,6,8,0,13,3,4,14,7,5,11,10,15,4,2,7,12,9,5,6,1,13,14,0,11,3,8,9,14,15,5,2,8,12,3,7,0,4,10,1,13,11,6,4,3,2,12,9,5,15,10,11,14,1,7,6,0,8,13],
    [4,11,2,14,15,0,8,13,3,12,9,7,5,10,6,1,13,0,11,7,4,9,1,10,14,3,5,12,2,15,8,6,1,4,11,13,12,3,7,14,10,15,6,8,0,5,9,2,6,11,13,8,1,4,10,7,9,5,0,15,14,2,3,12],
    [13,2,8,4,6,15,11,1,10,9,3,14,5,0,12,7,1,15,13,8,10,3,7,4,12,5,6,11,0,14,9,2,7,11,4,1,9,12,14,2,0,6,10,13,15,3,5,8,2,1,14,7,4,10,8,13,15,12,9,0,3,5,6,11]
];

const IP = [58,50,42,34,26,18,10,2,60,52,44,36,28,20,12,4,62,54,46,38,30,22,14,6,64,56,48,40,32,24,16,8,57,49,41,33,25,17,9,1,59,51,43,35,27,19,11,3,61,53,45,37,29,21,13,5,63,55,47,39,31,23,15,7];
const FP = [40,8,48,16,56,24,64,32,39,7,47,15,55,23,63,31,38,6,46,14,54,22,62,30,37,5,45,13,53,21,61,29,36,4,44,12,52,20,60,28,35,3,43,11,51,19,59,27,34,2,42,10,50,18,58,26,33,1,41,9,49,17,57,25];
const E = [32,1,2,3,4,5,4,5,6,7,8,9,8,9,10,11,12,13,12,13,14,15,16,17,16,17,18,19,20,21,20,21,22,23,24,25,24,25,26,27,28,29,28,29,30,31,32,1];
const P = [16,7,20,21,29,12,28,17,1,15,23,26,5,18,31,10,2,8,24,14,32,27,3,9,19,13,30,6,22,11,4,25];
const PC1 = [57,49,41,33,25,17,9,1,58,50,42,34,26,18,10,2,59,51,43,35,27,19,11,3,60,52,44,36,63,55,47,39,31,23,15,7,62,54,46,38,30,22,14,6,61,53,45,37,29,21,13,5,28,20,12,4];
const PC2 = [14,17,11,24,1,5,3,28,15,6,21,10,23,19,12,4,26,8,16,7,27,20,13,2,41,52,31,37,47,55,30,40,51,45,33,48,44,49,39,56,34,53,46,42,50,36,29,32];
const SHIFTS = [1,1,2,2,2,2,2,2,1,2,2,2,2,2,2,1];

function permute(inp, table) {
    return table.map(i => inp[i - 1]);
}

function leftShift(arr, n) {
    return [...arr.slice(n), ...arr.slice(0, n)];
}

function xor(a, b) {
    return a.map((v, i) => v ^ b[i]);
}

function toBits(bytes) {
    const bits = [];
    for (const b of bytes) {
        for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1);
    }
    return bits;
}

function toBytes(bits) {
    const bytes = [];
    for (let i = 0; i < bits.length; i += 8) {
        let b = 0;
        for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
        bytes.push(b);
    }
    return new Uint8Array(bytes);
}

function genSubkeys(keyBits) {
    const pc1Key = permute(keyBits, PC1);
    let c = pc1Key.slice(0, 28), d = pc1Key.slice(28);
    const subkeys = [];
    for (let i = 0; i < 16; i++) {
        c = leftShift(c, SHIFTS[i]);
        d = leftShift(d, SHIFTS[i]);
        subkeys.push(permute([...c, ...d], PC2));
    }
    return subkeys;
}

function sbox(inp) {
    const out = [];
    for (let i = 0; i < 8; i++) {
        const chunk = inp.slice(i * 6, i * 6 + 6);
        const row = (chunk[0] << 1) | chunk[5];
        const col = (chunk[1] << 3) | (chunk[2] << 2) | (chunk[3] << 1) | chunk[4];
        const val = SBOX[i][row * 16 + col];
        for (let j = 3; j >= 0; j--) out.push((val >> j) & 1);
    }
    return out;
}

function f(r, k) {
    return permute(sbox(xor(permute(r, E), k)), P);
}

function desBlock(block, subkeys, decrypt) {
    const perm = permute(block, IP);
    let l = perm.slice(0, 32), r = perm.slice(32);
    for (let i = 0; i < 16; i++) {
        const idx = decrypt ? 15 - i : i;
        const newR = xor(l, f(r, subkeys[idx]));
        l = r; r = newR;
    }
    return toBytes(permute([...r, ...l], FP));
}

function desDecrypt(cipher, key) {
    const keyBits = toBits(key);
    const subkeys = genSubkeys(keyBits);
    const plain = [];
    for (let i = 0; i < cipher.length; i += 8) {
        const block = toBits(cipher.slice(i, i + 8));
        plain.push(...desBlock(block, subkeys, true));
    }
    // PKCS7 unpad
    const last = plain[plain.length - 1];
    if (last > 0 && last <= 8) {
        return new Uint8Array(plain.slice(0, -last));
    }
    return new Uint8Array(plain);
}

function b64decode(str) {
    const bin = atob(str);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
}

// Circle ID to name mapping
const CIRCLES = {
    '1': 'Andhra Pradesh', '2': 'Assam', '3': 'Bihar', '4': 'Chennai',
    '5': 'Delhi', '6': 'Gujarat', '7': 'Haryana', '8': 'Himachal Pradesh',
    '9': 'Jammu & Kashmir', '10': 'Karnataka', '11': 'Kerala', '12': 'Punjab',
    '13': 'Kolkata', '14': 'Madhya Pradesh', '15': 'Maharashtra', '16': 'Mumbai',
    '17': 'North East', '18': 'Orissa', '19': 'Rajasthan', '20': 'Tamil Nadu',
    '21': 'UP East', '22': 'UP West', '23': 'West Bengal',
    '42': 'All India', '99': 'Unknown'
};

export async function onRequest(context) {
    const { params, request } = context;
    const number = params.number;
    
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
        const apiHeaders = {
            'Accept': 'application/json, text/plain, */*',
            'Origin': 'https://www.airtel.in',
            'Referer': 'https://www.airtel.in/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'X-Consumer-Name': 'AirtelIn',
            'requesterId': 'WEB',
            'x-at-application': 'recast',
            'x-at-client': 'WEB',
            'adsHeader': '03d916c46a1b1e19e78b74ef5d52b48b4d2fc845',
            'googleCookie': 'airtel.com',
        };

        const url = `https://digi-api.airtel.in/airtel-selfcare/rest/home/v1/getaccounts?siNumber=${number}&lob=PREPAID`;
        const response = await fetch(url, { headers: apiHeaders });
        
        const decryptKey = response.headers.get('googleCookie') || 'airtel.com';
        const encryptedText = await response.text();
        const encrypted = encryptedText.replace(/"/g, '');
        
        const cipher = b64decode(encrypted);
        const keyBytes = new TextEncoder().encode(decryptKey).slice(0, 8);
        const decrypted = desDecrypt(cipher, keyBytes);
        const jsonStr = new TextDecoder().decode(decrypted);
        const data = JSON.parse(jsonStr);
        
        const details = data.siAccountDetails || {};
        const result = {
            number: number,
            isAirtel: details.airtel === true,
            status: details.siStatus || 'UNKNOWN',
            circleId: details.circleId || null,
            circleName: CIRCLES[details.circleId] || null,
            lineOfBusiness: details.lob || null,
            valid: data.valid === true,
            timestamp: new Date().toISOString(),
            source: 'airtel-api'
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
