// Bulk lookup
async function doBulk(){
var raw=document.getElementById('bulkIn').value;
var lines=raw.split(/[\n\r]+/).map(function(l){return l.trim()}).filter(Boolean);
var ips=[...new Set(lines.filter(validIP))];
if(!ips.length){toast('No valid IPs');return;}
if(ips.length>100){ips=ips.slice(0,100);toast('Limited to 100');}
BD=[];
document.getElementById('bRes').style.display='block';
document.getElementById('bLoad').classList.remove('hid');
document.getElementById('bExp').style.display='none';
document.getElementById('bulkBtn').disabled=true;
document.getElementById('bulkBtn').innerHTML='<i class="fas fa-spinner fa-spin"></i> Processing...';
var total=ips.length,done=0,BATCH=5;
var th='<div class="btw"><table class="bt"><thead><tr>';
var hds=['#','IP','Country','Region','City','ISP','Org','ASN','Type','VPN','Proxy','Tor','Hosting','Mobile','Risk','Reverse','TZ'];
for(var hi=0;hi<hds.length;hi++)th+='<th>'+hds[hi]+'</th>';
th+='</tr></thead><tbody id="bTbody"></tbody></table></div>';
document.getElementById('bTbl').innerHTML=th;
var tb=document.getElementById('bTbody');
for(var i=0;i<total;i+=BATCH){
  var batch=ips.slice(i,i+BATCH);
  document.getElementById('bStat').textContent='Processing '+(done+1)+'-'+Math.min(done+batch.length,total)+' of '+total;
  document.getElementById('bProg').style.width=Math.round(done/total*100)+'%';
  var results=await Promise.all(batch.map(fetchLight));
  for(var j=0;j<results.length;j++){
    var d=results[j];var idx=i+j+1;d.index=idx;BD.push(d);
    var tr=document.createElement('tr');
    if(d.error){tr.className='err';tr.innerHTML='<td>'+idx+'</td><td>'+d.ip+'</td><td colspan="15" style="color:#dc3545">'+d.error+'</td>';}
    else{var f=flag(d.countryCode);tr.innerHTML='<td>'+idx+'</td><td style="font-family:monospace;font-size:.8rem">'+d.ip+'</td><td>'+f+' '+d.country+'</td><td>'+d.region+'</td><td>'+d.city+'</td><td>'+d.isp+'</td><td>'+d.org+'</td><td>'+d.asn+'</td><td><span class="badge '+bc(d.ipType)+'" style="font-size:.65rem">'+d.ipType+'</span></td><td>'+(d.isVPN?'⚠':'✓')+'</td><td>'+(d.isProxy?'⚠':'✓')+'</td><td>'+(d.isTor?'⚠':'✓')+'</td><td>'+(d.isHosting?'⚠':'✓')+'</td><td>'+(d.isMobile?'📱':'-')+'</td><td style="color:'+rcol(d.riskScore)+'">'+d.riskScore+'</td><td>'+d.reverse+'</td><td>'+d.timezone+'</td>';}
    tb.appendChild(tr);
  }
  done+=batch.length;
  document.getElementById('bSum').textContent=done+'/'+total;
  if(i+BATCH<total)await new Promise(function(r){setTimeout(r,1200)});
}
document.getElementById('bProg').style.width='100%';
document.getElementById('bLoad').classList.add('hid');
document.getElementById('bExp').style.display='flex';
document.getElementById('bulkBtn').disabled=false;
document.getElementById('bulkBtn').innerHTML='<i class="fas fa-rocket"></i> Lookup All';
var ok=BD.filter(function(d){return!d.error}).length;
document.getElementById('bSum').textContent=total+' IPs | '+ok+' OK | '+(total-ok)+' failed';
toast('Bulk complete');
}

// Copy bulk for Excel
function cpBulkExcel(){
if(!BD.length){toast('No results');return;}
var hd=['#','IP','Country','Code','Region','City','ISP','Org','ASN','Type','VPN','Provider','Proxy','Tor','Hosting','Mobile','Risk','Reverse','TZ'];
var tsv=hd.join('\t')+'\n';
for(var i=0;i<BD.length;i++){
  var d=BD[i];
  if(d.error){tsv+=d.index+'\t'+d.ip+'\tERROR\n';}
  else{tsv+=[d.index,d.ip,d.country,d.countryCode,d.region,d.city,d.isp,d.org,d.asn,d.ipType,d.isVPN,d.vpnProvider||'-',d.isProxy,d.isTor,d.isHosting,d.isMobile,d.riskScore,d.reverse,d.timezone].join('\t')+'\n';}
}
navigator.clipboard.writeText(tsv);toast('Copied for Excel');
}

