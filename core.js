window.onerror=function(m,u,l){var d=document.getElementById("err");if(!d){d=document.createElement("div");d.id="err";d.style.cssText="position:fixed;top:0;left:0;right:0;background:#b91c1c;color:#fff;padding:8px;z-index:99;font-size:13px;direction:ltr";document.body.appendChild(d)}d.textContent="Error: "+m+" (line "+l+" of "+u.split("/").pop()+")"};
var $=function(i){return document.getElementById(i)};
var mode="w",IDM={inf:"غير رسمي",frm:"رسمي",biz:"عمل",emo:"مشاعر",gen:"عام"},cfg={acc:"en-GB",theme:"auto",days:[]},view="",qq=null,last=null,POS={noun:"اسم",verb:"فعل",adj:"صفة",adv:"ظرف/حال",pron:"ضمير",prep:"حرف جر",conj:"روابط"},flt="",words=[],open={},editId=null,imgFor=null,db=null,timer=null;
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
var tt=null;
function say(t){$("msg").textContent=t;if(!t)return;var e=$("toast");e.textContent=t;e.style.display="block";clearTimeout(tt);tt=setTimeout(function(){e.style.display="none"},2500)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function norm(s){return String(s).toLowerCase().replace(/[\u064B-\u0652\u0640]/g,"").replace(/[إأآ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه")}
function openDB(cb){try{var r=indexedDB.open("vocab-cards",1);r.onupgradeneeded=function(){r.result.createObjectStore("kv")};r.onsuccess=function(){db=r.result;cb()};r.onerror=function(){cb()}}catch(e){cb()}}
function load(cb){if(!db)return cb();try{var tx=db.transaction("kv"),st=tx.objectStore("kv"),g=st.get("words"),c=st.get("cfg");c.onsuccess=function(){if(c.result)for(var k in c.result)cfg[k]=c.result[k]};g.onsuccess=function(){if(g.result){words=g.result;words.forEach(function(w){if(w.pos===undefined||(!w.man&&(!w.pos||w.guess)))setPos(w)})}};tx.oncomplete=function(){cb()};tx.onerror=function(){cb()}}catch(e){cb()}}
function save(){clearTimeout(timer);timer=setTimeout(function(){if(!db){say("الحفظ مو متاح بهذا المتصفح.");return}try{var st=db.transaction("kv","readwrite").objectStore("kv");st.put(words,"words");st.put(cfg,"cfg")}catch(e){say("تعذّر الحفظ.")}},400)}
function speak(t){try{if(!window.speechSynthesis)throw 0;speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(t);u.lang=cfg.acc;u.rate=0.9;var v=speechSynthesis.getVoices().filter(function(x){return x.lang.replace("_","-")===cfg.acc});if(v.length)u.voice=v[0];u.onerror=function(){say("النطق ما اشتغل. تأكد من محرك الصوت الإنجليزي بجهازك.")};speechSynthesis.speak(u)}catch(e){say("النطق مو متاح بهذا الجهاز أو التطبيق.")}}
function applyTheme(){var h=document.documentElement,t=cfg.theme||"auto";if(t==="auto")h.removeAttribute("data-theme");else h.setAttribute("data-theme",t);$("th").value=t}
function headword(t){
  var l=t.split(/\r?\n/)[0].replace(/[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu,"").replace(/[*#]/g,"").trim();
  var i=l.indexOf("/");if(i>0)l=l.slice(0,i);
  return l.trim().replace(/[\s:：-]+$/,"")||"(بدون عنوان)";
}
function preview(t){
  var m=t.match(/تعني\s*[:：]\s*(.+)/);if(m)return m[1].trim();
  var L=t.split(/\r?\n/).filter(function(x){return x.trim()});return (L[1]||"").trim();
}
var EN={noun:"noun",verb:"verb",adjective:"adj",adj:"adj",adverb:"adv",adv:"adv",pronoun:"pron",preposition:"prep",conjunction:"conj",connector:"conj",linker:"conj"};
var AR={"اسم":"noun","فعل":"verb","صفة":"adj","ظرف":"adv","حال":"adv","ضمير":"pron","حرف جر":"prep","رابط":"conj","روابط":"conj","حرف عطف":"conj","أداة ربط":"conj"};
var PRON=/^(i|me|my|mine|you|your|yours|he|him|his|she|her|hers|it|its|we|us|our|ours|they|them|their|theirs|myself|yourself|himself|herself|itself|ourselves|themselves|who|whom|whose|which|that|this|these|those)$/;
var PREP=/^(in|on|at|by|for|with|from|to|of|about|over|under|between|through|during|before|after|against|among|into|onto|upon|within|without|across|toward|towards|behind|beside|beyond|despite|towards|until|till|via|per)$/;
var CONJ=/^(and|but|or|so|yet|nor|because|although|though|while|whereas|if|unless|since|however|therefore|moreover|furthermore|nevertheless|otherwise|whether|once|hence|thus)$/;
function detectPos(t,word){
  var m=t.match(/(?:نوع الكلمة|التصنيف|القواعد|part of speech)\s*[:：-]?[^\n]*?(حرف جر|حرف عطف|أداة ربط|روابط|رابط|ضمير|صفة|ظرف|حال|فعل|اسم|pronoun|preposition|conjunction|connector|adjective|adverb|noun|verb|adj|adv)/i);
  if(m){var k=m[1].toLowerCase(),v=AR[m[1]]||EN[k];if(v)return{pos:v,guess:false}}
  var ls=t.split(/\r?\n/);
  for(var i=0;i<ls.length;i++){if(ls[i].length<40){var x=ls[i].toLowerCase().match(/\b(noun|verb|adjective|adverb|pronoun|preposition|conjunction)\b/);if(x)return{pos:EN[x[1]],guess:false}}}
  var ws=(word||"").toLowerCase().trim().split(/\s+/),w=ws[0],g=function(p){return{pos:p,guess:true}};
  if(!/^[a-z'-]+$/.test(w))return{pos:"",guess:false};
  if(ws.length>1){
    if(w==="to"||/^(up|out|off|on|in|down|over|away|back|about|for|with|at|into|through|along|around)$/.test(ws[ws.length-1]))return g("verb");
  }else{
    if(PRON.test(w))return g("pron");
    if(PREP.test(w))return g("prep");
    if(CONJ.test(w))return g("conj");
  }
  var k=ws[ws.length-1];
  if(k.length>4&&/ly$/.test(k))return g("adv");
  if(/(tion|sion|ment|ness|ity|ance|ence|ism|ist|ship|hood|dom|age|ure)$/.test(k))return g("noun");
  if(/(ful|ous|ive|able|ible|less|ish|ic|ical|al|ant|ent|ary|ory|like)$/.test(k))return g("adj");
  if(/(ing|er|or)$/.test(k))return g("noun");
  if(/(ize|ise|ify|ate)$/.test(k))return g("verb");
  var mn=(preview(t)||"").split(/[\/،,]/)[0].trim().split(/\s+/)[0]||"";
  if(/^ي[\u0621-\u064A]{3,}/.test(mn))return g("verb");
  if(/^ال/.test(mn))return g("noun");
  if(/(\u064B\u0627|\u0627\u064B)$/.test(mn))return g("adv");
  if(mn.length>=4&&/ي$/.test(mn))return g("adj");
  if(k.length>3&&/y$/.test(k))return g("adj");
  return g("noun");
}
function P(){return mode==="i"?IDM:POS}
function inMode(w){return(w.k||"w")===mode}
function detectIdm(t){
  var m=t.match(/(?:درجة الرسمية|الفئة|النوع|التصنيف)\s*[:：-]?\s*([^\n]*)/),z=m?m[1].toLowerCase():"";
  function f(x){if(/غير رسمي|informal|عامي|slang/.test(x))return"inf";if(/رسمي|formal/.test(x))return"frm";if(/عمل|business|وظيف/.test(x))return"biz";if(/مشاعر|emotion|feeling/.test(x))return"emo";if(/عام|general|neutral/.test(x))return"gen";return""}
  var a=f(z);if(a)return{pos:a,guess:false};
  var s=t.toLowerCase();
  if(/informal|slang|غير رسمي/.test(s))return{pos:"inf",guess:true};
  if(/\bformal|رسمي/.test(s))return{pos:"frm",guess:true};
  if(/business|\bwork|\bjob|office|boss|company|عمل|وظيف|شركة|مدير/.test(s))return{pos:"biz",guess:true};
  if(/\blove|angry|happy|\bsad|fear|\bjoy|\bmad\b|مشاعر|حزن|فرح|غضب|حب|خوف/.test(s))return{pos:"emo",guess:true};
  return{pos:"gen",guess:true};
}
function setPos(w){var d=(w.k==="i")?detectIdm(w.text):detectPos(w.text,w.word);w.pos=d.pos;w.guess=d.guess}
function newWord(t){var w={id:uid(),k:mode,word:headword(t),text:t,fav:false,box:0,due:0,rev:0,miss:0,at:Date.now()};setPos(w);return w}
function dkey(d){return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()}
function streak(){var set={};(cfg.days||[]).forEach(function(k){set[k]=1});var d=new Date(),c=0;if(!set[dkey(d)])d.setDate(d.getDate()-1);while(set[dkey(d)]){c++;d.setDate(d.getDate()-1)}return c}
function hlText(s,q){
  var h=esc(s);if(!q)return h;
  var n=norm(s),i=n.indexOf(q);
  if(i<0||n.length!==s.length)return h;
  return esc(s.slice(0,i))+"<mark>"+esc(s.slice(i,i+q.length))+"</mark>"+esc(s.slice(i+q.length));
}
function body(t,q){
  return t.split(/\r?\n/).map(function(l,i){
    if(!l.trim())return "";
    var k=/^(تعني|المعنى الحرفي|مثل عربي|درجة الرسمية|أصل العبارة|مثال|تُستخدم|تستخدم|كلمات مرتبطة|عبارات مشابهة|🔹)/.test(l.trim())||(i===0);
    var s=hlText(l.replace(/\*\*/g,""),q);
    return '<div class="l'+(k&&i>0?" k":"")+'" dir="auto">'+s+'</div>';
  }).join("");
}
