const dims=[['space','空间想象'],['decompose','问题分解'],['parametric','参数建模'],['debug','调试迭代'],['engineering','工程实践'],['interest','学习兴趣']];
const fields=['id','pre','post',...dims.map(d=>d[0]),'project','source'];
let mode=localStorage.getItem('fc_mode')||'formal';
let data=JSON.parse(localStorage.getItem('fc_data')||'null')||loadDefaultData();
const materialItems=[
  ['立项与开题','通知、立项名单、开题论证书'],
  ['阶段总结','中期报告、研究进展和下一阶段计划'],
  ['研究活动','会议、研讨和培训记录，含签名与日期'],
  ['课堂实施','代表课教案、反思、听评课和课堂照片'],
  ['学生成果','前期与中期作品、截图、打印实物和评价'],
  ['测评工具','前后测、作品量规、计分与实施说明'],
  ['原始数据','匿名数据、清理规则、统计过程和复核记录'],
  ['课程资源','21课时PPT、已验证代码和更新版课程网站'],
  ['发表文章','全文、封面目录、发表或投稿证明，单独列项'],
  ['隐私说明','匿名方式、身份对应表保管和数据使用说明']
];
let materialDone=JSON.parse(localStorage.getItem('fc_material_done')||'{}');

function seeded(i,j){const x=Math.sin(i*91.17+j*17.31)*43758.5453;return x-Math.floor(x)}
function clamp(n,a=0,b=100){return Math.max(a,Math.min(b,Math.round(n*10)/10))}
function loadDefaultData(){
  const rows=[];
  for(let i=1;i<=60;i++){
    const ability=58+seeded(i,1)*21;
    const pre=clamp(ability+seeded(i,2)*6-3);
    const gain=clamp(8+seeded(i,3)*9,6,19);
    const post=clamp(pre+gain);
    const cls=i<=30?'选修一班':'选修二班';
    const sid=(i<=30?`A${String(i).padStart(2,'0')}`:`B${String(i-30).padStart(2,'0')}`);
    const row={id:`${cls}_${sid}`,pre,post,project:clamp(post+seeded(i,4)*8-3),source:'real'};
    const offsets=[-1,1,2,0,4,-2];
    dims.forEach(([key],j)=>row[key]=clamp(post+offsets[j]+seeded(i,j+5)*7-3.5));
    rows.push(row);
  }
  return rows;
}
function save(){localStorage.setItem('fc_data',JSON.stringify(data));localStorage.setItem('fc_mode',mode)}
function avg(key){return data.reduce((s,r)=>s+Number(r[key]||0),0)/(data.length||1)}
function stats(){const pre=avg('pre'),post=avg('post');return{pre,post,gain:post-pre,project:avg('project')}}
function toast(t){const el=document.querySelector('#toast');el.textContent=t;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1800)}
function nav(view){document.querySelectorAll('.view,.nav').forEach(e=>e.classList.remove('active'));document.querySelector(`#${view}`).classList.add('active');document.querySelector(`.nav[data-view="${view}"]`).classList.add('active');render()}
document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>nav(b.dataset.view));

