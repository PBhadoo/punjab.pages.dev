document.getElementById('yr').textContent=new Date().getFullYear();
let SD=null,BD=[];
function toast(m){const t=document.getElementById('toast');document.getElementById('toastMsg').textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3000)}
function flag(c){if(!c||c.length!==2)return'🏳️';return String.fromCodePoint(...[...c.toUpperCase()].map(x=>0x1F1E6+x.charCodeAt(0)-65))}
function swMode(m){document.querySelectorAll('.mode-tab').forEach((t,i)=>t.classList.toggle('active',(i===0&&m==='single')||(i===1&&m==='bulk')));document.getElementById('singleMode').classList.toggle('active',m==='single');document.getElementById('bulkMode').classList.toggle('active',m==='bulk')}
function validIP(ip){ip=ip.trim();if(/^(\d{1,3}\.){3}\d{1,3}$/.test(ip))return ip.split('.').every(n=>parseInt(n)>=0&&parseInt(n)<=255);return/^[0-9a-fA-F:]+$/.test(ip)&&ip.includes(':')}
function fmtOff(s){var h=Math.floor(Math.abs(s)/3600),m=Math.floor((Math.abs(s)%3600)/60);return'UTC'+(s>=0?'+':'-')+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')}

// VPN/Proxy ASN database (inline for client-side fallback - top 50)
var VPN_ASNS={'13335':1,'198093':1,'212238':1,'209103':1,'9009':1,'55286':1,'22181':1,'60068':1,'62744':1,'54600':1,'394711':1,'63023':1,'53667':1,'36352':1,'40676':1,'8100':1,'33438':1,'204428':1,'396356':1,'210644':1,'44477':1,'200651':1,'51396':1,'62240':1,'39351':1,'213230':1,'56630':1,'41378':1,'25820':1,'35913':1,'62904':1,'3214':1,'46844':1,'19624':1,'57858':1,'63473':1,'60404':1,'203515':1,'206264':1,'209854':1,'46562':1,'397423':1,'32489':1,'60631':1,'41665':1,'201106':1,'399486':1,'63128':1,'206238':1,'34549':1,'142002':1,'398493':1};
var VPN_NAMES=/mullvad|nordvpn|nord.security|expressvpn|surfshark|protonvpn|proton.ag|cyberghost|private.internet.access|ipvanish|hotspot.shield|tunnelbear|windscribe|hide\.me|purevpn|vypr|strongvpn|astrill|torguard|airvpn|ivpn|mozilla.vpn|psiphon|ultrasurf|cloudflare.warp|warp|1\.1\.1\.1|kaspersky|bitdefender.vpn|avast.*vpn|adguard/i;
var DC_NAMES=/amazon|aws|google cloud|gcp|microsoft azure|digitalocean|linode|akamai|vultr|ovh|hetzner|oracle cloud|alibaba|tencent|scaleway|contabo|ionos|rackspace|leaseweb|choopa|equinix/i;

function ipType(d){
    // Server-side VPN match from Radar+DB takes priority
    if(d.vpnProvider)return'VPN';
    if(d.isTor)return'Tor Exit Node';
    if(d.isVPN)return'VPN';
    // Client-side ASN check against VPN database
    var asnNum=d.asn?String(d.asn).replace(/^AS/,'').split(' ')[0]:null;
    if(asnNum&&VPN_ASNS[asnNum]){d.isVPN=true;return'VPN';}
    // Check ISP/Org names
    var o=(d.org||'')+'|'+(d.isp||'')+'|'+(d.asnName||'');
    if(VPN_NAMES.test(o)){d.isVPN=true;return'VPN';}
    if(d.isProxy&&d.isHosting)return'Hosting/Proxy';
    if(d.isProxy)return'Proxy';
    if(d.isRelay)return'Relay';
    if(d.isHosting)return'Datacenter/Cloud';
    if(d.isMobile)return'Mobile/Cellular';
    if(DC_NAMES.test(o))return'Cloud Provider';
    var ol=o.toLowerCase();
    if(/university|college|\.edu|academic/.test(ol))return'Education';
    if(/government|govt|\.gov/.test(ol))return'Government';
    return'Residential';
}
function calcRisk(d){var s=0;if(d.isTor)s+=40;if(d.isVPN)s+=25;if(d.isProxy)s+=30;if(d.isHosting)s+=15;if(d.isRelay)s+=10;return Math.min(s,100)}
