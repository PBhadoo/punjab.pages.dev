document.getElementById('yr').textContent=new Date().getFullYear();
let SD=null,BD=[];
function toast(m){const t=document.getElementById('toast');document.getElementById('toastMsg').textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3000)}
function flag(c){if(!c||c.length!==2)return'🏳️';return String.fromCodePoint(...[...c.toUpperCase()].map(x=>0x1F1E6+x.charCodeAt(0)-65))}
function swMode(m){document.querySelectorAll('.mode-tab').forEach((t,i)=>t.classList.toggle('active',(i===0&&m==='single')||(i===1&&m==='bulk')));document.getElementById('singleMode').classList.toggle('active',m==='single');document.getElementById('bulkMode').classList.toggle('active',m==='bulk')}
function validIP(ip){ip=ip.trim();if(/^(\d{1,3}\.){3}\d{1,3}$/.test(ip))return ip.split('.').every(n=>parseInt(n)>=0&&parseInt(n)<=255);return/^[0-9a-fA-F:]+$/.test(ip)&&ip.includes(':')}
function fmtOff(s){const h=Math.floor(Math.abs(s)/3600),m=Math.floor((Math.abs(s)%3600)/60);return'UTC'+(s>=0?'+':'-')+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')}
function ipType(d){if(d.isTor)return'Tor Exit Node';if(d.isVPN)return'VPN';if(d.isProxy&&d.isHosting)return'Hosting/Proxy';if(d.isProxy)return'Proxy';if(d.isRelay)return'Relay';if(d.isHosting)return'Datacenter/Cloud';if(d.isMobile)return'Mobile/Cellular';var o=((d.org||'')+' '+(d.isp||'')).toLowerCase();if(/amazon|aws|google cloud|microsoft azure|digitalocean|linode|vultr|ovh|hetzner|oracle|alibaba|cloudflare/.test(o))return'Cloud Provider';if(/university|college|\.edu|academic/.test(o))return'Education';if(/government|govt|\.gov/.test(o))return'Government';return'Residential'}
function calcRisk(d){var s=0;if(d.isTor)s+=40;if(d.isVPN)s+=25;if(d.isProxy)s+=30;if(d.isHosting)s+=15;if(d.isRelay)s+=10;return Math.min(s,100)}
function bc(t){return{'Residential':'b-res','VPN':'b-vpn','Proxy':'b-prx','Hosting/Proxy':'b-prx','Tor Exit Node':'b-tor','Datacenter/Cloud':'b-dc','Cloud Provider':'b-cld','Mobile/Cellular':'b-mob','Relay':'b-vpn','Education':'b-edu','Government':'b-gov'}[t]||'b-unk'}
function rcls(s){return s<=10?'rl':s<=30?'rm':s<=60?'rh':'rc'}
function rlbl(s){return s<=10?'Low':s<=30?'Medium':s<=60?'High':'Critical'}
function rcol(s){return s<=10?'#28a745':s<=30?'#ffc107':s<=60?'#fd7e14':'#dc3545'}
function bi(v){return v?'<span style="color:#dc3545;font-weight:700">⚠ Yes</span>':'<span style="color:#28a745">✓ No</span>'}
function ir(l,v){return'<div class="irow"><span class="il">'+l+'</span><span class="iv">'+v+'</span></div>'}

function merge(ip,R){
    var p=R.ipapi||{},s=R.ipwho||{},t=R.ipapico||{},cf=R.cfRadarASN||{};
    if(R.err&&!p.query&&!s.ip&&!t.ip)return{ip:ip,error:R.err||'All lookups failed'};
    var sc=s.connection||{},ss=s.security||{},st=s.timezone||{},su=s.currency||{};
    var m={ip:ip,
        continent:p.continent||s.continent||'-',continentCode:p.continentCode||s.continent_code||t.continent_code||'-',
        country:p.country||s.country||t.country_name||'-',countryCode:p.countryCode||s.country_code||t.country_code||'-',
        region:p.regionName||s.region||t.region||'-',regionCode:p.region||s.region_code||t.region_code||'-',
        city:p.city||s.city||t.city||'-',district:p.district||'-',zip:p.zip||s.postal||t.postal||'-',
        latitude:p.lat||s.latitude||t.latitude||'-',longitude:p.lon||s.longitude||t.longitude||'-',
        timezone:p.timezone||st.id||t.timezone||'-',
        utcOffset:p.offset!==undefined?fmtOff(p.offset):st.utc||t.utc_offset||'-',
        currency:p.currency||su.code||t.currency||'-',currencyName:su.name||t.currency_name||'-',
        callingCode:s.calling_code||t.country_calling_code||'-',languages:t.languages||'-',
        countryArea:t.country_area?Number(t.country_area).toLocaleString()+' km²':'-',
        countryPop:t.country_population?Number(t.country_population).toLocaleString():'-',
        isp:p.isp||sc.isp||t.org||'-',org:p.org||sc.org||t.org||'-',
        asn:p.as||(sc.asn?'AS'+sc.asn:'')||t.asn||'-',asnName:p.asname||sc.org||'-',
        reverse:p.reverse||'-',connType:sc.type||'-',domain:sc.domain||'-',network:t.network||'-',
        isMobile:p.mobile||false,isProxy:p.proxy||ss.proxy||false,isHosting:p.hosting||false,
        isVPN:ss.vpn||false,isTor:ss.tor||false,isRelay:ss.relay||false,
        ipVersion:s.type||(ip.indexOf(':')>=0?'IPv6':'IPv4')
    };
    // Cloudflare Radar ASN enrichment
    if(cf&&cf.asn){m.cfAsnName=cf.asn.name||'-';m.cfAsnCountry=cf.asn.countryCode||'-';m.cfAsnType=cf.asn.orgType||'-';}
    m.ipType=ipType(m);m.riskScore=calcRisk(m);return m;
}

async function fetchIP(ip){
    try{var r=await fetch('/api/ip/'+encodeURIComponent(ip));var j=await r.json();return merge(ip,j);}
    catch(e){return await fetchDirect(ip);}
}
async function fetchDirect(ip){
    var R={};
    await Promise.allSettled([
        fetch('http://ip-api.com/json/'+ip+'?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query').then(function(r){return r.json()}).then(function(d){if(d.status==='success')R.ipapi=d;else R.err=d.message}).catch(function(e){R.err=e.message}),
        fetch('https://ipwho.is/'+ip).then(function(r){return r.json()}).then(function(d){if(d.success!==false)R.ipwho=d}).catch(function(){}),
        fetch('https://ipapi.co/'+ip+'/json/').then(function(r){return r.json()}).then(function(d){if(!d.error)R.ipapico=d}).catch(function(){})
    ]);
    return merge(ip,R);
}
async function fetchLight(ip){
    try{var r=await fetch('/api/ip/'+encodeURIComponent(ip));var j=await r.json();return merge(ip,j);}
    catch(e){
        try{var d=await(await fetch('http://ip-api.com/json/'+ip+'?fields=status,message,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,reverse,mobile,proxy,hosting,query')).json();
        if(d.status==='success'){var m={ip:ip,country:d.country||'-',countryCode:d.countryCode||'-',region:d.regionName||'-',city:d.city||'-',zip:d.zip||'-',latitude:d.lat||'-',longitude:d.lon||'-',timezone:d.timezone||'-',isp:d.isp||'-',org:d.org||'-',asn:d.as||'-',asnName:d.asname||'-',reverse:d.reverse||'-',isMobile:d.mobile||false,isProxy:d.proxy||false,isHosting:d.hosting||false,isVPN:false,isTor:false,isRelay:false,ipVersion:ip.indexOf(':')>=0?'IPv6':'IPv4'};m.ipType=ipType(m);m.riskScore=calcRisk(m);return m;}
        return{ip:ip,error:d.message||'Failed'};}catch(e2){return{ip:ip,error:e2.message};}
    }
}

// ===== RENDER SINGLE =====
function renderSingle(d){
    var c=document.getElementById('sOut');document.getElementById('sRes').style.display='block';
    if(d.error){c.innerHTML='<div class="irc"><p style="color:#dc3545;font-size:1.1rem"><i class="fas fa-exclamation-triangle"></i> '+d.error+'</p><p style="color:var(--text-secondary)">IP: '+d.ip+'</p></div>';document.getElementById('sAct').style.display='none';return;}
    document.getElementById('sAct').style.display='flex';
    var f=flag(d.countryCode),rc=rcls(d.riskScore),rl=rlbl(d.riskScore),hc=d.latitude!=='-'&&d.longitude!=='-';
    var h='<div class="irc"><div class="irh"><h3><span style="font-size:1.5rem">'+f+'</span> '+d.ip+' — '+d.country+'</h3><span class="badge '+bc(d.ipType)+'">'+d.ipType+'</span></div>';
    h+='<div style="margin-bottom:18px"><div style="font-size:.85rem;color:var(--text-secondary);margin-bottom:4px"><i class="fas fa-shield-alt"></i> Risk Score</div><div class="riskm"><div class="riskb"><div class="riskf '+rc+'" style="width:'+Math.max(d.riskScore,5)+'%"></div></div><span class="rlab" style="color:'+rcol(d.riskScore)+'">'+d.riskScore+'/100 '+rl+'</span></div></div>';
    h+='<div class="igrid">';
    h+='<div class="isec"><h4><i class="fas fa-map-marker-alt"></i> Location</h4>'+ir('Country',f+' '+d.country+' ('+d.countryCode+')')+ir('Continent',d.continent)+ir('Region',d.region+(d.regionCode!=='-'?' ('+d.regionCode+')':''))+ir('City',d.city)+(d.district!=='-'?ir('District',d.district):'')+ir('ZIP/Postal',d.zip)+ir('Latitude',d.latitude)+ir('Longitude',d.longitude)+ir('Timezone',d.timezone)+ir('UTC Offset',d.utcOffset)+'</div>';
    h+='<div class="isec"><h4><i class="fas fa-server"></i> Network</h4>'+ir('ISP',d.isp)+ir('Organization',d.org)+ir('ASN',d.asn)+ir('ASN Name',d.asnName)+ir('Reverse DNS',d.reverse)+ir('Connection Type',d.connType)+ir('Domain',d.domain)+ir('Network/CIDR',d.network)+ir('IP Version',d.ipVersion)+(d.cfAsnName?ir('CF Radar ASN',d.cfAsnName):'')+(d.cfAsnType?ir('CF ASN Type',d.cfAsnType):'')+'</div>';
    h+='<div class="isec"><h4><i class="fas fa-shield-alt"></i> Security / Type</h4>'+ir('IP Type','<span class="badge '+bc(d.ipType)+'" style="font-size:.7rem">'+d.ipType+'</span>')+ir('VPN',bi(d.isVPN))+ir('Proxy',bi(d.isProxy))+ir('Tor Exit Node',bi(d.isTor))+ir('Relay',bi(d.isRelay))+ir('Datacenter/Hosting',bi(d.isHosting))+ir('Mobile Network',bi(d.isMobile))+ir('Risk Score','<span style="color:'+rcol(d.riskScore)+'">'+d.riskScore+'/100 ('+rl+')</span>')+'</div>';
    h+='<div class="isec"><h4><i class="fas fa-flag"></i> Country Info</h4>'+ir('Currency',d.currency+(d.currencyName!=='-'?' ('+d.currencyName+')':''))+ir('Calling Code',d.callingCode)+ir('Languages',d.languages)+ir('Country Area',d.countryArea)+ir('Population',d.countryPop)+'</div>';
    h+='</div>';
    if(hc)h+='<div class="mapc"><iframe src="https://www.openstreetmap.org/export/embed.html?bbox='+(d.longitude-0.05)+','+(d.latitude-0.03)+','+(+d.longitude+0.05)+','+(+d.latitude+0.03)+'&layer=mapnik&marker='+d.latitude+','+d.longitude+'" loading="lazy"></iframe></div>';
    h+='<div style="margin-top:14px;padding:12px;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);border-radius:8px;text-align:center;font-size:.82rem;color:var(--text-secondary)"><i class="fas fa-database"></i> Data from ip-api.com, ipwho.is, ipapi.co'+(d.cfAsnName?' + Cloudflare Radar':'')+' | '+new Date().toLocaleString()+'</div></div>';
    c.innerHTML=h;document.getElementById('sRes').scrollIntoView({behavior:'smooth'});
}

// ===== SINGLE LOOKUP =====
async function doLookup(){
    var ip=document.getElementById('ipIn').value.trim();
    if(!ip){toast('Enter an IP address');return;}if(!validIP(ip)){toast('Enter a valid IP');return;}
    document.getElementById('lov').classList.remove('hid');document.getElementById('lovTxt').textContent='Looking up '+ip+'...';
    document.getElementById('lookBtn').disabled=true;
    try{SD=await fetchIP(ip);renderSingle(SD);}catch(e){document.getElementById('sOut').innerHTML='<div class="irc"><p style="color:#dc3545">Error: '+e.message+'</p></div>';document.getElementById('sRes').style.display='block';}
    document.getElementById('lov').classList.add('hid');document.getElementById('lookBtn').disabled=false;
}
async function doMyIP(){
    document.getElementById('lov').classList.remove('hid');document.getElementById('lovTxt').textContent='Detecting your IP...';
    try{var r=await fetch('https://api.ipify.org?format=json');var d=await r.json();document.getElementById('ipIn').value=d.ip;}catch(e){try{var r2=await fetch('https://ipwho.is/');var d2=await r2.json();document.getElementById('ipIn').value=d2.ip;}catch(e2){document.getElementById('lov').classList.add('hid');toast('Could not detect IP');return;}}
    document.getElementById('lov').classList.add('hid');await doLookup();
}
document.getElementById('ipIn').addEventListener('keypress',function(e){if(e.key==='Enter')doLookup()});

// ===== COPY / EXCEL / PDF SINGLE =====
function cpSingle(){if(!SD||SD.error){toast('No result');return;}
    var t='IP Lookup Report\n================\n'+new Date().toLocaleString()+'\n\nIP: '+SD.ip+'\nVersion: '+SD.ipVersion+'\nType: '+SD.ipType+'\nRisk: '+SD.riskScore+'/100 ('+rlbl(SD.riskScore)+')\n\n--- Location ---\nCountry: '+SD.country+' ('+SD.countryCode+')\nContinent: '+SD.continent+'\nRegion: '+SD.region+'\nCity: '+SD.city+'\nZIP: '+SD.zip+'\nCoords: '+SD.latitude+', '+SD.longitude+'\nTimezone: '+SD.timezone+' ('+SD.utcOffset+')\n\n--- Network ---\nISP: '+SD.isp+'\nOrg: '+SD.org+'\nASN: '+SD.asn+'\nASN Name: '+SD.asnName+'\nReverse: '+SD.reverse+'\nConn: '+SD.connType+'\nDomain: '+SD.domain+'\nNetwork: '+SD.network+'\n\n--- Security ---\nVPN: '+(SD.isVPN?'Yes':'No')+'\nProxy: '+(SD.isProxy?'Yes':'No')+'\nTor: '+(SD.isTor?'Yes':'No')+'\nRelay: '+(SD.isRelay?'Yes':'No')+'\nHosting: '+(SD.isHosting?'Yes':'No')+'\nMobile: '+(SD.isMobile?'Yes':'No')+'\n\nPunjab Investigation Tools\npunjab.pages.dev';
    navigator.clipboard.writeText(t);toast('Copied');}
function cpExcel(){if(!SD||SD.error){toast('No result');return;}
    var h=['IP','Country','Code','Region','City','ZIP','Lat','Lon','TZ','ISP','Org','ASN','Type','VPN','Proxy','Tor','Hosting','Mobile','Risk'];
    var v=[SD.ip,SD.country,SD.countryCode,SD.region,SD.city,SD.zip,SD.latitude,SD.longitude,SD.timezone,SD.isp,SD.org,SD.asn,SD.ipType,SD.isVPN,SD.isProxy,SD.isTor,SD.isHosting,SD.isMobile,SD.riskScore];
    navigator.clipboard.writeText(h.join('\t')+'\n'+v.join('\t'));toast('Copied for Excel');}
function pdfSingle(){if(!SD||SD.error){toast('No result');return;}
    var d=SD,doc=new jspdf.jsPDF();
    doc.setFillColor(26,26,46);doc.rect(0,0,210,35,'F');doc.setTextColor(255,255,255);doc.setFontSize(18);doc.text('IP Address Lookup Report',15,20);doc.setFontSize(9);doc.text('Punjab Investigation Tools | '+new Date().toLocaleString(),15,28);
    doc.setTextColor(0,0,0);var y=45;
    function aR(l,v){if(y>275){doc.addPage();y=20;}doc.setFont(undefined,'bold');doc.setFontSize(10);doc.text(l+':',15,y);doc.setFont(undefined,'normal');doc.text(String(v).substring(0,80),70,y);y+=7;}
    function aS(t){if(y>265){doc.addPage();y=20;}y+=3;doc.setFillColor(99,102,241);doc.rect(10,y-4,190,7,'F');doc.setTextColor(255,255,255);doc.setFontSize(10);doc.setFont(undefined,'bold');doc.text(t,15,y+1);doc.setTextColor(0,0,0);doc.setFont(undefined,'normal');y+=10;}
    aS('Overview');aR('IP',d.ip);aR('Version',d.ipVersion);aR('Type',d.ipType);aR('Risk',d.riskScore+'/100 ('+rlbl(d.riskScore)+')');
    aS('Location');aR('Country',d.country+' ('+d.countryCode+')');aR('Continent',d.continent);aR('Region',d.region);aR('City',d.city);aR('ZIP',d.zip);aR('Coords',d.latitude+', '+d.longitude);aR('Timezone',d.timezone+' ('+d.utcOffset+')');
    aS('Network');aR('ISP',d.isp);aR('Org',d.org);aR('ASN',d.asn);aR('ASN Name',d.asnName);aR('Reverse',d.reverse);aR('Conn Type',d.connType);aR('Domain',d.domain);aR('Network',d.network);
    aS('Security');aR('VPN',d.isVPN?'Yes':'No');aR('Proxy',d.isProxy?'Yes':'No');aR('Tor',d.isTor?'Yes':'No');aR('Hosting/DC',d.isHosting?'Yes':'No');aR('Mobile',d.isMobile?'Yes':'No');
    aS('Country');aR('Currency',d.currency);aR('Calling',d.callingCode);aR('Languages',d.languages);
    var pg=doc.internal.getNumberOfPages();for(var i=1;i<=pg;i++){doc.setPage(i);doc.setTextColor(128,128,128);doc.setFontSize(8);doc.text('Page '+i+'/'+pg+' | Punjab Investigation Tools | punjab.pages.dev',15,287);}
    doc.save('IP_'+d.ip.replace(/[:.]/g,'_')+'.pdf');toast('PDF downloaded');}

// ===== BULK LOOKUP =====
async function doBulk(){
    var raw=document.getElementById('bulkIn').value,lines=raw.split(/[\n\r]+/).map(function(l){return l.trim()}).filter(Boolean);
    var ips=[...new Set(lines.filter(validIP))];
    if(!ips.length){toast('No valid IPs found');return;}if(ips.length>100){ips=ips.slice(0,100);toast('Limited to 100');}
    BD=[];document.getElementById('bRes').style.display='block';document.getElementById('bLoad').classList.remove('hid');document.getElementById('bExp').style.display='none';
    document.getElementById('bulkBtn').disabled=true;document.getElementById('bulkBtn').innerHTML='<i class="fas fa-spinner fa-spin"></i> Processing...';
    var total=ips.length,done=0,BATCH=5;
    var th='<div class="btw"><table class="bt"><thead><tr>';
    ['#','IP','Country','Region','City','ISP','Org','ASN','Type','VPN','Proxy','Tor','Hosting','Mobile','Risk','Reverse','TZ'].forEach(function(h){th+='<th>'+h+'</th>'});
    th+='</tr></thead><tbody id="bTbody"></tbody></table></div>';
    document.getElementById('bTbl').innerHTML=th;var tb=document.getElementById('bTbody');
    for(var i=0;i<total;i+=BATCH){
        var batch=ips.slice(i,i+BATCH);document.getElementById('bStat').textContent='Processing '+(done+1)+'-'+Math.min(done+batch.length,total)+' of '+total;document.getElementById('bProg').style.width=Math.round(done/total*100)+'%';
        var results=await Promise.all(batch.map(fetchLight));
        results.forEach(function(d,j){var idx=i+j+1;d.index=idx;BD.push(d);var tr=document.createElement('tr');
            if(d.error){tr.className='err';tr.innerHTML='<td>'+idx+'</td><td>'+d.ip+'</td><td colspan="15" style="color:#dc3545">'+d.error+'</td>';}
            else{var f=flag(d.countryCode);tr.innerHTML='<td>'+idx+'</td><td style="font-family:JetBrains Mono,monospace;font-size:.8rem">'+d.ip+'</td><td>'+f+' '+d.country+'</td><td>'+d.region+'</td><td>'+d.city+'</td><td>'+d.isp+'</td><td>'+d.org+'</td><td>'+d.asn+'</td><td><span class="badge '+bc(d.ipType)+'" style="font-size:.65rem">'+d.ipType+'</span></td><td>'+(d.isVPN?'⚠':'✓')+'</td><td>'+(d.isProxy?'⚠':'✓')+'</td><td>'+(d.isTor?'⚠':'✓')+'</td><td>'+(d.isHosting?'⚠':'✓')+'</td><td>'+(d.isMobile?'📱':'-')+'</td><td style="color:'+rcol(d.riskScore)+'">'+d.riskScore+'</td><td>'+d.reverse+'</td><td>'+d.timezone+'</td>';}
            tb.appendChild(tr);});
        done+=batch.length;document.getElementById('bSum').textContent=done+'/'+total+' processed';
        if(i+BATCH<total)await new Promise(function(r){setTimeout(r,1200)});
    }
    document.getElementById('bProg').style.width='100%';document.getElementById('bLoad').classList.add('hid');document.getElementById('bExp').style.display='flex';
    document.getElementById('bulkBtn').disabled=false;document.getElementById('bulkBtn').innerHTML='<i class="fas fa-rocket"></i> Lookup All';
    var ok=BD.filter(function(d){return!d.error}).length;document.getElementById('bSum').textContent=total+' IPs | '+ok+' OK | '+(total-ok)+' failed';toast('Bulk complete');
}

// ===== BULK EXPORT =====
function cpBulkExcel(){if(!BD.length){toast('No results');return;}
    var h=['#','IP','Country','Code','Region','City','ISP','Org','ASN','Type','VPN','Proxy','Tor','Hosting','Mobile','Risk','Reverse','TZ'];var tsv=h.join('\t')+'\n';
    BD.forEach(function(d){if(d.error)tsv+=d.index+'\t'+d.ip+'\tERROR\n';else tsv+=[d.index,d.ip,d.country,d.countryCode,d.region,d.city,d.isp,d.org,d.asn,d.ipType,d.isVPN,d.isProxy,d.isTor,d.isHosting,d.isMobile,d.riskScore,d.reverse,d.timezone].join('\t')+'\n';});
    navigator.clipboard.writeText(tsv);toast('Copied for Excel');}

function pdfBulkSingle(){if(!BD.length){toast('No results');return;}
    var doc=new jspdf.jsPDF('landscape');doc.setFillColor(26,26,46);doc.rect(0,0,297,30,'F');doc.setTextColor(255,255,255);doc.setFontSize(16);doc.text('Bulk IP Lookup Report',15,15);doc.setFontSize(9);doc.text(new Date().toLocaleString()+' | '+BD.length+' IPs | Punjab Investigation Tools',15,23);
    var cols=['#','IP','Country','Region','City','ISP','ASN','Type','VPN','Prx','Tor','Host','Risk','Reverse','TZ'];
    var rows=BD.map(function(d){return d.error?[d.index,d.ip,'ERR','','','','','','','','','','','',d.error]:[d.index,d.ip,d.country,d.region,d.city,d.isp,d.asn,d.ipType,d.isVPN?'Y':'N',d.isProxy?'Y':'N',d.isTor?'Y':'N',d.isHosting?'Y':'N',d.riskScore,d.reverse,d.timezone]});
    doc.autoTable({head:[cols],body:rows,startY:35,theme:'grid',styles:{fontSize:7,cellPadding:2},headStyles:{fillColor:[99,102,241],textColor:255,fontStyle:'bold',fontSize:7},alternateRowStyles:{fillColor:[245,245,255]},margin:{left:10,right:10}});
    var pg=doc.internal.getNumberOfPages();for(var i=1;i<=pg;i++){doc.setPage(i);doc.setTextColor(128,128,128);doc.setFontSize(7);doc.text('Page '+i+'/'+pg+' | Punjab Investigation Tools',15,200);}
    doc.save('Bulk_IP_Lookup_'+new Date().toISOString().slice(0,10)+'.pdf');toast('PDF downloaded');}

function pdfBulkMulti(){var valid=BD.filter(function(d){return!d.error});if(!valid.length){toast('No results');return;}
    valid.forEach(function(d){
        var doc=new jspdf.jsPDF();doc.setFillColor(26,26,46);doc.rect(0,0,210,35,'F');doc.setTextColor(255,255,255);doc.setFontSize(18);doc.text('IP: '+d.ip,15,20);doc.setFontSize(9);doc.text('Punjab Investigation Tools | '+new Date().toLocaleString(),15,28);
        doc.setTextColor(0,0,0);var y=45;
        function aR(l,v){if(y>275){doc.addPage();y=20;}doc.setFont(undefined,'bold');doc.setFontSize(10);doc.text(l+':',15,y);doc.setFont(undefined,'normal');doc.text(String(v).substring(0,80),70,y);y+=7;}
        function aS(t){if(y>265){doc.addPage();y=20;}y+=3;doc.setFillColor(99,102,241);doc.rect(10,y-4,190,7,'F');doc.setTextColor(255,255,255);doc.setFontSize(10);doc.setFont(undefined,'bold');doc.text(t,15,y+1);doc.setTextColor(0,0,0);doc.setFont(undefined,'normal');y+=10;}
        aS('Overview');aR('IP',d.ip);aR('Type',d.ipType);aR('Risk',d.riskScore+'/100');
        aS('Location');aR('Country',d.country);aR('Region',d.region);aR('City',d.city);aR('Coords',(d.latitude||'-')+', '+(d.longitude||'-'));aR('Timezone',d.timezone);
        aS('Network');aR('ISP',d.isp);aR('Org',d.org);aR('ASN',d.asn);aR('Reverse',d.reverse);
        aS('Security');aR('VPN',d.isVPN?'Yes':'No');aR('Proxy',d.isProxy?'Yes':'No');aR('Tor',d.isTor?'Yes':'No');aR('Hosting',d.isHosting?'Yes':'No');aR('Mobile',d.isMobile?'Yes':'No');
        doc.setTextColor(128,128,128);doc.setFontSize(8);doc.text('Punjab Investigation Tools | punjab.pages.dev',15,287);
        doc.save('IP_'+d.ip.replace(/[:.]/g,'_')+'.pdf');
    });toast(valid.length+' PDFs downloaded');}
