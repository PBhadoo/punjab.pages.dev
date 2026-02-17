// Cloudflare Pages Function - Proxy for Google Input Tools API
// Handles Punjabi transliteration (English to Gurmukhi)

export async function onRequestGet(context) {
    const url = new URL(context.request.url);
    const text = url.searchParams.get('text');

    if (!text) {
        return new Response(JSON.stringify({ error: 'Missing "text" parameter' }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }

    const num = url.searchParams.get('num') || '5';

    try {
        const googleUrl = `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=pa-t-i0-und&num=${num}&cp=0&cs=1&ie=utf-8&oe=utf-8`;

        const response = await fetch(googleUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
            },
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=86400',
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch transliteration', details: error.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}
