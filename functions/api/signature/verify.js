/**
 * Signature Checksum Verification API
 * Cloudflare Pages Function
 * 
 * POST /api/signature/verify
 * 
 * Verifies a signature code against:
 * - Date (DDMMYYYY) - must be current date in IST (no backdating)
 * - User's 4-digit PIN
 * - 4-digit signature code to verify
 * - Secret key from environment variables
 */

export async function onRequestPost(context) {
    try {
        const body = await context.request.json();
        const pin = body.pin || '';
        const code = body.code || '';
        const dateInput = body.date || ''; // Expected format: DDMMYYYY
        
        // Validate PIN format (4 digits)
        if (!/^\d{4}$/.test(pin)) {
            return new Response(JSON.stringify({
                success: false,
                valid: false,
                message: 'Invalid PIN format. Must be exactly 4 digits.'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                }
            });
        }

        // Validate code format (4 digits)
        if (!/^\d{4}$/.test(code)) {
            return new Response(JSON.stringify({
                success: false,
                valid: false,
                message: 'Invalid signature code format. Must be exactly 4 digits.'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                }
            });
        }

        // Validate date format (DDMMYYYY)
        if (!/^\d{8}$/.test(dateInput)) {
            return new Response(JSON.stringify({
                success: false,
                valid: false,
                message: 'Invalid date format. Must be DDMMYYYY.'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                }
            });
        }

        // Get current date in IST (UTC+5:30)
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(now.getTime() + istOffset);
        
        const currentDay = String(istDate.getUTCDate()).padStart(2, '0');
        const currentMonth = String(istDate.getUTCMonth() + 1).padStart(2, '0');
        const currentYear = istDate.getUTCFullYear();
        const currentDateStr = `${currentDay}${currentMonth}${currentYear}`;

        // Check if the input date is in the future (not allowed)
        const inputDay = parseInt(dateInput.substring(0, 2));
        const inputMonth = parseInt(dateInput.substring(2, 4));
        const inputYear = parseInt(dateInput.substring(4, 8));
        
        const inputDate = new Date(Date.UTC(inputYear, inputMonth - 1, inputDay));
        const currentDateOnly = new Date(Date.UTC(currentYear, istDate.getUTCMonth(), istDate.getUTCDate()));
        
        if (inputDate > currentDateOnly) {
            return new Response(JSON.stringify({
                success: false,
                valid: false,
                message: 'Cannot verify codes for future dates.'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                }
            });
        }

        // Get secret key from environment
        const secretKey = context.env.SIGNATURE_KEY || '';
        
        if (!secretKey) {
            return new Response(JSON.stringify({
                success: false,
                valid: false,
                message: 'Server configuration error. Secret key not set.'
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                }
            });
        }

        // Create the combined string: DDMMYYYYXXXX + secretKey
        const combinedString = `${dateInput}${pin}${secretKey}`;
        
        // Calculate SHA-256 hash
        const encoder = new TextEncoder();
        const data = encoder.encode(combinedString);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Get last 4 characters and convert to digits
        const last4 = hashHex.slice(-4);
        const expectedCode = hexToDigits(last4);

        const isValid = code === expectedCode;

        const formattedInputDate = `${dateInput.substring(0, 2)}/${dateInput.substring(2, 4)}/${dateInput.substring(4, 8)}`;

        return new Response(JSON.stringify({
            success: true,
            valid: isValid,
            message: isValid ? 'Signature code is valid!' : 'Signature code is invalid.',
            verifiedDate: formattedInputDate,
            isCurrentDate: dateInput === currentDateStr
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            valid: false,
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

/**
 * Convert hex characters to digits
 * a=1, b=2, c=3, d=4, e=5, f=6, 0-9 stay same
 * Example: d7e6 -> 4756
 */
function hexToDigits(hex) {
    const hexMap = {
        'a': '1', 'b': '2', 'c': '3', 'd': '4', 'e': '5', 'f': '6',
        '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
        '5': '5', '6': '6', '7': '7', '8': '8', '9': '9'
    };
    return hex.split('').map(c => hexMap[c.toLowerCase()]).join('');
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
