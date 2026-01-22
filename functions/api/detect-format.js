/**
 * Cloudflare Pages Function: File Format Detector Proxy
 * Fetches first 1KB of a file from URL to bypass CORS restrictions
 */

export async function onRequestPost(context) {
    try {
        const { url } = await context.request.json();
        
        if (!url) {
            return new Response(JSON.stringify({ error: 'URL is required' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        
        // Validate URL
        let targetUrl;
        try {
            targetUrl = new URL(url);
        } catch (e) {
            return new Response(JSON.stringify({ error: 'Invalid URL' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        
        // Fetch with Range header for first 1KB only
        const response = await fetch(targetUrl.toString(), {
            headers: {
                'Range': 'bytes=0-1023',
                'User-Agent': 'Punjab-Investigation-Tools/1.0'
            }
        });
        
        if (!response.ok) {
            return new Response(JSON.stringify({ 
                error: `Failed to fetch: ${response.status} ${response.statusText}` 
            }), {
                status: response.status,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
        
        // Read response with strict 1KB limit
        const reader = response.body.getReader();
        const chunks = [];
        let totalBytes = 0;
        const MAX_BYTES = 1024;
        
        try {
            while (totalBytes < MAX_BYTES) {
                const { done, value } = await reader.read();
                
                if (done) break;
                
                // Calculate how many bytes we can still accept
                const bytesToTake = Math.min(value.length, MAX_BYTES - totalBytes);
                
                if (bytesToTake > 0) {
                    chunks.push(Array.from(value.slice(0, bytesToTake)));
                    totalBytes += bytesToTake;
                }
                
                // Stop if we've reached the limit
                if (totalBytes >= MAX_BYTES) {
                    reader.cancel();
                    break;
                }
            }
        } catch (e) {
            // Reader might already be closed, that's ok
            console.log('Reader closed:', e.message);
        }
        
        // Combine chunks into single array
        const bytes = chunks.flat();
        
        return new Response(JSON.stringify({ 
            bytes,
            length: bytes.length,
            url: targetUrl.toString()
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=300'
            }
        });
        
    } catch (error) {
        console.error('Proxy error:', error);
        return new Response(JSON.stringify({ 
            error: error.message || 'Internal server error' 
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

// Handle CORS preflight
export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400'
        }
    });
}