// Single PDF report for all bulk results
function pdfBulkSingle(){
if(!BD.length){toast('No results');return;}
var doc=new jspdf.jsPDF('landscape');
doc.setFillColor(26,26,46);doc.rect(0,0,297,30,'F');
doc.setTextColor(255,255,255);doc.setFontSize(16);
doc.text('Bulk IP Lookup Report',15,15);
doc.setFontSize(9);
doc.text(new Date().toLocaleString()+' | '+BD.length+' IPs | Punjab Investigation Tools',15,23);
var cols=['#','IP','Country','Region','City','ISP','ASN','Type','VPN','Prx','Tor','Host','Risk','Reverse','TZ'];
var rows=[];
for(var i=0;i<BD.length;i++){
  var d=BD[i];
  if(d.error)rows.push([d.index,d.ip,'ERR','','','','','','','','','','','',d.error]);
  else rows.push([d.index,d.ip,d.country,d.region,d.city,d.isp,d.asn,d.ipType,d.isVPN?'Y':'N',d.isProxy?'Y':'N',d.isTor?'Y':'N',d.isHosting?'Y':'N',d.riskScore,d.reverse,d.timezone]);
}
doc.autoTable({
  head:[cols],body:rows,startY:35,theme:'grid',
  styles:{fontSize:7,cellPadding:2},
  headStyles:{fillColor:[99,102,241],textColor:255,fontStyle:'bold',fontSize:7},
  alternateRowStyles:{fillColor:[245,245,255]},
  margin:{left:10,right:10}
});
var pg=doc.internal.getNumberOfPages();
for(var p=1;p<=pg;p++){doc.setPage(p);doc.setTextColor(128,128,128);doc.setFontSize(7);doc.text('Page '+p+'/'+pg+' | Punjab Investigation Tools',15,200);}
doc.save('Bulk_IP_Lookup_'+new Date().toISOString().slice(0,10)+'.pdf');
toast('PDF downloaded');
}

// Multi PDF - one per IP
function pdfBulkMulti(){
var valid=BD.filter(function(d){return!d.error});
if(!valid.length){toast('No results');return;}
for(var i=0;i<valid.length;i++){
  var d=valid[i];
  var doc=new jspdf.jsPDF();
  doc.setFillColor(26,26,46);doc.rect(0,0,210,35,'F');
  doc.setTextColor(255,255,255);doc.setFontSize(18);doc.text('IP: '+d.ip,15,20);
  doc.setFontSize(9);doc.text('Punjab Investigation Tools | '+new Date().toLocaleString(),15,28);
  doc.setTextColor(0,0,0);var y=45;
  var addR=function(l,v){if(y>275){doc.addPage();y=20;}doc.setFont(undefined,'bold');doc.setFontSize(10);doc.text(l+':',15,y);doc.setFont(undefined,'normal');doc.text(String(v).substring(0,80),70,y);y+=7;};
  var addS=function(t){if(y>265){doc.addPage();y=20;}y+=3;doc.setFillColor(99,102,241);doc.rect(10,y-4,190,7,'F');doc.setTextColor(255,255,255);doc.setFontSize(10);doc.setFont(undefined,'bold');doc.text(t,15,y+1);doc.setTextColor(0,0,0);doc.setFont(undefined,'normal');y+=10;};
  addS('Overview');addR('IP',d.ip);addR('Type',d.ipType);addR('Risk',d.riskScore+'/100');
  if(d.vpnProvider)addR('VPN Provider',d.vpnProvider);
  addS('Location');addR('Country',d.country);addR('Region',d.region);addR('City',d.city);addR('Timezone',d.timezone);
  addS('Network');addR('ISP',d.isp);addR('Org',d.org);addR('ASN',d.asn);addR('Reverse',d.reverse);
  addS('Security');addR('VPN',d.isVPN?'Yes':'No');addR('Proxy',d.isProxy?'Yes':'No');addR('Tor',d.isTor?'Yes':'No');addR('Hosting',d.isHosting?'Yes':'No');addR('Mobile',d.isMobile?'Yes':'No');
  doc.setTextColor(128,128,128);doc.setFontSize(8);doc.text('Punjab Investigation Tools | punjab.pages.dev',15,287);
  doc.save('IP_'+d.ip.replace(/[:.]/g,'_')+'.pdf');
}
toast(valid.length+' PDFs downloaded');
}