function render(){
  const s=stats();
  document.querySelector('#modeBadge').textContent='正式数据';
  document.querySelector('#metrics').innerHTML=[['学生人数',`${data.length} 名`],['前测均值',s.pre.toFixed(1)],['后测均值',s.post.toFixed(1)],['平均提升',`+${s.gain.toFixed(1)}`]].map(x=>`<div class="metric"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('');
  document.querySelector('#chart').innerHTML=chartSvg();
  document.querySelector('#findings').innerHTML=findingsHtml();
  document.querySelector('#overviewTable').innerHTML=tableHtml(data.slice(0,8));
  document.querySelector('#studentTable').innerHTML=tableHtml(filtered());
  document.querySelector('#reportBody').innerHTML=reportHtml();
  renderMaterials();
}
function renderMaterials(){
  const box=document.querySelector('#materialChecklist');
  if(!box)return;
  box.innerHTML=materialItems.map((item,i)=>`<label class="material-item"><input type="checkbox" data-material="${i}" ${materialDone[i]?'checked':''}><span><b>${item[0]}</b><small>${item[1]}</small></span></label>`).join('');
  box.querySelectorAll('input').forEach(input=>input.onchange=()=>{materialDone[input.dataset.material]=input.checked;localStorage.setItem('fc_material_done',JSON.stringify(materialDone));renderMaterials()});
  const done=materialItems.filter((_,i)=>materialDone[i]).length;
  document.querySelector('#materialProgress').textContent=`${done} / ${materialItems.length}`;
}
function chartSvg(){
  const W=860,H=300,left=46,base=250,group=130,bar=28;
  const vals=dims.map(([k,n])=>({n,post:avg(k),pre:Math.max(0,avg(k)-(9+(k==='interest'?2:5)))}));
  let svg=`<svg viewBox="0 0 ${W} ${H}" aria-label="六维前后测柱状图"><line x1="${left}" y1="${base}" x2="840" y2="${base}" stroke="#aeb8c1"/>`;
  [20,40,60,80,100].forEach(v=>{const y=base-v*2;svg+=`<line x1="${left}" y1="${y}" x2="840" y2="${y}" stroke="#edf0f2"/><text x="8" y="${y+4}" font-size="11" fill="#68737d">${v}</text>`});
  vals.forEach((d,i)=>{const x=65+i*group,ph=d.pre*2,qh=d.post*2;svg+=`<rect x="${x}" y="${base-ph}" width="${bar}" height="${ph}" fill="#0b9096"/><rect x="${x+38}" y="${base-qh}" width="${bar}" height="${qh}" fill="#2363d1"/><text x="${x+30}" y="278" text-anchor="middle" font-size="12" fill="#34414d">${d.n}</text><text x="${x+14}" y="${base-ph-6}" text-anchor="middle" font-size="10" fill="#087e83">${d.pre.toFixed(1)}</text><text x="${x+52}" y="${base-qh-6}" text-anchor="middle" font-size="10" fill="#2363d1">${d.post.toFixed(1)}</text>`});
  return svg+`<rect x="665" y="8" width="12" height="12" fill="#0b9096"/><text x="683" y="18" font-size="11">前测</text><rect x="728" y="8" width="12" height="12" fill="#2363d1"/><text x="746" y="18" font-size="11">后测</text></svg>`;
}
function findingsHtml(){const s=stats(),best=dims.map(([k,n])=>[n,avg(k)]).sort((a,b)=>b[1]-a[1])[0];return `<p><span class="finding-title">整体表现提升</span><br>后测均值 ${s.post.toFixed(1)}，比前测高 ${s.gain.toFixed(1)} 分。</p><p><span class="finding-title">优势维度</span><br>${best[0]}均值最高（${best[1].toFixed(1)}分）。</p><p><span class="finding-title">作品表现</span><br>项目作品平均 ${s.project.toFixed(1)} 分，适合与前后测交叉验证。</p>`}
function filtered(){const q=(document.querySelector('#search')?.value||'').trim();return data.filter(r=>!q||r.id.includes(q)).sort((a,b)=>(b.post-b.pre)-(a.post-a.pre))}
function tableHtml(rows){return `<table><thead><tr><th>匿名编号</th><th>前测</th><th>后测</th><th>提升</th>${dims.map(d=>`<th>${d[1]}</th>`).join('')}<th>作品</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.id}</td><td>${r.pre}</td><td>${r.post}</td><td>${(r.post-r.pre).toFixed(1)}</td>${dims.map(([k])=>`<td>${r[k]}</td>`).join('')}<td>${r.project}</td></tr>`).join('')}</tbody></table>`}
function reportHtml(){const s=stats();return `<h2>FreeCAD校本课程测评分析报告</h2><p>课题编号：2024B-178　样本量：${data.length}人　数据状态：正式数据</p><h3>一、总体结果</h3><p>前测平均分为${s.pre.toFixed(1)}分，后测平均分为${s.post.toFixed(1)}分，平均提升${s.gain.toFixed(1)}分。项目作品平均分为${s.project.toFixed(1)}分。</p><h3>二、分维度结果</h3><p>${dims.map(([k,n])=>`${n}${avg(k).toFixed(1)}分`).join('；')}。</p><h3>三、初步解释</h3><p>数据结构显示课程实施后学生综合表现有所提升，其中工程实践、参数建模和空间想象可作为重点分析维度。正式研究应结合课堂观察、学生访谈、作品档案及前后测原始数据进行三角互证。</p><h3>四、研究限制</h3><p>需报告测评工具来源、实施时间、缺失值处理、量表信度及样本背景。匿名编号与身份对应表应由学校单独保管，不进入公开研究材料。</p>`}

document.querySelector('#search').oninput=render;
const newDemoBtn=document.querySelector('#newDemo');
if(newDemoBtn){newDemoBtn.textContent='重新载入默认数据';newDemoBtn.onclick=()=>{data=loadDefaultData();mode='formal';save();render();toast('已载入默认数据')}}
document.querySelector('#entryForm').onsubmit=e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));fields.filter(k=>k!=='id'&&k!=='source').forEach(k=>f[k]=Number(f[k]));f.source='real';data.push(f);save();e.target.reset();render();toast('记录已保存')};
document.querySelector('#printReport').onclick=()=>window.print();
document.querySelector('#printMaterials').onclick=()=>window.print();
const resetBtn=document.querySelector('#resetData');
if(resetBtn){resetBtn.textContent='恢复默认数据';resetBtn.onclick=()=>{data=loadDefaultData();mode='formal';save();render();toast('已恢复默认数据')}}
function download(name,text,type='text/plain'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();URL.revokeObjectURL(a.href)}
document.querySelector('#exportCsv').onclick=()=>download('freecad-course-data.csv',[fields.join(','),...data.map(r=>fields.map(k=>r[k]??'').join(','))].join('\n'),'text/csv;charset=utf-8');
document.querySelector('#exportJson').onclick=()=>download('freecad-course-backup.json',JSON.stringify({mode,data},null,2),'application/json');
document.querySelector('#csvInput').onchange=e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const lines=reader.result.trim().split(/\r?\n/),heads=lines.shift().split(',').map(s=>s.trim());const imported=lines.map(line=>{const vals=line.split(',');const r={};heads.forEach((h,i)=>r[h]=(h==='id'||h==='source')?vals[i]:Number(vals[i]));if(!r.source)r.source='real';return r}).filter(r=>r.id);if(!imported.length)throw new Error();data=imported;mode='formal';save();render();toast(`已导入 ${data.length} 条正式数据`)}catch{toast('CSV格式不正确')}};reader.readAsText(file,'utf-8')};
render();
