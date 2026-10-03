function pass(w){return(!flt||(flt==="none"?!w.pos:w.pos===flt))&&(!view||w.fav)}
function chips(arr,cur,at){return arr.map(function(t){return '<button class="chip'+(cur===t[0]?" on":"")+'" '+at+'="'+esc(t[0])+'">'+esc(t[1])+'</button>'}).join("")}
function dueN(){var n=Date.now();return words.filter(function(w){return(w.due||0)<=n}).length}
function renderStats(){
  var c={},fv=0;words.forEach(function(w){var k=w.pos||"none";c[k]=(c[k]||0)+1;if(w.fav)fv++});
  var top=words.filter(function(w){return w.rev>0}).sort(function(a,b){return b.rev-a.rev}).slice(0,5);
  var bad=words.filter(function(w){return w.miss>0}).sort(function(a,b){return b.miss-a.miss}).slice(0,5);
  function ol(a,k,u){return a.length?'<ol>'+a.map(function(w){return '<li><span dir="ltr">'+esc(w.word)+'</span> — '+w[k]+' '+u+'</li>'}).join("")+'</ol>':'<p class="hint">لسا ماكو بيانات. ابدأ مراجعة.</p>'}
  $("stats").innerHTML='<p>إجمالي الكلمات: <b>'+words.length+'</b> · المفضلة: <b>'+fv+'</b> · 🔥 سلسلة المراجعة: <b>'+streak()+'</b> يوم</p><div class="bar">'+Object.keys(POS).concat(["none"]).map(function(k){return c[k]?'<span class="pos '+k+'">'+(POS[k]||"غير مصنف")+': '+c[k]+'</span>':""}).join("")+'</div><b>أكثر الكلمات اللي راجعتها</b>'+ol(top,"rev","مرة")+'<b>تحتاج مراجعة أكثر</b>'+ol(bad,"miss","خطأ");
}
function render(){
  var q=norm($("q").value.trim()),out="",n=0;
  words.forEach(function(w){
    if(!pass(w))return;
    if(q&&norm(w.text).indexOf(q)<0)return;
    n++;
    var isOpen=!!open[w.id]||(q&&true);
    out+='<div class="card '+(w.pos||"")+'"><div class="hd" tabindex="0" role="button" data-t="'+w.id+'"><span class="w">'+hlText(w.word,q)+'</span><span class="m" dir="auto">'+esc(preview(w.text))+'</span>'+(w.pos?'<span class="pos '+w.pos+'">'+POS[w.pos]+'</span>':'')+(w.fav?'⭐':'')+'<button class="ic" data-sp="'+w.id+'" aria-label="نطق">🔊</button></div>';
    if(isOpen){
      out+='<div class="bd">';
      if(editId===w.id){
        out+='<textarea id="ed" style="margin-top:10px">'+esc(w.text)+'</textarea><div class="bar"><button data-sv="'+w.id+'">حفظ التعديل</button><button class="alt" data-cn="1">إلغاء</button></div>';
      }else{
        out+=body(w.text,q)+(w.guess?'<div class="hint">التصنيف تخمين من شكل الكلمة. غيّره إذا غلط.</div>':'')+'<div class="bar"><button class="alt" data-ed="'+w.id+'">تعديل</button><button class="alt" data-cp="'+w.id+'">نسخ</button><select class="cls" data-ps="'+w.id+'" aria-label="التصنيف"><option value="" selected hidden>التصنيف</option>'+Object.keys(POS).map(function(k){return '<option value="'+k+'">'+(w.pos===k?'✓ ':'')+POS[k]+'</option>'}).join("")+'<option value="none">'+(w.pos?'':'✓ ')+'غير مصنف</option></select><button class="alt" data-fv="'+w.id+'">'+(w.fav?'★ مفضلة':'☆ مفضلة')+'</button><button class="dg" data-dl="'+w.id+'">حذف</button></div>';
      }
      out+='</div>';
    }
    out+='</div>';
  });
  $("list").innerHTML=out;
  $("empty").hidden=words.length>0;
  $("total").textContent=words.length?words.length+" كلمة":"";
  $("chips2").innerHTML=chips([["","الكل"],["fav","⭐ المفضلة"]],view,"data-v");
  $("chips").innerHTML=chips([["","كل الأنواع"],["noun","اسم"],["verb","فعل"],["adj","صفة"],["adv","ظرف/حال"],["pron","ضمير"],["prep","حرف جر"],["conj","روابط"],["none","غير مصنف"]],flt,"data-f");
  $("cnt").textContent=(q||flt||view)?("النتائج: "+n):"";
  $("panel").innerHTML=words.length?'<div class="panel"><div>🔥 سلسلة المراجعة: <b>'+streak()+'</b> يوم</div><div>عندك <b>'+dueN()+'</b> كلمة للمراجعة اليوم</div><div class="bar"><button id="qz2">ابدأ جلسة مراجعة سريعة</button></div></div>':"";
  $("acc").textContent=cfg.acc==="en-GB"?"🇬🇧 بريطاني":"🇺🇸 أمريكي";
  renderStats();
}
var dcb=null;
function ask(m,cb){$("dm").textContent=m;dcb=cb;$("dlg").style.display="flex";$("dn").focus()}
$("dy").onclick=function(){$("dlg").style.display="none";var f=dcb;dcb=null;if(f)f()};
$("dn").onclick=function(){$("dlg").style.display="none";dcb=null};
function find(id){for(var i=0;i<words.length;i++)if(words[i].id===id)return i;return -1}
$("add").onclick=function(){
  var raw=$("paste").value.trim();if(!raw){say("الصق الشرح أول.");return}
  var parts=raw.split(/^\s*-{3,}\s*$/m).map(function(x){return x.trim()}).filter(Boolean);
  parts.reverse().forEach(function(p){words.unshift(newWord(p))});
  save();$("paste").value="";render();say("انحفظت "+parts.length+" كلمة");
};
$("q").oninput=render;
$("list").onclick=function(e){
  var t=e.target,b;
  if(b=t.closest("[data-sv]")){var w=words[find(b.dataset.sv)];w.text=$("ed").value;w.word=headword(w.text);if(!w.man)setPos(w);editId=null;save();render();return}
  if(t.closest("[data-cn]")){editId=null;render();return}
  if(b=t.closest("[data-ed]")){editId=b.dataset.ed;render();return}
  if(b=t.closest("[data-dl]")){var i=find(b.dataset.dl);ask("حذف «"+words[i].word+"»؟",function(){words.splice(find(b.dataset.dl),1);save();render()});return}
  if(b=t.closest("[data-cp]")){copyText(words[find(b.dataset.cp)].text,"اننسخت الكلمة");return}
  if(b=t.closest("[data-sh]")){shareText(words[find(b.dataset.sh)].text);return}
  if(b=t.closest("[data-sp]")){speak(words[find(b.dataset.sp)].word);return}
  if(b=t.closest("[data-fv]")){var f1=words[find(b.dataset.fv)];f1.fav=!f1.fav;save();render();return}
  if(b=t.closest(".hd")){open[b.dataset.t]=!open[b.dataset.t];if(open[b.dataset.t])last=b.dataset.t;render()}
};
$("list").onkeydown=function(e){if((e.key==="Enter"||e.key===" ")&&e.target.classList.contains("hd")){e.preventDefault();e.target.click()}};
$("chips").onclick=function(e){var b=e.target.closest(".chip");if(!b)return;flt=b.dataset.f;render()};
$("chips2").onclick=function(e){var b=e.target.closest(".chip");if(!b)return;view=b.dataset.v;render()};
$("acc").onclick=function(){cfg.acc=cfg.acc==="en-GB"?"en-US":"en-GB";save();render();speak("hello")};
$("th").onchange=function(){cfg.theme=this.value;applyTheme();save()};
$("pr").onclick=function(){copyText("اشرح لي الكلمة الإنجليزية: [الكلمة]\nاكتب الشرح بهذا الترتيب بالضبط وبدون جداول:\nالسطر الأول: الكلمة /النطق IPA/ 🇬🇧\nتعني: المعنى بالعربي\nنوع الكلمة: (اسم أو فعل أو صفة أو ظرف/حال أو ضمير أو حرف جر أو روابط)\nشرح قصير بالعربي\nمثالان بالإنجليزي مع ترجمتهما\nكلمات مرتبطة: كلمة /نطق/ = معنى","انتسخ البرومبت. بدّل [الكلمة] والصقه بـ ChatGPT")};
$("ex").onclick=function(){try{var bl=new Blob([JSON.stringify(words)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(bl);a.download="my-words.json";document.body.appendChild(a);a.click();document.body.removeChild(a);say("بدأ التنزيل. إذا ما نزل شي، استخدم زر انسخ.")}catch(e){say("التنزيل مو متاح هنا. استخدم زر انسخ.")}};
$("imp").onchange=function(){var f=this.files[0];if(!f)return;var r=new FileReader();r.onload=function(){$("bak").value=r.result;$("bkd").open=true;say("انقرأ الملف. اضغط استرجاع.")};r.onerror=function(){say("ما كدرت أقرأ الملف.")};r.readAsText(f);this.value=""};
function shuf(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
function mean(w){return preview(w.text)||"(بدون معنى)"}
function startQuiz(){
  if(!words.length){say("أضف كلمات أول.");return}
  var n=Date.now(),a=words.filter(function(w){return pass(w)&&(w.due||0)<=n});
  var all=!a.length;if(all)a=words.filter(pass);
  if(!a.length){say("ماكو كلمات بهالفلتر.");return}
  qq={all:all,pool:shuf(a.map(function(w){return w.id})).slice(0,20)};qq.mode=null;showQ();
}
function nextQ(){
  qq.i++;qq.fb=null;
  if(qq.i>=qq.ids.length){showQ();return}
  var w=words[find(qq.ids[qq.i])],t=qq.mode==="mix"?(Math.random()<.5?"type":"choice"):qq.mode;
  var ms=shuf(words.filter(function(x){return x.id!==w.id&&preview(x.text)}).map(mean)).filter(function(m,i,ar){return ar.indexOf(m)===i&&m!==mean(w)});
  if(t==="choice"&&ms.length<3)t="type";
  qq.t=t;qq.opts=t==="choice"?shuf([mean(w)].concat(ms.slice(0,3))):null;showQ();
}
function sh(s){return s.length>80?s.slice(0,80)+"…":s}
function showQ(){
  var el=$("quiz");el.style.display="flex";
  if(!qq.mode){
    el.innerHTML='<div class="qc"><h2>🧠 مراجعة</h2><p>'+(qq.all?'ماكو كلمات مستحقة هسه، راح أدرّبك على كلماتك.':'كلمات مستحقة للمراجعة: '+qq.pool.length)+'</p><button class="big" data-m="mix">مزج</button><button class="big alt" data-m="type">معنى ← اكتب الكلمة</button><button class="big alt" data-m="choice">كلمة ← اختر المعنى</button><button class="alt" id="qx" style="margin-top:14px">رجوع</button></div>';return}
  if(qq.i>=qq.ids.length){
    el.innerHTML='<div class="qc"><h2>خلصت الجلسة 🎉</h2><p>عرفت '+qq.ok+' من '+qq.n+' من أول مرة</p><button class="big" id="qx">رجوع</button></div>';return}
  var w=words[find(qq.ids[qq.i])],h='<div class="qc"><div class="hint">'+(qq.i+1)+' / '+qq.ids.length+'</div>';
  if(qq.fb){
    h+='<div class="'+(qq.fb.ok?'good">صح ✅':'badt">غلط ❌')+'</div><div class="qw">'+esc(w.word)+'</div><button class="ic" data-sp="'+w.id+'" aria-label="نطق" style="font-size:30px">🔊</button><div class="qb">'+body(w.text,"")+'</div>';
    if(qq.t==="choice")h+=qq.opts.map(function(o,i){return '<div class="opt'+(o===mean(w)?' ok':(i===qq.fb.pick?' bad':''))+'" dir="auto">'+esc(sh(o))+'</div>'}).join("");
    h+='<button class="big" id="qnx">التالي ←</button>';
  }else if(qq.t==="type"){
    h+='<div class="hint">اكتب الكلمة الإنجليزية لهذا المعنى</div><div class="qb" dir="auto">'+esc(mean(w))+'</div><input id="qa" dir="ltr" placeholder="الكلمة بالإنجليزي" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="big" id="qck">تحقق</button><button class="big alt" id="qdk">ما أعرف</button>';
  }else{
    h+='<div class="qw">'+esc(w.word)+'</div><button class="ic" data-sp="'+w.id+'" aria-label="نطق" style="font-size:30px">🔊</button><div class="hint">اختر المعنى الصحيح</div>'+qq.opts.map(function(o,i){return '<button class="opt" data-o="'+i+'" dir="auto">'+esc(sh(o))+'</button>'}).join("");
  }
  el.innerHTML=h+'<button class="alt" id="qx" style="margin-top:14px">إنهاء</button></div>';
  if($("qa"))$("qa").focus();
}
function grade(ok,pick){
  var id=qq.ids[qq.i],w=words[find(id)],D=[0,1,3,7,14];
  w.rev=(w.rev||0)+1;
  if(ok){w.box=Math.min((w.box||0)+1,4);w.due=Date.now()+D[w.box]*864e5;if(!qq.miss[id])qq.ok++}
  else{w.box=0;w.due=0;w.miss=(w.miss||0)+1;if(!qq.miss[id]){qq.miss[id]=1;qq.ids.push(id)}}
  var k=dkey(new Date());cfg.days=cfg.days||[];if(cfg.days.indexOf(k)<0){cfg.days.push(k);if(cfg.days.length>400)cfg.days.shift()}
  qq.fb={ok:ok,pick:pick};save();showQ();
}
function answerType(){var w=words[find(qq.ids[qq.i])],v=norm($("qa").value.trim());grade(!!v&&v===norm(w.word))}
$("qz").onclick=startQuiz;
$("panel").onclick=function(e){if(e.target.closest("#qz2"))startQuiz()};
$("quiz").onkeydown=function(e){if(e.key==="Enter"&&e.target.id==="qa"){e.preventDefault();answerType()}};
$("quiz").onclick=function(e){
  var b=e.target.closest("[data-sp],[data-m],[data-o],#qck,#qdk,#qnx,#qx");if(!b)return;
  if(b.dataset.sp){speak(words[find(b.dataset.sp)].word);return}
  if(b.dataset.m){qq.mode=b.dataset.m;qq.ids=qq.pool.slice();qq.n=qq.ids.length;qq.i=-1;qq.ok=0;qq.miss={};nextQ();return}
  if(b.dataset.o!==undefined){var w=words[find(qq.ids[qq.i])];grade(qq.opts[+b.dataset.o]===mean(w),+b.dataset.o);return}
  if(b.id==="qck"){answerType();return}
  if(b.id==="qdk"){grade(false);return}
  if(b.id==="qnx"){nextQ();return}
  $("quiz").style.display="none";qq=null;render();
};
function copyText(t,msg){
  function fb(){var a=document.createElement("textarea");a.value=t;a.style.position="fixed";a.style.opacity="0";document.body.appendChild(a);a.select();try{document.execCommand("copy");say(msg)}catch(e){say("تعذّر النسخ.")}document.body.removeChild(a)}
  try{navigator.clipboard.writeText(t).then(function(){say(msg)},fb)}catch(e){fb()}
}
function shareText(t){
  if(navigator.share){navigator.share({text:t}).catch(function(){copyText(t,"المشاركة مو متاحة هنا، اننسخ النص وتكدر تلصقه بأي مكان")})}
  else copyText(t,"المشاركة مو متاحة هنا، اننسخ النص وتكدر تلصقه بأي مكان");
}
$("list").onchange=function(e){
  var s=e.target.closest("[data-ps]");if(!s||!s.value)return;var w=words[find(s.dataset.ps)];w.pos=s.value==="none"?"":s.value;w.guess=false;w.man=true;save();render()};
$("ov").onclick=function(){this.style.display="none"};
$("mk").onclick=function(){$("bak").value=JSON.stringify(words)};
$("shall").onclick=function(){if(!words.length){say("ماكو كلمات للمشاركة.");return}shareText(words.map(function(w){return w.text}).join("\n---\n"))};
$("cp").onclick=function(){var t=$("bak");if(!t.value)$("mk").click();copyText(t.value,"اننسخ الدفتر")};
$("rs").onclick=function(){
  var raw=$("bak").value.trim(),d;
  try{d=JSON.parse(raw);if(!Array.isArray(d))throw 0}catch(e){d=raw.split(/^\s*-{3,}\s*$/m).map(function(x){return x.trim()}).filter(Boolean)}
  if(!d.length){say("الصق النسخة أول.");return}
  ask("يضيف "+d.length+" كلمة للموجودة. تكمل؟",function(){d.forEach(function(t){var nw;if(typeof t==="string")nw=newWord(t);else if(t&&t.text){nw=newWord(t.text);["fav","box","due","rev","miss","at","man"].forEach(function(k){if(t[k]!==undefined)nw[k]=t[k]});if(t.pos!==undefined){nw.pos=t.pos;nw.guess=false}}else return;words.push(nw)});save();render();say("انضافت "+d.length+" كلمة")});
};
openDB(function(){load(function(){applyTheme();render()})});
