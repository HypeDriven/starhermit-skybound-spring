var eu="1.0.0";var Vs=.008333333333333333,vt=480,ni=12,Zf=180,Jf=60,jf=900,Kh=34,Kf=1.85,Qh=100,Qf=25;var Mn={BAD_SHAPE:"bad-shape",BAD_TYPE:"bad-type",BAD_DIR:"bad-dir",BAD_TICK:"bad-tick",TERMINAL:"terminal",DUPLICATE:"duplicate-command"},$f=["bud","drift","crumb","spring","wisp","thorn"],si={sprout:{key:"sprout",label:"Sprout (easy)",gravity:1400,bounceV:700,steerAccel:2500,maxVx:280,gapMin:55,gapMax:118,width:96,ratios:{drift:.06,crumb:.04,spring:.09,wisp:.03,thorn:0},tokenRate:.16},bloom:{key:"bloom",label:"Bloom (medium)",gravity:1600,bounceV:750,steerAccel:2600,maxVx:295,gapMin:60,gapMax:128,width:80,ratios:{drift:.13,crumb:.1,spring:.08,wisp:.05,thorn:.03},tokenRate:.14},storm:{key:"storm",label:"Storm (hard)",gravity:1800,bounceV:800,steerAccel:2700,maxVx:310,gapMin:64,gapMax:136,width:66,ratios:{drift:.2,crumb:.16,spring:.07,wisp:.07,thorn:.07},tokenRate:.12}};function ep(n){return n.bounceV*n.bounceV/(2*n.gravity)}function Sa(n){return{s:n>>>0}}function Tn(n){n.s=n.s+1831565813>>>0;let e=n.s;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function pi(n,e,t){return e+Tn(n)*(t-e)}function $h(n,e){let t=Math.abs(n-e)%vt;return Math.min(t,vt-t)}function ri(n){let e=2166136261;for(let t=0;t<n.length;t++)e^=n.charCodeAt(t),e=Math.imul(e,16777619);return e>>>0}function sc(n){if(n===null||typeof n!="object")return n;if(Array.isArray(n))return n.map(sc);let e={};for(let t of Object.keys(n).sort())e[t]=sc(n[t]);return e}function tp(n){let e=JSON.parse(JSON.stringify(sc(n),(t,i)=>typeof i=="number"?Math.round(i*1e3)/1e3:i));return JSON.stringify(e)}function Zn(n){let e=nu(n);return ri(tp(e)).toString(16).padStart(8,"0")}function rc(n){let e=typeof n.difficulty=="string"?si[n.difficulty]:n.difficulty;if(!e)throw new Error("unknown difficulty: "+n.difficulty);let t=Sa(n.seed>>>0^1373993649),i={v:1,seed:n.seed>>>0,tierKey:e.key,tier:e,tick:0,dir:0,queue:[],seenIds:[],player:{x:vt/2,y:0,vx:0,vy:0},camY:0,maxY:0,chain:0,lastLandY:0,lastLandId:-1,score:{altitude:0,chainBonus:0,tokens:0},platforms:[],tokens:[],nextPlatId:1,nextTokenId:1,genY:0,lastRowX:vt/2,lastRowType:"bud",pendingThorn:null,lastRowPads:[],rng:t,terminal:null,invalidCount:0,landings:0,goal:n.goal?{...n.goal}:{type:"none",target:0},moveLimitTicks:n.moveLimitTicks||0,steerTicksUsed:0,maxTicks:n.maxTicks||120*600,mechanics:n.mechanics?[...n.mechanics]:[...$f]};return i.platforms.push({id:0,x:vt/2,y:-20,w:140,type:"bud",vx:0,alive:!0}),i.player.y=0,i.player.vy=e.bounceV,tu(i),i}function ip(n,e){let t=n.tier.ratios,i=n.mechanics,s=e,r=[["wisp",t.wisp],["spring",t.spring],["crumb",t.crumb],["drift",t.drift]];for(let[a,o]of r){if(i.includes(a)&&s<o)return a;i.includes(a)&&(s-=o)}return"bud"}function np(n){let e=n.bounceV/n.gravity,t=ep(n),i=Math.sqrt(Math.max(0,2*(t-n.gapMax)/n.gravity));return n.maxVx*(e+i)*.7}function tu(n){let e=n.tier,t=np(e);for(;n.genY<n.player.y+jf;){let s=n.lastRowType==="crumb"||n.lastRowType==="wisp",r=s?e.gapMax*.75:e.gapMax,a=s?t*.6:t,o=pi(n.rng,e.gapMin,r);n.genY+=o;let l=ip(n,Tn(n.rng));s&&(l==="drift"||l==="crumb"||l==="wisp")&&(l="bud");let c=e.width*(l==="spring"?.8:1),h=n.lastRowX!==void 0?n.lastRowX:vt/2,d=Math.max(c/2,Math.min(vt-c/2,h+pi(n.rng,-a,a)));n.lastRowX=d,n.lastRowType=l;let u=l==="drift"?(Tn(n.rng)<.5?-1:1)*pi(n.rng,35,85):0,f={id:n.nextPlatId++,x:d,y:n.genY,w:c,type:l,vx:u,alive:!0};l==="drift"&&(f.home=d),n.platforms.push(f);let g=[{x:d,w:c}];if(Tn(n.rng)<.22){let y=e.width*.9,A=Math.max(y/2,d-t),M=Math.min(vt-y/2,d+t);if(M-A>(c+y)/2+8){let C=pi(n.rng,A,M);Math.abs(C-d)<(c+y)/2+8&&(C=d+(C>=d?1:-1)*((c+y)/2+8),C=Math.max(A,Math.min(M,C))),n.platforms.push({id:n.nextPlatId++,x:C,y:n.genY,w:y,type:"bud",vx:0,alive:!0}),g.push({x:C,w:y})}}if(n.pendingThorn){let y=n.pendingThorn;n.pendingThorn=null;let A=[...n.lastRowPads||[],...g],M=[y.x-y.off,y.x+y.off].filter(C=>C>y.w2/2&&C<vt-y.w2/2&&Math.abs(C-y.x)>y.w2/2+y.wPrim/2+36&&A.every(v=>Math.abs(C-v.x)>y.w2/2+v.w/2+36));if(M.length){let C=M[y.side%M.length];n.platforms.push({id:n.nextPlatId++,x:C,y:y.y,w:y.w2,type:"thorn",vx:0,alive:!0})}}n.lastRowPads=g,Tn(n.rng)<e.tokenRate&&n.tokens.push({id:n.nextTokenId++,x:d,y:n.genY+46,taken:!1});let m=Tn(n.rng),p=pi(n.rng,0,60),T=Tn(n.rng),S=e.width*.7;n.pendingThorn=n.mechanics.includes("thorn")&&m<e.ratios.thorn?{x:d,y:n.genY,w2:S,wPrim:c,off:(c+S)/2+46+p,side:T<.5?0:1}:null}let i=n.camY-200;n.platforms.length>400&&(n.platforms=n.platforms.filter(s=>s.y>i||s.alive&&s.y>n.player.y-400)),n.tokens.length>200&&(n.tokens=n.tokens.filter(s=>!s.taken&&s.y>i))}function sp(n,e){return!e||typeof e!="object"||typeof e.id!="string"||e.id.length===0||e.id.length>64?Mn.BAD_SHAPE:e.type!=="steer"?Mn.BAD_TYPE:e.dir!==-1&&e.dir!==0&&e.dir!==1?Mn.BAD_DIR:!Number.isInteger(e.tick)||e.tick<0||e.tick>n.tick+240?Mn.BAD_TICK:n.terminal?Mn.TERMINAL:n.seenIds.includes(e.id)?Mn.DUPLICATE:null}function Gs(n,e){let t=sp(n,e);if(t)return n.invalidCount++,{state:n,events:[],invalidReason:t};n.seenIds.push(e.id),n.seenIds.length>512&&(n.seenIds=n.seenIds.slice(-256));let i={tick:Math.max(e.tick,n.tick),dir:e.dir},s=n.queue.length;for(;s>0&&n.queue[s-1].tick>i.tick;)s--;return n.queue.splice(s,0,i),{state:n,events:[]}}function ac(n){let e=[];if(n.terminal)return e;let t=n.tier;for(n.tick++;n.queue.length&&n.queue[0].tick<=n.tick;)n.dir=n.queue.shift().dir;let i=n.dir*t.maxVx,s=t.steerAccel*Vs;if(n.player.vx<i?n.player.vx=Math.min(i,n.player.vx+s):n.player.vx>i&&(n.player.vx=Math.max(i,n.player.vx-s)),n.dir!==0&&(n.steerTicksUsed++,n.moveLimitTicks&&n.steerTicksUsed>n.moveLimitTicks))return n.terminal={reason:"move-limit",tick:n.tick},e.push({type:"terminal",reason:"move-limit"}),e;n.player.x+=n.player.vx*Vs,n.player.x<-ni&&(n.player.x+=vt+ni*2),n.player.x>vt+ni&&(n.player.x-=vt+ni*2);let r=n.player.y;n.player.vy-=t.gravity*Vs,n.player.y+=n.player.vy*Vs;for(let l of n.platforms)if(l.type==="drift"&&l.alive){l.x+=l.vx*Vs;let c=l.w/2,h=Math.max(c,(l.home!==void 0?l.home:l.x)-Kh),d=Math.min(vt-c,(l.home!==void 0?l.home:l.x)+Kh);l.x<h&&(l.x=h,l.vx=Math.abs(l.vx)),l.x>d&&(l.x=d,l.vx=-Math.abs(l.vx))}if(n.player.vy<0){let l=null;for(let c of n.platforms)c.alive&&r>=c.y&&n.player.y<=c.y&&$h(n.player.x,c.x)<=c.w/2+ni*1.2&&(!l||c.y>l.y)&&(l=c);if(l){if(n.player.y=l.y,l.type==="thorn")return n.terminal={reason:"hazard",tick:n.tick},e.push({type:"thorn",id:l.id}),e.push({type:"terminal",reason:"hazard"}),e;let c=l.type==="spring";n.player.vy=c?t.bounceV*Kf:t.bounceV,(l.type==="crumb"||l.type==="wisp")&&(l.alive=!1),l.id!==n.lastLandId&&(n.chain=l.y>n.lastLandY?n.chain+1:1,n.lastLandId=l.id,n.lastLandY=l.y,n.landings++,n.score.chainBonus+=Math.min(n.chain,Qf)),e.push({type:c?"spring":"land",id:l.id,ptype:l.type,chain:n.chain,y:l.y})}}for(let l of n.tokens)!l.taken&&$h(n.player.x,l.x)<22&&Math.abs(n.player.y-l.y)<26&&(l.taken=!0,n.score.tokens+=Qh,e.push({type:"token",id:l.id}));let a=n.player.y-Zf;if(a>n.camY&&(n.camY=a),n.player.y>n.maxY&&(n.maxY=n.player.y,n.score.altitude=Math.floor(n.maxY/10)),n.player.y<n.camY-Jf)return n.terminal={reason:"fell",tick:n.tick},e.push({type:"terminal",reason:"fell"}),e;let o=n.goal;return o.type==="altitude"&&n.score.altitude>=o.target?(n.terminal={reason:"goal-reached",tick:n.tick},e.push({type:"terminal",reason:"goal-reached"}),e):o.type==="tokens"&&n.score.tokens/Qh>=o.target?(n.terminal={reason:"goal-reached",tick:n.tick},e.push({type:"terminal",reason:"goal-reached"}),e):o.timeLimitTicks&&n.tick>=o.timeLimitTicks&&!n.terminal?(n.terminal={reason:"time-out",tick:n.tick},e.push({type:"terminal",reason:"time-out"}),e):n.tick>=n.maxTicks?(n.terminal={reason:"time-out",tick:n.tick},e.push({type:"terminal",reason:"time-out"}),e):(tu(n),e)}function Hs(n){return n.score.altitude+n.score.chainBonus+n.score.tokens}function iu(n,e,t={}){let i=rc(n),s=[...e||[]].sort((l,c)=>l.tick-c.tick),r=0,a=i.maxTicks,o=t.collectEvents?[]:null;for(;!i.terminal&&i.tick<a;){for(;r<s.length&&s[r]&&s[r].tick<=i.tick+1;)Gs(i,s[r]),r++;let l=ac(i);if(o)for(let c of l)o.push(c);if(i.tick>a+10)break}return{state:i,terminal:i.terminal||{reason:"time-out",tick:i.tick},score:{...i.score,total:Hs(i)},invalidCount:i.invalidCount,hash:Zn(i),events:o}}function nu(n){return{v:n.v,seed:n.seed,tierKey:n.tierKey,tick:n.tick,dir:n.dir,queue:n.queue,seenIds:n.seenIds.slice(-64),player:{...n.player},camY:n.camY,maxY:n.maxY,chain:n.chain,lastLandY:n.lastLandY,lastLandId:n.lastLandId,score:{...n.score},platforms:n.platforms,tokens:n.tokens,nextPlatId:n.nextPlatId,nextTokenId:n.nextTokenId,genY:n.genY,lastRowX:n.lastRowX,lastRowType:n.lastRowType,lastRowPads:n.lastRowPads,pendingThorn:n.pendingThorn,rng:{s:n.rng.s},terminal:n.terminal,invalidCount:n.invalidCount,landings:n.landings,goal:n.goal,moveLimitTicks:n.moveLimitTicks,steerTicksUsed:n.steerTicksUsed,maxTicks:n.maxTicks,mechanics:n.mechanics}}function su(n){return JSON.stringify(nu(n))}function ru(n){let e=typeof n=="string"?JSON.parse(n):n;if(!e||typeof e!="object")throw new Error("bad state payload");let t=e.v;if(t===0&&(e={steerTicksUsed:0,moveLimitTicks:0,landings:0,...e,v:1},t=1),t!==1)throw new Error("unsupported schema version: "+t);let i=si[e.tierKey];if(!i)throw new Error("unknown tier in state: "+e.tierKey);return{...e,tier:i,rng:Sa(e.rng.s>>>0),platforms:e.platforms.map(s=>({...s})),tokens:e.tokens.map(s=>({...s})),queue:e.queue.map(s=>({...s})),seenIds:[...e.seenIds||[]],score:{...e.score},player:{...e.player},goal:{...e.goal},mechanics:[...e.mechanics]}}var Jt=[{key:"dawn-meadow",name:"Dawn Meadow",skyTop:8370152,skyBottom:16769986,fog:16046528,fogNear:2600,fogFar:7e3,keyLight:16771272,hemiSky:12573183,hemiGround:9083498,pad:5217871,padAlt:7323487,accent:16751964,cloud:16774378},{key:"cloud-terrace",name:"Cloud Terrace",skyTop:6201312,skyBottom:14281983,fog:14675708,fogNear:2600,fogFar:7200,keyLight:16777215,hemiSky:13625087,hemiGround:10335176,pad:4165486,padAlt:5745539,accent:16761948,cloud:16777215},{key:"dusk-canopy",name:"Dusk Canopy",skyTop:4864626,skyBottom:15239019,fog:13074285,fogNear:2400,fogFar:6500,keyLight:16757370,hemiSky:9072552,hemiGround:5917242,pad:7232158,padAlt:9073336,accent:16765286,cloud:15910064},{key:"frostline",name:"Frostline",skyTop:3362938,skyBottom:12575730,fog:13625072,fogNear:2200,fogFar:6e3,keyLight:15398655,hemiSky:11061480,hemiGround:8030874,pad:5933744,padAlt:7775432,accent:10479871,cloud:15661311},{key:"night-bloom",name:"Night Bloom",skyTop:1317434,skyBottom:3811934,fog:2761808,fogNear:2e3,fogFar:5600,keyLight:10128127,hemiSky:4864634,hemiGround:1709606,pad:4157070,padAlt:5540010,accent:8060888,cloud:4867186}],oc={default:{bud:5813096,drift:4171734,crumb:13208139,spring:14964640,wisp:12105936,thorn:14236475,token:16767309},deuteranopia:{bud:5086688,drift:15779848,crumb:9202250,spring:14964640,wisp:12632280,thorn:8010713,token:16774304},tritanopia:{bud:5095592,drift:14241648,crumb:11044960,spring:4171734,wisp:13158600,thorn:15250432,token:16777215}},Ws=40,rp=[{at:0,mech:["bud"]},{at:4,add:"spring"},{at:8,add:"drift"},{at:14,add:"crumb"},{at:20,add:"thorn"},{at:26,add:"wisp"}];function lc(n){if(n<0||n>=Ws)throw new Error("stage out of range");let e=["bud"];for(let c of rp)n>=c.at&&c.add&&!e.includes(c.add)&&e.push(c.add);let t=n%8===7&&n>0,i=n<12?"sprout":n<28?"bloom":"storm",s=Jt[Math.floor(n/8)%Jt.length].key,r=Math.round((300+n*55)*(t?1.12:1)),a=n%8===5?{type:"tokens",target:4+Math.floor(n/8)}:null,o=ri("skybound-stage-"+n),l=Math.round(r*10/75*120*1.4);return{id:"stage-"+String(n+1).padStart(2,"0"),index:n,name:t?`Mastery Gate ${Math.floor(n/8)+1}`:`Ascent ${n+1}`,seed:o,difficulty:i,goal:a||{type:"altitude",target:r},parTicks:l,parSeconds:Math.round(l/120),mastery:t,mechanics:e,theme:s,tutorial:n===0?"steer-basics":n===4?"springs":n===8?"drifters":n===14?"crumbles":null,version:1}}function Xs(){let n=[];for(let e=0;e<Ws;e++)n.push(lc(e));return n}var ou=[{id:"steady-hands",name:"Steady Hands",type:"move-limit",description:"Reach 900 altitude with a limited steering budget. Every tick you steer counts.",difficulty:"bloom",goal:{type:"altitude",target:900},moveLimitTicks:5400,seed:ri("challenge-steady-hands"),theme:"cloud-terrace",version:1},{id:"sky-sprint",name:"Sky Sprint",type:"speed",description:"Reach 700 altitude before the clock runs out. Keep bouncing, keep climbing.",difficulty:"bloom",goal:{type:"altitude",target:700,timeLimitTicks:6e3},seed:ri("challenge-sky-sprint"),theme:"dusk-canopy",version:1}];function ap(n){return ri("skybound-daily-"+n)}function op(n=new Date){return n.toISOString().slice(0,10)}function cc(n=op()){let e=ap(n),t=Object.keys(si),i=t[e%t.length];return{id:"daily-"+n,date:n,seed:e,difficulty:i,goal:{type:"none",target:0},theme:Jt[e%Jt.length].key,mechanics:["bud","drift","crumb","spring","wisp","thorn"],version:1}}var Ma=[{id:"steer-basics",name:"Find the Wind",theme:"dawn-meadow",difficulty:"sprout",mechanics:["bud"],seed:ri("tut-steer"),goal:{type:"altitude",target:60},steps:[{text:"You bounce on your own. Steer with \u2190 \u2192 (or A / D), or drag on touch.",check:{event:"land",count:1}},{text:"Steer left until the arrow fills.",check:{steerDir:-1,ticks:120}},{text:"Now steer right until the arrow fills.",check:{steerDir:1,ticks:120}},{text:"You can wrap around the screen edges \u2014 fly off one side, appear on the other!",check:{event:"land",count:3}}]},{id:"springs",name:"Spring Blooms",theme:"cloud-terrace",difficulty:"sprout",mechanics:["bud","spring"],seed:ri("tut-spring"),goal:{type:"altitude",target:120},steps:[{text:"Pink blossom pads launch you high. Land on one!",check:{event:"spring",count:1}},{text:"Ride the boost and climb!",check:{event:"land",count:2}}]},{id:"drifters",name:"Drifting Leaves",theme:"dusk-canopy",difficulty:"sprout",mechanics:["bud","drift"],seed:ri("tut-drift"),goal:{type:"altitude",target:150},steps:[{text:"Blue leaf pads slide sideways. Time your landing!",check:{event:"land",count:3}}]},{id:"crumbles",name:"Brittle Petals",theme:"frostline",difficulty:"bloom",mechanics:["bud","crumb"],seed:ri("tut-crumb"),goal:{type:"altitude",target:180},steps:[{text:"Brown petals break after one landing. Never plan to return to them.",check:{event:"land",count:4}}]}],qs=[{key:"first-ascent",name:"First Ascent",description:"Complete any stage or climb 300 altitude."},{key:"spring-master",name:"Spring Master",description:"Bounce on 25 spring pads in one run."},{key:"streak-tender",name:"Streak Tender",description:"Reach a landing chain of 30."},{key:"storm-summit",name:"Storm Summit",description:"Complete a Journey stage on Storm difficulty."},{key:"evergreen",name:"Evergreen",description:"Play on 7 different days."}];function lu(n){return Xs().filter(t=>t.mastery).map(t=>({stageId:t.id,name:t.name,completed:!!(n&&n.stagesCompleted&&n.stagesCompleted[t.id])}))}var Gu=0,jc=1,Hu=2;var kn=1,Wu=2,Cs=3,Yi=0,Dt=1,ei=2,ui=0,Ln=1,qr=2,Kc=3,Qc=4,Xu=5;var cn=100,qu=101,Yu=102,Zu=103,Ju=104,ju=200,Ku=201,Qu=202,$u=203,$a=204,eo=205,ed=206,td=207,id=208,nd=209,sd=210,rd=211,ad=212,od=213,ld=214,to=0,io=1,no=2,Dn=3,so=4,ro=5,ao=6,oo=7,ko=0,cd=1,hd=2,Si=0,Yr=1,Zr=2,Jr=3,zn=4,jr=5,Kr=6,Qr=7;var $c=300,pn=301,Vn=302,zo=303,Vo=304,$r=306,lo=1e3,Pi=1001,co=1002,Et=1003,ud=1004;var ea=1005;var Lt=1006,Go=1007;var mn=1008;var Yt=1009,eh=1010,th=1011,Rs=1012,Ho=1013,Mi=1014,di=1015,Ct=1016,Wo=1017,Xo=1018,Ps=1020,ih=35902,nh=35899,sh=1021,rh=1022,fi=1023,Di=1026,gn=1027,qo=1028,Yo=1029,xn=1030,Zo=1031;var Jo=1033,ta=33776,ia=33777,na=33778,sa=33779,jo=35840,Ko=35841,Qo=35842,$o=35843,el=36196,tl=37492,il=37496,nl=37488,sl=37489,ra=37490,rl=37491,al=37808,ol=37809,ll=37810,cl=37811,hl=37812,ul=37813,dl=37814,fl=37815,pl=37816,ml=37817,gl=37818,xl=37819,vl=37820,yl=37821,_l=36492,bl=36494,Sl=36495,Ml=36283,Tl=36284,aa=36285,Al=36286;var or=2300,ho=2301,Qa=2302,Fc=2303,Oc=2400,Bc=2401,kc=2402;var dd=3200;var oa=0,fd=1,Qi="",Ht="srgb",lr="srgb-linear",cr="linear",st="srgb";var Rn=7680;var zc=519,pd=512,md=513,gd=514,wl=515,xd=516,vd=517,El=518,yd=519,uo=35044;var ah="300 es",_i=2e3,ps=2001;function cp(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function hp(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function hr(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function _d(){let n=hr("canvas");return n.style.display="block",n}var cu={},ms=null;function ur(...n){let e="THREE."+n.shift();ms?ms("log",e,...n):console.log(e,...n)}function bd(n){let e=n[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=n[1];t&&t.isStackTrace?n[0]+=" "+t.getLocation():n[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return n}function Oe(...n){n=bd(n);let e="THREE."+n.shift();if(ms)ms("warn",e,...n);else{let t=n[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...n)}}function ke(...n){n=bd(n);let e="THREE."+n.shift();if(ms)ms("error",e,...n);else{let t=n[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...n)}}function In(...n){let e=n.join(" ");e in cu||(cu[e]=!0,Oe(...n))}function Sd(n,e,t){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}var Md={[to]:io,[no]:ao,[so]:oo,[Dn]:ro,[io]:to,[ao]:no,[oo]:so,[ro]:Dn},Ni=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){let i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){let i=this._listeners;if(i===void 0)return;let s=i[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let i=t[e.type];if(i!==void 0){e.target=this;let s=i.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},Vt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],hu=1234567,nr=Math.PI/180,gs=180/Math.PI;function Li(){let n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Vt[n&255]+Vt[n>>8&255]+Vt[n>>16&255]+Vt[n>>24&255]+"-"+Vt[e&255]+Vt[e>>8&255]+"-"+Vt[e>>16&15|64]+Vt[e>>24&255]+"-"+Vt[t&63|128]+Vt[t>>8&255]+"-"+Vt[t>>16&255]+Vt[t>>24&255]+Vt[i&255]+Vt[i>>8&255]+Vt[i>>16&255]+Vt[i>>24&255]).toLowerCase()}function Qe(n,e,t){return Math.max(e,Math.min(t,n))}function oh(n,e){return(n%e+e)%e}function up(n,e,t,i,s){return i+(n-e)*(s-i)/(t-e)}function dp(n,e,t){return n!==e?(t-n)/(e-n):0}function sr(n,e,t){return(1-t)*n+t*e}function fp(n,e,t,i){return sr(n,e,1-Math.exp(-t*i))}function pp(n,e=1){return e-Math.abs(oh(n,e*2)-e)}function mp(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))}function gp(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))}function xp(n,e){return n+Math.floor(Math.random()*(e-n+1))}function vp(n,e){return n+Math.random()*(e-n)}function yp(n){return n*(.5-Math.random())}function _p(n){n!==void 0&&(hu=n);let e=hu+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function bp(n){return n*nr}function Sp(n){return n*gs}function Mp(n){return(n&n-1)===0&&n!==0}function Tp(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function Ap(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function wp(n,e,t,i,s){let r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+i)/2),h=a((e+i)/2),d=r((e-i)/2),u=a((e-i)/2),f=r((i-e)/2),g=a((i-e)/2);switch(s){case"XYX":n.set(o*h,l*d,l*u,o*c);break;case"YZY":n.set(l*u,o*h,l*d,o*c);break;case"ZXZ":n.set(l*d,l*u,o*h,o*c);break;case"XZX":n.set(o*h,l*g,l*f,o*c);break;case"YXY":n.set(l*f,o*h,l*g,o*c);break;case"ZYZ":n.set(l*g,l*f,o*h,o*c);break;default:Oe("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function yi(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function ot(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var Cl={DEG2RAD:nr,RAD2DEG:gs,generateUUID:Li,clamp:Qe,euclideanModulo:oh,mapLinear:up,inverseLerp:dp,lerp:sr,damp:fp,pingpong:pp,smoothstep:mp,smootherstep:gp,randInt:xp,randFloat:vp,randFloatSpread:yp,seededRandom:_p,degToRad:bp,radToDeg:Sp,isPowerOfTwo:Mp,ceilPowerOfTwo:Tp,floorPowerOfTwo:Ap,setQuaternionFromProperEuler:wp,normalize:ot,denormalize:yi},ee=class n{static{n.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Qe(this.x,e.x,t.x),this.y=Qe(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Qe(this.x,e,t),this.y=Qe(this.y,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Qe(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(Qe(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*i-a*s+e.x,this.y=r*s+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},oi=class{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,a,o){let l=i[s+0],c=i[s+1],h=i[s+2],d=i[s+3],u=r[a+0],f=r[a+1],g=r[a+2],b=r[a+3];if(d!==b||l!==u||c!==f||h!==g){let m=l*u+c*f+h*g+d*b;m<0&&(u=-u,f=-f,g=-g,b=-b,m=-m);let p=1-o;if(m<.9995){let T=Math.acos(m),S=Math.sin(T);p=Math.sin(p*T)/S,o=Math.sin(o*T)/S,l=l*p+u*o,c=c*p+f*o,h=h*p+g*o,d=d*p+b*o}else{l=l*p+u*o,c=c*p+f*o,h=h*p+g*o,d=d*p+b*o;let T=1/Math.sqrt(l*l+c*c+h*h+d*d);l*=T,c*=T,h*=T,d*=T}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=d}static multiplyQuaternionsFlat(e,t,i,s,r,a){let o=i[s],l=i[s+1],c=i[s+2],h=i[s+3],d=r[a],u=r[a+1],f=r[a+2],g=r[a+3];return e[t]=o*g+h*d+l*f-c*u,e[t+1]=l*g+h*u+c*d-o*f,e[t+2]=c*g+h*f+o*u-l*d,e[t+3]=h*g-o*d-l*u-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(i/2),h=o(s/2),d=o(r/2),u=l(i/2),f=l(s/2),g=l(r/2);switch(a){case"XYZ":this._x=u*h*d+c*f*g,this._y=c*f*d-u*h*g,this._z=c*h*g+u*f*d,this._w=c*h*d-u*f*g;break;case"YXZ":this._x=u*h*d+c*f*g,this._y=c*f*d-u*h*g,this._z=c*h*g-u*f*d,this._w=c*h*d+u*f*g;break;case"ZXY":this._x=u*h*d-c*f*g,this._y=c*f*d+u*h*g,this._z=c*h*g+u*f*d,this._w=c*h*d-u*f*g;break;case"ZYX":this._x=u*h*d-c*f*g,this._y=c*f*d+u*h*g,this._z=c*h*g-u*f*d,this._w=c*h*d+u*f*g;break;case"YZX":this._x=u*h*d+c*f*g,this._y=c*f*d+u*h*g,this._z=c*h*g-u*f*d,this._w=c*h*d-u*f*g;break;case"XZY":this._x=u*h*d-c*f*g,this._y=c*f*d-u*h*g,this._z=c*h*g+u*f*d,this._w=c*h*d+u*f*g;break;default:Oe("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],d=t[10],u=i+o+d;if(u>0){let f=.5/Math.sqrt(u+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(a-s)*f}else if(i>o&&i>d){let f=2*Math.sqrt(1+i-o-d);this._w=(h-l)/f,this._x=.25*f,this._y=(s+a)/f,this._z=(r+c)/f}else if(o>d){let f=2*Math.sqrt(1+o-i-d);this._w=(r-c)/f,this._x=(s+a)/f,this._y=.25*f,this._z=(l+h)/f}else{let f=2*Math.sqrt(1+d-i-o);this._w=(a-s)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Qe(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=i*h+a*o+s*c-r*l,this._y=s*h+a*l+r*o-i*c,this._z=r*h+a*c+i*l-s*o,this._w=a*h-i*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let i=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(i=-i,s=-s,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){let c=Math.acos(o),h=Math.sin(c);l=Math.sin(l*c)/h,t=Math.sin(t*c)/h,this._x=this._x*l+i*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+i*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},L=class n{static{n.prototype.isVector3=!0}constructor(e=0,t=0,i=0){this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(uu.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(uu.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,i=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*i),h=2*(o*t-r*s),d=2*(r*i-a*t);return this.x=t+l*c+a*d-o*h,this.y=i+l*h+o*c-r*d,this.z=s+l*d+r*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Qe(this.x,e.x,t.x),this.y=Qe(this.y,e.y,t.y),this.z=Qe(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Qe(this.x,e,t),this.y=Qe(this.y,e,t),this.z=Qe(this.z,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Qe(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-i*l,this.z=i*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return hc.copy(this).projectOnVector(e),this.sub(hc)}reflect(e){return this.sub(hc.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(Qe(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},hc=new L,uu=new oi,We=class n{static{n.prototype.isMatrix3=!0}constructor(e,t,i,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,a,o,l,c)}set(e,t,i,s,r,a,o,l,c){let h=this.elements;return h[0]=e,h[1]=s,h[2]=o,h[3]=t,h[4]=r,h[5]=l,h[6]=i,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,a=i[0],o=i[3],l=i[6],c=i[1],h=i[4],d=i[7],u=i[2],f=i[5],g=i[8],b=s[0],m=s[3],p=s[6],T=s[1],S=s[4],y=s[7],A=s[2],M=s[5],C=s[8];return r[0]=a*b+o*T+l*A,r[3]=a*m+o*S+l*M,r[6]=a*p+o*y+l*C,r[1]=c*b+h*T+d*A,r[4]=c*m+h*S+d*M,r[7]=c*p+h*y+d*C,r[2]=u*b+f*T+g*A,r[5]=u*m+f*S+g*M,r[8]=u*p+f*y+g*C,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-i*r*h+i*o*l+s*r*c-s*a*l}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],d=h*a-o*c,u=o*l-h*r,f=c*r-a*l,g=t*d+i*u+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let b=1/g;return e[0]=d*b,e[1]=(s*c-h*i)*b,e[2]=(o*i-s*a)*b,e[3]=u*b,e[4]=(h*t-s*l)*b,e[5]=(s*r-o*t)*b,e[6]=f*b,e[7]=(i*l-c*t)*b,e[8]=(a*t-i*r)*b,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return In("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(uc.makeScale(e,t)),this}rotate(e){return In("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(uc.makeRotation(-e)),this}translate(e,t){return In("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(uc.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}},uc=new We,du=new We().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),fu=new We().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Ep(){let n={enabled:!0,workingColorSpace:lr,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===st&&(s.r=qi(s.r),s.g=qi(s.g),s.b=qi(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===st&&(s.r=fs(s.r),s.g=fs(s.g),s.b=fs(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Qi?cr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return In("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return In("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[lr]:{primaries:e,whitePoint:i,transfer:cr,toXYZ:du,fromXYZ:fu,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Ht},outputColorSpaceConfig:{drawingBufferColorSpace:Ht}},[Ht]:{primaries:e,whitePoint:i,transfer:st,toXYZ:du,fromXYZ:fu,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Ht}}}),n}var $e=Ep();function qi(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function fs(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var jn,fo=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{jn===void 0&&(jn=hr("canvas")),jn.width=e.width,jn.height=e.height;let s=jn.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),i=jn}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=hr("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=qi(r[a]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(qi(t[i]/255)*255):t[i]=qi(t[i]);return{data:t,width:e.width,height:e.height}}else return Oe("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Cp=0,xs=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Cp++}),this.uuid=Li(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(dc(s[a].image)):r.push(dc(s[a]))}else r=dc(s);i.url=r}return t||(e.images[this.uuid]=i),i}};function dc(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?fo.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(Oe("Texture: Unable to serialize Texture."),{})}var Rp=0,fc=new L,Bt=class n extends Ni{constructor(e=n.DEFAULT_IMAGE,t=n.DEFAULT_MAPPING,i=Pi,s=Pi,r=Lt,a=mn,o=fi,l=Yt,c=n.DEFAULT_ANISOTROPY,h=Qi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Rp++}),this.uuid=Li(),this.name="",this.source=new xs(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new ee(0,0),this.repeat=new ee(1,1),this.center=new ee(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new We,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(fc).x}get height(){return this.source.getSize(fc).y}get depth(){return this.source.getSize(fc).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let i=e[t];if(i===void 0){Oe(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Oe(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==$c)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case lo:e.x=e.x-Math.floor(e.x);break;case Pi:e.x=e.x<0?0:1;break;case co:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case lo:e.y=e.y-Math.floor(e.y);break;case Pi:e.y=e.y<0?0:1;break;case co:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Bt.DEFAULT_IMAGE=null;Bt.DEFAULT_MAPPING=$c;Bt.DEFAULT_ANISOTROPY=1;var yt=class n{static{n.prototype.isVector4=!0}constructor(e=0,t=0,i=0,s=1){this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*i+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*i+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*i+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*i+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r,l=e.elements,c=l[0],h=l[4],d=l[8],u=l[1],f=l[5],g=l[9],b=l[2],m=l[6],p=l[10];if(Math.abs(h-u)<.01&&Math.abs(d-b)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+u)<.1&&Math.abs(d+b)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let S=(c+1)/2,y=(f+1)/2,A=(p+1)/2,M=(h+u)/4,C=(d+b)/4,v=(g+m)/4;return S>y&&S>A?S<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(S),s=M/i,r=C/i):y>A?y<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(y),i=M/s,r=v/s):A<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(A),i=C/r,s=v/r),this.set(i,s,r,t),this}let T=Math.sqrt((m-g)*(m-g)+(d-b)*(d-b)+(u-h)*(u-h));return Math.abs(T)<.001&&(T=1),this.x=(m-g)/T,this.y=(d-b)/T,this.z=(u-h)/T,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Qe(this.x,e.x,t.x),this.y=Qe(this.y,e.y,t.y),this.z=Qe(this.z,e.z,t.z),this.w=Qe(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Qe(this.x,e,t),this.y=Qe(this.y,e,t),this.z=Qe(this.z,e,t),this.w=Qe(this.w,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Qe(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},po=class extends Ni{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Lt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new yt(0,0,e,t),this.scissorTest=!1,this.viewport=new yt(0,0,e,t),this.textures=[];let s={width:e,height:t,depth:i.depth},r=new Bt(s),a=i.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Lt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new xs(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},_t=class extends po{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},dr=class extends Bt{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Et,this.minFilter=Et,this.wrapR=Pi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var mo=class extends Bt{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Et,this.minFilter=Et,this.wrapR=Pi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var rt=class n{static{n.prototype.isMatrix4=!0}constructor(e,t,i,s,r,a,o,l,c,h,d,u,f,g,b,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,a,o,l,c,h,d,u,f,g,b,m)}set(e,t,i,s,r,a,o,l,c,h,d,u,f,g,b,m){let p=this.elements;return p[0]=e,p[4]=t,p[8]=i,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=h,p[10]=d,p[14]=u,p[3]=f,p[7]=g,p[11]=b,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,i=e.elements,s=1/Kn.setFromMatrixColumn(e,0).length(),r=1/Kn.setFromMatrixColumn(e,1).length(),a=1/Kn.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*a,t[9]=i[9]*a,t[10]=i[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,s=e.y,r=e.z,a=Math.cos(i),o=Math.sin(i),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),d=Math.sin(r);if(e.order==="XYZ"){let u=a*h,f=a*d,g=o*h,b=o*d;t[0]=l*h,t[4]=-l*d,t[8]=c,t[1]=f+g*c,t[5]=u-b*c,t[9]=-o*l,t[2]=b-u*c,t[6]=g+f*c,t[10]=a*l}else if(e.order==="YXZ"){let u=l*h,f=l*d,g=c*h,b=c*d;t[0]=u+b*o,t[4]=g*o-f,t[8]=a*c,t[1]=a*d,t[5]=a*h,t[9]=-o,t[2]=f*o-g,t[6]=b+u*o,t[10]=a*l}else if(e.order==="ZXY"){let u=l*h,f=l*d,g=c*h,b=c*d;t[0]=u-b*o,t[4]=-a*d,t[8]=g+f*o,t[1]=f+g*o,t[5]=a*h,t[9]=b-u*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){let u=a*h,f=a*d,g=o*h,b=o*d;t[0]=l*h,t[4]=g*c-f,t[8]=u*c+b,t[1]=l*d,t[5]=b*c+u,t[9]=f*c-g,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){let u=a*l,f=a*c,g=o*l,b=o*c;t[0]=l*h,t[4]=b-u*d,t[8]=g*d+f,t[1]=d,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=f*d+g,t[10]=u-b*d}else if(e.order==="XZY"){let u=a*l,f=a*c,g=o*l,b=o*c;t[0]=l*h,t[4]=-d,t[8]=c*h,t[1]=u*d+b,t[5]=a*h,t[9]=f*d-g,t[2]=g*d-f,t[6]=o*h,t[10]=b*d+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Pp,e,Ip)}lookAt(e,t,i){let s=this.elements;return jt.subVectors(e,t),jt.lengthSq()===0&&(jt.z=1),jt.normalize(),nn.crossVectors(i,jt),nn.lengthSq()===0&&(Math.abs(i.z)===1?jt.x+=1e-4:jt.z+=1e-4,jt.normalize(),nn.crossVectors(i,jt)),nn.normalize(),Ta.crossVectors(jt,nn),s[0]=nn.x,s[4]=Ta.x,s[8]=jt.x,s[1]=nn.y,s[5]=Ta.y,s[9]=jt.y,s[2]=nn.z,s[6]=Ta.z,s[10]=jt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,a=i[0],o=i[4],l=i[8],c=i[12],h=i[1],d=i[5],u=i[9],f=i[13],g=i[2],b=i[6],m=i[10],p=i[14],T=i[3],S=i[7],y=i[11],A=i[15],M=s[0],C=s[4],v=s[8],w=s[12],P=s[1],I=s[5],U=s[9],q=s[13],Y=s[2],B=s[6],X=s[10],W=s[14],$=s[3],re=s[7],de=s[11],ce=s[15];return r[0]=a*M+o*P+l*Y+c*$,r[4]=a*C+o*I+l*B+c*re,r[8]=a*v+o*U+l*X+c*de,r[12]=a*w+o*q+l*W+c*ce,r[1]=h*M+d*P+u*Y+f*$,r[5]=h*C+d*I+u*B+f*re,r[9]=h*v+d*U+u*X+f*de,r[13]=h*w+d*q+u*W+f*ce,r[2]=g*M+b*P+m*Y+p*$,r[6]=g*C+b*I+m*B+p*re,r[10]=g*v+b*U+m*X+p*de,r[14]=g*w+b*q+m*W+p*ce,r[3]=T*M+S*P+y*Y+A*$,r[7]=T*C+S*I+y*B+A*re,r[11]=T*v+S*U+y*X+A*de,r[15]=T*w+S*q+y*W+A*ce,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],d=e[6],u=e[10],f=e[14],g=e[3],b=e[7],m=e[11],p=e[15],T=l*f-c*u,S=o*f-c*d,y=o*u-l*d,A=a*f-c*h,M=a*u-l*h,C=a*d-o*h;return t*(b*T-m*S+p*y)-i*(g*T-m*A+p*M)+s*(g*S-b*A+p*C)-r*(g*y-b*M+m*C)}determinantAffine(){let e=this.elements,t=e[0],i=e[4],s=e[8],r=e[1],a=e[5],o=e[9],l=e[2],c=e[6],h=e[10];return t*(a*h-o*c)-i*(r*h-o*l)+s*(r*c-a*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],d=e[9],u=e[10],f=e[11],g=e[12],b=e[13],m=e[14],p=e[15],T=t*o-i*a,S=t*l-s*a,y=t*c-r*a,A=i*l-s*o,M=i*c-r*o,C=s*c-r*l,v=h*b-d*g,w=h*m-u*g,P=h*p-f*g,I=d*m-u*b,U=d*p-f*b,q=u*p-f*m,Y=T*q-S*U+y*I+A*P-M*w+C*v;if(Y===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let B=1/Y;return e[0]=(o*q-l*U+c*I)*B,e[1]=(s*U-i*q-r*I)*B,e[2]=(b*C-m*M+p*A)*B,e[3]=(u*M-d*C-f*A)*B,e[4]=(l*P-a*q-c*w)*B,e[5]=(t*q-s*P+r*w)*B,e[6]=(m*y-g*C-p*S)*B,e[7]=(h*C-u*y+f*S)*B,e[8]=(a*U-o*P+c*v)*B,e[9]=(i*P-t*U-r*v)*B,e[10]=(g*M-b*y+p*T)*B,e[11]=(d*y-h*M-f*T)*B,e[12]=(o*w-a*I-l*v)*B,e[13]=(t*I-i*w+s*v)*B,e[14]=(b*S-g*A-m*T)*B,e[15]=(h*A-d*S+u*T)*B,this}scale(e){let t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),s=Math.sin(t),r=1-i,a=e.x,o=e.y,l=e.z,c=r*a,h=r*o;return this.set(c*a+i,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+i,h*l-s*a,0,c*l-s*o,h*l+s*a,r*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,a){return this.set(1,i,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){let s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,h=a+a,d=o+o,u=r*c,f=r*h,g=r*d,b=a*h,m=a*d,p=o*d,T=l*c,S=l*h,y=l*d,A=i.x,M=i.y,C=i.z;return s[0]=(1-(b+p))*A,s[1]=(f+y)*A,s[2]=(g-S)*A,s[3]=0,s[4]=(f-y)*M,s[5]=(1-(u+p))*M,s[6]=(m+T)*M,s[7]=0,s[8]=(g+S)*C,s[9]=(m-T)*C,s[10]=(1-(u+b))*C,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return i.set(1,1,1),t.identity(),this;let a=Kn.set(s[0],s[1],s[2]).length(),o=Kn.set(s[4],s[5],s[6]).length(),l=Kn.set(s[8],s[9],s[10]).length();r<0&&(a=-a),gi.copy(this);let c=1/a,h=1/o,d=1/l;return gi.elements[0]*=c,gi.elements[1]*=c,gi.elements[2]*=c,gi.elements[4]*=h,gi.elements[5]*=h,gi.elements[6]*=h,gi.elements[8]*=d,gi.elements[9]*=d,gi.elements[10]*=d,t.setFromRotationMatrix(gi),i.x=a,i.y=o,i.z=l,this}makePerspective(e,t,i,s,r,a,o=_i,l=!1){let c=this.elements,h=2*r/(t-e),d=2*r/(i-s),u=(t+e)/(t-e),f=(i+s)/(i-s),g,b;if(l)g=r/(a-r),b=a*r/(a-r);else if(o===_i)g=-(a+r)/(a-r),b=-2*a*r/(a-r);else if(o===ps)g=-a/(a-r),b=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=d,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=b,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,i,s,r,a,o=_i,l=!1){let c=this.elements,h=2/(t-e),d=2/(i-s),u=-(t+e)/(t-e),f=-(i+s)/(i-s),g,b;if(l)g=1/(a-r),b=a/(a-r);else if(o===_i)g=-2/(a-r),b=-(a+r)/(a-r);else if(o===ps)g=-1/(a-r),b=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=d,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=g,c[14]=b,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}},Kn=new L,gi=new rt,Pp=new L(0,0,0),Ip=new L(1,1,1),nn=new L,Ta=new L,jt=new L,pu=new rt,mu=new oi,li=class n{constructor(e=0,t=0,i=0,s=n.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],h=s[9],d=s[2],u=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(Qe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Qe(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(Qe(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Qe(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(u,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Qe(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-Qe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:Oe("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return pu.makeRotationFromQuaternion(e),this.setFromRotationMatrix(pu,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return mu.setFromEuler(this),this.setFromQuaternion(mu,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};li.DEFAULT_ORDER="XYZ";var fr=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Lp=0,gu=new L,Qn=new oi,zi=new rt,Aa=new L,Ys=new L,Dp=new L,Np=new oi,xu=new L(1,0,0),vu=new L(0,1,0),yu=new L(0,0,1),_u={type:"added"},Up={type:"removed"},$n={type:"childadded",child:null},pc={type:"childremoved",child:null},It=class n extends Ni{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Lp++}),this.uuid=Li(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let e=new L,t=new li,i=new oi,s=new L(1,1,1);function r(){i.setFromEuler(t,!1)}function a(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new rt},normalMatrix:{value:new We}}),this.matrix=new rt,this.matrixWorld=new rt,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new fr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Qn.setFromAxisAngle(e,t),this.quaternion.multiply(Qn),this}rotateOnWorldAxis(e,t){return Qn.setFromAxisAngle(e,t),this.quaternion.premultiply(Qn),this}rotateX(e){return this.rotateOnAxis(xu,e)}rotateY(e){return this.rotateOnAxis(vu,e)}rotateZ(e){return this.rotateOnAxis(yu,e)}translateOnAxis(e,t){return gu.copy(e).applyQuaternion(this.quaternion),this.position.add(gu.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(xu,e)}translateY(e){return this.translateOnAxis(vu,e)}translateZ(e){return this.translateOnAxis(yu,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(zi.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?Aa.copy(e):Aa.set(e,t,i);let s=this.parent;this.updateWorldMatrix(!0,!1),Ys.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?zi.lookAt(Ys,Aa,this.up):zi.lookAt(Aa,Ys,this.up),this.quaternion.setFromRotationMatrix(zi),s&&(zi.extractRotation(s.matrixWorld),Qn.setFromRotationMatrix(zi),this.quaternion.premultiply(Qn.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(ke("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(_u),$n.child=e,this.dispatchEvent($n),$n.child=null):ke("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Up),pc.child=e,this.dispatchEvent(pc),pc.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),zi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),zi.multiply(e.parent.matrixWorld)),e.applyMatrix4(zi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(_u),$n.child=e,this.dispatchEvent($n),$n.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){let a=this.children[i].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ys,e,Dp),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ys,Np,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,i=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*i-r[8]*s,r[13]+=i-r[1]*t-r[5]*i-r[9]*s,r[14]+=s-r[2]*t-r[6]*i-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t,i=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),t===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,i)}}toJSON(e){let t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),this.static!==!1&&(s.static=this.static),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let d=l[c];r(e.shapes,d)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){let o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),d=a(e.shapes),u=a(e.skeletons),f=a(e.animations),g=a(e.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),d.length>0&&(i.shapes=d),u.length>0&&(i.skeletons=u),f.length>0&&(i.animations=f),g.length>0&&(i.nodes=g)}return i.object=s,i;function a(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){let s=e.children[i];this.add(s.clone())}return this}};It.DEFAULT_UP=new L(0,1,0);It.DEFAULT_MATRIX_AUTO_UPDATE=!0;It.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Ii=class extends It{constructor(){super(),this.isGroup=!0,this.type="Group"}},Fp={type:"move"},vs=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ii,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ii,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new L,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new L),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ii,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new L,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new L,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(let b of e.hand.values()){let m=t.getJointPose(b,i),p=this._getHandJoint(c,b);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}let h=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],u=h.position.distanceTo(d.position),f=.02,g=.005;c.inputState.pinching&&u>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&u<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Fp)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new Ii;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}},Td={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},sn={h:0,s:0,l:0},wa={h:0,s:0,l:0};function mc(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}var Ee=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Ht){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,$e.colorSpaceToWorking(this,t),this}setRGB(e,t,i,s=$e.workingColorSpace){return this.r=e,this.g=t,this.b=i,$e.colorSpaceToWorking(this,s),this}setHSL(e,t,i,s=$e.workingColorSpace){if(e=oh(e,1),t=Qe(t,0,1),i=Qe(i,0,1),t===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+t):i+t-i*t,a=2*i-r;this.r=mc(a,r,e+1/3),this.g=mc(a,r,e),this.b=mc(a,r,e-1/3)}return $e.colorSpaceToWorking(this,s),this}setStyle(e,t=Ht){function i(r){r!==void 0&&parseFloat(r)<1&&Oe("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Oe("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Oe("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Ht){let i=Td[e.toLowerCase()];return i!==void 0?this.setHex(i,t):Oe("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=qi(e.r),this.g=qi(e.g),this.b=qi(e.b),this}copyLinearToSRGB(e){return this.r=fs(e.r),this.g=fs(e.g),this.b=fs(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Ht){return $e.workingToColorSpace(Gt.copy(this),e),Math.round(Qe(Gt.r*255,0,255))*65536+Math.round(Qe(Gt.g*255,0,255))*256+Math.round(Qe(Gt.b*255,0,255))}getHexString(e=Ht){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=$e.workingColorSpace){$e.workingToColorSpace(Gt.copy(this),t);let i=Gt.r,s=Gt.g,r=Gt.b,a=Math.max(i,s,r),o=Math.min(i,s,r),l,c,h=(o+a)/2;if(o===a)l=0,c=0;else{let d=a-o;switch(c=h<=.5?d/(a+o):d/(2-a-o),a){case i:l=(s-r)/d+(s<r?6:0);break;case s:l=(r-i)/d+2;break;case r:l=(i-s)/d+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=$e.workingColorSpace){return $e.workingToColorSpace(Gt.copy(this),t),e.r=Gt.r,e.g=Gt.g,e.b=Gt.b,e}getStyle(e=Ht){$e.workingToColorSpace(Gt.copy(this),e);let t=Gt.r,i=Gt.g,s=Gt.b;return e!==Ht?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,t,i){return this.getHSL(sn),this.setHSL(sn.h+e,sn.s+t,sn.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(sn),e.getHSL(wa);let i=sr(sn.h,wa.h,t),s=sr(sn.s,wa.s,t),r=sr(sn.l,wa.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Gt=new Ee;Ee.NAMES=Td;var pr=class n{constructor(e,t=1,i=1e3){this.isFog=!0,this.name="",this.color=new Ee(e),this.near=t,this.far=i}clone(){return new n(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Nn=class extends It{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new li,this.environmentIntensity=1,this.environmentRotation=new li,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},xi=new L,Vi=new L,gc=new L,Gi=new L,es=new L,ts=new L,bu=new L,xc=new L,vc=new L,yc=new L,_c=new yt,bc=new yt,Sc=new yt,Xi=class n{constructor(e=new L,t=new L,i=new L){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),xi.subVectors(e,t),s.cross(xi);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){xi.subVectors(s,t),Vi.subVectors(i,t),gc.subVectors(e,t);let a=xi.dot(xi),o=xi.dot(Vi),l=xi.dot(gc),c=Vi.dot(Vi),h=Vi.dot(gc),d=a*c-o*o;if(d===0)return r.set(0,0,0),null;let u=1/d,f=(c*l-o*h)*u,g=(a*h-o*l)*u;return r.set(1-f-g,g,f)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,Gi)===null?!1:Gi.x>=0&&Gi.y>=0&&Gi.x+Gi.y<=1}static getInterpolation(e,t,i,s,r,a,o,l){return this.getBarycoord(e,t,i,s,Gi)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Gi.x),l.addScaledVector(a,Gi.y),l.addScaledVector(o,Gi.z),l)}static getInterpolatedAttribute(e,t,i,s,r,a){return _c.setScalar(0),bc.setScalar(0),Sc.setScalar(0),_c.fromBufferAttribute(e,t),bc.fromBufferAttribute(e,i),Sc.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(_c,r.x),a.addScaledVector(bc,r.y),a.addScaledVector(Sc,r.z),a}static isFrontFacing(e,t,i,s){return xi.subVectors(i,t),Vi.subVectors(e,t),xi.cross(Vi).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return xi.subVectors(this.c,this.b),Vi.subVectors(this.a,this.b),xi.cross(Vi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return n.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,r){return n.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,s=this.b,r=this.c,a,o;es.subVectors(s,i),ts.subVectors(r,i),xc.subVectors(e,i);let l=es.dot(xc),c=ts.dot(xc);if(l<=0&&c<=0)return t.copy(i);vc.subVectors(e,s);let h=es.dot(vc),d=ts.dot(vc);if(h>=0&&d<=h)return t.copy(s);let u=l*d-h*c;if(u<=0&&l>=0&&h<=0)return a=l/(l-h),t.copy(i).addScaledVector(es,a);yc.subVectors(e,r);let f=es.dot(yc),g=ts.dot(yc);if(g>=0&&f<=g)return t.copy(r);let b=f*c-l*g;if(b<=0&&c>=0&&g<=0)return o=c/(c-g),t.copy(i).addScaledVector(ts,o);let m=h*g-f*d;if(m<=0&&d-h>=0&&f-g>=0)return bu.subVectors(r,s),o=(d-h)/(d-h+(f-g)),t.copy(s).addScaledVector(bu,o);let p=1/(m+b+u);return a=b*p,o=u*p,t.copy(i).addScaledVector(es,a).addScaledVector(ts,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Ui=class{constructor(e=new L(1/0,1/0,1/0),t=new L(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(vi.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(vi.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=vi.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,vi):vi.fromBufferAttribute(r,a),vi.applyMatrix4(e.matrixWorld),this.expandByPoint(vi);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Ea.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Ea.copy(i.boundingBox)),Ea.applyMatrix4(e.matrixWorld),this.union(Ea)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,vi),vi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Zs),Ca.subVectors(this.max,Zs),is.subVectors(e.a,Zs),ns.subVectors(e.b,Zs),ss.subVectors(e.c,Zs),rn.subVectors(ns,is),an.subVectors(ss,ns),An.subVectors(is,ss);let t=[0,-rn.z,rn.y,0,-an.z,an.y,0,-An.z,An.y,rn.z,0,-rn.x,an.z,0,-an.x,An.z,0,-An.x,-rn.y,rn.x,0,-an.y,an.x,0,-An.y,An.x,0];return!Mc(t,is,ns,ss,Ca)||(t=[1,0,0,0,1,0,0,0,1],!Mc(t,is,ns,ss,Ca))?!1:(Ra.crossVectors(rn,an),t=[Ra.x,Ra.y,Ra.z],Mc(t,is,ns,ss,Ca))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,vi).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(vi).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Hi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Hi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Hi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Hi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Hi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Hi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Hi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Hi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Hi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Hi=[new L,new L,new L,new L,new L,new L,new L,new L],vi=new L,Ea=new Ui,is=new L,ns=new L,ss=new L,rn=new L,an=new L,An=new L,Zs=new L,Ca=new L,Ra=new L,wn=new L;function Mc(n,e,t,i,s){for(let r=0,a=n.length-3;r<=a;r+=3){wn.fromArray(n,r);let o=s.x*Math.abs(wn.x)+s.y*Math.abs(wn.y)+s.z*Math.abs(wn.z),l=e.dot(wn),c=t.dot(wn),h=i.dot(wn);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var Rt=new L,Pa=new ee,Op=0,Pt=class extends Ni{constructor(e,t,i=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Op++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=uo,this.updateRanges=[],this.gpuType=di,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Pa.fromBufferAttribute(this,t),Pa.applyMatrix3(e),this.setXY(t,Pa.x,Pa.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Rt.fromBufferAttribute(this,t),Rt.applyMatrix3(e),this.setXYZ(t,Rt.x,Rt.y,Rt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Rt.fromBufferAttribute(this,t),Rt.applyMatrix4(e),this.setXYZ(t,Rt.x,Rt.y,Rt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Rt.fromBufferAttribute(this,t),Rt.applyNormalMatrix(e),this.setXYZ(t,Rt.x,Rt.y,Rt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Rt.fromBufferAttribute(this,t),Rt.transformDirection(e),this.setXYZ(t,Rt.x,Rt.y,Rt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=yi(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=ot(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=yi(t,this.array)),t}setX(e,t){return this.normalized&&(t=ot(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=yi(t,this.array)),t}setY(e,t){return this.normalized&&(t=ot(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=yi(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ot(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=yi(t,this.array)),t}setW(e,t){return this.normalized&&(t=ot(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=ot(t,this.array),i=ot(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=ot(t,this.array),i=ot(i,this.array),s=ot(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=ot(t,this.array),i=ot(i,this.array),s=ot(s,this.array),r=ot(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==uo&&(e.usage=this.usage),e}dispose(){this.dispatchEvent({type:"dispose"})}};var mr=class extends Pt{constructor(e,t,i){super(new Uint16Array(e),t,i)}};var gr=class extends Pt{constructor(e,t,i){super(new Uint32Array(e),t,i)}};var lt=class extends Pt{constructor(e,t,i){super(new Float32Array(e),t,i)}},Bp=new Ui,Js=new L,Tc=new L,Zi=class{constructor(e=new L,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):Bp.setFromPoints(e).getCenter(i);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Js.subVectors(e,this.center);let t=Js.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(Js,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Tc.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Js.copy(e.center).add(Tc)),this.expandByPoint(Js.copy(e.center).sub(Tc))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},kp=0,ai=new rt,Ac=new It,rs=new L,Kt=new Ui,js=new Ui,Ot=new L,Tt=class n extends Ni{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:kp++}),this.uuid=Li(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(cp(e)?gr:mr)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new We().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return ai.makeRotationFromQuaternion(e),this.applyMatrix4(ai),this}rotateX(e){return ai.makeRotationX(e),this.applyMatrix4(ai),this}rotateY(e){return ai.makeRotationY(e),this.applyMatrix4(ai),this}rotateZ(e){return ai.makeRotationZ(e),this.applyMatrix4(ai),this}translate(e,t,i){return ai.makeTranslation(e,t,i),this.applyMatrix4(ai),this}scale(e,t,i){return ai.makeScale(e,t,i),this.applyMatrix4(ai),this}lookAt(e){return Ac.lookAt(e),Ac.updateMatrix(),this.applyMatrix4(Ac.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(rs).negate(),this.translate(rs.x,rs.y,rs.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let i=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new lt(i,3))}else{let i=Math.min(e.length,t.count);for(let s=0;s<i;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Oe("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ui);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ke("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new L(-1/0,-1/0,-1/0),new L(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){let r=t[i];Kt.setFromBufferAttribute(r),this.morphTargetsRelative?(Ot.addVectors(this.boundingBox.min,Kt.min),this.boundingBox.expandByPoint(Ot),Ot.addVectors(this.boundingBox.max,Kt.max),this.boundingBox.expandByPoint(Ot)):(this.boundingBox.expandByPoint(Kt.min),this.boundingBox.expandByPoint(Kt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&ke('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Zi);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ke("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new L,1/0);return}if(e){let i=this.boundingSphere.center;if(Kt.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];js.setFromBufferAttribute(o),this.morphTargetsRelative?(Ot.addVectors(Kt.min,js.min),Kt.expandByPoint(Ot),Ot.addVectors(Kt.max,js.max),Kt.expandByPoint(Ot)):(Kt.expandByPoint(js.min),Kt.expandByPoint(js.max))}Kt.getCenter(i);let s=0;for(let r=0,a=e.count;r<a;r++)Ot.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(Ot));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Ot.fromBufferAttribute(o,c),l&&(rs.fromBufferAttribute(e,c),Ot.add(rs)),s=Math.max(s,i.distanceToSquared(Ot))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&ke('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){ke("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=t.position,s=t.normal,r=t.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==i.count)&&(a=new Pt(new Float32Array(4*i.count),4),this.setAttribute("tangent",a));let o=[],l=[];for(let v=0;v<i.count;v++)o[v]=new L,l[v]=new L;let c=new L,h=new L,d=new L,u=new ee,f=new ee,g=new ee,b=new L,m=new L;function p(v,w,P){c.fromBufferAttribute(i,v),h.fromBufferAttribute(i,w),d.fromBufferAttribute(i,P),u.fromBufferAttribute(r,v),f.fromBufferAttribute(r,w),g.fromBufferAttribute(r,P),h.sub(c),d.sub(c),f.sub(u),g.sub(u);let I=1/(f.x*g.y-g.x*f.y);isFinite(I)&&(b.copy(h).multiplyScalar(g.y).addScaledVector(d,-f.y).multiplyScalar(I),m.copy(d).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(I),o[v].add(b),o[w].add(b),o[P].add(b),l[v].add(m),l[w].add(m),l[P].add(m))}let T=this.groups;T.length===0&&(T=[{start:0,count:e.count}]);for(let v=0,w=T.length;v<w;++v){let P=T[v],I=P.start,U=P.count;for(let q=I,Y=I+U;q<Y;q+=3)p(e.getX(q+0),e.getX(q+1),e.getX(q+2))}let S=new L,y=new L,A=new L,M=new L;function C(v){A.fromBufferAttribute(s,v),M.copy(A);let w=o[v];S.copy(w),S.sub(A.multiplyScalar(A.dot(w))).normalize(),y.crossVectors(M,w);let I=y.dot(l[v])<0?-1:1;a.setXYZW(v,S.x,S.y,S.z,I)}for(let v=0,w=T.length;v<w;++v){let P=T[v],I=P.start,U=P.count;for(let q=I,Y=I+U;q<Y;q+=3)C(e.getX(q+0)),C(e.getX(q+1)),C(e.getX(q+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==t.count)i=new Pt(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let u=0,f=i.count;u<f;u++)i.setXYZ(u,0,0,0);let s=new L,r=new L,a=new L,o=new L,l=new L,c=new L,h=new L,d=new L;if(e)for(let u=0,f=e.count;u<f;u+=3){let g=e.getX(u+0),b=e.getX(u+1),m=e.getX(u+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,b),a.fromBufferAttribute(t,m),h.subVectors(a,r),d.subVectors(s,r),h.cross(d),o.fromBufferAttribute(i,g),l.fromBufferAttribute(i,b),c.fromBufferAttribute(i,m),o.add(h),l.add(h),c.add(h),i.setXYZ(g,o.x,o.y,o.z),i.setXYZ(b,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let u=0,f=t.count;u<f;u+=3)s.fromBufferAttribute(t,u+0),r.fromBufferAttribute(t,u+1),a.fromBufferAttribute(t,u+2),h.subVectors(a,r),d.subVectors(s,r),h.cross(d),i.setXYZ(u+0,h.x,h.y,h.z),i.setXYZ(u+1,h.x,h.y,h.z),i.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Ot.fromBufferAttribute(e,t),Ot.normalize(),e.setXYZ(t,Ot.x,Ot.y,Ot.z)}toNonIndexed(){function e(o,l){let c=o.array,h=o.itemSize,d=o.normalized,u=new c.constructor(l.length*h),f=0,g=0;for(let b=0,m=l.length;b<m;b++){o.isInterleavedBufferAttribute?f=l[b]*o.data.stride+o.offset:f=l[b]*h;for(let p=0;p<h;p++)u[g++]=c[f++]}return new Pt(u,h,d)}if(this.index===null)return Oe("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new n,i=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=e(l,i);t.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let h=0,d=c.length;h<d;h++){let u=c[h],f=e(u,i);l.push(f)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let l in i){let c=i[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let d=0,u=c.length;d<u;d++){let f=c[d];h.push(f.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone());let s=e.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(t))}let r=e.morphAttributes;for(let c in r){let h=[],d=r[c];for(let u=0,f=d.length;u<f;u++)h.push(d[u].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let c=0,h=a.length;c<h;c++){let d=a[c];this.addGroup(d.start,d.count,d.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},go=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=uo,this.updateRanges=[],this.version=0,this.uuid=Li()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[i+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Li()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Li()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},Xt=new L,xr=class n{constructor(e,t,i,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)Xt.fromBufferAttribute(this,t),Xt.applyMatrix4(e),this.setXYZ(t,Xt.x,Xt.y,Xt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Xt.fromBufferAttribute(this,t),Xt.applyNormalMatrix(e),this.setXYZ(t,Xt.x,Xt.y,Xt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Xt.fromBufferAttribute(this,t),Xt.transformDirection(e),this.setXYZ(t,Xt.x,Xt.y,Xt.z);return this}getComponent(e,t){let i=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(i=yi(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=ot(i,this.array)),this.data.array[e*this.data.stride+this.offset+t]=i,this}setX(e,t){return this.normalized&&(t=ot(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=ot(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=ot(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=ot(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=yi(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=yi(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=yi(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=yi(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=ot(t,this.array),i=ot(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=ot(t,this.array),i=ot(i,this.array),s=ot(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=ot(t,this.array),i=ot(i,this.array),s=ot(s,this.array),r=ot(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){ur("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let i=0;i<this.count;i++){let s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new Pt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new n(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){ur("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let i=0;i<this.count;i++){let s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},zp=0,bi=class extends Ni{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:zp++}),this.uuid=Li(),this.name="",this.type="Material",this.blending=Ln,this.side=Yi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=$a,this.blendDst=eo,this.blendEquation=cn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ee(0,0,0),this.blendAlpha=0,this.depthFunc=Dn,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=zc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Rn,this.stencilZFail=Rn,this.stencilZPass=Rn,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){Oe(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Oe(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector2&&i&&i.isVector2||s&&s.isEuler&&i&&i.isEuler||s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==Ln&&(i.blending=this.blending),this.side!==Yi&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==$a&&(i.blendSrc=this.blendSrc),this.blendDst!==eo&&(i.blendDst=this.blendDst),this.blendEquation!==cn&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==Dn&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==zc&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Rn&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Rn&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Rn&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.allowOverride===!1&&(i.allowOverride=!1),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(i.textures=r),a.length>0&&(i.images=a)}return i}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Ee().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let i=e.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new ee().fromArray(i)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new ee().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},ys=class extends bi{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Ee(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},as,Ks=new L,os=new L,ls=new L,cs=new ee,Qs=new ee,Ad=new rt,Ia=new L,$s=new L,La=new L,Su=new ee,wc=new ee,Mu=new ee,vr=class extends It{constructor(e=new ys){if(super(),this.isSprite=!0,this.type="Sprite",as===void 0){as=new Tt;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new go(t,5);as.setIndex([0,1,2,0,2,3]),as.setAttribute("position",new xr(i,3,0,!1)),as.setAttribute("uv",new xr(i,2,3,!1))}this.geometry=as,this.material=e,this.center=new ee(.5,.5),this.count=1}raycast(e,t){e.camera===null&&ke('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),os.setFromMatrixScale(this.matrixWorld),Ad.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),ls.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&os.multiplyScalar(-ls.z);let i=this.material.rotation,s,r;i!==0&&(r=Math.cos(i),s=Math.sin(i));let a=this.center;Da(Ia.set(-.5,-.5,0),ls,a,os,s,r),Da($s.set(.5,-.5,0),ls,a,os,s,r),Da(La.set(.5,.5,0),ls,a,os,s,r),Su.set(0,0),wc.set(1,0),Mu.set(1,1);let o=e.ray.intersectTriangle(Ia,$s,La,!1,Ks);if(o===null&&(Da($s.set(-.5,.5,0),ls,a,os,s,r),wc.set(0,1),o=e.ray.intersectTriangle(Ia,La,$s,!1,Ks),o===null))return;let l=e.ray.origin.distanceTo(Ks);l<e.near||l>e.far||t.push({distance:l,point:Ks.clone(),uv:Xi.getInterpolation(Ks,Ia,$s,La,Su,wc,Mu,new ee),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function Da(n,e,t,i,s,r){cs.subVectors(n,t).addScalar(.5).multiply(i),s!==void 0?(Qs.x=r*cs.x-s*cs.y,Qs.y=s*cs.x+r*cs.y):Qs.copy(cs),n.copy(e),n.x+=Qs.x,n.y+=Qs.y,n.applyMatrix4(Ad)}var Wi=new L,Ec=new L,Na=new L,on=new L,Cc=new L,Ua=new L,Rc=new L,yr=class{constructor(e=new L,t=new L(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Wi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Wi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Wi.copy(this.origin).addScaledVector(this.direction,t),Wi.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){Ec.copy(e).add(t).multiplyScalar(.5),Na.copy(t).sub(e).normalize(),on.copy(this.origin).sub(Ec);let r=e.distanceTo(t)*.5,a=-this.direction.dot(Na),o=on.dot(this.direction),l=-on.dot(Na),c=on.lengthSq(),h=Math.abs(1-a*a),d,u,f,g;if(h>0)if(d=a*l-o,u=a*o-l,g=r*h,d>=0)if(u>=-g)if(u<=g){let b=1/h;d*=b,u*=b,f=d*(d+a*u+2*o)+u*(a*d+u+2*l)+c}else u=r,d=Math.max(0,-(a*u+o)),f=-d*d+u*(u+2*l)+c;else u=-r,d=Math.max(0,-(a*u+o)),f=-d*d+u*(u+2*l)+c;else u<=-g?(d=Math.max(0,-(-a*r+o)),u=d>0?-r:Math.min(Math.max(-r,-l),r),f=-d*d+u*(u+2*l)+c):u<=g?(d=0,u=Math.min(Math.max(-r,-l),r),f=u*(u+2*l)+c):(d=Math.max(0,-(a*r+o)),u=d>0?r:Math.min(Math.max(-r,-l),r),f=-d*d+u*(u+2*l)+c);else u=a>0?-r:r,d=Math.max(0,-(a*u+o)),f=-d*d+u*(u+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(Ec).addScaledVector(Na,u),f}intersectSphere(e,t){Wi.subVectors(e.center,this.origin);let i=Wi.dot(this.direction),s=Wi.dot(Wi)-i*i,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=i-a,l=i+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,a,o,l,c=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,u=this.origin;return c>=0?(i=(e.min.x-u.x)*c,s=(e.max.x-u.x)*c):(i=(e.max.x-u.x)*c,s=(e.min.x-u.x)*c),h>=0?(r=(e.min.y-u.y)*h,a=(e.max.y-u.y)*h):(r=(e.max.y-u.y)*h,a=(e.min.y-u.y)*h),i>a||r>s||((r>i||isNaN(i))&&(i=r),(a<s||isNaN(s))&&(s=a),d>=0?(o=(e.min.z-u.z)*d,l=(e.max.z-u.z)*d):(o=(e.max.z-u.z)*d,l=(e.min.z-u.z)*d),i>l||o>s)||((o>i||i!==i)&&(i=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,Wi)!==null}intersectTriangle(e,t,i,s,r){Cc.subVectors(t,e),Ua.subVectors(i,e),Rc.crossVectors(Cc,Ua);let a=this.direction.dot(Rc),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;on.subVectors(this.origin,e);let l=o*this.direction.dot(Ua.crossVectors(on,Ua));if(l<0)return null;let c=o*this.direction.dot(Cc.cross(on));if(c<0||l+c>a)return null;let h=-o*on.dot(Rc);return h<0?null:this.at(h/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},ci=class extends bi{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ee(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new li,this.combine=ko,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Tu=new rt,En=new yr,Fa=new Zi,Au=new L,Oa=new L,Ba=new L,ka=new L,Pc=new L,za=new L,wu=new L,Va=new L,tt=class extends It{constructor(e=new Tt,t=new ci){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,a=i.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){za.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=o[l],d=r[l];h!==0&&(Pc.fromBufferAttribute(d,e),a?za.addScaledVector(Pc,h):za.addScaledVector(Pc.sub(t),h))}t.add(za)}return t}raycast(e,t){let i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Fa.copy(i.boundingSphere),Fa.applyMatrix4(r),En.copy(e.ray).recast(e.near),!(Fa.containsPoint(En.origin)===!1&&(En.intersectSphere(Fa,Au)===null||En.origin.distanceToSquared(Au)>(e.far-e.near)**2))&&(Tu.copy(r).invert(),En.copy(e.ray).applyMatrix4(Tu),!(i.boundingBox!==null&&En.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,En)))}_computeIntersections(e,t,i){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,d=r.attributes.normal,u=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,b=u.length;g<b;g++){let m=u[g],p=a[m.materialIndex],T=Math.max(m.start,f.start),S=Math.min(o.count,Math.min(m.start+m.count,f.start+f.count));for(let y=T,A=S;y<A;y+=3){let M=o.getX(y),C=o.getX(y+1),v=o.getX(y+2);s=Ga(this,p,e,i,c,h,d,M,C,v),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,f.start),b=Math.min(o.count,f.start+f.count);for(let m=g,p=b;m<p;m+=3){let T=o.getX(m),S=o.getX(m+1),y=o.getX(m+2);s=Ga(this,a,e,i,c,h,d,T,S,y),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,b=u.length;g<b;g++){let m=u[g],p=a[m.materialIndex],T=Math.max(m.start,f.start),S=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let y=T,A=S;y<A;y+=3){let M=y,C=y+1,v=y+2;s=Ga(this,p,e,i,c,h,d,M,C,v),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,f.start),b=Math.min(l.count,f.start+f.count);for(let m=g,p=b;m<p;m+=3){let T=m,S=m+1,y=m+2;s=Ga(this,a,e,i,c,h,d,T,S,y),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function Vp(n,e,t,i,s,r,a,o){let l;if(e.side===Dt?l=i.intersectTriangle(a,r,s,!0,o):l=i.intersectTriangle(s,r,a,e.side===Yi,o),l===null)return null;Va.copy(o),Va.applyMatrix4(n.matrixWorld);let c=t.ray.origin.distanceTo(Va);return c<t.near||c>t.far?null:{distance:c,point:Va.clone(),object:n}}function Ga(n,e,t,i,s,r,a,o,l,c){n.getVertexPosition(o,Oa),n.getVertexPosition(l,Ba),n.getVertexPosition(c,ka);let h=Vp(n,e,t,i,Oa,Ba,ka,wu);if(h){let d=new L;Xi.getBarycoord(wu,Oa,Ba,ka,d),s&&(h.uv=Xi.getInterpolatedAttribute(s,o,l,c,d,new ee)),r&&(h.uv1=Xi.getInterpolatedAttribute(r,o,l,c,d,new ee)),a&&(h.normal=Xi.getInterpolatedAttribute(a,o,l,c,d,new L),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let u={a:o,b:l,c,normal:new L,materialIndex:0};Xi.getNormal(Oa,Ba,ka,u.normal),h.face=u,h.barycoord=d}return h}var _r=class extends Bt{constructor(e=null,t=1,i=1,s,r,a,o,l,c=Et,h=Et,d,u){super(null,a,o,l,c,h,s,r,d,u),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var br=class extends Pt{constructor(e,t,i,s=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},hs=new rt,Eu=new rt,Ha=[],Cu=new Ui,Gp=new rt,er=new tt,tr=new Zi,Ji=class extends tt{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new br(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<i;s++)this.setMatrixAt(s,Gp)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Ui),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,hs),Cu.copy(e.boundingBox).applyMatrix4(hs),this.boundingBox.union(Cu)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Zi),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,hs),tr.copy(e.boundingSphere).applyMatrix4(hs),this.boundingSphere.union(tr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let i=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=i.length+1,a=e*r+1;for(let o=0;o<i.length;o++)i[o]=s[a+o]}raycast(e,t){let i=this.matrixWorld,s=this.count;if(er.geometry=this.geometry,er.material=this.material,er.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),tr.copy(this.boundingSphere),tr.applyMatrix4(i),e.ray.intersectsSphere(tr)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,hs),Eu.multiplyMatrices(i,hs),er.matrixWorld=Eu,er.raycast(e,Ha);for(let a=0,o=Ha.length;a<o;a++){let l=Ha[a];l.instanceId=r,l.object=this,t.push(l)}Ha.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new br(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let i=t.morphTargetInfluences,s=i.length+1;this.morphTexture===null&&(this.morphTexture=new _r(new Float32Array(s*this.count),s,this.count,qo,di));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<i.length;c++)a+=i[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=s*e;return r[l]=o,r.set(i,l+1),this}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Ic=new L,Hp=new L,Wp=new We,Ri=class{constructor(e=new L(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let s=Ic.subVectors(i,t).cross(Hp.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,i=!0){let s=e.delta(Ic),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/r;return i===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||Wp.getNormalMatrix(e),s=this.coplanarPoint(Ic).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Cn=new Zi,Xp=new ee(.5,.5),Wa=new L,_s=class{constructor(e=new Ri,t=new Ri,i=new Ri,s=new Ri,r=new Ri,a=new Ri){this.planes=[e,t,i,s,r,a]}set(e,t,i,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(i),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=_i,i=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],h=r[4],d=r[5],u=r[6],f=r[7],g=r[8],b=r[9],m=r[10],p=r[11],T=r[12],S=r[13],y=r[14],A=r[15];if(s[0].setComponents(c-a,f-h,p-g,A-T).normalize(),s[1].setComponents(c+a,f+h,p+g,A+T).normalize(),s[2].setComponents(c+o,f+d,p+b,A+S).normalize(),s[3].setComponents(c-o,f-d,p-b,A-S).normalize(),i)s[4].setComponents(l,u,m,y).normalize(),s[5].setComponents(c-l,f-u,p-m,A-y).normalize();else if(s[4].setComponents(c-l,f-u,p-m,A-y).normalize(),t===_i)s[5].setComponents(c+l,f+u,p+m,A+y).normalize();else if(t===ps)s[5].setComponents(l,u,m,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Cn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Cn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Cn)}intersectsSprite(e){Cn.center.set(0,0,0);let t=Xp.distanceTo(e.center);return Cn.radius=.7071067811865476+t,Cn.applyMatrix4(e.matrixWorld),this.intersectsSphere(Cn)}intersectsSphere(e){let t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let s=t[i];if(Wa.x=s.normal.x>0?e.max.x:e.min.x,Wa.y=s.normal.y>0?e.max.y:e.min.y,Wa.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Wa)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var bs=class extends bi{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ee(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Ru=new rt,Vc=new yr,Xa=new Zi,qa=new L,Sr=class extends It{constructor(e=new Tt,t=new bs){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let i=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Xa.copy(i.boundingSphere),Xa.applyMatrix4(s),Xa.radius+=r,e.ray.intersectsSphere(Xa)===!1)return;Ru.copy(s).invert(),Vc.copy(e.ray).applyMatrix4(Ru);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=i.index,d=i.attributes.position;if(c!==null){let u=Math.max(0,a.start),f=Math.min(c.count,a.start+a.count);for(let g=u,b=f;g<b;g++){let m=c.getX(g);qa.fromBufferAttribute(d,m),Pu(qa,m,l,s,e,t,this)}}else{let u=Math.max(0,a.start),f=Math.min(d.count,a.start+a.count);for(let g=u,b=f;g<b;g++)qa.fromBufferAttribute(d,g),Pu(qa,g,l,s,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function Pu(n,e,t,i,s,r,a){let o=Vc.distanceSqToPoint(n);if(o<t){let l=new L;Vc.closestPointToPoint(n,l),l.applyMatrix4(i);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}var Mr=class extends Bt{constructor(e=[],t=pn,i,s,r,a,o,l,c,h){super(e,t,i,s,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Tr=class extends Bt{constructor(e,t,i,s,r,a,o,l,c){super(e,t,i,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var ji=class extends Bt{constructor(e,t,i=Mi,s,r,a,o=Et,l=Et,c,h=Di,d=1){if(h!==Di&&h!==gn)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:e,height:t,depth:d};super(u,s,r,a,o,l,h,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new xs(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},xo=class extends ji{constructor(e,t=Mi,i=pn,s,r,a=Et,o=Et,l,c=Di){let h={width:e,height:e,depth:1},d=[h,h,h,h,h,h];super(e,e,t,i,s,r,a,o,l,c),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Ar=class extends Bt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Fi=class n extends Tt{constructor(e=1,t=1,i=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],h=[],d=[],u=0,f=0;g("z","y","x",-1,-1,i,t,e,a,r,0),g("z","y","x",1,-1,i,t,-e,a,r,1),g("x","z","y",1,1,e,i,t,s,a,2),g("x","z","y",1,-1,e,i,-t,s,a,3),g("x","y","z",1,-1,e,t,i,s,r,4),g("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(l),this.setAttribute("position",new lt(c,3)),this.setAttribute("normal",new lt(h,3)),this.setAttribute("uv",new lt(d,2));function g(b,m,p,T,S,y,A,M,C,v,w){let P=y/C,I=A/v,U=y/2,q=A/2,Y=M/2,B=C+1,X=v+1,W=0,$=0,re=new L;for(let de=0;de<X;de++){let ce=de*I-q;for(let Me=0;Me<B;Me++){let je=Me*P-U;re[b]=je*T,re[m]=ce*S,re[p]=Y,c.push(re.x,re.y,re.z),re[b]=0,re[m]=0,re[p]=M>0?1:-1,h.push(re.x,re.y,re.z),d.push(Me/C),d.push(1-de/v),W+=1}}for(let de=0;de<v;de++)for(let ce=0;ce<C;ce++){let Me=u+ce+B*de,je=u+ce+B*(de+1),ut=u+(ce+1)+B*(de+1),it=u+(ce+1)+B*de;l.push(Me,je,it),l.push(je,ut,it),$+=6}o.addGroup(f,$,w),f+=$,u+=W}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var Ss=class n extends Tt{constructor(e=1,t=1,i=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let h=[],d=[],u=[],f=[],g=0,b=[],m=i/2,p=0;T(),a===!1&&(e>0&&S(!0),t>0&&S(!1)),this.setIndex(h),this.setAttribute("position",new lt(d,3)),this.setAttribute("normal",new lt(u,3)),this.setAttribute("uv",new lt(f,2));function T(){let y=new L,A=new L,M=0,C=(t-e)/i;for(let v=0;v<=r;v++){let w=[],P=v/r,I=P*(t-e)+e;for(let U=0;U<=s;U++){let q=U/s,Y=q*l+o,B=Math.sin(Y),X=Math.cos(Y);A.x=I*B,A.y=-P*i+m,A.z=I*X,d.push(A.x,A.y,A.z),y.set(B,C,X).normalize(),u.push(y.x,y.y,y.z),f.push(q,1-P),w.push(g++)}b.push(w)}for(let v=0;v<s;v++)for(let w=0;w<r;w++){let P=b[w][v],I=b[w+1][v],U=b[w+1][v+1],q=b[w][v+1];(e>0||w!==0)&&(h.push(P,I,q),M+=3),(t>0||w!==r-1)&&(h.push(I,U,q),M+=3)}c.addGroup(p,M,0),p+=M}function S(y){let A=g,M=new ee,C=new L,v=0,w=y===!0?e:t,P=y===!0?1:-1;for(let U=1;U<=s;U++)d.push(0,m*P,0),u.push(0,P,0),f.push(.5,.5),g++;let I=g;for(let U=0;U<=s;U++){let Y=U/s*l+o,B=Math.cos(Y),X=Math.sin(Y);C.x=w*X,C.y=m*P,C.z=w*B,d.push(C.x,C.y,C.z),u.push(0,P,0),M.x=B*.5+.5,M.y=X*.5*P+.5,f.push(M.x,M.y),g++}for(let U=0;U<s;U++){let q=A+U,Y=I+U;y===!0?h.push(Y,Y+1,q):h.push(Y+1,Y,q),v+=3}c.addGroup(p,v,y===!0?1:2),p+=v}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Un=class n extends Ss{constructor(e=1,t=1,i=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,i,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new n(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},wr=class n extends Tt{constructor(e=[],t=[],i=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:s};let r=[],a=[];o(s),c(i),h(),this.setAttribute("position",new lt(r,3)),this.setAttribute("normal",new lt(r.slice(),3)),this.setAttribute("uv",new lt(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(T){let S=new L,y=new L,A=new L;for(let M=0;M<t.length;M+=3)f(t[M+0],S),f(t[M+1],y),f(t[M+2],A),l(S,y,A,T)}function l(T,S,y,A){let M=A+1,C=[];for(let v=0;v<=M;v++){C[v]=[];let w=T.clone().lerp(y,v/M),P=S.clone().lerp(y,v/M),I=M-v;for(let U=0;U<=I;U++)U===0&&v===M?C[v][U]=w:C[v][U]=w.clone().lerp(P,U/I)}for(let v=0;v<M;v++)for(let w=0;w<2*(M-v)-1;w++){let P=Math.floor(w/2);w%2===0?(u(C[v][P+1]),u(C[v+1][P]),u(C[v][P])):(u(C[v][P+1]),u(C[v+1][P+1]),u(C[v+1][P]))}}function c(T){let S=new L;for(let y=0;y<r.length;y+=3)S.x=r[y+0],S.y=r[y+1],S.z=r[y+2],S.normalize().multiplyScalar(T),r[y+0]=S.x,r[y+1]=S.y,r[y+2]=S.z}function h(){let T=new L;for(let S=0;S<r.length;S+=3){T.x=r[S+0],T.y=r[S+1],T.z=r[S+2];let y=m(T)/2/Math.PI+.5,A=p(T)/Math.PI+.5;a.push(y,1-A)}g(),d()}function d(){for(let T=0;T<a.length;T+=6){let S=a[T+0],y=a[T+2],A=a[T+4],M=Math.max(S,y,A),C=Math.min(S,y,A);M>.9&&C<.1&&(S<.2&&(a[T+0]+=1),y<.2&&(a[T+2]+=1),A<.2&&(a[T+4]+=1))}}function u(T){r.push(T.x,T.y,T.z)}function f(T,S){let y=T*3;S.x=e[y+0],S.y=e[y+1],S.z=e[y+2]}function g(){let T=new L,S=new L,y=new L,A=new L,M=new ee,C=new ee,v=new ee;for(let w=0,P=0;w<r.length;w+=9,P+=6){T.set(r[w+0],r[w+1],r[w+2]),S.set(r[w+3],r[w+4],r[w+5]),y.set(r[w+6],r[w+7],r[w+8]),M.set(a[P+0],a[P+1]),C.set(a[P+2],a[P+3]),v.set(a[P+4],a[P+5]),A.copy(T).add(S).add(y).divideScalar(3);let I=m(A);b(M,P+0,T,I),b(C,P+2,S,I),b(v,P+4,y,I)}}function b(T,S,y,A){A<0&&T.x===1&&(a[S]=T.x-1),y.x===0&&y.z===0&&(a[S]=A/2/Math.PI+.5)}function m(T){return Math.atan2(T.z,-T.x)}function p(T){return Math.atan2(-T.y,Math.sqrt(T.x*T.x+T.z*T.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.vertices,e.indices,e.radius,e.detail)}};var Qt=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Oe("Curve: .getPoint() not implemented.")}getPointAt(e,t){let i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],i,s=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)i=this.getPoint(a/e),r+=i.distanceTo(s),t.push(r),s=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let i=this.getLengths(),s=0,r=i.length,a;t?a=t:a=e*i[r-1];let o=0,l=r-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=i[s]-a,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,i[s]===a)return s/(r-1);let h=i[s],u=i[s+1]-h,f=(a-h)/u;return(s+f)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let a=this.getPoint(s),o=this.getPoint(r),l=t||(a.isVector2?new ee:new L);return l.copy(o).sub(a).normalize(),l}getTangentAt(e,t){let i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t=!1){let i=new L,s=[],r=[],a=[],o=new L,l=new rt;for(let f=0;f<=e;f++){let g=f/e;s[f]=this.getTangentAt(g,new L)}r[0]=new L,a[0]=new L;let c=Number.MAX_VALUE,h=Math.abs(s[0].x),d=Math.abs(s[0].y),u=Math.abs(s[0].z);h<=c&&(c=h,i.set(1,0,0)),d<=c&&(c=d,i.set(0,1,0)),u<=c&&i.set(0,0,1),o.crossVectors(s[0],i).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),a[f]=a[f-1].clone(),o.crossVectors(s[f-1],s[f]),o.length()>Number.EPSILON){o.normalize();let g=Math.acos(Qe(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(o,g))}a[f].crossVectors(s[f],r[f])}if(t===!0){let f=Math.acos(Qe(r[0].dot(r[e]),-1,1));f/=e,s[0].dot(o.crossVectors(r[0],r[e]))>0&&(f=-f);for(let g=1;g<=e;g++)r[g].applyMatrix4(l.makeRotationAxis(s[g],f*g)),a[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},Ms=class extends Qt{constructor(e=0,t=0,i=1,s=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(e,t=new ee){let i=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);let o=this.aStartAngle+e*r,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let h=Math.cos(this.aRotation),d=Math.sin(this.aRotation),u=l-this.aX,f=c-this.aY;l=u*h-f*d+this.aX,c=u*d+f*h+this.aY}return i.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},vo=class extends Ms{constructor(e,t,i,s,r,a){super(e,t,i,i,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function lh(){let n=0,e=0,t=0,i=0;function s(r,a,o,l){n=r,e=o,t=-3*r+3*a-2*o-l,i=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){s(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,h,d){let u=(a-r)/c-(o-r)/(c+h)+(o-a)/h,f=(o-a)/h-(l-a)/(h+d)+(l-o)/d;u*=h,f*=h,s(a,o,u,f)},calc:function(r){let a=r*r,o=a*r;return n+e*r+t*a+i*o}}}var Iu=new L,Lu=new L,Lc=new lh,Dc=new lh,Nc=new lh,yo=class extends Qt{constructor(e=[],t=!1,i="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=s}getPoint(e,t=new L){let i=t,s=this.points,r=s.length,a=(r-(this.closed?0:1))*e,o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,h;this.closed||o>0?c=s[(o-1)%r]:(Lu.subVectors(s[0],s[1]).add(s[0]),c=Lu);let d=s[o%r],u=s[(o+1)%r];if(this.closed||o+2<r?h=s[(o+2)%r]:(Iu.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=Iu),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(d),f),b=Math.pow(d.distanceToSquared(u),f),m=Math.pow(u.distanceToSquared(h),f);b<1e-4&&(b=1),g<1e-4&&(g=b),m<1e-4&&(m=b),Lc.initNonuniformCatmullRom(c.x,d.x,u.x,h.x,g,b,m),Dc.initNonuniformCatmullRom(c.y,d.y,u.y,h.y,g,b,m),Nc.initNonuniformCatmullRom(c.z,d.z,u.z,h.z,g,b,m)}else this.curveType==="catmullrom"&&(Lc.initCatmullRom(c.x,d.x,u.x,h.x,this.tension),Dc.initCatmullRom(c.y,d.y,u.y,h.y,this.tension),Nc.initCatmullRom(c.z,d.z,u.z,h.z,this.tension));return i.set(Lc.calc(l),Dc.calc(l),Nc.calc(l)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(new L().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Du(n,e,t,i,s){let r=(i-e)*.5,a=(s-t)*.5,o=n*n,l=n*o;return(2*t-2*i+r+a)*l+(-3*t+3*i-2*r-a)*o+r*n+t}function qp(n,e){let t=1-n;return t*t*e}function Yp(n,e){return 2*(1-n)*n*e}function Zp(n,e){return n*n*e}function rr(n,e,t,i){return qp(n,e)+Yp(n,t)+Zp(n,i)}function Jp(n,e){let t=1-n;return t*t*t*e}function jp(n,e){let t=1-n;return 3*t*t*n*e}function Kp(n,e){return 3*(1-n)*n*n*e}function Qp(n,e){return n*n*n*e}function ar(n,e,t,i,s){return Jp(n,e)+jp(n,t)+Kp(n,i)+Qp(n,s)}var Er=class extends Qt{constructor(e=new ee,t=new ee,i=new ee,s=new ee){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new ee){let i=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return i.set(ar(e,s.x,r.x,a.x,o.x),ar(e,s.y,r.y,a.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},_o=class extends Qt{constructor(e=new L,t=new L,i=new L,s=new L){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new L){let i=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return i.set(ar(e,s.x,r.x,a.x,o.x),ar(e,s.y,r.y,a.y,o.y),ar(e,s.z,r.z,a.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Cr=class extends Qt{constructor(e=new ee,t=new ee){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new ee){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new ee){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},bo=class extends Qt{constructor(e=new L,t=new L){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new L){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new L){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Rr=class extends Qt{constructor(e=new ee,t=new ee,i=new ee){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new ee){let i=t,s=this.v0,r=this.v1,a=this.v2;return i.set(rr(e,s.x,r.x,a.x),rr(e,s.y,r.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},So=class extends Qt{constructor(e=new L,t=new L,i=new L){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new L){let i=t,s=this.v0,r=this.v1,a=this.v2;return i.set(rr(e,s.x,r.x,a.x),rr(e,s.y,r.y,a.y),rr(e,s.z,r.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Pr=class extends Qt{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new ee){let i=t,s=this.points,r=(s.length-1)*e,a=Math.floor(r),o=r-a,l=s[a===0?a:a-1],c=s[a],h=s[a>s.length-2?s.length-1:a+1],d=s[a>s.length-3?s.length-1:a+2];return i.set(Du(o,l.x,c.x,h.x,d.x),Du(o,l.y,c.y,h.y,d.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(new ee().fromArray(s))}return this}},Gc=Object.freeze({__proto__:null,ArcCurve:vo,CatmullRomCurve3:yo,CubicBezierCurve:Er,CubicBezierCurve3:_o,EllipseCurve:Ms,LineCurve:Cr,LineCurve3:bo,QuadraticBezierCurve:Rr,QuadraticBezierCurve3:So,SplineCurve:Pr}),Mo=class extends Qt{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Gc[i](t,e))}return this}getPoint(e,t){let i=e*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=i){let a=s[r]-i,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let i=0,s=this.curves.length;i<s;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],i;for(let s=0,r=this.curves;s<r.length;s++){let a=r[s],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,l=a.getPoints(o);for(let c=0;c<l.length;c++){let h=l[c];i&&i.equals(h)||(t.push(h),i=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){let s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let s=e.curves[t];this.curves.push(new Gc[s.type]().fromJSON(s))}return this}},Ir=class extends Mo{constructor(e){super(),this.type="Path",this.currentPoint=new ee,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let i=new Cr(this.currentPoint.clone(),new ee(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,s){let r=new Rr(this.currentPoint.clone(),new ee(e,t),new ee(i,s));return this.curves.push(r),this.currentPoint.set(i,s),this}bezierCurveTo(e,t,i,s,r,a){let o=new Er(this.currentPoint.clone(),new ee(e,t),new ee(i,s),new ee(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),i=new Pr(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,s,r,a){let o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+o,t+l,i,s,r,a),this}absarc(e,t,i,s,r,a){return this.absellipse(e,t,i,i,s,r,a),this}ellipse(e,t,i,s,r,a,o,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,i,s,r,a,o,l),this}absellipse(e,t,i,s,r,a,o,l){let c=new Ms(e,t,i,s,r,a,o,l);if(this.curves.length>0){let d=c.getPoint(0);d.equals(this.currentPoint)||this.lineTo(d.x,d.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Ts=class extends Ir{constructor(e){super(e),this.uuid=Li(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let i=0,s=this.holes.length;i<s;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){let s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let s=e.holes[t];this.holes.push(new Ir().fromJSON(s))}return this}};function $p(n,e,t=2){let i=e&&e.length,s=i?e[0]*t:n.length,r=wd(n,0,s,t,!0),a=[];if(!r||r.next===r.prev)return a;let o,l,c;if(i&&(r=sm(n,e,r,t)),n.length>80*t){o=n[0],l=n[1];let h=o,d=l;for(let u=t;u<s;u+=t){let f=n[u],g=n[u+1];f<o&&(o=f),g<l&&(l=g),f>h&&(h=f),g>d&&(d=g)}c=Math.max(h-o,d-l),c=c!==0?32767/c:0}return Lr(r,a,t,o,l,c,0),a}function wd(n,e,t,i,s){let r;if(s===mm(n,e,t,i)>0)for(let a=e;a<t;a+=i)r=Nu(a/i|0,n[a],n[a+1],r);else for(let a=t-i;a>=e;a-=i)r=Nu(a/i|0,n[a],n[a+1],r);return r&&As(r,r.next)&&(Nr(r),r=r.next),r}function Fn(n,e){if(!n)return n;e||(e=n);let t=n,i;do if(i=!1,!t.steiner&&(As(t,t.next)||bt(t.prev,t,t.next)===0)){if(Nr(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function Lr(n,e,t,i,s,r,a){if(!n)return;!a&&r&&cm(n,i,s,r);let o=n;for(;n.prev!==n.next;){let l=n.prev,c=n.next;if(r?tm(n,i,s,r):em(n)){e.push(l.i,n.i,c.i),Nr(n),n=c.next,o=c.next;continue}if(n=c,n===o){a?a===1?(n=im(Fn(n),e),Lr(n,e,t,i,s,r,2)):a===2&&nm(n,e,t,i,s,r):Lr(Fn(n),e,t,i,s,r,1);break}}}function em(n){let e=n.prev,t=n,i=n.next;if(bt(e,t,i)>=0)return!1;let s=e.x,r=t.x,a=i.x,o=e.y,l=t.y,c=i.y,h=Math.min(s,r,a),d=Math.min(o,l,c),u=Math.max(s,r,a),f=Math.max(o,l,c),g=i.next;for(;g!==e;){if(g.x>=h&&g.x<=u&&g.y>=d&&g.y<=f&&ir(s,o,r,l,a,c,g.x,g.y)&&bt(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function tm(n,e,t,i){let s=n.prev,r=n,a=n.next;if(bt(s,r,a)>=0)return!1;let o=s.x,l=r.x,c=a.x,h=s.y,d=r.y,u=a.y,f=Math.min(o,l,c),g=Math.min(h,d,u),b=Math.max(o,l,c),m=Math.max(h,d,u),p=Hc(f,g,e,t,i),T=Hc(b,m,e,t,i),S=n.prevZ,y=n.nextZ;for(;S&&S.z>=p&&y&&y.z<=T;){if(S.x>=f&&S.x<=b&&S.y>=g&&S.y<=m&&S!==s&&S!==a&&ir(o,h,l,d,c,u,S.x,S.y)&&bt(S.prev,S,S.next)>=0||(S=S.prevZ,y.x>=f&&y.x<=b&&y.y>=g&&y.y<=m&&y!==s&&y!==a&&ir(o,h,l,d,c,u,y.x,y.y)&&bt(y.prev,y,y.next)>=0))return!1;y=y.nextZ}for(;S&&S.z>=p;){if(S.x>=f&&S.x<=b&&S.y>=g&&S.y<=m&&S!==s&&S!==a&&ir(o,h,l,d,c,u,S.x,S.y)&&bt(S.prev,S,S.next)>=0)return!1;S=S.prevZ}for(;y&&y.z<=T;){if(y.x>=f&&y.x<=b&&y.y>=g&&y.y<=m&&y!==s&&y!==a&&ir(o,h,l,d,c,u,y.x,y.y)&&bt(y.prev,y,y.next)>=0)return!1;y=y.nextZ}return!0}function im(n,e){let t=n;do{let i=t.prev,s=t.next.next;!As(i,s)&&Cd(i,t,t.next,s)&&Dr(i,s)&&Dr(s,i)&&(e.push(i.i,t.i,s.i),Nr(t),Nr(t.next),t=n=s),t=t.next}while(t!==n);return Fn(t)}function nm(n,e,t,i,s,r){let a=n;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&dm(a,o)){let l=Rd(a,o);a=Fn(a,a.next),l=Fn(l,l.next),Lr(a,e,t,i,s,r,0),Lr(l,e,t,i,s,r,0);return}o=o.next}a=a.next}while(a!==n)}function sm(n,e,t,i){let s=[];for(let r=0,a=e.length;r<a;r++){let o=e[r]*i,l=r<a-1?e[r+1]*i:n.length,c=wd(n,o,l,i,!1);c===c.next&&(c.steiner=!0),s.push(um(c))}s.sort(rm);for(let r=0;r<s.length;r++)t=am(s[r],t);return t}function rm(n,e){let t=n.x-e.x;if(t===0&&(t=n.y-e.y,t===0)){let i=(n.next.y-n.y)/(n.next.x-n.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=i-s}return t}function am(n,e){let t=om(n,e);if(!t)return e;let i=Rd(t,n);return Fn(i,i.next),Fn(t,t.next)}function om(n,e){let t=e,i=n.x,s=n.y,r=-1/0,a;if(As(n,t))return t;do{if(As(n,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){let d=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(d<=i&&d>r&&(r=d,a=t.x<t.next.x?t:t.next,d===i))return a}t=t.next}while(t!==e);if(!a)return null;let o=a,l=a.x,c=a.y,h=1/0;t=a;do{if(i>=t.x&&t.x>=l&&i!==t.x&&Ed(s<c?i:r,s,l,c,s<c?r:i,s,t.x,t.y)){let d=Math.abs(s-t.y)/(i-t.x);Dr(t,n)&&(d<h||d===h&&(t.x>a.x||t.x===a.x&&lm(a,t)))&&(a=t,h=d)}t=t.next}while(t!==o);return a}function lm(n,e){return bt(n.prev,n,e.prev)<0&&bt(e.next,n,n.next)<0}function cm(n,e,t,i){let s=n;do s.z===0&&(s.z=Hc(s.x,s.y,e,t,i)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==n);s.prevZ.nextZ=null,s.prevZ=null,hm(s)}function hm(n){let e,t=1;do{let i=n,s;n=null;let r=null;for(e=0;i;){e++;let a=i,o=0;for(let c=0;c<t&&(o++,a=a.nextZ,!!a);c++);let l=t;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||i.z<=a.z)?(s=i,i=i.nextZ,o--):(s=a,a=a.nextZ,l--),r?r.nextZ=s:n=s,s.prevZ=r,r=s;i=a}r.nextZ=null,t*=2}while(e>1);return n}function Hc(n,e,t,i,s){return n=(n-t)*s|0,e=(e-i)*s|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,n|e<<1}function um(n){let e=n,t=n;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==n);return t}function Ed(n,e,t,i,s,r,a,o){return(s-a)*(e-o)>=(n-a)*(r-o)&&(n-a)*(i-o)>=(t-a)*(e-o)&&(t-a)*(r-o)>=(s-a)*(i-o)}function ir(n,e,t,i,s,r,a,o){return!(n===a&&e===o)&&Ed(n,e,t,i,s,r,a,o)}function dm(n,e){return n.next.i!==e.i&&n.prev.i!==e.i&&!fm(n,e)&&(Dr(n,e)&&Dr(e,n)&&pm(n,e)&&(bt(n.prev,n,e.prev)||bt(n,e.prev,e))||As(n,e)&&bt(n.prev,n,n.next)>0&&bt(e.prev,e,e.next)>0)}function bt(n,e,t){return(e.y-n.y)*(t.x-e.x)-(e.x-n.x)*(t.y-e.y)}function As(n,e){return n.x===e.x&&n.y===e.y}function Cd(n,e,t,i){let s=Za(bt(n,e,t)),r=Za(bt(n,e,i)),a=Za(bt(t,i,n)),o=Za(bt(t,i,e));return!!(s!==r&&a!==o||s===0&&Ya(n,t,e)||r===0&&Ya(n,i,e)||a===0&&Ya(t,n,i)||o===0&&Ya(t,e,i))}function Ya(n,e,t){return e.x<=Math.max(n.x,t.x)&&e.x>=Math.min(n.x,t.x)&&e.y<=Math.max(n.y,t.y)&&e.y>=Math.min(n.y,t.y)}function Za(n){return n>0?1:n<0?-1:0}function fm(n,e){let t=n;do{if(t.i!==n.i&&t.next.i!==n.i&&t.i!==e.i&&t.next.i!==e.i&&Cd(t,t.next,n,e))return!0;t=t.next}while(t!==n);return!1}function Dr(n,e){return bt(n.prev,n,n.next)<0?bt(n,e,n.next)>=0&&bt(n,n.prev,e)>=0:bt(n,e,n.prev)<0||bt(n,n.next,e)<0}function pm(n,e){let t=n,i=!1,s=(n.x+e.x)/2,r=(n.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==n);return i}function Rd(n,e){let t=Wc(n.i,n.x,n.y),i=Wc(e.i,e.x,e.y),s=n.next,r=e.prev;return n.next=e,e.prev=n,t.next=s,s.prev=t,i.next=t,t.prev=i,r.next=i,i.prev=r,i}function Nu(n,e,t,i){let s=Wc(n,e,t);return i?(s.next=i.next,s.prev=i,i.next.prev=s,i.next=s):(s.prev=s,s.next=s),s}function Nr(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function Wc(n,e,t){return{i:n,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function mm(n,e,t,i){let s=0;for(let r=e,a=t-i;r<t;r+=i)s+=(n[a]-n[r])*(n[r+1]+n[a+1]),a=r;return s}var Xc=class{static triangulate(e,t,i=2){return $p(e,t,i)}},Pn=class n{static area(e){let t=e.length,i=0;for(let s=t-1,r=0;r<t;s=r++)i+=e[s].x*e[r].y-e[r].x*e[s].y;return i*.5}static isClockWise(e){return n.area(e)<0}static triangulateShape(e,t){let i=[],s=[],r=[];Uu(e),Fu(i,e);let a=e.length;t.forEach(Uu);for(let l=0;l<t.length;l++)s.push(a),a+=t[l].length,Fu(i,t[l]);let o=Xc.triangulate(i,s);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}};function Uu(n){let e=n.length;e>2&&n[e-1].equals(n[0])&&n.pop()}function Fu(n,e){for(let t=0;t<e.length;t++)n.push(e[t].x),n.push(e[t].y)}var Ur=class n extends Tt{constructor(e=new Ts([new ee(.5,.5),new ee(-.5,.5),new ee(-.5,-.5),new ee(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let i=this,s=[],r=[];for(let o=0,l=e.length;o<l;o++){let c=e[o];a(c)}this.setAttribute("position",new lt(s,3)),this.setAttribute("uv",new lt(r,2)),this.computeVertexNormals();function a(o){let l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,d=t.depth!==void 0?t.depth:1,u=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:.2,g=t.bevelSize!==void 0?t.bevelSize:f-.1,b=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3,p=t.extrudePath,T=t.UVGenerator!==void 0?t.UVGenerator:gm,S,y=!1,A,M,C,v;if(p){S=p.getSpacedPoints(h),y=!0,u=!1;let te=p.isCatmullRomCurve3?p.closed:!1;A=p.computeFrenetFrames(h,te),M=new L,C=new L,v=new L}u||(m=0,f=0,g=0,b=0);let w=o.extractPoints(c),P=w.shape,I=w.holes;if(!Pn.isClockWise(P)){P=P.reverse();for(let te=0,se=I.length;te<se;te++){let ne=I[te];Pn.isClockWise(ne)&&(I[te]=ne.reverse())}}function q(te){let ne=10000000000000001e-36,ye=te[0];for(let ge=1;ge<=te.length;ge++){let Be=ge%te.length,Pe=te[Be],Ge=Pe.x-ye.x,Xe=Pe.y-ye.y,D=Ge*Ge+Xe*Xe,ct=Math.max(Math.abs(Pe.x),Math.abs(Pe.y),Math.abs(ye.x),Math.abs(ye.y)),et=ne*ct*ct;if(D<=et){te.splice(Be,1),ge--;continue}ye=Pe}}q(P),I.forEach(q);let Y=I.length,B=P;for(let te=0;te<Y;te++){let se=I[te];P=P.concat(se)}function X(te,se,ne){return se||ke("ExtrudeGeometry: vec does not exist"),te.clone().addScaledVector(se,ne)}let W=P.length;function $(te,se,ne){let ye,ge,Be,Pe=te.x-se.x,Ge=te.y-se.y,Xe=ne.x-te.x,D=ne.y-te.y,ct=Pe*Pe+Ge*Ge,et=Pe*D-Ge*Xe;if(Math.abs(et)>Number.EPSILON){let E=Math.sqrt(ct),x=Math.sqrt(Xe*Xe+D*D),O=se.x-Ge/E,G=se.y+Pe/E,Z=ne.x-D/x,oe=ne.y+Xe/x,le=((Z-O)*D-(oe-G)*Xe)/(Pe*D-Ge*Xe);ye=O+Pe*le-te.x,ge=G+Ge*le-te.y;let J=ye*ye+ge*ge;if(J<=2)return new ee(ye,ge);Be=Math.sqrt(J/2)}else{let E=!1;Pe>Number.EPSILON?Xe>Number.EPSILON&&(E=!0):Pe<-Number.EPSILON?Xe<-Number.EPSILON&&(E=!0):Math.sign(Ge)===Math.sign(D)&&(E=!0),E?(ye=-Ge,ge=Pe,Be=Math.sqrt(ct)):(ye=Pe,ge=Ge,Be=Math.sqrt(ct/2))}return new ee(ye/Be,ge/Be)}let re=[];for(let te=0,se=B.length,ne=se-1,ye=te+1;te<se;te++,ne++,ye++)ne===se&&(ne=0),ye===se&&(ye=0),re[te]=$(B[te],B[ne],B[ye]);let de=[],ce,Me=re.concat();for(let te=0,se=Y;te<se;te++){let ne=I[te];ce=[];for(let ye=0,ge=ne.length,Be=ge-1,Pe=ye+1;ye<ge;ye++,Be++,Pe++)Be===ge&&(Be=0),Pe===ge&&(Pe=0),ce[ye]=$(ne[ye],ne[Be],ne[Pe]);de.push(ce),Me=Me.concat(ce)}let je;if(m===0)je=Pn.triangulateShape(B,I);else{let te=[],se=[];for(let ne=0;ne<m;ne++){let ye=ne/m,ge=f*Math.cos(ye*Math.PI/2),Be=g*Math.sin(ye*Math.PI/2)+b;for(let Pe=0,Ge=B.length;Pe<Ge;Pe++){let Xe=X(B[Pe],re[Pe],Be);De(Xe.x,Xe.y,-ge),ye===0&&te.push(Xe)}for(let Pe=0,Ge=Y;Pe<Ge;Pe++){let Xe=I[Pe];ce=de[Pe];let D=[];for(let ct=0,et=Xe.length;ct<et;ct++){let E=X(Xe[ct],ce[ct],Be);De(E.x,E.y,-ge),ye===0&&D.push(E)}ye===0&&se.push(D)}}je=Pn.triangulateShape(te,se)}let ut=je.length,it=g+b;for(let te=0;te<W;te++){let se=u?X(P[te],Me[te],it):P[te];y?(C.copy(A.normals[0]).multiplyScalar(se.x),M.copy(A.binormals[0]).multiplyScalar(se.y),v.copy(S[0]).add(C).add(M),De(v.x,v.y,v.z)):De(se.x,se.y,0)}for(let te=1;te<=h;te++)for(let se=0;se<W;se++){let ne=u?X(P[se],Me[se],it):P[se];y?(C.copy(A.normals[te]).multiplyScalar(ne.x),M.copy(A.binormals[te]).multiplyScalar(ne.y),v.copy(S[te]).add(C).add(M),De(v.x,v.y,v.z)):De(ne.x,ne.y,d/h*te)}for(let te=m-1;te>=0;te--){let se=te/m,ne=f*Math.cos(se*Math.PI/2),ye=g*Math.sin(se*Math.PI/2)+b;for(let ge=0,Be=B.length;ge<Be;ge++){let Pe=X(B[ge],re[ge],ye);De(Pe.x,Pe.y,d+ne)}for(let ge=0,Be=I.length;ge<Be;ge++){let Pe=I[ge];ce=de[ge];for(let Ge=0,Xe=Pe.length;Ge<Xe;Ge++){let D=X(Pe[Ge],ce[Ge],ye);y?De(D.x,D.y+S[h-1].y,S[h-1].x+ne):De(D.x,D.y,d+ne)}}}K(),he();function K(){let te=s.length/3;if(u){let se=0,ne=W*se;for(let ye=0;ye<ut;ye++){let ge=je[ye];Ve(ge[2]+ne,ge[1]+ne,ge[0]+ne)}se=h+m*2,ne=W*se;for(let ye=0;ye<ut;ye++){let ge=je[ye];Ve(ge[0]+ne,ge[1]+ne,ge[2]+ne)}}else{for(let se=0;se<ut;se++){let ne=je[se];Ve(ne[2],ne[1],ne[0])}for(let se=0;se<ut;se++){let ne=je[se];Ve(ne[0]+W*h,ne[1]+W*h,ne[2]+W*h)}}i.addGroup(te,s.length/3-te,0)}function he(){let te=s.length/3,se=0;ae(B,se),se+=B.length;for(let ne=0,ye=I.length;ne<ye;ne++){let ge=I[ne];ae(ge,se),se+=ge.length}i.addGroup(te,s.length/3-te,1)}function ae(te,se){let ne=te.length;for(;--ne>=0;){let ye=ne,ge=ne-1;ge<0&&(ge=te.length-1);for(let Be=0,Pe=h+m*2;Be<Pe;Be++){let Ge=W*Be,Xe=W*(Be+1),D=se+ye+Ge,ct=se+ge+Ge,et=se+ge+Xe,E=se+ye+Xe;Fe(D,ct,et,E)}}}function De(te,se,ne){l.push(te),l.push(se),l.push(ne)}function Ve(te,se,ne){at(te),at(se),at(ne);let ye=s.length/3,ge=T.generateTopUV(i,s,ye-3,ye-2,ye-1);He(ge[0]),He(ge[1]),He(ge[2])}function Fe(te,se,ne,ye){at(te),at(se),at(ye),at(se),at(ne),at(ye);let ge=s.length/3,Be=T.generateSideWallUV(i,s,ge-6,ge-3,ge-2,ge-1);He(Be[0]),He(Be[1]),He(Be[3]),He(Be[1]),He(Be[2]),He(Be[3])}function at(te){s.push(l[te*3+0]),s.push(l[te*3+1]),s.push(l[te*3+2])}function He(te){r.push(te.x),r.push(te.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,i=this.parameters.options;return xm(t,i,e)}static fromJSON(e,t){let i=[];for(let r=0,a=e.shapes.length;r<a;r++){let o=t[e.shapes[r]];i.push(o)}let s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new Gc[s.type]().fromJSON(s)),new n(i,e.options)}},gm={generateTopUV:function(n,e,t,i,s){let r=e[t*3],a=e[t*3+1],o=e[i*3],l=e[i*3+1],c=e[s*3],h=e[s*3+1];return[new ee(r,a),new ee(o,l),new ee(c,h)]},generateSideWallUV:function(n,e,t,i,s,r){let a=e[t*3],o=e[t*3+1],l=e[t*3+2],c=e[i*3],h=e[i*3+1],d=e[i*3+2],u=e[s*3],f=e[s*3+1],g=e[s*3+2],b=e[r*3],m=e[r*3+1],p=e[r*3+2];return Math.abs(o-h)<Math.abs(a-c)?[new ee(a,1-l),new ee(c,1-d),new ee(u,1-g),new ee(b,1-p)]:[new ee(o,1-l),new ee(h,1-d),new ee(f,1-g),new ee(m,1-p)]}};function xm(n,e,t){if(t.shapes=[],Array.isArray(n))for(let i=0,s=n.length;i<s;i++){let r=n[i];t.shapes.push(r.uuid)}else t.shapes.push(n.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var Fr=class n extends wr{constructor(e=1,t=0){let i=(1+Math.sqrt(5))/2,s=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new n(e.radius,e.detail)}};var Or=class n extends wr{constructor(e=1,t=0){let i=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],s=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(i,s,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new n(e.radius,e.detail)}},On=class n extends Tt{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(i),l=Math.floor(s),c=o+1,h=l+1,d=e/o,u=t/l,f=[],g=[],b=[],m=[];for(let p=0;p<h;p++){let T=p*u-a;for(let S=0;S<c;S++){let y=S*d-r;g.push(y,-T,0),b.push(0,0,1),m.push(S/o),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let T=0;T<o;T++){let S=T+c*p,y=T+c*(p+1),A=T+1+c*(p+1),M=T+1+c*p;f.push(S,y,M),f.push(y,A,M)}this.setIndex(f),this.setAttribute("position",new lt(g,3)),this.setAttribute("normal",new lt(b,3)),this.setAttribute("uv",new lt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.widthSegments,e.heightSegments)}},Br=class n extends Tt{constructor(e=.5,t=1,i=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:s,thetaStart:r,thetaLength:a},i=Math.max(3,i),s=Math.max(1,s);let o=[],l=[],c=[],h=[],d=e,u=(t-e)/s,f=new L,g=new ee;for(let b=0;b<=s;b++){for(let m=0;m<=i;m++){let p=r+m/i*a;f.x=d*Math.cos(p),f.y=d*Math.sin(p),l.push(f.x,f.y,f.z),c.push(0,0,1),g.x=(f.x/t+1)/2,g.y=(f.y/t+1)/2,h.push(g.x,g.y)}d+=u}for(let b=0;b<s;b++){let m=b*(i+1);for(let p=0;p<i;p++){let T=p+m,S=T,y=T+i+1,A=T+i+2,M=T+1;o.push(S,y,M),o.push(y,A,M)}}this.setIndex(o),this.setAttribute("position",new lt(l,3)),this.setAttribute("normal",new lt(c,3)),this.setAttribute("uv",new lt(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}};var hi=class n extends Tt{constructor(e=1,t=32,i=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));let l=Math.min(a+o,Math.PI),c=0,h=[],d=new L,u=new L,f=[],g=[],b=[],m=[];for(let p=0;p<=i;p++){let T=[],S=p/i,y=a+S*o,A=e*Math.cos(y),M=Math.sqrt(e*e-A*A),C=0;p===0&&a===0?C=.5/t:p===i&&l===Math.PI&&(C=-.5/t);for(let v=0;v<=t;v++){let w=v/t,P=s+w*r;d.x=-M*Math.cos(P),d.y=A,d.z=M*Math.sin(P),g.push(d.x,d.y,d.z),u.copy(d).normalize(),b.push(u.x,u.y,u.z),m.push(w+C,1-S),T.push(c++)}h.push(T)}for(let p=0;p<i;p++)for(let T=0;T<t;T++){let S=h[p][T+1],y=h[p][T],A=h[p+1][T],M=h[p+1][T+1];(p!==0||a>0)&&f.push(S,y,M),(p!==i-1||l<Math.PI)&&f.push(y,A,M)}this.setIndex(f),this.setAttribute("position",new lt(g,3)),this.setAttribute("normal",new lt(b,3)),this.setAttribute("uv",new lt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};function Gn(n){let e={};for(let t in n){e[t]={};for(let i in n[t]){let s=n[t][i];if(Ou(s))s.isRenderTargetTexture?(Oe("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone();else if(Array.isArray(s))if(Ou(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][i]=r}else e[t][i]=s.slice();else e[t][i]=s}}return e}function Wt(n){let e={};for(let t=0;t<n.length;t++){let i=Gn(n[t]);for(let s in i)e[s]=i[s]}return e}function Ou(n){return n&&(n.isColor||n.isMatrix3||n.isMatrix4||n.isVector2||n.isVector3||n.isVector4||n.isTexture||n.isQuaternion)}function vm(n){let e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function ch(n){let e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:$e.workingColorSpace}var ti={clone:Gn,merge:Wt},ym=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,_m=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,pt=class extends bi{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=ym,this.fragmentShader=_m,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Gn(e.uniforms),this.uniformsGroups=vm(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let i in e.uniforms){let s=e.uniforms[i];switch(this.uniforms[i]={},s.type){case"t":this.uniforms[i].value=t[s.value]||null;break;case"c":this.uniforms[i].value=new Ee().setHex(s.value);break;case"v2":this.uniforms[i].value=new ee().fromArray(s.value);break;case"v3":this.uniforms[i].value=new L().fromArray(s.value);break;case"v4":this.uniforms[i].value=new yt().fromArray(s.value);break;case"m3":this.uniforms[i].value=new We().fromArray(s.value);break;case"m4":this.uniforms[i].value=new rt().fromArray(s.value);break;default:this.uniforms[i].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let i in e.extensions)this.extensions[i]=e.extensions[i];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},ws=class extends pt{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Ki=class extends bi{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ee(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ee(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=oa,this.normalScale=new ee(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new li,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},kr=class extends Ki{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new ee(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Qe(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Ee(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ee(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ee(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var Bn=class extends bi{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Ee(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ee(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=oa,this.normalScale=new ee(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new li,this.combine=ko,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},To=class extends bi{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=dd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Ao=class extends bi{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Ja(n,e){return!n||n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}var hn=class{constructor(e,t,i,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,s=t[i],r=t[i-1];i:{e:{let a;t:{n:if(!(e<s)){for(let o=i+2;;){if(s===void 0){if(e<r)break n;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===o)break;if(r=s,s=t[++i],e<s)break e}a=t.length;break t}if(!(e>=r)){let o=t[1];e<o&&(i=2,r=o);for(let l=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(s=r,r=t[--i-1],e>=r)break e}a=i,i=0;break t}break i}for(;i<a;){let o=i+a>>>1;e<t[o]?a=o:i=o+1}if(s=t[i],r=t[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,s)}return this.interpolate_(i,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=i[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},wo=class extends hn{constructor(e,t,i,s){super(e,t,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Oc,endingEnd:Oc}}intervalChanged_(e,t,i){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case Bc:r=e,o=2*t-i;break;case kc:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=i}if(l===void 0)switch(this.getSettings_().endingEnd){case Bc:a=e,l=2*i-t;break;case kc:a=1,l=i+s[1]-s[0];break;default:a=e-1,l=t}let c=(i-t)*.5,h=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-i),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this._offsetPrev,d=this._offsetNext,u=this._weightPrev,f=this._weightNext,g=(i-t)/(s-t),b=g*g,m=b*g,p=-u*m+2*u*b-u*g,T=(1+u)*m+(-1.5-2*u)*b+(-.5+u)*g+1,S=(-1-f)*m+(1.5+f)*b+.5*g,y=f*m-f*b;for(let A=0;A!==o;++A)r[A]=p*a[h+A]+T*a[c+A]+S*a[l+A]+y*a[d+A];return r}},Eo=class extends hn{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=(i-t)/(s-t),d=1-h;for(let u=0;u!==o;++u)r[u]=a[c+u]*d+a[l+u]*h;return r}},Co=class extends hn{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e){return this.copySampleValue_(e-1)}},Ro=class extends hn{interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this.inTangents,d=this.outTangents;if(!h||!d){let g=(i-t)/(s-t),b=1-g;for(let m=0;m!==o;++m)r[m]=a[c+m]*b+a[l+m]*g;return r}let u=o*2,f=e-1;for(let g=0;g!==o;++g){let b=a[c+g],m=a[l+g],p=f*u+g*2,T=d[p],S=d[p+1],y=e*u+g*2,A=h[y],M=h[y+1],C=(i-t)/(s-t),v,w,P,I,U;for(let q=0;q<8;q++){v=C*C,w=v*C,P=1-C,I=P*P,U=I*P;let B=U*t+3*I*C*T+3*P*v*A+w*s-i;if(Math.abs(B)<1e-10)break;let X=3*I*(T-t)+6*P*C*(A-T)+3*v*(s-A);if(Math.abs(X)<1e-10)break;C=C-B/X,C=Math.max(0,Math.min(1,C))}r[g]=U*b+3*I*C*S+3*P*v*M+w*m}return r}},$t=class{constructor(e,t,i,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Ja(t,this.TimeBufferType),this.values=Ja(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:Ja(e.times,Array),values:Ja(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(i.interpolation=s)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new Co(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Eo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new wo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new Ro(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case or:t=this.InterpolantFactoryMethodDiscrete;break;case ho:t=this.InterpolantFactoryMethodLinear;break;case Qa:t=this.InterpolantFactoryMethodSmooth;break;case Fc:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return Oe("KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return or;case this.InterpolantFactoryMethodLinear:return ho;case this.InterpolantFactoryMethodSmooth:return Qa;case this.InterpolantFactoryMethodBezier:return Fc}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]*=e}return this}trim(e,t){let i=this.times,s=i.length,r=0,a=s-1;for(;r!==s&&i[r]<e;)++r;for(;a!==-1&&i[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=i.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(ke("KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,s=this.values,r=i.length;r===0&&(ke("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let l=i[o];if(typeof l=="number"&&isNaN(l)){ke("KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){ke("KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(s!==void 0&&hp(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){ke("KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===Qa,r=e.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=e[o],h=e[o+1];if(c!==h&&(o!==1||c!==e[0]))if(s)l=!0;else{let d=o*i,u=d-i,f=d+i;for(let g=0;g!==i;++g){let b=t[d+g];if(b!==t[u+g]||b!==t[f+g]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];let d=o*i,u=a*i;for(let f=0;f!==i;++f)t[u+f]=t[d+f]}++a}}if(r>0){e[a]=e[r];for(let o=r*i,l=a*i,c=0;c!==i;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=this.constructor,s=new i(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}};$t.prototype.ValueTypeName="";$t.prototype.TimeBufferType=Float32Array;$t.prototype.ValueBufferType=Float32Array;$t.prototype.DefaultInterpolation=ho;var un=class extends $t{constructor(e,t,i){super(e,t,i)}};un.prototype.ValueTypeName="bool";un.prototype.ValueBufferType=Array;un.prototype.DefaultInterpolation=or;un.prototype.InterpolantFactoryMethodLinear=void 0;un.prototype.InterpolantFactoryMethodSmooth=void 0;var Po=class extends $t{constructor(e,t,i,s){super(e,t,i,s)}};Po.prototype.ValueTypeName="color";var Io=class extends $t{constructor(e,t,i,s){super(e,t,i,s)}};Io.prototype.ValueTypeName="number";var Lo=class extends hn{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(i-t)/(s-t),c=e*o;for(let h=c+o;c!==h;c+=4)oi.slerpFlat(r,0,a,c-o,a,c,l);return r}},zr=class extends $t{constructor(e,t,i,s){super(e,t,i,s)}InterpolantFactoryMethodLinear(e){return new Lo(this.times,this.values,this.getValueSize(),e)}};zr.prototype.ValueTypeName="quaternion";zr.prototype.InterpolantFactoryMethodSmooth=void 0;var dn=class extends $t{constructor(e,t,i){super(e,t,i)}};dn.prototype.ValueTypeName="string";dn.prototype.ValueBufferType=Array;dn.prototype.DefaultInterpolation=or;dn.prototype.InterpolantFactoryMethodLinear=void 0;dn.prototype.InterpolantFactoryMethodSmooth=void 0;var Do=class extends $t{constructor(e,t,i,s){super(e,t,i,s)}};Do.prototype.ValueTypeName="vector";var No=class{constructor(e,t,i){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this._abortController=null,this.itemStart=function(h){o++,r===!1&&s.onStart!==void 0&&s.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,s.onProgress!==void 0&&s.onProgress(h,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,d){return c.push(h,d),this},this.removeHandler=function(h){let d=c.indexOf(h);return d!==-1&&c.splice(d,2),this},this.getHandler=function(h){for(let d=0,u=c.length;d<u;d+=2){let f=c[d],g=c[d+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Pd=new No,Uo=class{constructor(e){this.manager=e!==void 0?e:Pd,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let i=this;return new Promise(function(s,r){i.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};Uo.DEFAULT_MATERIAL_NAME="__DEFAULT";var Es=class extends It{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ee(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Vr=class extends Es{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(It.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ee(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},Uc=new rt,Bu=new L,ku=new L,Fo=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ee(512,512),this.mapType=Yt,this.map=null,this.mapPass=null,this.matrix=new rt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new _s,this._frameExtents=new ee(1,1),this._viewportCount=1,this._viewports=[new yt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,i=this.matrix;Bu.setFromMatrixPosition(e.matrixWorld),t.position.copy(Bu),ku.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(ku),t.updateMatrixWorld(),Uc.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Uc,t.coordinateSystem,t.reversedDepth),t.coordinateSystem===ps||t.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Uc)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},ja=new L,Ka=new oi,Ci=new L,Gr=class extends It{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new rt,this.projectionMatrix=new rt,this.projectionMatrixInverse=new rt,this.coordinateSystem=_i,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(ja,Ka,Ci),Ci.x===1&&Ci.y===1&&Ci.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ja,Ka,Ci.set(1,1,1)).invert()}updateWorldMatrix(e,t,i=!1){super.updateWorldMatrix(e,t,i),this.matrixWorld.decompose(ja,Ka,Ci),Ci.x===1&&Ci.y===1&&Ci.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ja,Ka,Ci.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},ln=new L,zu=new ee,Vu=new ee,kt=class extends Gr{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=gs*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(nr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return gs*2*Math.atan(Math.tan(nr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){ln.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(ln.x,ln.y).multiplyScalar(-e/ln.z),ln.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(ln.x,ln.y).multiplyScalar(-e/ln.z)}getViewSize(e,t){return this.getViewBounds(e,zu,Vu),t.subVectors(Vu,zu)}setViewOffset(e,t,i,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(nr*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*i/c,s*=a.width/l,i*=a.height/c}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var qc=class extends Fo{constructor(){super(new kt(90,1,.5,500)),this.isPointLightShadow=!0}},Hr=class extends Es{constructor(e,t,i=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=s,this.shadow=new qc}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},fn=class extends Gr{constructor(e=-1,t=1,i=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=i-e,a=i+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Yc=class extends Fo{constructor(){super(new fn(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Wr=class extends Es{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(It.DEFAULT_UP),this.updateMatrix(),this.target=new It,this.shadow=new Yc}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var us=-90,ds=1,Oo=class extends It{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new kt(us,ds,e,t);s.layers=this.layers,this.add(s);let r=new kt(us,ds,e,t);r.layers=this.layers,this.add(r);let a=new kt(us,ds,e,t);a.layers=this.layers,this.add(a);let o=new kt(us,ds,e,t);o.layers=this.layers,this.add(o);let l=new kt(us,ds,e,t);l.layers=this.layers,this.add(l);let c=new kt(us,ds,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,s,r,a,o,l]=t;for(let c of t)this.remove(c);if(e===_i)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===ps)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,h]=this.children,d=e.getRenderTarget(),u=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let b=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(i,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(i,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(i,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(i,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(i,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),i.texture.generateMipmaps=b,e.setRenderTarget(i,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,h),e.setRenderTarget(d,u,f),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}},Bo=class extends kt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},Xr=class{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(e){this._document=e,e.hidden!==void 0&&(this._pageVisibilityHandler=bm.bind(this),e.addEventListener("visibilitychange",this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener("visibilitychange",this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(e){return this._timescale=e,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(e){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(e!==void 0?e:performance.now())-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}};function bm(){this._document.hidden===!1&&this.reset()}var hh="\\[\\]\\.:\\/",Sm=new RegExp("["+hh+"]","g"),uh="[^"+hh+"]",Mm="[^"+hh.replace("\\.","")+"]",Tm=/((?:WC+[\/:])*)/.source.replace("WC",uh),Am=/(WCOD+)?/.source.replace("WCOD",Mm),wm=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",uh),Em=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",uh),Cm=new RegExp("^"+Tm+Am+wm+Em+"$"),Rm=["material","materials","bones","map"],Zc=class{constructor(e,t,i){let s=i||xt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(e,t)}setValue(e,t){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=i.length;s!==r;++s)i[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}},xt=class n{constructor(e,t,i){this.path=t,this.parsedPath=i||n.parseTrackName(t),this.node=n.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new n.Composite(e,t,i):new n(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Sm,"")}static parseTrackName(e){let t=Cm.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=i.nodeName.substring(s+1);Rm.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){let i=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let l=i(o.children);if(l)return l}return null},s=i(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)e[t++]=i[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,i=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=n.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Oe("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=t.objectIndex;switch(i){case"materials":if(!e.material){ke("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){ke("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){ke("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){ke("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){ke("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){ke("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(c!==void 0){if(e[c]===void 0){ke("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let a=e[s];if(a===void 0){let c=t.nodeName;ke("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){ke("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){ke("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};xt.Composite=Zc;xt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};xt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};xt.prototype.GetterByBindingType=[xt.prototype._getValue_direct,xt.prototype._getValue_array,xt.prototype._getValue_arrayElement,xt.prototype._getValue_toArray];xt.prototype.SetterByBindingTypeAndVersioning=[[xt.prototype._setValue_direct,xt.prototype._setValue_direct_setNeedsUpdate,xt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[xt.prototype._setValue_array,xt.prototype._setValue_array_setNeedsUpdate,xt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[xt.prototype._setValue_arrayElement,xt.prototype._setValue_arrayElement_setNeedsUpdate,xt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[xt.prototype._setValue_fromArray,xt.prototype._setValue_fromArray_setNeedsUpdate,xt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var o_=new Float32Array(1);var Jc=class n{static{n.prototype.isMatrix2=!0}constructor(e,t,i,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,i,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let i=0;i<4;i++)this.elements[i]=e[i+t];return this}set(e,t,i,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=i,r[3]=s,this}};function dh(n,e,t,i){let s=Pm(i);switch(t){case sh:return n*e;case qo:return n*e/s.components*s.byteLength;case Yo:return n*e/s.components*s.byteLength;case xn:return n*e*2/s.components*s.byteLength;case Zo:return n*e*2/s.components*s.byteLength;case rh:return n*e*3/s.components*s.byteLength;case fi:return n*e*4/s.components*s.byteLength;case Jo:return n*e*4/s.components*s.byteLength;case ta:case ia:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case na:case sa:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Ko:case $o:return Math.max(n,16)*Math.max(e,8)/4;case jo:case Qo:return Math.max(n,8)*Math.max(e,8)/2;case el:case tl:case nl:case sl:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case il:case ra:case rl:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case al:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case ol:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case ll:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case cl:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case hl:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case ul:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case dl:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case fl:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case pl:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case ml:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case gl:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case xl:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case vl:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case yl:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case _l:case bl:case Sl:return Math.ceil(n/4)*Math.ceil(e/4)*16;case Ml:case Tl:return Math.ceil(n/4)*Math.ceil(e/4)*8;case aa:case Al:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Pm(n){switch(n){case Yt:case eh:return{byteLength:1,components:1};case Rs:case th:case Ct:return{byteLength:2,components:1};case Wo:case Xo:return{byteLength:2,components:4};case Mi:case Ho:case di:return{byteLength:4,components:1};case ih:case nh:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"185"}}));typeof window<"u"&&(window.__THREE__?Oe("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="185");function $d(){let n=null,e=!1,t=null,i=null;function s(r,a){t(r,a),i=n.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&n!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n!==null&&n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function Lm(n){let e=new WeakMap;function t(o,l){let c=o.array,h=o.usage,d=c.byteLength,u=n.createBuffer();n.bindBuffer(l,u),n.bufferData(l,c,h),o.onUploadCallback();let f;if(c instanceof Float32Array)f=n.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=n.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=n.HALF_FLOAT:f=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=n.SHORT;else if(c instanceof Uint32Array)f=n.UNSIGNED_INT;else if(c instanceof Int32Array)f=n.INT;else if(c instanceof Int8Array)f=n.BYTE;else if(c instanceof Uint8Array)f=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:d}}function i(o,l,c){let h=l.array,d=l.updateRanges;if(n.bindBuffer(c,o),d.length===0)n.bufferSubData(c,0,h);else{d.sort((f,g)=>f.start-g.start);let u=0;for(let f=1;f<d.length;f++){let g=d[u],b=d[f];b.start<=g.start+g.count+1?g.count=Math.max(g.count,b.start+b.count-g.start):(++u,d[u]=b)}d.length=u+1;for(let f=0,g=d.length;f<g;f++){let b=d[f];n.bufferSubData(c,b.start*h.BYTES_PER_ELEMENT,h,b.start,b.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=e.get(o);l&&(n.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var Dm=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Nm=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Um=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Fm=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Om=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Bm=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,km=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,zm=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Vm=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Gm=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Hm=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Wm=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Xm=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,qm=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Ym=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Zm=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Jm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,jm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Km=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Qm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,$m=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,eg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,tg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,ig=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,ng=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,sg=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,rg=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,ag=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,og=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,lg=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,cg="gl_FragColor = linearToOutputTexel( gl_FragColor );",hg=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,ug=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,dg=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,fg=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,pg=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,mg=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,gg=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,xg=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,vg=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,yg=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,_g=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,bg=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Sg=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Mg=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Tg=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Ag=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,wg=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Eg=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Cg=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Rg=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Pg=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Ig=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Lg=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Dg=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Ng=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Ug=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Fg=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Og=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Bg=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,kg=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,zg=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Vg=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Gg=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Hg=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Wg=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Xg=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,qg=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Yg=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Zg=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Jg=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,jg=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Kg=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Qg=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,$g=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,e0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,t0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,i0=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,n0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,s0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,r0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,a0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,o0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,l0=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,c0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,h0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,u0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,d0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,f0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,p0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,m0=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,g0=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,x0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,v0=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,y0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,_0=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,b0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,S0=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,M0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,T0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,A0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,w0=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,E0=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,C0=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,R0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,P0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,I0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,L0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,D0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,N0=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,U0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,F0=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,O0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,B0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,k0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,z0=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,V0=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,G0=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,H0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,W0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,X0=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,q0=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Y0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Z0=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,J0=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,j0=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,K0=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Q0=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,$0=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,ex=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,tx=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ix=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,nx=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,sx=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,rx=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ax=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ox=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,lx=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,cx=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,hx=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,ux=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,dx=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Je={alphahash_fragment:Dm,alphahash_pars_fragment:Nm,alphamap_fragment:Um,alphamap_pars_fragment:Fm,alphatest_fragment:Om,alphatest_pars_fragment:Bm,aomap_fragment:km,aomap_pars_fragment:zm,batching_pars_vertex:Vm,batching_vertex:Gm,begin_vertex:Hm,beginnormal_vertex:Wm,bsdfs:Xm,iridescence_fragment:qm,bumpmap_pars_fragment:Ym,clipping_planes_fragment:Zm,clipping_planes_pars_fragment:Jm,clipping_planes_pars_vertex:jm,clipping_planes_vertex:Km,color_fragment:Qm,color_pars_fragment:$m,color_pars_vertex:eg,color_vertex:tg,common:ig,cube_uv_reflection_fragment:ng,defaultnormal_vertex:sg,displacementmap_pars_vertex:rg,displacementmap_vertex:ag,emissivemap_fragment:og,emissivemap_pars_fragment:lg,colorspace_fragment:cg,colorspace_pars_fragment:hg,envmap_fragment:ug,envmap_common_pars_fragment:dg,envmap_pars_fragment:fg,envmap_pars_vertex:pg,envmap_physical_pars_fragment:Ag,envmap_vertex:mg,fog_vertex:gg,fog_pars_vertex:xg,fog_fragment:vg,fog_pars_fragment:yg,gradientmap_pars_fragment:_g,lightmap_pars_fragment:bg,lights_lambert_fragment:Sg,lights_lambert_pars_fragment:Mg,lights_pars_begin:Tg,lights_toon_fragment:wg,lights_toon_pars_fragment:Eg,lights_phong_fragment:Cg,lights_phong_pars_fragment:Rg,lights_physical_fragment:Pg,lights_physical_pars_fragment:Ig,lights_fragment_begin:Lg,lights_fragment_maps:Dg,lights_fragment_end:Ng,lightprobes_pars_fragment:Ug,logdepthbuf_fragment:Fg,logdepthbuf_pars_fragment:Og,logdepthbuf_pars_vertex:Bg,logdepthbuf_vertex:kg,map_fragment:zg,map_pars_fragment:Vg,map_particle_fragment:Gg,map_particle_pars_fragment:Hg,metalnessmap_fragment:Wg,metalnessmap_pars_fragment:Xg,morphinstance_vertex:qg,morphcolor_vertex:Yg,morphnormal_vertex:Zg,morphtarget_pars_vertex:Jg,morphtarget_vertex:jg,normal_fragment_begin:Kg,normal_fragment_maps:Qg,normal_pars_fragment:$g,normal_pars_vertex:e0,normal_vertex:t0,normalmap_pars_fragment:i0,clearcoat_normal_fragment_begin:n0,clearcoat_normal_fragment_maps:s0,clearcoat_pars_fragment:r0,iridescence_pars_fragment:a0,opaque_fragment:o0,packing:l0,premultiplied_alpha_fragment:c0,project_vertex:h0,dithering_fragment:u0,dithering_pars_fragment:d0,roughnessmap_fragment:f0,roughnessmap_pars_fragment:p0,shadowmap_pars_fragment:m0,shadowmap_pars_vertex:g0,shadowmap_vertex:x0,shadowmask_pars_fragment:v0,skinbase_vertex:y0,skinning_pars_vertex:_0,skinning_vertex:b0,skinnormal_vertex:S0,specularmap_fragment:M0,specularmap_pars_fragment:T0,tonemapping_fragment:A0,tonemapping_pars_fragment:w0,transmission_fragment:E0,transmission_pars_fragment:C0,uv_pars_fragment:R0,uv_pars_vertex:P0,uv_vertex:I0,worldpos_vertex:L0,background_vert:D0,background_frag:N0,backgroundCube_vert:U0,backgroundCube_frag:F0,cube_vert:O0,cube_frag:B0,depth_vert:k0,depth_frag:z0,distance_vert:V0,distance_frag:G0,equirect_vert:H0,equirect_frag:W0,linedashed_vert:X0,linedashed_frag:q0,meshbasic_vert:Y0,meshbasic_frag:Z0,meshlambert_vert:J0,meshlambert_frag:j0,meshmatcap_vert:K0,meshmatcap_frag:Q0,meshnormal_vert:$0,meshnormal_frag:ex,meshphong_vert:tx,meshphong_frag:ix,meshphysical_vert:nx,meshphysical_frag:sx,meshtoon_vert:rx,meshtoon_frag:ax,points_vert:ox,points_frag:lx,shadow_vert:cx,shadow_frag:hx,sprite_vert:ux,sprite_frag:dx},ve={common:{diffuse:{value:new Ee(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new We},alphaMap:{value:null},alphaMapTransform:{value:new We},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new We}},envmap:{envMap:{value:null},envMapRotation:{value:new We},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new We}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new We}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new We},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new We},normalScale:{value:new ee(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new We},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new We}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new We}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new We}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ee(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new L},probesMax:{value:new L},probesResolution:{value:new L}},points:{diffuse:{value:new Ee(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new We},alphaTest:{value:0},uvTransform:{value:new We}},sprite:{diffuse:{value:new Ee(16777215)},opacity:{value:1},center:{value:new ee(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new We},alphaMap:{value:null},alphaMapTransform:{value:new We},alphaTest:{value:0}}},Bi={basic:{uniforms:Wt([ve.common,ve.specularmap,ve.envmap,ve.aomap,ve.lightmap,ve.fog]),vertexShader:Je.meshbasic_vert,fragmentShader:Je.meshbasic_frag},lambert:{uniforms:Wt([ve.common,ve.specularmap,ve.envmap,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.fog,ve.lights,{emissive:{value:new Ee(0)},envMapIntensity:{value:1}}]),vertexShader:Je.meshlambert_vert,fragmentShader:Je.meshlambert_frag},phong:{uniforms:Wt([ve.common,ve.specularmap,ve.envmap,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.fog,ve.lights,{emissive:{value:new Ee(0)},specular:{value:new Ee(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Je.meshphong_vert,fragmentShader:Je.meshphong_frag},standard:{uniforms:Wt([ve.common,ve.envmap,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.roughnessmap,ve.metalnessmap,ve.fog,ve.lights,{emissive:{value:new Ee(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Je.meshphysical_vert,fragmentShader:Je.meshphysical_frag},toon:{uniforms:Wt([ve.common,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.gradientmap,ve.fog,ve.lights,{emissive:{value:new Ee(0)}}]),vertexShader:Je.meshtoon_vert,fragmentShader:Je.meshtoon_frag},matcap:{uniforms:Wt([ve.common,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.fog,{matcap:{value:null}}]),vertexShader:Je.meshmatcap_vert,fragmentShader:Je.meshmatcap_frag},points:{uniforms:Wt([ve.points,ve.fog]),vertexShader:Je.points_vert,fragmentShader:Je.points_frag},dashed:{uniforms:Wt([ve.common,ve.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Je.linedashed_vert,fragmentShader:Je.linedashed_frag},depth:{uniforms:Wt([ve.common,ve.displacementmap]),vertexShader:Je.depth_vert,fragmentShader:Je.depth_frag},normal:{uniforms:Wt([ve.common,ve.bumpmap,ve.normalmap,ve.displacementmap,{opacity:{value:1}}]),vertexShader:Je.meshnormal_vert,fragmentShader:Je.meshnormal_frag},sprite:{uniforms:Wt([ve.sprite,ve.fog]),vertexShader:Je.sprite_vert,fragmentShader:Je.sprite_frag},background:{uniforms:{uvTransform:{value:new We},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Je.background_vert,fragmentShader:Je.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new We}},vertexShader:Je.backgroundCube_vert,fragmentShader:Je.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Je.cube_vert,fragmentShader:Je.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Je.equirect_vert,fragmentShader:Je.equirect_frag},distance:{uniforms:Wt([ve.common,ve.displacementmap,{referencePosition:{value:new L},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Je.distance_vert,fragmentShader:Je.distance_frag},shadow:{uniforms:Wt([ve.lights,ve.fog,{color:{value:new Ee(0)},opacity:{value:1}}]),vertexShader:Je.shadow_vert,fragmentShader:Je.shadow_frag}};Bi.physical={uniforms:Wt([Bi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new We},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new We},clearcoatNormalScale:{value:new ee(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new We},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new We},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new We},sheen:{value:0},sheenColor:{value:new Ee(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new We},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new We},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new We},transmissionSamplerSize:{value:new ee},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new We},attenuationDistance:{value:0},attenuationColor:{value:new Ee(0)},specularColor:{value:new Ee(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new We},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new We},anisotropyVector:{value:new ee},anisotropyMap:{value:null},anisotropyMapTransform:{value:new We}}]),vertexShader:Je.meshphysical_vert,fragmentShader:Je.meshphysical_frag};var Rl={r:0,b:0,g:0},fx=new rt,ef=new We;ef.set(-1,0,0,0,1,0,0,0,1);function px(n,e,t,i,s,r){let a=new Ee(0),o=s===!0?0:1,l,c,h=null,d=0,u=null;function f(T){let S=T.isScene===!0?T.background:null;if(S&&S.isTexture){let y=T.backgroundBlurriness>0;S=e.get(S,y)}return S}function g(T){let S=!1,y=f(T);y===null?m(a,o):y&&y.isColor&&(m(y,1),S=!0);let A=n.xr.getEnvironmentBlendMode();A==="additive"?t.buffers.color.setClear(0,0,0,1,r):A==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(n.autoClear||S)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function b(T,S){let y=f(S);y&&(y.isCubeTexture||y.mapping===$r)?(c===void 0&&(c=new tt(new Fi(1,1,1),new pt({name:"BackgroundCubeMaterial",uniforms:Gn(Bi.backgroundCube.uniforms),vertexShader:Bi.backgroundCube.vertexShader,fragmentShader:Bi.backgroundCube.fragmentShader,side:Dt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(A,M,C){this.matrixWorld.copyPosition(C.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=y,c.material.uniforms.backgroundBlurriness.value=S.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(fx.makeRotationFromEuler(S.backgroundRotation)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(ef),c.material.toneMapped=$e.getTransfer(y.colorSpace)!==st,(h!==y||d!==y.version||u!==n.toneMapping)&&(c.material.needsUpdate=!0,h=y,d=y.version,u=n.toneMapping),c.layers.enableAll(),T.unshift(c,c.geometry,c.material,0,0,null)):y&&y.isTexture&&(l===void 0&&(l=new tt(new On(2,2),new pt({name:"BackgroundMaterial",uniforms:Gn(Bi.background.uniforms),vertexShader:Bi.background.vertexShader,fragmentShader:Bi.background.fragmentShader,side:Yi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=y,l.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,l.material.toneMapped=$e.getTransfer(y.colorSpace)!==st,y.matrixAutoUpdate===!0&&y.updateMatrix(),l.material.uniforms.uvTransform.value.copy(y.matrix),(h!==y||d!==y.version||u!==n.toneMapping)&&(l.material.needsUpdate=!0,h=y,d=y.version,u=n.toneMapping),l.layers.enableAll(),T.unshift(l,l.geometry,l.material,0,0,null))}function m(T,S){T.getRGB(Rl,ch(n)),t.buffers.color.setClear(Rl.r,Rl.g,Rl.b,S,r)}function p(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(T,S=1){a.set(T),o=S,m(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(T){o=T,m(a,o)},render:g,addToRenderList:b,dispose:p}}function mx(n,e){let t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=u(null),r=s,a=!1;function o(I,U,q,Y,B){let X=!1,W=d(I,Y,q,U);r!==W&&(r=W,c(r.object)),X=f(I,Y,q,B),X&&g(I,Y,q,B),B!==null&&e.update(B,n.ELEMENT_ARRAY_BUFFER),(X||a)&&(a=!1,y(I,U,q,Y),B!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(B).buffer))}function l(){return n.createVertexArray()}function c(I){return n.bindVertexArray(I)}function h(I){return n.deleteVertexArray(I)}function d(I,U,q,Y){let B=Y.wireframe===!0,X=i[U.id];X===void 0&&(X={},i[U.id]=X);let W=I.isInstancedMesh===!0?I.id:0,$=X[W];$===void 0&&($={},X[W]=$);let re=$[q.id];re===void 0&&(re={},$[q.id]=re);let de=re[B];return de===void 0&&(de=u(l()),re[B]=de),de}function u(I){let U=[],q=[],Y=[];for(let B=0;B<t;B++)U[B]=0,q[B]=0,Y[B]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:U,enabledAttributes:q,attributeDivisors:Y,object:I,attributes:{},index:null}}function f(I,U,q,Y){let B=r.attributes,X=U.attributes,W=0,$=q.getAttributes();for(let re in $)if($[re].location>=0){let ce=B[re],Me=X[re];if(Me===void 0&&(re==="instanceMatrix"&&I.instanceMatrix&&(Me=I.instanceMatrix),re==="instanceColor"&&I.instanceColor&&(Me=I.instanceColor)),ce===void 0||ce.attribute!==Me||Me&&ce.data!==Me.data)return!0;W++}return r.attributesNum!==W||r.index!==Y}function g(I,U,q,Y){let B={},X=U.attributes,W=0,$=q.getAttributes();for(let re in $)if($[re].location>=0){let ce=X[re];ce===void 0&&(re==="instanceMatrix"&&I.instanceMatrix&&(ce=I.instanceMatrix),re==="instanceColor"&&I.instanceColor&&(ce=I.instanceColor));let Me={};Me.attribute=ce,ce&&ce.data&&(Me.data=ce.data),B[re]=Me,W++}r.attributes=B,r.attributesNum=W,r.index=Y}function b(){let I=r.newAttributes;for(let U=0,q=I.length;U<q;U++)I[U]=0}function m(I){p(I,0)}function p(I,U){let q=r.newAttributes,Y=r.enabledAttributes,B=r.attributeDivisors;q[I]=1,Y[I]===0&&(n.enableVertexAttribArray(I),Y[I]=1),B[I]!==U&&(n.vertexAttribDivisor(I,U),B[I]=U)}function T(){let I=r.newAttributes,U=r.enabledAttributes;for(let q=0,Y=U.length;q<Y;q++)U[q]!==I[q]&&(n.disableVertexAttribArray(q),U[q]=0)}function S(I,U,q,Y,B,X,W){W===!0?n.vertexAttribIPointer(I,U,q,B,X):n.vertexAttribPointer(I,U,q,Y,B,X)}function y(I,U,q,Y){b();let B=Y.attributes,X=q.getAttributes(),W=U.defaultAttributeValues;for(let $ in X){let re=X[$];if(re.location>=0){let de=B[$];if(de===void 0&&($==="instanceMatrix"&&I.instanceMatrix&&(de=I.instanceMatrix),$==="instanceColor"&&I.instanceColor&&(de=I.instanceColor)),de!==void 0){let ce=de.normalized,Me=de.itemSize,je=e.get(de);if(je===void 0)continue;let ut=je.buffer,it=je.type,K=je.bytesPerElement,he=it===n.INT||it===n.UNSIGNED_INT||de.gpuType===Ho;if(de.isInterleavedBufferAttribute){let ae=de.data,De=ae.stride,Ve=de.offset;if(ae.isInstancedInterleavedBuffer){for(let Fe=0;Fe<re.locationSize;Fe++)p(re.location+Fe,ae.meshPerAttribute);I.isInstancedMesh!==!0&&Y._maxInstanceCount===void 0&&(Y._maxInstanceCount=ae.meshPerAttribute*ae.count)}else for(let Fe=0;Fe<re.locationSize;Fe++)m(re.location+Fe);n.bindBuffer(n.ARRAY_BUFFER,ut);for(let Fe=0;Fe<re.locationSize;Fe++)S(re.location+Fe,Me/re.locationSize,it,ce,De*K,(Ve+Me/re.locationSize*Fe)*K,he)}else{if(de.isInstancedBufferAttribute){for(let ae=0;ae<re.locationSize;ae++)p(re.location+ae,de.meshPerAttribute);I.isInstancedMesh!==!0&&Y._maxInstanceCount===void 0&&(Y._maxInstanceCount=de.meshPerAttribute*de.count)}else for(let ae=0;ae<re.locationSize;ae++)m(re.location+ae);n.bindBuffer(n.ARRAY_BUFFER,ut);for(let ae=0;ae<re.locationSize;ae++)S(re.location+ae,Me/re.locationSize,it,ce,Me*K,Me/re.locationSize*ae*K,he)}}else if(W!==void 0){let ce=W[$];if(ce!==void 0)switch(ce.length){case 2:n.vertexAttrib2fv(re.location,ce);break;case 3:n.vertexAttrib3fv(re.location,ce);break;case 4:n.vertexAttrib4fv(re.location,ce);break;default:n.vertexAttrib1fv(re.location,ce)}}}}T()}function A(){w();for(let I in i){let U=i[I];for(let q in U){let Y=U[q];for(let B in Y){let X=Y[B];for(let W in X)h(X[W].object),delete X[W];delete Y[B]}}delete i[I]}}function M(I){if(i[I.id]===void 0)return;let U=i[I.id];for(let q in U){let Y=U[q];for(let B in Y){let X=Y[B];for(let W in X)h(X[W].object),delete X[W];delete Y[B]}}delete i[I.id]}function C(I){for(let U in i){let q=i[U];for(let Y in q){let B=q[Y];if(B[I.id]===void 0)continue;let X=B[I.id];for(let W in X)h(X[W].object),delete X[W];delete B[I.id]}}}function v(I){for(let U in i){let q=i[U],Y=I.isInstancedMesh===!0?I.id:0,B=q[Y];if(B!==void 0){for(let X in B){let W=B[X];for(let $ in W)h(W[$].object),delete W[$];delete B[X]}delete q[Y],Object.keys(q).length===0&&delete i[U]}}}function w(){P(),a=!0,r!==s&&(r=s,c(r.object))}function P(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:w,resetDefaultState:P,dispose:A,releaseStatesOfGeometry:M,releaseStatesOfObject:v,releaseStatesOfProgram:C,initAttributes:b,enableAttribute:m,disableUnusedAttributes:T}}function gx(n,e,t){let i;function s(l){i=l}function r(l,c){n.drawArrays(i,l,c),t.update(c,i,1)}function a(l,c,h){h!==0&&(n.drawArraysInstanced(i,l,c,h),t.update(c,i,h))}function o(l,c,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,h);let u=0;for(let f=0;f<h;f++)u+=c[f];t.update(u,i,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function xx(n,e,t,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let C=e.get("EXT_texture_filter_anisotropic");s=n.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(C){return!(C!==fi&&i.convert(C)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(C){let v=C===Ct&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(C!==Yt&&i.convert(C)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&C!==di&&!v)}function l(C){if(C==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";C="mediump"}return C==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",h=l(c);h!==c&&(Oe("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let d=t.logarithmicDepthBuffer===!0,u=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&u===!1&&Oe("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),g=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),b=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),p=n.getParameter(n.MAX_VERTEX_ATTRIBS),T=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),S=n.getParameter(n.MAX_VARYING_VECTORS),y=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),A=n.getParameter(n.MAX_SAMPLES),M=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:u,maxTextures:f,maxVertexTextures:g,maxTextureSize:b,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:T,maxVaryings:S,maxFragmentUniforms:y,maxSamples:A,samples:M}}function vx(n){let e=this,t=null,i=0,s=!1,r=!1,a=new Ri,o=new We,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,u){let f=d.length!==0||u||i!==0||s;return s=u,i=d.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,u){t=h(d,u,0)},this.setState=function(d,u,f){let g=d.clippingPlanes,b=d.clipIntersection,m=d.clipShadows,p=n.get(d);if(!s||g===null||g.length===0||r&&!m)r?h(null):c();else{let T=r?0:i,S=T*4,y=p.clippingState||null;l.value=y,y=h(g,u,S,f);for(let A=0;A!==S;++A)y[A]=t[A];p.clippingState=y,this.numIntersection=b?this.numPlanes:0,this.numPlanes+=T}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function h(d,u,f,g){let b=d!==null?d.length:0,m=null;if(b!==0){if(m=l.value,g!==!0||m===null){let p=f+b*4,T=u.matrixWorldInverse;o.getNormalMatrix(T),(m===null||m.length<p)&&(m=new Float32Array(p));for(let S=0,y=f;S!==b;++S,y+=4)a.copy(d[S]).applyMatrix4(T,o),a.normal.toArray(m,y),m[y+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=b,e.numIntersection=0,m}}var vn=4,Id=[.125,.215,.35,.446,.526,.582],Hn=20,yx=256,la=new fn,Ld=new Ee,fh=null,ph=0,mh=0,gh=!1,_x=new L,Ds=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,s=100,r={}){let{size:a=256,position:o=_x}=r;fh=this._renderer.getRenderTarget(),ph=this._renderer.getActiveCubeFace(),mh=this._renderer.getActiveMipmapLevel(),gh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,i,s,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Ud(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Nd(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(fh,ph,mh),this._renderer.xr.enabled=gh,e.scissorTest=!1,Is(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===pn||e.mapping===Vn?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),fh=this._renderer.getRenderTarget(),ph=this._renderer.getActiveCubeFace(),mh=this._renderer.getActiveMipmapLevel(),gh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Lt,minFilter:Lt,generateMipmaps:!1,type:Ct,format:fi,colorSpace:lr,depthBuffer:!1},s=Dd(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Dd(e,t,i);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=bx(r)),this._blurMaterial=Mx(r,e,t),this._ggxMaterial=Sx(r,e,t)}return s}_compileMaterial(e){let t=new tt(new Tt,e);this._renderer.compile(t,la)}_sceneToCubeUV(e,t,i,s,r){let l=new kt(90,1,t,i),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],d=this._renderer,u=d.autoClear,f=d.toneMapping;d.getClearColor(Ld),d.toneMapping=Si,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(s),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new tt(new Fi,new ci({name:"PMREM.Background",side:Dt,depthWrite:!1,depthTest:!1})));let b=this._backgroundBox,m=b.material,p=!1,T=e.background;T?T.isColor&&(m.color.copy(T),e.background=null,p=!0):(m.color.copy(Ld),p=!0);for(let S=0;S<6;S++){let y=S%3;y===0?(l.up.set(0,c[S],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[S],r.y,r.z)):y===1?(l.up.set(0,0,c[S]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[S],r.z)):(l.up.set(0,c[S],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[S]));let A=this._cubeSize;Is(s,y*A,S>2?A:0,A,A),d.setRenderTarget(s),p&&d.render(b,l),d.render(e,l)}d.toneMapping=f,d.autoClear=u,e.background=T}_textureToCubeUV(e,t){let i=this._renderer,s=e.mapping===pn||e.mapping===Vn;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Ud()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Nd());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=e;let l=this._cubeSize;Is(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(a,la)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=i}_applyGGXFilter(e,t,i){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[i];o.material=a;let l=a.uniforms,c=i/(this._lodMeshes.length-1),h=t/(this._lodMeshes.length-1),d=Math.sqrt(c*c-h*h),u=0+c*1.25,f=d*u,{_lodMax:g}=this,b=this._sizeLods[i],m=3*b*(i>g-vn?i-g+vn:0),p=4*(this._cubeSize-b);l.envMap.value=e.texture,l.roughness.value=f,l.mipInt.value=g-t,Is(r,m,p,3*b,2*b),s.setRenderTarget(r),s.render(o,la),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=g-i,Is(e,m,p,3*b,2*b),s.setRenderTarget(e),s.render(o,la)}_blur(e,t,i,s,r){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,i,s,"latitudinal",r),this._halfBlur(a,e,i,i,s,"longitudinal",r)}_halfBlur(e,t,i,s,r,a,o){let l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&ke("blur direction must be either latitudinal or longitudinal!");let h=3,d=this._lodMeshes[s];d.material=c;let u=c.uniforms,f=this._sizeLods[i]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*Hn-1),b=r/g,m=isFinite(r)?1+Math.floor(h*b):Hn;m>Hn&&Oe(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Hn}`);let p=[],T=0;for(let C=0;C<Hn;++C){let v=C/b,w=Math.exp(-v*v/2);p.push(w),C===0?T+=w:C<m&&(T+=2*w)}for(let C=0;C<p.length;C++)p[C]=p[C]/T;u.envMap.value=e.texture,u.samples.value=m,u.weights.value=p,u.latitudinal.value=a==="latitudinal",o&&(u.poleAxis.value=o);let{_lodMax:S}=this;u.dTheta.value=g,u.mipInt.value=S-i;let y=this._sizeLods[s],A=3*y*(s>S-vn?s-S+vn:0),M=4*(this._cubeSize-y);Is(t,A,M,3*y,2*y),l.setRenderTarget(t),l.render(d,la)}};function bx(n){let e=[],t=[],i=[],s=n,r=n-vn+1+Id.length;for(let a=0;a<r;a++){let o=Math.pow(2,s);e.push(o);let l=1/o;a>n-vn?l=Id[a-n+vn-1]:a===0&&(l=0),t.push(l);let c=1/(o-2),h=-c,d=1+c,u=[h,h,d,h,d,d,h,h,d,d,h,d],f=6,g=6,b=3,m=2,p=1,T=new Float32Array(b*g*f),S=new Float32Array(m*g*f),y=new Float32Array(p*g*f);for(let M=0;M<f;M++){let C=M%3*2/3-1,v=M>2?0:-1,w=[C,v,0,C+2/3,v,0,C+2/3,v+1,0,C,v,0,C+2/3,v+1,0,C,v+1,0];T.set(w,b*g*M),S.set(u,m*g*M);let P=[M,M,M,M,M,M];y.set(P,p*g*M)}let A=new Tt;A.setAttribute("position",new Pt(T,b)),A.setAttribute("uv",new Pt(S,m)),A.setAttribute("faceIndex",new Pt(y,p)),i.push(new tt(A,null)),s>vn&&s--}return{lodMeshes:i,sizeLods:e,sigmas:t}}function Dd(n,e,t){let i=new _t(n,e,t);return i.texture.mapping=$r,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Is(n,e,t,i,s){n.viewport.set(e,t,i,s),n.scissor.set(e,t,i,s)}function Sx(n,e,t){return new pt({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:yx,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Dl(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:ui,depthTest:!1,depthWrite:!1})}function Mx(n,e,t){let i=new Float32Array(Hn),s=new L(0,1,0);return new pt({name:"SphericalGaussianBlur",defines:{n:Hn,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Dl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:ui,depthTest:!1,depthWrite:!1})}function Nd(){return new pt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Dl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:ui,depthTest:!1,depthWrite:!1})}function Ud(){return new pt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Dl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:ui,depthTest:!1,depthWrite:!1})}function Dl(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}var Il=class extends _t{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new Mr(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Fi(5,5,5),r=new pt({name:"CubemapFromEquirect",uniforms:Gn(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Dt,blending:ui});r.uniforms.tEquirect.value=t;let a=new tt(s,r),o=t.minFilter;return t.minFilter===mn&&(t.minFilter=Lt),new Oo(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,i=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,i,s);e.setRenderTarget(r)}};function Tx(n){let e=new WeakMap,t=new WeakMap,i=null;function s(u,f=!1){return u==null?null:f?a(u):r(u)}function r(u){if(u&&u.isTexture){let f=u.mapping;if(f===zo||f===Vo)if(e.has(u)){let g=e.get(u).texture;return o(g,u.mapping)}else{let g=u.image;if(g&&g.height>0){let b=new Il(g.height);return b.fromEquirectangularTexture(n,u),e.set(u,b),u.addEventListener("dispose",c),o(b.texture,u.mapping)}else return null}}return u}function a(u){if(u&&u.isTexture){let f=u.mapping,g=f===zo||f===Vo,b=f===pn||f===Vn;if(g||b){let m=t.get(u),p=m!==void 0?m.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==p)return i===null&&(i=new Ds(n)),m=g?i.fromEquirectangular(u,m):i.fromCubemap(u,m),m.texture.pmremVersion=u.pmremVersion,t.set(u,m),m.texture;if(m!==void 0)return m.texture;{let T=u.image;return g&&T&&T.height>0||b&&T&&l(T)?(i===null&&(i=new Ds(n)),m=g?i.fromEquirectangular(u):i.fromCubemap(u),m.texture.pmremVersion=u.pmremVersion,t.set(u,m),u.addEventListener("dispose",h),m.texture):null}}}return u}function o(u,f){return f===zo?u.mapping=pn:f===Vo&&(u.mapping=Vn),u}function l(u){let f=0,g=6;for(let b=0;b<g;b++)u[b]!==void 0&&f++;return f===g}function c(u){let f=u.target;f.removeEventListener("dispose",c);let g=e.get(f);g!==void 0&&(e.delete(f),g.dispose())}function h(u){let f=u.target;f.removeEventListener("dispose",h);let g=t.get(f);g!==void 0&&(t.delete(f),g.dispose())}function d(){e=new WeakMap,t=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:s,dispose:d}}function Ax(n){let e={};function t(i){if(e[i]!==void 0)return e[i];let s=n.getExtension(i);return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){let s=t(i);return s===null&&In("WebGLRenderer: "+i+" extension not supported."),s}}}function wx(n,e,t,i){let s={},r=new WeakMap;function a(d){let u=d.target;u.index!==null&&e.remove(u.index);for(let g in u.attributes)e.remove(u.attributes[g]);u.removeEventListener("dispose",a),delete s[u.id];let f=r.get(u);f&&(e.remove(f),r.delete(u)),i.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,t.memory.geometries--}function o(d,u){return s[u.id]===!0||(u.addEventListener("dispose",a),s[u.id]=!0,t.memory.geometries++),u}function l(d){let u=d.attributes;for(let f in u)e.update(u[f],n.ARRAY_BUFFER)}function c(d){let u=[],f=d.index,g=d.attributes.position,b=0;if(g===void 0)return;if(f!==null){let T=f.array;b=f.version;for(let S=0,y=T.length;S<y;S+=3){let A=T[S+0],M=T[S+1],C=T[S+2];u.push(A,M,M,C,C,A)}}else{let T=g.array;b=g.version;for(let S=0,y=T.length/3-1;S<y;S+=3){let A=S+0,M=S+1,C=S+2;u.push(A,M,M,C,C,A)}}let m=new(g.count>=65535?gr:mr)(u,1);m.version=b;let p=r.get(d);p&&e.remove(p),r.set(d,m)}function h(d){let u=r.get(d);if(u){let f=d.index;f!==null&&u.version<f.version&&c(d)}else c(d);return r.get(d)}return{get:o,update:l,getWireframeAttribute:h}}function Ex(n,e,t){let i;function s(d){i=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function l(d,u){n.drawElements(i,u,r,d*a),t.update(u,i,1)}function c(d,u,f){f!==0&&(n.drawElementsInstanced(i,u,r,d*a,f),t.update(u,i,f))}function h(d,u,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,u,0,r,d,0,f);let b=0;for(let m=0;m<f;m++)b+=u[m];t.update(b,i,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function Cx(n){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,a,o){switch(t.calls++,a){case n.TRIANGLES:t.triangles+=o*(r/3);break;case n.LINES:t.lines+=o*(r/2);break;case n.LINE_STRIP:t.lines+=o*(r-1);break;case n.LINE_LOOP:t.lines+=o*r;break;case n.POINTS:t.points+=o*r;break;default:ke("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function Rx(n,e,t){let i=new WeakMap,s=new yt;function r(a,o,l){let c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=h!==void 0?h.length:0,u=i.get(o);if(u===void 0||u.count!==d){let w=function(){C.dispose(),i.delete(o),o.removeEventListener("dispose",w)};u!==void 0&&u.texture.dispose();let f=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,b=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],T=o.morphAttributes.color||[],S=0;f===!0&&(S=1),g===!0&&(S=2),b===!0&&(S=3);let y=o.attributes.position.count*S,A=1;y>e.maxTextureSize&&(A=Math.ceil(y/e.maxTextureSize),y=e.maxTextureSize);let M=new Float32Array(y*A*4*d),C=new dr(M,y,A,d);C.type=di,C.needsUpdate=!0;let v=S*4;for(let P=0;P<d;P++){let I=m[P],U=p[P],q=T[P],Y=y*A*4*P;for(let B=0;B<I.count;B++){let X=B*v;f===!0&&(s.fromBufferAttribute(I,B),M[Y+X+0]=s.x,M[Y+X+1]=s.y,M[Y+X+2]=s.z,M[Y+X+3]=0),g===!0&&(s.fromBufferAttribute(U,B),M[Y+X+4]=s.x,M[Y+X+5]=s.y,M[Y+X+6]=s.z,M[Y+X+7]=0),b===!0&&(s.fromBufferAttribute(q,B),M[Y+X+8]=s.x,M[Y+X+9]=s.y,M[Y+X+10]=s.z,M[Y+X+11]=q.itemSize===4?s.w:1)}}u={count:d,texture:C,size:new ee(y,A)},i.set(o,u),o.addEventListener("dispose",w)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",a.morphTexture,t);else{let f=0;for(let b=0;b<c.length;b++)f+=c[b];let g=o.morphTargetsRelative?1:1-f;l.getUniforms().setValue(n,"morphTargetBaseInfluence",g),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",u.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",u.size)}return{update:r}}function Px(n,e,t,i,s){let r=new WeakMap;function a(c){let h=s.render.frame,d=c.geometry,u=e.get(c,d);if(r.get(u)!==h&&(e.update(u),r.set(u,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(t.update(c.instanceMatrix,n.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,n.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let f=c.skeleton;r.get(f)!==h&&(f.update(),r.set(f,h))}return u}function o(){r=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),i.releaseStatesOfObject(h),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:a,dispose:o}}var Ix={[Yr]:"LINEAR_TONE_MAPPING",[Zr]:"REINHARD_TONE_MAPPING",[Jr]:"CINEON_TONE_MAPPING",[zn]:"ACES_FILMIC_TONE_MAPPING",[Kr]:"AGX_TONE_MAPPING",[Qr]:"NEUTRAL_TONE_MAPPING",[jr]:"CUSTOM_TONE_MAPPING"};function Lx(n,e,t,i,s,r){let a=new _t(e,t,{type:n,depthBuffer:s,stencilBuffer:r,samples:i?4:0,depthTexture:s?new ji(e,t):void 0}),o=new _t(e,t,{type:Ct,depthBuffer:!1,stencilBuffer:!1}),l=new Tt;l.setAttribute("position",new lt([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute("uv",new lt([0,2,0,0,2,0],2));let c=new ws({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),h=new tt(l,c),d=new fn(-1,1,1,-1,0,1),u=null,f=null,g=!1,b,m=null,p=[],T=!1;this.setSize=function(S,y){a.setSize(S,y),o.setSize(S,y);for(let A=0;A<p.length;A++){let M=p[A];M.setSize&&M.setSize(S,y)}},this.setEffects=function(S){p=S,T=p.length>0&&p[0].isRenderPass===!0;let y=a.width,A=a.height;for(let M=0;M<p.length;M++){let C=p[M];C.setSize&&C.setSize(y,A)}},this.begin=function(S,y){if(g||S.toneMapping===Si&&p.length===0)return!1;if(m=y,y!==null){let A=y.width,M=y.height;(a.width!==A||a.height!==M)&&this.setSize(A,M)}return T===!1&&S.setRenderTarget(a),b=S.toneMapping,S.toneMapping=Si,!0},this.hasRenderPass=function(){return T},this.end=function(S,y){S.toneMapping=b,g=!0;let A=a,M=o;for(let C=0;C<p.length;C++){let v=p[C];if(v.enabled!==!1&&(v.render(S,M,A,y),v.needsSwap!==!1)){let w=A;A=M,M=w}}if(u!==S.outputColorSpace||f!==S.toneMapping){u=S.outputColorSpace,f=S.toneMapping,c.defines={},$e.getTransfer(u)===st&&(c.defines.SRGB_TRANSFER="");let C=Ix[f];C&&(c.defines[C]=""),c.needsUpdate=!0}c.uniforms.tDiffuse.value=A.texture,S.setRenderTarget(m),S.render(h,d),m=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){a.depthTexture&&a.depthTexture.dispose(),a.dispose(),o.dispose(),l.dispose(),c.dispose()}}var tf=new Bt,yh=new ji(1,1),nf=new dr,sf=new mo,rf=new Mr,Fd=[],Od=[],Bd=new Float32Array(16),kd=new Float32Array(9),zd=new Float32Array(4);function Ns(n,e,t){let i=n[0];if(i<=0||i>0)return n;let s=e*t,r=Fd[s];if(r===void 0&&(r=new Float32Array(s),Fd[s]=r),e!==0){i.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,n[a].toArray(r,o)}return r}function Nt(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function Ut(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function Nl(n,e){let t=Od[e];t===void 0&&(t=new Int32Array(e),Od[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function Dx(n,e){let t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function Nx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Nt(t,e))return;n.uniform2fv(this.addr,e),Ut(t,e)}}function Ux(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Nt(t,e))return;n.uniform3fv(this.addr,e),Ut(t,e)}}function Fx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Nt(t,e))return;n.uniform4fv(this.addr,e),Ut(t,e)}}function Ox(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Nt(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),Ut(t,e)}else{if(Nt(t,i))return;zd.set(i),n.uniformMatrix2fv(this.addr,!1,zd),Ut(t,i)}}function Bx(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Nt(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),Ut(t,e)}else{if(Nt(t,i))return;kd.set(i),n.uniformMatrix3fv(this.addr,!1,kd),Ut(t,i)}}function kx(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Nt(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),Ut(t,e)}else{if(Nt(t,i))return;Bd.set(i),n.uniformMatrix4fv(this.addr,!1,Bd),Ut(t,i)}}function zx(n,e){let t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function Vx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Nt(t,e))return;n.uniform2iv(this.addr,e),Ut(t,e)}}function Gx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Nt(t,e))return;n.uniform3iv(this.addr,e),Ut(t,e)}}function Hx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Nt(t,e))return;n.uniform4iv(this.addr,e),Ut(t,e)}}function Wx(n,e){let t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function Xx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Nt(t,e))return;n.uniform2uiv(this.addr,e),Ut(t,e)}}function qx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Nt(t,e))return;n.uniform3uiv(this.addr,e),Ut(t,e)}}function Yx(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Nt(t,e))return;n.uniform4uiv(this.addr,e),Ut(t,e)}}function Zx(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(yh.compareFunction=t.isReversedDepthBuffer()?El:wl,r=yh):r=tf,t.setTexture2D(e||r,s)}function Jx(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||sf,s)}function jx(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||rf,s)}function Kx(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||nf,s)}function Qx(n){switch(n){case 5126:return Dx;case 35664:return Nx;case 35665:return Ux;case 35666:return Fx;case 35674:return Ox;case 35675:return Bx;case 35676:return kx;case 5124:case 35670:return zx;case 35667:case 35671:return Vx;case 35668:case 35672:return Gx;case 35669:case 35673:return Hx;case 5125:return Wx;case 36294:return Xx;case 36295:return qx;case 36296:return Yx;case 35678:case 36198:case 36298:case 36306:case 35682:return Zx;case 35679:case 36299:case 36307:return Jx;case 35680:case 36300:case 36308:case 36293:return jx;case 36289:case 36303:case 36311:case 36292:return Kx}}function $x(n,e){n.uniform1fv(this.addr,e)}function ev(n,e){let t=Ns(e,this.size,2);n.uniform2fv(this.addr,t)}function tv(n,e){let t=Ns(e,this.size,3);n.uniform3fv(this.addr,t)}function iv(n,e){let t=Ns(e,this.size,4);n.uniform4fv(this.addr,t)}function nv(n,e){let t=Ns(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function sv(n,e){let t=Ns(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function rv(n,e){let t=Ns(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function av(n,e){n.uniform1iv(this.addr,e)}function ov(n,e){n.uniform2iv(this.addr,e)}function lv(n,e){n.uniform3iv(this.addr,e)}function cv(n,e){n.uniform4iv(this.addr,e)}function hv(n,e){n.uniform1uiv(this.addr,e)}function uv(n,e){n.uniform2uiv(this.addr,e)}function dv(n,e){n.uniform3uiv(this.addr,e)}function fv(n,e){n.uniform4uiv(this.addr,e)}function pv(n,e,t){let i=this.cache,s=e.length,r=Nl(t,s);Nt(i,r)||(n.uniform1iv(this.addr,r),Ut(i,r));let a;this.type===n.SAMPLER_2D_SHADOW?a=yh:a=tf;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function mv(n,e,t){let i=this.cache,s=e.length,r=Nl(t,s);Nt(i,r)||(n.uniform1iv(this.addr,r),Ut(i,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||sf,r[a])}function gv(n,e,t){let i=this.cache,s=e.length,r=Nl(t,s);Nt(i,r)||(n.uniform1iv(this.addr,r),Ut(i,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||rf,r[a])}function xv(n,e,t){let i=this.cache,s=e.length,r=Nl(t,s);Nt(i,r)||(n.uniform1iv(this.addr,r),Ut(i,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||nf,r[a])}function vv(n){switch(n){case 5126:return $x;case 35664:return ev;case 35665:return tv;case 35666:return iv;case 35674:return nv;case 35675:return sv;case 35676:return rv;case 5124:case 35670:return av;case 35667:case 35671:return ov;case 35668:case 35672:return lv;case 35669:case 35673:return cv;case 5125:return hv;case 36294:return uv;case 36295:return dv;case 36296:return fv;case 35678:case 36198:case 36298:case 36306:case 35682:return pv;case 35679:case 36299:case 36307:return mv;case 35680:case 36300:case 36308:case 36293:return gv;case 36289:case 36303:case 36311:case 36292:return xv}}var _h=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=Qx(t.type)}},bh=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=vv(t.type)}},Sh=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],i)}}},xh=/(\w+)(\])?(\[|\.)?/g;function Vd(n,e){n.seq.push(e),n.map[e.id]=e}function yv(n,e,t){let i=n.name,s=i.length;for(xh.lastIndex=0;;){let r=xh.exec(i),a=xh.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){Vd(t,c===void 0?new _h(o,n,e):new bh(o,n,e));break}else{let d=t.map[o];d===void 0&&(d=new Sh(o),Vd(t,d)),t=d}}}var Ls=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<i;++a){let o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);yv(o,l,this)}let s=[],r=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,i,s){let r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){let s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],l=i[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){let i=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&i.push(a)}return i}};function Gd(n,e,t){let i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}var _v=37297,bv=0;function Sv(n,e){let t=n.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;i.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return i.join(`
`)}var Hd=new We;function Mv(n){$e._getMatrix(Hd,$e.workingColorSpace,n);let e=`mat3( ${Hd.elements.map(t=>t.toFixed(4))} )`;switch($e.getTransfer(n)){case cr:return[e,"LinearTransferOETF"];case st:return[e,"sRGBTransferOETF"];default:return Oe("WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function Wd(n,e,t){let i=n.getShaderParameter(e,n.COMPILE_STATUS),r=(n.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+Sv(n.getShaderSource(e),o)}else return r}function Tv(n,e){let t=Mv(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var Av={[Yr]:"Linear",[Zr]:"Reinhard",[Jr]:"Cineon",[zn]:"ACESFilmic",[Kr]:"AgX",[Qr]:"Neutral",[jr]:"Custom"};function wv(n,e){let t=Av[e];return t===void 0?(Oe("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Pl=new L;function Ev(){$e.getLuminanceCoefficients(Pl);let n=Pl.x.toFixed(4),e=Pl.y.toFixed(4),t=Pl.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Cv(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ha).join(`
`)}function Rv(n){let e=[];for(let t in n){let i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function Pv(n,e){let t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let r=n.getActiveAttrib(e,s),a=r.name,o=1;r.type===n.FLOAT_MAT2&&(o=2),r.type===n.FLOAT_MAT3&&(o=3),r.type===n.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:n.getAttribLocation(e,a),locationSize:o}}return t}function ha(n){return n!==""}function Xd(n,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function qd(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var Iv=/^[ \t]*#include +<([\w\d./]+)>/gm;function Mh(n){return n.replace(Iv,Dv)}var Lv=new Map;function Dv(n,e){let t=Je[e];if(t===void 0){let i=Lv.get(e);if(i!==void 0)t=Je[i],Oe('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return Mh(t)}var Nv=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Yd(n){return n.replace(Nv,Uv)}function Uv(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Zd(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}var Fv={[kn]:"SHADOWMAP_TYPE_PCF",[Cs]:"SHADOWMAP_TYPE_VSM"};function Ov(n){return Fv[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var Bv={[pn]:"ENVMAP_TYPE_CUBE",[Vn]:"ENVMAP_TYPE_CUBE",[$r]:"ENVMAP_TYPE_CUBE_UV"};function kv(n){return n.envMap===!1?"ENVMAP_TYPE_CUBE":Bv[n.envMapMode]||"ENVMAP_TYPE_CUBE"}var zv={[Vn]:"ENVMAP_MODE_REFRACTION"};function Vv(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":zv[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}var Gv={[ko]:"ENVMAP_BLENDING_MULTIPLY",[cd]:"ENVMAP_BLENDING_MIX",[hd]:"ENVMAP_BLENDING_ADD"};function Hv(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":Gv[n.combine]||"ENVMAP_BLENDING_NONE"}function Wv(n){let e=n.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function Xv(n,e,t,i){let s=n.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,l=Ov(t),c=kv(t),h=Vv(t),d=Hv(t),u=Wv(t),f=Cv(t),g=Rv(r),b=s.createProgram(),m,p,T=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(ha).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(ha).join(`
`),p.length>0&&(p+=`
`)):(m=[Zd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ha).join(`
`),p=[Zd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+d:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Si?"#define TONE_MAPPING":"",t.toneMapping!==Si?Je.tonemapping_pars_fragment:"",t.toneMapping!==Si?wv("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Je.colorspace_pars_fragment,Tv("linearToOutputTexel",t.outputColorSpace),Ev(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(ha).join(`
`)),a=Mh(a),a=Xd(a,t),a=qd(a,t),o=Mh(o),o=Xd(o,t),o=qd(o,t),a=Yd(a),o=Yd(o),t.isRawShaderMaterial!==!0&&(T=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===ah?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===ah?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let S=T+m+a,y=T+p+o,A=Gd(s,s.VERTEX_SHADER,S),M=Gd(s,s.FRAGMENT_SHADER,y);s.attachShader(b,A),s.attachShader(b,M),t.index0AttributeName!==void 0?s.bindAttribLocation(b,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(b,0,"position"),s.linkProgram(b);function C(I){if(n.debug.checkShaderErrors){let U=s.getProgramInfoLog(b)||"",q=s.getShaderInfoLog(A)||"",Y=s.getShaderInfoLog(M)||"",B=U.trim(),X=q.trim(),W=Y.trim(),$=!0,re=!0;if(s.getProgramParameter(b,s.LINK_STATUS)===!1)if($=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,b,A,M);else{let de=Wd(s,A,"vertex"),ce=Wd(s,M,"fragment");ke("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(b,s.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+B+`
`+de+`
`+ce)}else B!==""?Oe("WebGLProgram: Program Info Log:",B):(X===""||W==="")&&(re=!1);re&&(I.diagnostics={runnable:$,programLog:B,vertexShader:{log:X,prefix:m},fragmentShader:{log:W,prefix:p}})}s.deleteShader(A),s.deleteShader(M),v=new Ls(s,b),w=Pv(s,b)}let v;this.getUniforms=function(){return v===void 0&&C(this),v};let w;this.getAttributes=function(){return w===void 0&&C(this),w};let P=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return P===!1&&(P=s.getProgramParameter(b,_v)),P},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(b),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=bv++,this.cacheKey=e,this.usedTimes=1,this.program=b,this.vertexShader=A,this.fragmentShader=M,this}var qv=0,Th=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,i){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(i)===!1&&(s.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new Ah(e),t.set(e,i)),i}},Ah=class{constructor(e){this.id=qv++,this.code=e,this.usedTimes=0}};function Yv(n){return n===xn||n===ra||n===aa}function Zv(n,e,t,i,s,r){let a=new fr,o=new Th,l=new Set,c=[],h=new Map,d=i.logarithmicDepthBuffer,u=i.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(v){return l.add(v),v===0?"uv":`uv${v}`}function b(v,w,P,I,U,q){let Y=I.fog,B=U.geometry,X=v.isMeshStandardMaterial||v.isMeshLambertMaterial||v.isMeshPhongMaterial?I.environment:null,W=v.isMeshStandardMaterial||v.isMeshLambertMaterial&&!v.envMap||v.isMeshPhongMaterial&&!v.envMap,$=e.get(v.envMap||X,W),re=$&&$.mapping===$r?$.image.height:null,de=f[v.type];v.precision!==null&&(u=i.getMaxPrecision(v.precision),u!==v.precision&&Oe("WebGLProgram.getParameters:",v.precision,"not supported, using",u,"instead."));let ce=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,Me=ce!==void 0?ce.length:0,je=0;B.morphAttributes.position!==void 0&&(je=1),B.morphAttributes.normal!==void 0&&(je=2),B.morphAttributes.color!==void 0&&(je=3);let ut,it,K,he;if(de){let we=Bi[de];ut=we.vertexShader,it=we.fragmentShader}else{ut=v.vertexShader,it=v.fragmentShader;let we=o.getVertexShaderStage(v),St=o.getFragmentShaderStage(v);o.update(v,we,St),K=we.id,he=St.id}let ae=n.getRenderTarget(),De=n.state.buffers.depth.getReversed(),Ve=U.isInstancedMesh===!0,Fe=U.isBatchedMesh===!0,at=!!v.map,He=!!v.matcap,te=!!$,se=!!v.aoMap,ne=!!v.lightMap,ye=!!v.bumpMap&&v.wireframe===!1,ge=!!v.normalMap,Be=!!v.displacementMap,Pe=!!v.emissiveMap,Ge=!!v.metalnessMap,Xe=!!v.roughnessMap,D=v.anisotropy>0,ct=v.clearcoat>0,et=v.dispersion>0,E=v.iridescence>0,x=v.sheen>0,O=v.transmission>0,G=D&&!!v.anisotropyMap,Z=ct&&!!v.clearcoatMap,oe=ct&&!!v.clearcoatNormalMap,le=ct&&!!v.clearcoatRoughnessMap,J=E&&!!v.iridescenceMap,Q=E&&!!v.iridescenceThicknessMap,fe=x&&!!v.sheenColorMap,Ie=x&&!!v.sheenRoughnessMap,xe=!!v.specularMap,pe=!!v.specularColorMap,Ue=!!v.specularIntensityMap,ze=O&&!!v.transmissionMap,qe=O&&!!v.thicknessMap,N=!!v.gradientMap,ue=!!v.alphaMap,j=v.alphaTest>0,me=!!v.alphaHash,Se=!!v.extensions,ie=Si;v.toneMapped&&(ae===null||ae.isXRRenderTarget===!0)&&(ie=n.toneMapping);let Re={shaderID:de,shaderType:v.type,shaderName:v.name,vertexShader:ut,fragmentShader:it,defines:v.defines,customVertexShaderID:K,customFragmentShaderID:he,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:u,batching:Fe,batchingColor:Fe&&U._colorsTexture!==null,instancing:Ve,instancingColor:Ve&&U.instanceColor!==null,instancingMorph:Ve&&U.morphTexture!==null,outputColorSpace:ae===null?n.outputColorSpace:ae.isXRRenderTarget===!0?ae.texture.colorSpace:$e.workingColorSpace,alphaToCoverage:!!v.alphaToCoverage,map:at,matcap:He,envMap:te,envMapMode:te&&$.mapping,envMapCubeUVHeight:re,aoMap:se,lightMap:ne,bumpMap:ye,normalMap:ge,displacementMap:Be,emissiveMap:Pe,normalMapObjectSpace:ge&&v.normalMapType===fd,normalMapTangentSpace:ge&&v.normalMapType===oa,packedNormalMap:ge&&v.normalMapType===oa&&Yv(v.normalMap.format),metalnessMap:Ge,roughnessMap:Xe,anisotropy:D,anisotropyMap:G,clearcoat:ct,clearcoatMap:Z,clearcoatNormalMap:oe,clearcoatRoughnessMap:le,dispersion:et,iridescence:E,iridescenceMap:J,iridescenceThicknessMap:Q,sheen:x,sheenColorMap:fe,sheenRoughnessMap:Ie,specularMap:xe,specularColorMap:pe,specularIntensityMap:Ue,transmission:O,transmissionMap:ze,thicknessMap:qe,gradientMap:N,opaque:v.transparent===!1&&v.blending===Ln&&v.alphaToCoverage===!1,alphaMap:ue,alphaTest:j,alphaHash:me,combine:v.combine,mapUv:at&&g(v.map.channel),aoMapUv:se&&g(v.aoMap.channel),lightMapUv:ne&&g(v.lightMap.channel),bumpMapUv:ye&&g(v.bumpMap.channel),normalMapUv:ge&&g(v.normalMap.channel),displacementMapUv:Be&&g(v.displacementMap.channel),emissiveMapUv:Pe&&g(v.emissiveMap.channel),metalnessMapUv:Ge&&g(v.metalnessMap.channel),roughnessMapUv:Xe&&g(v.roughnessMap.channel),anisotropyMapUv:G&&g(v.anisotropyMap.channel),clearcoatMapUv:Z&&g(v.clearcoatMap.channel),clearcoatNormalMapUv:oe&&g(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:le&&g(v.clearcoatRoughnessMap.channel),iridescenceMapUv:J&&g(v.iridescenceMap.channel),iridescenceThicknessMapUv:Q&&g(v.iridescenceThicknessMap.channel),sheenColorMapUv:fe&&g(v.sheenColorMap.channel),sheenRoughnessMapUv:Ie&&g(v.sheenRoughnessMap.channel),specularMapUv:xe&&g(v.specularMap.channel),specularColorMapUv:pe&&g(v.specularColorMap.channel),specularIntensityMapUv:Ue&&g(v.specularIntensityMap.channel),transmissionMapUv:ze&&g(v.transmissionMap.channel),thicknessMapUv:qe&&g(v.thicknessMap.channel),alphaMapUv:ue&&g(v.alphaMap.channel),vertexTangents:!!B.attributes.tangent&&(ge||D),vertexNormals:!!B.attributes.normal,vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,pointsUvs:U.isPoints===!0&&!!B.attributes.uv&&(at||ue),fog:!!Y,useFog:v.fog===!0,fogExp2:!!Y&&Y.isFogExp2,flatShading:v.wireframe===!1&&(v.flatShading===!0||B.attributes.normal===void 0&&ge===!1&&(v.isMeshLambertMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isMeshPhysicalMaterial)),sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:De,skinning:U.isSkinnedMesh===!0,hasPositionAttribute:B.attributes.position!==void 0,morphTargets:B.morphAttributes.position!==void 0,morphNormals:B.morphAttributes.normal!==void 0,morphColors:B.morphAttributes.color!==void 0,morphTargetsCount:Me,morphTextureStride:je,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numLightProbeGrids:q.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:v.dithering,shadowMapEnabled:n.shadowMap.enabled&&P.length>0,shadowMapType:n.shadowMap.type,toneMapping:ie,decodeVideoTexture:at&&v.map.isVideoTexture===!0&&$e.getTransfer(v.map.colorSpace)===st,decodeVideoTextureEmissive:Pe&&v.emissiveMap.isVideoTexture===!0&&$e.getTransfer(v.emissiveMap.colorSpace)===st,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===ei,flipSided:v.side===Dt,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionClipCullDistance:Se&&v.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Se&&v.extensions.multiDraw===!0||Fe)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return Re.vertexUv1s=l.has(1),Re.vertexUv2s=l.has(2),Re.vertexUv3s=l.has(3),l.clear(),Re}function m(v){let w=[];if(v.shaderID?w.push(v.shaderID):(w.push(v.customVertexShaderID),w.push(v.customFragmentShaderID)),v.defines!==void 0)for(let P in v.defines)w.push(P),w.push(v.defines[P]);return v.isRawShaderMaterial===!1&&(p(w,v),T(w,v),w.push(n.outputColorSpace)),w.push(v.customProgramCacheKey),w.join()}function p(v,w){v.push(w.precision),v.push(w.outputColorSpace),v.push(w.envMapMode),v.push(w.envMapCubeUVHeight),v.push(w.mapUv),v.push(w.alphaMapUv),v.push(w.lightMapUv),v.push(w.aoMapUv),v.push(w.bumpMapUv),v.push(w.normalMapUv),v.push(w.displacementMapUv),v.push(w.emissiveMapUv),v.push(w.metalnessMapUv),v.push(w.roughnessMapUv),v.push(w.anisotropyMapUv),v.push(w.clearcoatMapUv),v.push(w.clearcoatNormalMapUv),v.push(w.clearcoatRoughnessMapUv),v.push(w.iridescenceMapUv),v.push(w.iridescenceThicknessMapUv),v.push(w.sheenColorMapUv),v.push(w.sheenRoughnessMapUv),v.push(w.specularMapUv),v.push(w.specularColorMapUv),v.push(w.specularIntensityMapUv),v.push(w.transmissionMapUv),v.push(w.thicknessMapUv),v.push(w.combine),v.push(w.fogExp2),v.push(w.sizeAttenuation),v.push(w.morphTargetsCount),v.push(w.morphAttributeCount),v.push(w.numDirLights),v.push(w.numPointLights),v.push(w.numSpotLights),v.push(w.numSpotLightMaps),v.push(w.numHemiLights),v.push(w.numRectAreaLights),v.push(w.numDirLightShadows),v.push(w.numPointLightShadows),v.push(w.numSpotLightShadows),v.push(w.numSpotLightShadowsWithMaps),v.push(w.numLightProbes),v.push(w.shadowMapType),v.push(w.toneMapping),v.push(w.numClippingPlanes),v.push(w.numClipIntersection),v.push(w.depthPacking)}function T(v,w){a.disableAll(),w.instancing&&a.enable(0),w.instancingColor&&a.enable(1),w.instancingMorph&&a.enable(2),w.matcap&&a.enable(3),w.envMap&&a.enable(4),w.normalMapObjectSpace&&a.enable(5),w.normalMapTangentSpace&&a.enable(6),w.clearcoat&&a.enable(7),w.iridescence&&a.enable(8),w.alphaTest&&a.enable(9),w.vertexColors&&a.enable(10),w.vertexAlphas&&a.enable(11),w.vertexUv1s&&a.enable(12),w.vertexUv2s&&a.enable(13),w.vertexUv3s&&a.enable(14),w.vertexTangents&&a.enable(15),w.anisotropy&&a.enable(16),w.alphaHash&&a.enable(17),w.batching&&a.enable(18),w.dispersion&&a.enable(19),w.batchingColor&&a.enable(20),w.gradientMap&&a.enable(21),w.packedNormalMap&&a.enable(22),w.vertexNormals&&a.enable(23),v.push(a.mask),a.disableAll(),w.fog&&a.enable(0),w.useFog&&a.enable(1),w.flatShading&&a.enable(2),w.logarithmicDepthBuffer&&a.enable(3),w.reversedDepthBuffer&&a.enable(4),w.skinning&&a.enable(5),w.morphTargets&&a.enable(6),w.morphNormals&&a.enable(7),w.morphColors&&a.enable(8),w.premultipliedAlpha&&a.enable(9),w.shadowMapEnabled&&a.enable(10),w.doubleSided&&a.enable(11),w.flipSided&&a.enable(12),w.useDepthPacking&&a.enable(13),w.dithering&&a.enable(14),w.transmission&&a.enable(15),w.sheen&&a.enable(16),w.opaque&&a.enable(17),w.pointsUvs&&a.enable(18),w.decodeVideoTexture&&a.enable(19),w.decodeVideoTextureEmissive&&a.enable(20),w.alphaToCoverage&&a.enable(21),w.numLightProbeGrids>0&&a.enable(22),w.hasPositionAttribute&&a.enable(23),v.push(a.mask)}function S(v){let w=f[v.type],P;if(w){let I=Bi[w];P=ti.clone(I.uniforms)}else P=v.uniforms;return P}function y(v,w){let P=h.get(w);return P!==void 0?++P.usedTimes:(P=new Xv(n,w,v,s),c.push(P),h.set(w,P)),P}function A(v){if(--v.usedTimes===0){let w=c.indexOf(v);c[w]=c[c.length-1],c.pop(),h.delete(v.cacheKey),v.destroy()}}function M(v){o.remove(v)}function C(){o.dispose()}return{getParameters:b,getProgramCacheKey:m,getUniforms:S,acquireProgram:y,releaseProgram:A,releaseShaderCache:M,programs:c,dispose:C}}function Jv(){let n=new WeakMap;function e(a){return n.has(a)}function t(a){let o=n.get(a);return o===void 0&&(o={},n.set(a,o)),o}function i(a){n.delete(a)}function s(a,o,l){n.get(a)[o]=l}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:r}}function jv(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.materialVariant!==e.materialVariant?n.materialVariant-e.materialVariant:n.z!==e.z?n.z-e.z:n.id-e.id}function Jd(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function jd(){let n=[],e=0,t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function a(u){let f=0;return u.isInstancedMesh&&(f+=2),u.isSkinnedMesh&&(f+=1),f}function o(u,f,g,b,m,p){let T=n[e];return T===void 0?(T={id:u.id,object:u,geometry:f,material:g,materialVariant:a(u),groupOrder:b,renderOrder:u.renderOrder,z:m,group:p},n[e]=T):(T.id=u.id,T.object=u,T.geometry=f,T.material=g,T.materialVariant=a(u),T.groupOrder=b,T.renderOrder=u.renderOrder,T.z=m,T.group=p),e++,T}function l(u,f,g,b,m,p){let T=o(u,f,g,b,m,p);g.transmission>0?i.push(T):g.transparent===!0?s.push(T):t.push(T)}function c(u,f,g,b,m,p){let T=o(u,f,g,b,m,p);g.transmission>0?i.unshift(T):g.transparent===!0?s.unshift(T):t.unshift(T)}function h(u,f,g){t.length>1&&t.sort(u||jv),i.length>1&&i.sort(f||Jd),s.length>1&&s.sort(f||Jd),g&&(t.reverse(),i.reverse(),s.reverse())}function d(){for(let u=e,f=n.length;u<f;u++){let g=n[u];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:l,unshift:c,finish:d,sort:h}}function Kv(){let n=new WeakMap;function e(i,s){let r=n.get(i),a;return r===void 0?(a=new jd,n.set(i,[a])):s>=r.length?(a=new jd,r.push(a)):a=r[s],a}function t(){n=new WeakMap}return{get:e,dispose:t}}function Qv(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new L,color:new Ee};break;case"SpotLight":t={position:new L,direction:new L,color:new Ee,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new L,color:new Ee,distance:0,decay:0};break;case"HemisphereLight":t={direction:new L,skyColor:new Ee,groundColor:new Ee};break;case"RectAreaLight":t={color:new Ee,position:new L,halfWidth:new L,halfHeight:new L};break}return n[e.id]=t,t}}}function $v(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ee};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ee};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ee,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}var ey=0;function ty(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function iy(n){let e=new Qv,t=$v(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new L);let s=new L,r=new rt,a=new rt;function o(c){let h=0,d=0,u=0;for(let w=0;w<9;w++)i.probe[w].set(0,0,0);let f=0,g=0,b=0,m=0,p=0,T=0,S=0,y=0,A=0,M=0,C=0;c.sort(ty);for(let w=0,P=c.length;w<P;w++){let I=c[w],U=I.color,q=I.intensity,Y=I.distance,B=null;if(I.shadow&&I.shadow.map&&(I.shadow.map.texture.format===xn?B=I.shadow.map.texture:B=I.shadow.map.depthTexture||I.shadow.map.texture),I.isAmbientLight)h+=U.r*q,d+=U.g*q,u+=U.b*q;else if(I.isLightProbe){for(let X=0;X<9;X++)i.probe[X].addScaledVector(I.sh.coefficients[X],q);C++}else if(I.isDirectionalLight){let X=e.get(I);if(X.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let W=I.shadow,$=t.get(I);$.shadowIntensity=W.intensity,$.shadowBias=W.bias,$.shadowNormalBias=W.normalBias,$.shadowRadius=W.radius,$.shadowMapSize=W.mapSize,i.directionalShadow[f]=$,i.directionalShadowMap[f]=B,i.directionalShadowMatrix[f]=I.shadow.matrix,T++}i.directional[f]=X,f++}else if(I.isSpotLight){let X=e.get(I);X.position.setFromMatrixPosition(I.matrixWorld),X.color.copy(U).multiplyScalar(q),X.distance=Y,X.coneCos=Math.cos(I.angle),X.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),X.decay=I.decay,i.spot[b]=X;let W=I.shadow;if(I.map&&(i.spotLightMap[A]=I.map,A++,W.updateMatrices(I),I.castShadow&&M++),i.spotLightMatrix[b]=W.matrix,I.castShadow){let $=t.get(I);$.shadowIntensity=W.intensity,$.shadowBias=W.bias,$.shadowNormalBias=W.normalBias,$.shadowRadius=W.radius,$.shadowMapSize=W.mapSize,i.spotShadow[b]=$,i.spotShadowMap[b]=B,y++}b++}else if(I.isRectAreaLight){let X=e.get(I);X.color.copy(U).multiplyScalar(q),X.halfWidth.set(I.width*.5,0,0),X.halfHeight.set(0,I.height*.5,0),i.rectArea[m]=X,m++}else if(I.isPointLight){let X=e.get(I);if(X.color.copy(I.color).multiplyScalar(I.intensity),X.distance=I.distance,X.decay=I.decay,I.castShadow){let W=I.shadow,$=t.get(I);$.shadowIntensity=W.intensity,$.shadowBias=W.bias,$.shadowNormalBias=W.normalBias,$.shadowRadius=W.radius,$.shadowMapSize=W.mapSize,$.shadowCameraNear=W.camera.near,$.shadowCameraFar=W.camera.far,i.pointShadow[g]=$,i.pointShadowMap[g]=B,i.pointShadowMatrix[g]=I.shadow.matrix,S++}i.point[g]=X,g++}else if(I.isHemisphereLight){let X=e.get(I);X.skyColor.copy(I.color).multiplyScalar(q),X.groundColor.copy(I.groundColor).multiplyScalar(q),i.hemi[p]=X,p++}}m>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=ve.LTC_FLOAT_1,i.rectAreaLTC2=ve.LTC_FLOAT_2):(i.rectAreaLTC1=ve.LTC_HALF_1,i.rectAreaLTC2=ve.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=d,i.ambient[2]=u;let v=i.hash;(v.directionalLength!==f||v.pointLength!==g||v.spotLength!==b||v.rectAreaLength!==m||v.hemiLength!==p||v.numDirectionalShadows!==T||v.numPointShadows!==S||v.numSpotShadows!==y||v.numSpotMaps!==A||v.numLightProbes!==C)&&(i.directional.length=f,i.spot.length=b,i.rectArea.length=m,i.point.length=g,i.hemi.length=p,i.directionalShadow.length=T,i.directionalShadowMap.length=T,i.pointShadow.length=S,i.pointShadowMap.length=S,i.spotShadow.length=y,i.spotShadowMap.length=y,i.directionalShadowMatrix.length=T,i.pointShadowMatrix.length=S,i.spotLightMatrix.length=y+A-M,i.spotLightMap.length=A,i.numSpotLightShadowsWithMaps=M,i.numLightProbes=C,v.directionalLength=f,v.pointLength=g,v.spotLength=b,v.rectAreaLength=m,v.hemiLength=p,v.numDirectionalShadows=T,v.numPointShadows=S,v.numSpotShadows=y,v.numSpotMaps=A,v.numLightProbes=C,i.version=ey++)}function l(c,h){let d=0,u=0,f=0,g=0,b=0,m=h.matrixWorldInverse;for(let p=0,T=c.length;p<T;p++){let S=c[p];if(S.isDirectionalLight){let y=i.directional[d];y.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),d++}else if(S.isSpotLight){let y=i.spot[f];y.position.setFromMatrixPosition(S.matrixWorld),y.position.applyMatrix4(m),y.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),f++}else if(S.isRectAreaLight){let y=i.rectArea[g];y.position.setFromMatrixPosition(S.matrixWorld),y.position.applyMatrix4(m),a.identity(),r.copy(S.matrixWorld),r.premultiply(m),a.extractRotation(r),y.halfWidth.set(S.width*.5,0,0),y.halfHeight.set(0,S.height*.5,0),y.halfWidth.applyMatrix4(a),y.halfHeight.applyMatrix4(a),g++}else if(S.isPointLight){let y=i.point[u];y.position.setFromMatrixPosition(S.matrixWorld),y.position.applyMatrix4(m),u++}else if(S.isHemisphereLight){let y=i.hemi[b];y.direction.setFromMatrixPosition(S.matrixWorld),y.direction.transformDirection(m),b++}}}return{setup:o,setupView:l,state:i}}function Kd(n){let e=new iy(n),t=[],i=[],s=[];function r(u){d.camera=u,t.length=0,i.length=0,s.length=0}function a(u){t.push(u)}function o(u){i.push(u)}function l(u){s.push(u)}function c(){e.setup(t)}function h(u){e.setupView(t,u)}let d={lightsArray:t,shadowsArray:i,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:d,setupLights:c,setupLightsView:h,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function ny(n){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new Kd(n),e.set(s,[o])):r>=a.length?(o=new Kd(n),a.push(o)):o=a[r],o}function i(){e=new WeakMap}return{get:t,dispose:i}}var sy=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,ry=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,ay=[new L(1,0,0),new L(-1,0,0),new L(0,1,0),new L(0,-1,0),new L(0,0,1),new L(0,0,-1)],oy=[new L(0,-1,0),new L(0,-1,0),new L(0,0,1),new L(0,0,-1),new L(0,-1,0),new L(0,-1,0)],Qd=new rt,ca=new L,vh=new L;function ly(n,e,t){let i=new _s,s=new ee,r=new ee,a=new yt,o=new To,l=new Ao,c={},h=t.maxTextureSize,d={[Yi]:Dt,[Dt]:Yi,[ei]:ei},u=new pt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ee},radius:{value:4}},vertexShader:sy,fragmentShader:ry}),f=u.clone();f.defines.HORIZONTAL_PASS=1;let g=new Tt;g.setAttribute("position",new Pt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let b=new tt(g,u),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=kn;let p=this.type;this.render=function(M,C,v){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||M.length===0)return;this.type===Wu&&(Oe("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=kn);let w=n.getRenderTarget(),P=n.getActiveCubeFace(),I=n.getActiveMipmapLevel(),U=n.state;U.setBlending(ui),U.buffers.depth.getReversed()===!0?U.buffers.color.setClear(0,0,0,0):U.buffers.color.setClear(1,1,1,1),U.buffers.depth.setTest(!0),U.setScissorTest(!1);let q=p!==this.type;q&&C.traverse(function(Y){Y.material&&(Array.isArray(Y.material)?Y.material.forEach(B=>B.needsUpdate=!0):Y.material.needsUpdate=!0)});for(let Y=0,B=M.length;Y<B;Y++){let X=M[Y],W=X.shadow;if(W===void 0){Oe("WebGLShadowMap:",X,"has no shadow.");continue}if(W.autoUpdate===!1&&W.needsUpdate===!1)continue;s.copy(W.mapSize);let $=W.getFrameExtents();s.multiply($),r.copy(W.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/$.x),s.x=r.x*$.x,W.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/$.y),s.y=r.y*$.y,W.mapSize.y=r.y));let re=n.state.buffers.depth.getReversed();if(W.camera._reversedDepth=re,W.map===null||q===!0){if(W.map!==null&&(W.map.depthTexture!==null&&(W.map.depthTexture.dispose(),W.map.depthTexture=null),W.map.dispose()),this.type===Cs){if(X.isPointLight){Oe("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}W.map=new _t(s.x,s.y,{format:xn,type:Ct,minFilter:Lt,magFilter:Lt,generateMipmaps:!1}),W.map.texture.name=X.name+".shadowMap",W.map.depthTexture=new ji(s.x,s.y,di),W.map.depthTexture.name=X.name+".shadowMapDepth",W.map.depthTexture.format=Di,W.map.depthTexture.compareFunction=null,W.map.depthTexture.minFilter=Et,W.map.depthTexture.magFilter=Et}else X.isPointLight?(W.map=new Il(s.x),W.map.depthTexture=new xo(s.x,Mi)):(W.map=new _t(s.x,s.y),W.map.depthTexture=new ji(s.x,s.y,Mi)),W.map.depthTexture.name=X.name+".shadowMap",W.map.depthTexture.format=Di,this.type===kn?(W.map.depthTexture.compareFunction=re?El:wl,W.map.depthTexture.minFilter=Lt,W.map.depthTexture.magFilter=Lt):(W.map.depthTexture.compareFunction=null,W.map.depthTexture.minFilter=Et,W.map.depthTexture.magFilter=Et);W.camera.updateProjectionMatrix()}let de=W.map.isWebGLCubeRenderTarget?6:1;for(let ce=0;ce<de;ce++){if(W.map.isWebGLCubeRenderTarget)n.setRenderTarget(W.map,ce),n.clear();else{ce===0&&(n.setRenderTarget(W.map),n.clear());let Me=W.getViewport(ce);a.set(r.x*Me.x,r.y*Me.y,r.x*Me.z,r.y*Me.w),U.viewport(a)}if(X.isPointLight){let Me=W.camera,je=W.matrix,ut=X.distance||Me.far;ut!==Me.far&&(Me.far=ut,Me.updateProjectionMatrix()),ca.setFromMatrixPosition(X.matrixWorld),Me.position.copy(ca),vh.copy(Me.position),vh.add(ay[ce]),Me.up.copy(oy[ce]),Me.lookAt(vh),Me.updateMatrixWorld(),je.makeTranslation(-ca.x,-ca.y,-ca.z),Qd.multiplyMatrices(Me.projectionMatrix,Me.matrixWorldInverse),W._frustum.setFromProjectionMatrix(Qd,Me.coordinateSystem,Me.reversedDepth)}else W.updateMatrices(X);i=W.getFrustum(),y(C,v,W.camera,X,this.type)}W.isPointLightShadow!==!0&&this.type===Cs&&T(W,v),W.needsUpdate=!1}p=this.type,m.needsUpdate=!1,n.setRenderTarget(w,P,I)};function T(M,C){let v=e.update(b);u.defines.VSM_SAMPLES!==M.blurSamples&&(u.defines.VSM_SAMPLES=M.blurSamples,f.defines.VSM_SAMPLES=M.blurSamples,u.needsUpdate=!0,f.needsUpdate=!0),M.mapPass===null&&(M.mapPass=new _t(s.x,s.y,{format:xn,type:Ct})),u.uniforms.shadow_pass.value=M.map.depthTexture,u.uniforms.resolution.value=M.mapSize,u.uniforms.radius.value=M.radius,n.setRenderTarget(M.mapPass),n.clear(),n.renderBufferDirect(C,null,v,u,b,null),f.uniforms.shadow_pass.value=M.mapPass.texture,f.uniforms.resolution.value=M.mapSize,f.uniforms.radius.value=M.radius,n.setRenderTarget(M.map),n.clear(),n.renderBufferDirect(C,null,v,f,b,null)}function S(M,C,v,w){let P=null,I=v.isPointLight===!0?M.customDistanceMaterial:M.customDepthMaterial;if(I!==void 0)P=I;else if(P=v.isPointLight===!0?l:o,n.localClippingEnabled&&C.clipShadows===!0&&Array.isArray(C.clippingPlanes)&&C.clippingPlanes.length!==0||C.displacementMap&&C.displacementScale!==0||C.alphaMap&&C.alphaTest>0||C.map&&C.alphaTest>0||C.alphaToCoverage===!0){let U=P.uuid,q=C.uuid,Y=c[U];Y===void 0&&(Y={},c[U]=Y);let B=Y[q];B===void 0&&(B=P.clone(),Y[q]=B,C.addEventListener("dispose",A)),P=B}if(P.visible=C.visible,P.wireframe=C.wireframe,w===Cs?P.side=C.shadowSide!==null?C.shadowSide:C.side:P.side=C.shadowSide!==null?C.shadowSide:d[C.side],P.alphaMap=C.alphaMap,P.alphaTest=C.alphaToCoverage===!0?.5:C.alphaTest,P.map=C.map,P.clipShadows=C.clipShadows,P.clippingPlanes=C.clippingPlanes,P.clipIntersection=C.clipIntersection,P.displacementMap=C.displacementMap,P.displacementScale=C.displacementScale,P.displacementBias=C.displacementBias,P.wireframeLinewidth=C.wireframeLinewidth,P.linewidth=C.linewidth,v.isPointLight===!0&&P.isMeshDistanceMaterial===!0){let U=n.properties.get(P);U.light=v}return P}function y(M,C,v,w,P){if(M.visible===!1)return;if(M.layers.test(C.layers)&&(M.isMesh||M.isLine||M.isPoints)&&(M.castShadow||M.receiveShadow&&P===Cs)&&(!M.frustumCulled||i.intersectsObject(M))){M.modelViewMatrix.multiplyMatrices(v.matrixWorldInverse,M.matrixWorld);let q=e.update(M),Y=M.material;if(Array.isArray(Y)){let B=q.groups;for(let X=0,W=B.length;X<W;X++){let $=B[X],re=Y[$.materialIndex];if(re&&re.visible){let de=S(M,re,w,P);M.onBeforeShadow(n,M,C,v,q,de,$),n.renderBufferDirect(v,null,q,de,M,$),M.onAfterShadow(n,M,C,v,q,de,$)}}}else if(Y.visible){let B=S(M,Y,w,P);M.onBeforeShadow(n,M,C,v,q,B,null),n.renderBufferDirect(v,null,q,B,M,null),M.onAfterShadow(n,M,C,v,q,B,null)}}let U=M.children;for(let q=0,Y=U.length;q<Y;q++)y(U[q],C,v,w,P)}function A(M){M.target.removeEventListener("dispose",A);for(let v in c){let w=c[v],P=M.target.uuid;P in w&&(w[P].dispose(),delete w[P])}}}function cy(n,e){function t(){let N=!1,ue=new yt,j=null,me=new yt(0,0,0,0);return{setMask:function(Se){j!==Se&&!N&&(n.colorMask(Se,Se,Se,Se),j=Se)},setLocked:function(Se){N=Se},setClear:function(Se,ie,Re,we,St){St===!0&&(Se*=we,ie*=we,Re*=we),ue.set(Se,ie,Re,we),me.equals(ue)===!1&&(n.clearColor(Se,ie,Re,we),me.copy(ue))},reset:function(){N=!1,j=null,me.set(-1,0,0,0)}}}function i(){let N=!1,ue=!1,j=null,me=null,Se=null;return{setReversed:function(ie){if(ue!==ie){let Re=e.get("EXT_clip_control");ie?Re.clipControlEXT(Re.LOWER_LEFT_EXT,Re.ZERO_TO_ONE_EXT):Re.clipControlEXT(Re.LOWER_LEFT_EXT,Re.NEGATIVE_ONE_TO_ONE_EXT),ue=ie;let we=Se;Se=null,this.setClear(we)}},getReversed:function(){return ue},setTest:function(ie){ie?ae(n.DEPTH_TEST):De(n.DEPTH_TEST)},setMask:function(ie){j!==ie&&!N&&(n.depthMask(ie),j=ie)},setFunc:function(ie){if(ue&&(ie=Md[ie]),me!==ie){switch(ie){case to:n.depthFunc(n.NEVER);break;case io:n.depthFunc(n.ALWAYS);break;case no:n.depthFunc(n.LESS);break;case Dn:n.depthFunc(n.LEQUAL);break;case so:n.depthFunc(n.EQUAL);break;case ro:n.depthFunc(n.GEQUAL);break;case ao:n.depthFunc(n.GREATER);break;case oo:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}me=ie}},setLocked:function(ie){N=ie},setClear:function(ie){Se!==ie&&(Se=ie,ue&&(ie=1-ie),n.clearDepth(ie))},reset:function(){N=!1,j=null,me=null,Se=null,ue=!1}}}function s(){let N=!1,ue=null,j=null,me=null,Se=null,ie=null,Re=null,we=null,St=null;return{setTest:function(mt){N||(mt?ae(n.STENCIL_TEST):De(n.STENCIL_TEST))},setMask:function(mt){ue!==mt&&!N&&(n.stencilMask(mt),ue=mt)},setFunc:function(mt,Ai,wi){(j!==mt||me!==Ai||Se!==wi)&&(n.stencilFunc(mt,Ai,wi),j=mt,me=Ai,Se=wi)},setOp:function(mt,Ai,wi){(ie!==mt||Re!==Ai||we!==wi)&&(n.stencilOp(mt,Ai,wi),ie=mt,Re=Ai,we=wi)},setLocked:function(mt){N=mt},setClear:function(mt){St!==mt&&(n.clearStencil(mt),St=mt)},reset:function(){N=!1,ue=null,j=null,me=null,Se=null,ie=null,Re=null,we=null,St=null}}}let r=new t,a=new i,o=new s,l=new WeakMap,c=new WeakMap,h={},d={},u={},f=new WeakMap,g=[],b=null,m=!1,p=null,T=null,S=null,y=null,A=null,M=null,C=null,v=new Ee(0,0,0),w=0,P=!1,I=null,U=null,q=null,Y=null,B=null,X=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),W=!1,$=0,re=n.getParameter(n.VERSION);re.indexOf("WebGL")!==-1?($=parseFloat(/^WebGL (\d)/.exec(re)[1]),W=$>=1):re.indexOf("OpenGL ES")!==-1&&($=parseFloat(/^OpenGL ES (\d)/.exec(re)[1]),W=$>=2);let de=null,ce={},Me=n.getParameter(n.SCISSOR_BOX),je=n.getParameter(n.VIEWPORT),ut=new yt().fromArray(Me),it=new yt().fromArray(je);function K(N,ue,j,me){let Se=new Uint8Array(4),ie=n.createTexture();n.bindTexture(N,ie),n.texParameteri(N,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(N,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Re=0;Re<j;Re++)N===n.TEXTURE_3D||N===n.TEXTURE_2D_ARRAY?n.texImage3D(ue,0,n.RGBA,1,1,me,0,n.RGBA,n.UNSIGNED_BYTE,Se):n.texImage2D(ue+Re,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,Se);return ie}let he={};he[n.TEXTURE_2D]=K(n.TEXTURE_2D,n.TEXTURE_2D,1),he[n.TEXTURE_CUBE_MAP]=K(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),he[n.TEXTURE_2D_ARRAY]=K(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),he[n.TEXTURE_3D]=K(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),ae(n.DEPTH_TEST),a.setFunc(Dn),ye(!1),ge(jc),ae(n.CULL_FACE),se(ui);function ae(N){h[N]!==!0&&(n.enable(N),h[N]=!0)}function De(N){h[N]!==!1&&(n.disable(N),h[N]=!1)}function Ve(N,ue){return u[N]!==ue?(n.bindFramebuffer(N,ue),u[N]=ue,N===n.DRAW_FRAMEBUFFER&&(u[n.FRAMEBUFFER]=ue),N===n.FRAMEBUFFER&&(u[n.DRAW_FRAMEBUFFER]=ue),!0):!1}function Fe(N,ue){let j=g,me=!1;if(N){j=f.get(ue),j===void 0&&(j=[],f.set(ue,j));let Se=N.textures;if(j.length!==Se.length||j[0]!==n.COLOR_ATTACHMENT0){for(let ie=0,Re=Se.length;ie<Re;ie++)j[ie]=n.COLOR_ATTACHMENT0+ie;j.length=Se.length,me=!0}}else j[0]!==n.BACK&&(j[0]=n.BACK,me=!0);me&&n.drawBuffers(j)}function at(N){return b!==N?(n.useProgram(N),b=N,!0):!1}let He={[cn]:n.FUNC_ADD,[qu]:n.FUNC_SUBTRACT,[Yu]:n.FUNC_REVERSE_SUBTRACT};He[Zu]=n.MIN,He[Ju]=n.MAX;let te={[ju]:n.ZERO,[Ku]:n.ONE,[Qu]:n.SRC_COLOR,[$a]:n.SRC_ALPHA,[sd]:n.SRC_ALPHA_SATURATE,[id]:n.DST_COLOR,[ed]:n.DST_ALPHA,[$u]:n.ONE_MINUS_SRC_COLOR,[eo]:n.ONE_MINUS_SRC_ALPHA,[nd]:n.ONE_MINUS_DST_COLOR,[td]:n.ONE_MINUS_DST_ALPHA,[rd]:n.CONSTANT_COLOR,[ad]:n.ONE_MINUS_CONSTANT_COLOR,[od]:n.CONSTANT_ALPHA,[ld]:n.ONE_MINUS_CONSTANT_ALPHA};function se(N,ue,j,me,Se,ie,Re,we,St,mt){if(N===ui){m===!0&&(De(n.BLEND),m=!1);return}if(m===!1&&(ae(n.BLEND),m=!0),N!==Xu){if(N!==p||mt!==P){if((T!==cn||A!==cn)&&(n.blendEquation(n.FUNC_ADD),T=cn,A=cn),mt)switch(N){case Ln:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case qr:n.blendFunc(n.ONE,n.ONE);break;case Kc:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Qc:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:ke("WebGLState: Invalid blending: ",N);break}else switch(N){case Ln:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case qr:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case Kc:ke("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Qc:ke("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:ke("WebGLState: Invalid blending: ",N);break}S=null,y=null,M=null,C=null,v.set(0,0,0),w=0,p=N,P=mt}return}Se=Se||ue,ie=ie||j,Re=Re||me,(ue!==T||Se!==A)&&(n.blendEquationSeparate(He[ue],He[Se]),T=ue,A=Se),(j!==S||me!==y||ie!==M||Re!==C)&&(n.blendFuncSeparate(te[j],te[me],te[ie],te[Re]),S=j,y=me,M=ie,C=Re),(we.equals(v)===!1||St!==w)&&(n.blendColor(we.r,we.g,we.b,St),v.copy(we),w=St),p=N,P=!1}function ne(N,ue){N.side===ei?De(n.CULL_FACE):ae(n.CULL_FACE);let j=N.side===Dt;ue&&(j=!j),ye(j),N.blending===Ln&&N.transparent===!1?se(ui):se(N.blending,N.blendEquation,N.blendSrc,N.blendDst,N.blendEquationAlpha,N.blendSrcAlpha,N.blendDstAlpha,N.blendColor,N.blendAlpha,N.premultipliedAlpha),a.setFunc(N.depthFunc),a.setTest(N.depthTest),a.setMask(N.depthWrite),r.setMask(N.colorWrite);let me=N.stencilWrite;o.setTest(me),me&&(o.setMask(N.stencilWriteMask),o.setFunc(N.stencilFunc,N.stencilRef,N.stencilFuncMask),o.setOp(N.stencilFail,N.stencilZFail,N.stencilZPass)),Pe(N.polygonOffset,N.polygonOffsetFactor,N.polygonOffsetUnits),N.alphaToCoverage===!0?ae(n.SAMPLE_ALPHA_TO_COVERAGE):De(n.SAMPLE_ALPHA_TO_COVERAGE)}function ye(N){I!==N&&(N?n.frontFace(n.CW):n.frontFace(n.CCW),I=N)}function ge(N){N!==Gu?(ae(n.CULL_FACE),N!==U&&(N===jc?n.cullFace(n.BACK):N===Hu?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):De(n.CULL_FACE),U=N}function Be(N){N!==q&&(W&&n.lineWidth(N),q=N)}function Pe(N,ue,j){N?(ae(n.POLYGON_OFFSET_FILL),(Y!==ue||B!==j)&&(Y=ue,B=j,a.getReversed()&&(ue=-ue),n.polygonOffset(ue,j))):De(n.POLYGON_OFFSET_FILL)}function Ge(N){N?ae(n.SCISSOR_TEST):De(n.SCISSOR_TEST)}function Xe(N){N===void 0&&(N=n.TEXTURE0+X-1),de!==N&&(n.activeTexture(N),de=N)}function D(N,ue,j){j===void 0&&(de===null?j=n.TEXTURE0+X-1:j=de);let me=ce[j];me===void 0&&(me={type:void 0,texture:void 0},ce[j]=me),(me.type!==N||me.texture!==ue)&&(de!==j&&(n.activeTexture(j),de=j),n.bindTexture(N,ue||he[N]),me.type=N,me.texture=ue)}function ct(){let N=ce[de];N!==void 0&&N.type!==void 0&&(n.bindTexture(N.type,null),N.type=void 0,N.texture=void 0)}function et(){try{n.compressedTexImage2D(...arguments)}catch(N){ke("WebGLState:",N)}}function E(){try{n.compressedTexImage3D(...arguments)}catch(N){ke("WebGLState:",N)}}function x(){try{n.texSubImage2D(...arguments)}catch(N){ke("WebGLState:",N)}}function O(){try{n.texSubImage3D(...arguments)}catch(N){ke("WebGLState:",N)}}function G(){try{n.compressedTexSubImage2D(...arguments)}catch(N){ke("WebGLState:",N)}}function Z(){try{n.compressedTexSubImage3D(...arguments)}catch(N){ke("WebGLState:",N)}}function oe(){try{n.texStorage2D(...arguments)}catch(N){ke("WebGLState:",N)}}function le(){try{n.texStorage3D(...arguments)}catch(N){ke("WebGLState:",N)}}function J(){try{n.texImage2D(...arguments)}catch(N){ke("WebGLState:",N)}}function Q(){try{n.texImage3D(...arguments)}catch(N){ke("WebGLState:",N)}}function fe(N){return d[N]!==void 0?d[N]:n.getParameter(N)}function Ie(N,ue){d[N]!==ue&&(n.pixelStorei(N,ue),d[N]=ue)}function xe(N){ut.equals(N)===!1&&(n.scissor(N.x,N.y,N.z,N.w),ut.copy(N))}function pe(N){it.equals(N)===!1&&(n.viewport(N.x,N.y,N.z,N.w),it.copy(N))}function Ue(N,ue){let j=c.get(ue);j===void 0&&(j=new WeakMap,c.set(ue,j));let me=j.get(N);me===void 0&&(me=n.getUniformBlockIndex(ue,N.name),j.set(N,me))}function ze(N,ue){let me=c.get(ue).get(N);l.get(ue)!==me&&(n.uniformBlockBinding(ue,me,N.__bindingPointIndex),l.set(ue,me))}function qe(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),a.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),n.pixelStorei(n.PACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!1),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,n.BROWSER_DEFAULT_WEBGL),n.pixelStorei(n.PACK_ROW_LENGTH,0),n.pixelStorei(n.PACK_SKIP_PIXELS,0),n.pixelStorei(n.PACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_ROW_LENGTH,0),n.pixelStorei(n.UNPACK_IMAGE_HEIGHT,0),n.pixelStorei(n.UNPACK_SKIP_PIXELS,0),n.pixelStorei(n.UNPACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_SKIP_IMAGES,0),h={},d={},de=null,ce={},u={},f=new WeakMap,g=[],b=null,m=!1,p=null,T=null,S=null,y=null,A=null,M=null,C=null,v=new Ee(0,0,0),w=0,P=!1,I=null,U=null,q=null,Y=null,B=null,ut.set(0,0,n.canvas.width,n.canvas.height),it.set(0,0,n.canvas.width,n.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:ae,disable:De,bindFramebuffer:Ve,drawBuffers:Fe,useProgram:at,setBlending:se,setMaterial:ne,setFlipSided:ye,setCullFace:ge,setLineWidth:Be,setPolygonOffset:Pe,setScissorTest:Ge,activeTexture:Xe,bindTexture:D,unbindTexture:ct,compressedTexImage2D:et,compressedTexImage3D:E,texImage2D:J,texImage3D:Q,pixelStorei:Ie,getParameter:fe,updateUBOMapping:Ue,uniformBlockBinding:ze,texStorage2D:oe,texStorage3D:le,texSubImage2D:x,texSubImage3D:O,compressedTexSubImage2D:G,compressedTexSubImage3D:Z,scissor:xe,viewport:pe,reset:qe}}function hy(n,e,t,i,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new ee,h=new WeakMap,d=new Set,u,f=new WeakMap,g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function b(E,x){return g?new OffscreenCanvas(E,x):hr("canvas")}function m(E,x,O){let G=1,Z=et(E);if((Z.width>O||Z.height>O)&&(G=O/Math.max(Z.width,Z.height)),G<1)if(typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&E instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&E instanceof ImageBitmap||typeof VideoFrame<"u"&&E instanceof VideoFrame){let oe=Math.floor(G*Z.width),le=Math.floor(G*Z.height);u===void 0&&(u=b(oe,le));let J=x?b(oe,le):u;return J.width=oe,J.height=le,J.getContext("2d").drawImage(E,0,0,oe,le),Oe("WebGLRenderer: Texture has been resized from ("+Z.width+"x"+Z.height+") to ("+oe+"x"+le+")."),J}else return"data"in E&&Oe("WebGLRenderer: Image in DataTexture is too big ("+Z.width+"x"+Z.height+")."),E;return E}function p(E){return E.generateMipmaps}function T(E){n.generateMipmap(E)}function S(E){return E.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:E.isWebGL3DRenderTarget?n.TEXTURE_3D:E.isWebGLArrayRenderTarget||E.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function y(E,x,O,G,Z,oe=!1){if(E!==null){if(n[E]!==void 0)return n[E];Oe("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+E+"'")}let le;G&&(le=e.get("EXT_texture_norm16"),le||Oe("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let J=x;if(x===n.RED&&(O===n.FLOAT&&(J=n.R32F),O===n.HALF_FLOAT&&(J=n.R16F),O===n.UNSIGNED_BYTE&&(J=n.R8),O===n.UNSIGNED_SHORT&&le&&(J=le.R16_EXT),O===n.SHORT&&le&&(J=le.R16_SNORM_EXT)),x===n.RED_INTEGER&&(O===n.UNSIGNED_BYTE&&(J=n.R8UI),O===n.UNSIGNED_SHORT&&(J=n.R16UI),O===n.UNSIGNED_INT&&(J=n.R32UI),O===n.BYTE&&(J=n.R8I),O===n.SHORT&&(J=n.R16I),O===n.INT&&(J=n.R32I)),x===n.RG&&(O===n.FLOAT&&(J=n.RG32F),O===n.HALF_FLOAT&&(J=n.RG16F),O===n.UNSIGNED_BYTE&&(J=n.RG8),O===n.UNSIGNED_SHORT&&le&&(J=le.RG16_EXT),O===n.SHORT&&le&&(J=le.RG16_SNORM_EXT)),x===n.RG_INTEGER&&(O===n.UNSIGNED_BYTE&&(J=n.RG8UI),O===n.UNSIGNED_SHORT&&(J=n.RG16UI),O===n.UNSIGNED_INT&&(J=n.RG32UI),O===n.BYTE&&(J=n.RG8I),O===n.SHORT&&(J=n.RG16I),O===n.INT&&(J=n.RG32I)),x===n.RGB_INTEGER&&(O===n.UNSIGNED_BYTE&&(J=n.RGB8UI),O===n.UNSIGNED_SHORT&&(J=n.RGB16UI),O===n.UNSIGNED_INT&&(J=n.RGB32UI),O===n.BYTE&&(J=n.RGB8I),O===n.SHORT&&(J=n.RGB16I),O===n.INT&&(J=n.RGB32I)),x===n.RGBA_INTEGER&&(O===n.UNSIGNED_BYTE&&(J=n.RGBA8UI),O===n.UNSIGNED_SHORT&&(J=n.RGBA16UI),O===n.UNSIGNED_INT&&(J=n.RGBA32UI),O===n.BYTE&&(J=n.RGBA8I),O===n.SHORT&&(J=n.RGBA16I),O===n.INT&&(J=n.RGBA32I)),x===n.RGB&&(O===n.UNSIGNED_SHORT&&le&&(J=le.RGB16_EXT),O===n.SHORT&&le&&(J=le.RGB16_SNORM_EXT),O===n.UNSIGNED_INT_5_9_9_9_REV&&(J=n.RGB9_E5),O===n.UNSIGNED_INT_10F_11F_11F_REV&&(J=n.R11F_G11F_B10F)),x===n.RGBA){let Q=oe?cr:$e.getTransfer(Z);O===n.FLOAT&&(J=n.RGBA32F),O===n.HALF_FLOAT&&(J=n.RGBA16F),O===n.UNSIGNED_BYTE&&(J=Q===st?n.SRGB8_ALPHA8:n.RGBA8),O===n.UNSIGNED_SHORT&&le&&(J=le.RGBA16_EXT),O===n.SHORT&&le&&(J=le.RGBA16_SNORM_EXT),O===n.UNSIGNED_SHORT_4_4_4_4&&(J=n.RGBA4),O===n.UNSIGNED_SHORT_5_5_5_1&&(J=n.RGB5_A1)}return(J===n.R16F||J===n.R32F||J===n.RG16F||J===n.RG32F||J===n.RGBA16F||J===n.RGBA32F)&&e.get("EXT_color_buffer_float"),J}function A(E,x){let O;return E?x===null||x===Mi||x===Ps?O=n.DEPTH24_STENCIL8:x===di?O=n.DEPTH32F_STENCIL8:x===Rs&&(O=n.DEPTH24_STENCIL8,Oe("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===Mi||x===Ps?O=n.DEPTH_COMPONENT24:x===di?O=n.DEPTH_COMPONENT32F:x===Rs&&(O=n.DEPTH_COMPONENT16),O}function M(E,x){return p(E)===!0||E.isFramebufferTexture&&E.minFilter!==Et&&E.minFilter!==Lt?Math.log2(Math.max(x.width,x.height))+1:E.mipmaps!==void 0&&E.mipmaps.length>0?E.mipmaps.length:E.isCompressedTexture&&Array.isArray(E.image)?x.mipmaps.length:1}function C(E){let x=E.target;x.removeEventListener("dispose",C),w(x),x.isVideoTexture&&h.delete(x),x.isHTMLTexture&&d.delete(x)}function v(E){let x=E.target;x.removeEventListener("dispose",v),I(x)}function w(E){let x=i.get(E);if(x.__webglInit===void 0)return;let O=E.source,G=f.get(O);if(G){let Z=G[x.__cacheKey];Z.usedTimes--,Z.usedTimes===0&&P(E),Object.keys(G).length===0&&f.delete(O)}i.remove(E)}function P(E){let x=i.get(E);n.deleteTexture(x.__webglTexture);let O=E.source,G=f.get(O);delete G[x.__cacheKey],a.memory.textures--}function I(E){let x=i.get(E);if(E.depthTexture&&(E.depthTexture.dispose(),i.remove(E.depthTexture)),E.isWebGLCubeRenderTarget)for(let G=0;G<6;G++){if(Array.isArray(x.__webglFramebuffer[G]))for(let Z=0;Z<x.__webglFramebuffer[G].length;Z++)n.deleteFramebuffer(x.__webglFramebuffer[G][Z]);else n.deleteFramebuffer(x.__webglFramebuffer[G]);x.__webglDepthbuffer&&n.deleteRenderbuffer(x.__webglDepthbuffer[G])}else{if(Array.isArray(x.__webglFramebuffer))for(let G=0;G<x.__webglFramebuffer.length;G++)n.deleteFramebuffer(x.__webglFramebuffer[G]);else n.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&n.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&n.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let G=0;G<x.__webglColorRenderbuffer.length;G++)x.__webglColorRenderbuffer[G]&&n.deleteRenderbuffer(x.__webglColorRenderbuffer[G]);x.__webglDepthRenderbuffer&&n.deleteRenderbuffer(x.__webglDepthRenderbuffer)}let O=E.textures;for(let G=0,Z=O.length;G<Z;G++){let oe=i.get(O[G]);oe.__webglTexture&&(n.deleteTexture(oe.__webglTexture),a.memory.textures--),i.remove(O[G])}i.remove(E)}let U=0;function q(){U=0}function Y(){return U}function B(E){U=E}function X(){let E=U;return E>=s.maxTextures&&Oe("WebGLTextures: Trying to use "+E+" texture units while this GPU supports only "+s.maxTextures),U+=1,E}function W(E){let x=[];return x.push(E.wrapS),x.push(E.wrapT),x.push(E.wrapR||0),x.push(E.magFilter),x.push(E.minFilter),x.push(E.anisotropy),x.push(E.internalFormat),x.push(E.format),x.push(E.type),x.push(E.generateMipmaps),x.push(E.premultiplyAlpha),x.push(E.flipY),x.push(E.unpackAlignment),x.push(E.colorSpace),x.join()}function $(E,x){let O=i.get(E);if(E.isVideoTexture&&D(E),E.isRenderTargetTexture===!1&&E.isExternalTexture!==!0&&E.version>0&&O.__version!==E.version){let G=E.image;if(G===null)Oe("WebGLRenderer: Texture marked for update but no image data found.");else if(G.complete===!1)Oe("WebGLRenderer: Texture marked for update but image is incomplete");else{De(O,E,x);return}}else E.isExternalTexture&&(O.__webglTexture=E.sourceTexture?E.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,O.__webglTexture,n.TEXTURE0+x)}function re(E,x){let O=i.get(E);if(E.isRenderTargetTexture===!1&&E.version>0&&O.__version!==E.version){De(O,E,x);return}else E.isExternalTexture&&(O.__webglTexture=E.sourceTexture?E.sourceTexture:null);t.bindTexture(n.TEXTURE_2D_ARRAY,O.__webglTexture,n.TEXTURE0+x)}function de(E,x){let O=i.get(E);if(E.isRenderTargetTexture===!1&&E.version>0&&O.__version!==E.version){De(O,E,x);return}t.bindTexture(n.TEXTURE_3D,O.__webglTexture,n.TEXTURE0+x)}function ce(E,x){let O=i.get(E);if(E.isCubeDepthTexture!==!0&&E.version>0&&O.__version!==E.version){Ve(O,E,x);return}t.bindTexture(n.TEXTURE_CUBE_MAP,O.__webglTexture,n.TEXTURE0+x)}let Me={[lo]:n.REPEAT,[Pi]:n.CLAMP_TO_EDGE,[co]:n.MIRRORED_REPEAT},je={[Et]:n.NEAREST,[ud]:n.NEAREST_MIPMAP_NEAREST,[ea]:n.NEAREST_MIPMAP_LINEAR,[Lt]:n.LINEAR,[Go]:n.LINEAR_MIPMAP_NEAREST,[mn]:n.LINEAR_MIPMAP_LINEAR},ut={[pd]:n.NEVER,[yd]:n.ALWAYS,[md]:n.LESS,[wl]:n.LEQUAL,[gd]:n.EQUAL,[El]:n.GEQUAL,[xd]:n.GREATER,[vd]:n.NOTEQUAL};function it(E,x){if(x.type===di&&e.has("OES_texture_float_linear")===!1&&(x.magFilter===Lt||x.magFilter===Go||x.magFilter===ea||x.magFilter===mn||x.minFilter===Lt||x.minFilter===Go||x.minFilter===ea||x.minFilter===mn)&&Oe("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(E,n.TEXTURE_WRAP_S,Me[x.wrapS]),n.texParameteri(E,n.TEXTURE_WRAP_T,Me[x.wrapT]),(E===n.TEXTURE_3D||E===n.TEXTURE_2D_ARRAY)&&n.texParameteri(E,n.TEXTURE_WRAP_R,Me[x.wrapR]),n.texParameteri(E,n.TEXTURE_MAG_FILTER,je[x.magFilter]),n.texParameteri(E,n.TEXTURE_MIN_FILTER,je[x.minFilter]),x.compareFunction&&(n.texParameteri(E,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(E,n.TEXTURE_COMPARE_FUNC,ut[x.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===Et||x.minFilter!==ea&&x.minFilter!==mn||x.type===di&&e.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||i.get(x).__currentAnisotropy){let O=e.get("EXT_texture_filter_anisotropic");n.texParameterf(E,O.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,s.getMaxAnisotropy())),i.get(x).__currentAnisotropy=x.anisotropy}}}function K(E,x){let O=!1;E.__webglInit===void 0&&(E.__webglInit=!0,x.addEventListener("dispose",C));let G=x.source,Z=f.get(G);Z===void 0&&(Z={},f.set(G,Z));let oe=W(x);if(oe!==E.__cacheKey){Z[oe]===void 0&&(Z[oe]={texture:n.createTexture(),usedTimes:0},a.memory.textures++,O=!0),Z[oe].usedTimes++;let le=Z[E.__cacheKey];le!==void 0&&(Z[E.__cacheKey].usedTimes--,le.usedTimes===0&&P(x)),E.__cacheKey=oe,E.__webglTexture=Z[oe].texture}return O}function he(E,x,O){return Math.floor(Math.floor(E/O)/x)}function ae(E,x,O,G){let oe=E.updateRanges;if(oe.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,x.width,x.height,O,G,x.data);else{oe.sort((Ie,xe)=>Ie.start-xe.start);let le=0;for(let Ie=1;Ie<oe.length;Ie++){let xe=oe[le],pe=oe[Ie],Ue=xe.start+xe.count,ze=he(pe.start,x.width,4),qe=he(xe.start,x.width,4);pe.start<=Ue+1&&ze===qe&&he(pe.start+pe.count-1,x.width,4)===ze?xe.count=Math.max(xe.count,pe.start+pe.count-xe.start):(++le,oe[le]=pe)}oe.length=le+1;let J=t.getParameter(n.UNPACK_ROW_LENGTH),Q=t.getParameter(n.UNPACK_SKIP_PIXELS),fe=t.getParameter(n.UNPACK_SKIP_ROWS);t.pixelStorei(n.UNPACK_ROW_LENGTH,x.width);for(let Ie=0,xe=oe.length;Ie<xe;Ie++){let pe=oe[Ie],Ue=Math.floor(pe.start/4),ze=Math.ceil(pe.count/4),qe=Ue%x.width,N=Math.floor(Ue/x.width),ue=ze,j=1;t.pixelStorei(n.UNPACK_SKIP_PIXELS,qe),t.pixelStorei(n.UNPACK_SKIP_ROWS,N),t.texSubImage2D(n.TEXTURE_2D,0,qe,N,ue,j,O,G,x.data)}E.clearUpdateRanges(),t.pixelStorei(n.UNPACK_ROW_LENGTH,J),t.pixelStorei(n.UNPACK_SKIP_PIXELS,Q),t.pixelStorei(n.UNPACK_SKIP_ROWS,fe)}}function De(E,x,O){let G=n.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(G=n.TEXTURE_2D_ARRAY),x.isData3DTexture&&(G=n.TEXTURE_3D);let Z=K(E,x),oe=x.source;t.bindTexture(G,E.__webglTexture,n.TEXTURE0+O);let le=i.get(oe);if(oe.version!==le.__version||Z===!0){if(t.activeTexture(n.TEXTURE0+O),(typeof ImageBitmap<"u"&&x.image instanceof ImageBitmap)===!1){let j=$e.getPrimaries($e.workingColorSpace),me=x.colorSpace===Qi?null:$e.getPrimaries(x.colorSpace),Se=x.colorSpace===Qi||j===me?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Se)}t.pixelStorei(n.UNPACK_ALIGNMENT,x.unpackAlignment);let Q=m(x.image,!1,s.maxTextureSize);Q=ct(x,Q);let fe=r.convert(x.format,x.colorSpace),Ie=r.convert(x.type),xe=y(x.internalFormat,fe,Ie,x.normalized,x.colorSpace,x.isVideoTexture);it(G,x);let pe,Ue=x.mipmaps,ze=x.isVideoTexture!==!0,qe=le.__version===void 0||Z===!0,N=oe.dataReady,ue=M(x,Q);if(x.isDepthTexture)xe=A(x.format===gn,x.type),qe&&(ze?t.texStorage2D(n.TEXTURE_2D,1,xe,Q.width,Q.height):t.texImage2D(n.TEXTURE_2D,0,xe,Q.width,Q.height,0,fe,Ie,null));else if(x.isDataTexture)if(Ue.length>0){ze&&qe&&t.texStorage2D(n.TEXTURE_2D,ue,xe,Ue[0].width,Ue[0].height);for(let j=0,me=Ue.length;j<me;j++)pe=Ue[j],ze?N&&t.texSubImage2D(n.TEXTURE_2D,j,0,0,pe.width,pe.height,fe,Ie,pe.data):t.texImage2D(n.TEXTURE_2D,j,xe,pe.width,pe.height,0,fe,Ie,pe.data);x.generateMipmaps=!1}else ze?(qe&&t.texStorage2D(n.TEXTURE_2D,ue,xe,Q.width,Q.height),N&&ae(x,Q,fe,Ie)):t.texImage2D(n.TEXTURE_2D,0,xe,Q.width,Q.height,0,fe,Ie,Q.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){ze&&qe&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ue,xe,Ue[0].width,Ue[0].height,Q.depth);for(let j=0,me=Ue.length;j<me;j++)if(pe=Ue[j],x.format!==fi)if(fe!==null)if(ze){if(N)if(x.layerUpdates.size>0){let Se=dh(pe.width,pe.height,x.format,x.type);for(let ie of x.layerUpdates){let Re=pe.data.subarray(ie*Se/pe.data.BYTES_PER_ELEMENT,(ie+1)*Se/pe.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,j,0,0,ie,pe.width,pe.height,1,fe,Re)}x.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,j,0,0,0,pe.width,pe.height,Q.depth,fe,pe.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,j,xe,pe.width,pe.height,Q.depth,0,pe.data,0,0);else Oe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ze?N&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,j,0,0,0,pe.width,pe.height,Q.depth,fe,Ie,pe.data):t.texImage3D(n.TEXTURE_2D_ARRAY,j,xe,pe.width,pe.height,Q.depth,0,fe,Ie,pe.data)}else{ze&&qe&&t.texStorage2D(n.TEXTURE_2D,ue,xe,Ue[0].width,Ue[0].height);for(let j=0,me=Ue.length;j<me;j++)pe=Ue[j],x.format!==fi?fe!==null?ze?N&&t.compressedTexSubImage2D(n.TEXTURE_2D,j,0,0,pe.width,pe.height,fe,pe.data):t.compressedTexImage2D(n.TEXTURE_2D,j,xe,pe.width,pe.height,0,pe.data):Oe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ze?N&&t.texSubImage2D(n.TEXTURE_2D,j,0,0,pe.width,pe.height,fe,Ie,pe.data):t.texImage2D(n.TEXTURE_2D,j,xe,pe.width,pe.height,0,fe,Ie,pe.data)}else if(x.isDataArrayTexture)if(ze){if(qe&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ue,xe,Q.width,Q.height,Q.depth),N)if(x.layerUpdates.size>0){let j=dh(Q.width,Q.height,x.format,x.type);for(let me of x.layerUpdates){let Se=Q.data.subarray(me*j/Q.data.BYTES_PER_ELEMENT,(me+1)*j/Q.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,me,Q.width,Q.height,1,fe,Ie,Se)}x.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,Q.width,Q.height,Q.depth,fe,Ie,Q.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,xe,Q.width,Q.height,Q.depth,0,fe,Ie,Q.data);else if(x.isData3DTexture)ze?(qe&&t.texStorage3D(n.TEXTURE_3D,ue,xe,Q.width,Q.height,Q.depth),N&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,Q.width,Q.height,Q.depth,fe,Ie,Q.data)):t.texImage3D(n.TEXTURE_3D,0,xe,Q.width,Q.height,Q.depth,0,fe,Ie,Q.data);else if(x.isFramebufferTexture){if(qe)if(ze)t.texStorage2D(n.TEXTURE_2D,ue,xe,Q.width,Q.height);else{let j=Q.width,me=Q.height;for(let Se=0;Se<ue;Se++)t.texImage2D(n.TEXTURE_2D,Se,xe,j,me,0,fe,Ie,null),j>>=1,me>>=1}}else if(x.isHTMLTexture){if("texElementImage2D"in n){let j=n.canvas;if(j.hasAttribute("layoutsubtree")||j.setAttribute("layoutsubtree","true"),Q.parentNode!==j){j.appendChild(Q),d.add(x),j.onpaint=me=>{let Se=me.changedElements;for(let ie of d)Se.includes(ie.image)&&(ie.needsUpdate=!0)},j.requestPaint();return}if(n.texElementImage2D.length===3)n.texElementImage2D(n.TEXTURE_2D,n.RGBA8,Q);else{let Se=n.RGBA,ie=n.RGBA,Re=n.UNSIGNED_BYTE;n.texElementImage2D(n.TEXTURE_2D,0,Se,ie,Re,Q)}n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE)}}else if(Ue.length>0){if(ze&&qe){let j=et(Ue[0]);t.texStorage2D(n.TEXTURE_2D,ue,xe,j.width,j.height)}for(let j=0,me=Ue.length;j<me;j++)pe=Ue[j],ze?N&&t.texSubImage2D(n.TEXTURE_2D,j,0,0,fe,Ie,pe):t.texImage2D(n.TEXTURE_2D,j,xe,fe,Ie,pe);x.generateMipmaps=!1}else if(ze){if(qe){let j=et(Q);t.texStorage2D(n.TEXTURE_2D,ue,xe,j.width,j.height)}N&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,fe,Ie,Q)}else t.texImage2D(n.TEXTURE_2D,0,xe,fe,Ie,Q);p(x)&&T(G),le.__version=oe.version,x.onUpdate&&x.onUpdate(x)}E.__version=x.version}function Ve(E,x,O){if(x.image.length!==6)return;let G=K(E,x),Z=x.source;t.bindTexture(n.TEXTURE_CUBE_MAP,E.__webglTexture,n.TEXTURE0+O);let oe=i.get(Z);if(Z.version!==oe.__version||G===!0){t.activeTexture(n.TEXTURE0+O);let le=$e.getPrimaries($e.workingColorSpace),J=x.colorSpace===Qi?null:$e.getPrimaries(x.colorSpace),Q=x.colorSpace===Qi||le===J?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(n.UNPACK_ALIGNMENT,x.unpackAlignment),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Q);let fe=x.isCompressedTexture||x.image[0].isCompressedTexture,Ie=x.image[0]&&x.image[0].isDataTexture,xe=[];for(let ie=0;ie<6;ie++)!fe&&!Ie?xe[ie]=m(x.image[ie],!0,s.maxCubemapSize):xe[ie]=Ie?x.image[ie].image:x.image[ie],xe[ie]=ct(x,xe[ie]);let pe=xe[0],Ue=r.convert(x.format,x.colorSpace),ze=r.convert(x.type),qe=y(x.internalFormat,Ue,ze,x.normalized,x.colorSpace),N=x.isVideoTexture!==!0,ue=oe.__version===void 0||G===!0,j=Z.dataReady,me=M(x,pe);it(n.TEXTURE_CUBE_MAP,x);let Se;if(fe){N&&ue&&t.texStorage2D(n.TEXTURE_CUBE_MAP,me,qe,pe.width,pe.height);for(let ie=0;ie<6;ie++){Se=xe[ie].mipmaps;for(let Re=0;Re<Se.length;Re++){let we=Se[Re];x.format!==fi?Ue!==null?N?j&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Re,0,0,we.width,we.height,Ue,we.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Re,qe,we.width,we.height,0,we.data):Oe("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):N?j&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Re,0,0,we.width,we.height,Ue,ze,we.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Re,qe,we.width,we.height,0,Ue,ze,we.data)}}}else{if(Se=x.mipmaps,N&&ue){Se.length>0&&me++;let ie=et(xe[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,me,qe,ie.width,ie.height)}for(let ie=0;ie<6;ie++)if(Ie){N?j&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,xe[ie].width,xe[ie].height,Ue,ze,xe[ie].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,qe,xe[ie].width,xe[ie].height,0,Ue,ze,xe[ie].data);for(let Re=0;Re<Se.length;Re++){let St=Se[Re].image[ie].image;N?j&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Re+1,0,0,St.width,St.height,Ue,ze,St.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Re+1,qe,St.width,St.height,0,Ue,ze,St.data)}}else{N?j&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,Ue,ze,xe[ie]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,qe,Ue,ze,xe[ie]);for(let Re=0;Re<Se.length;Re++){let we=Se[Re];N?j&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Re+1,0,0,Ue,ze,we.image[ie]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,Re+1,qe,Ue,ze,we.image[ie])}}}p(x)&&T(n.TEXTURE_CUBE_MAP),oe.__version=Z.version,x.onUpdate&&x.onUpdate(x)}E.__version=x.version}function Fe(E,x,O,G,Z,oe){let le=r.convert(O.format,O.colorSpace),J=r.convert(O.type),Q=y(O.internalFormat,le,J,O.normalized,O.colorSpace),fe=i.get(x),Ie=i.get(O);if(Ie.__renderTarget=x,!fe.__hasExternalTextures){let xe=Math.max(1,x.width>>oe),pe=Math.max(1,x.height>>oe);Z===n.TEXTURE_3D||Z===n.TEXTURE_2D_ARRAY?t.texImage3D(Z,oe,Q,xe,pe,x.depth,0,le,J,null):t.texImage2D(Z,oe,Q,xe,pe,0,le,J,null)}t.bindFramebuffer(n.FRAMEBUFFER,E),Xe(x)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,G,Z,Ie.__webglTexture,0,Ge(x)):(Z===n.TEXTURE_2D||Z>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&Z<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,G,Z,Ie.__webglTexture,oe),t.bindFramebuffer(n.FRAMEBUFFER,null)}function at(E,x,O){if(n.bindRenderbuffer(n.RENDERBUFFER,E),x.depthBuffer){let G=x.depthTexture,Z=G&&G.isDepthTexture?G.type:null,oe=A(x.stencilBuffer,Z),le=x.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;Xe(x)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Ge(x),oe,x.width,x.height):O?n.renderbufferStorageMultisample(n.RENDERBUFFER,Ge(x),oe,x.width,x.height):n.renderbufferStorage(n.RENDERBUFFER,oe,x.width,x.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,le,n.RENDERBUFFER,E)}else{let G=x.textures;for(let Z=0;Z<G.length;Z++){let oe=G[Z],le=r.convert(oe.format,oe.colorSpace),J=r.convert(oe.type),Q=y(oe.internalFormat,le,J,oe.normalized,oe.colorSpace);Xe(x)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Ge(x),Q,x.width,x.height):O?n.renderbufferStorageMultisample(n.RENDERBUFFER,Ge(x),Q,x.width,x.height):n.renderbufferStorage(n.RENDERBUFFER,Q,x.width,x.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function He(E,x,O){let G=x.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(n.FRAMEBUFFER,E),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let Z=i.get(x.depthTexture);if(Z.__renderTarget=x,(!Z.__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),G){if(Z.__webglInit===void 0&&(Z.__webglInit=!0,x.depthTexture.addEventListener("dispose",C)),Z.__webglTexture===void 0){Z.__webglTexture=n.createTexture(),t.bindTexture(n.TEXTURE_CUBE_MAP,Z.__webglTexture),it(n.TEXTURE_CUBE_MAP,x.depthTexture);let fe=r.convert(x.depthTexture.format),Ie=r.convert(x.depthTexture.type),xe;x.depthTexture.format===Di?xe=n.DEPTH_COMPONENT24:x.depthTexture.format===gn&&(xe=n.DEPTH24_STENCIL8);for(let pe=0;pe<6;pe++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+pe,0,xe,x.width,x.height,0,fe,Ie,null)}}else $(x.depthTexture,0);let oe=Z.__webglTexture,le=Ge(x),J=G?n.TEXTURE_CUBE_MAP_POSITIVE_X+O:n.TEXTURE_2D,Q=x.depthTexture.format===gn?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(x.depthTexture.format===Di)Xe(x)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,Q,J,oe,0,le):n.framebufferTexture2D(n.FRAMEBUFFER,Q,J,oe,0);else if(x.depthTexture.format===gn)Xe(x)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,Q,J,oe,0,le):n.framebufferTexture2D(n.FRAMEBUFFER,Q,J,oe,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function te(E){let x=i.get(E),O=E.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==E.depthTexture){let G=E.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),G){let Z=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,G.removeEventListener("dispose",Z)};G.addEventListener("dispose",Z),x.__depthDisposeCallback=Z}x.__boundDepthTexture=G}if(E.depthTexture&&!x.__autoAllocateDepthBuffer)if(O)for(let G=0;G<6;G++)He(x.__webglFramebuffer[G],E,G);else{let G=E.texture.mipmaps;G&&G.length>0?He(x.__webglFramebuffer[0],E,0):He(x.__webglFramebuffer,E,0)}else if(O){x.__webglDepthbuffer=[];for(let G=0;G<6;G++)if(t.bindFramebuffer(n.FRAMEBUFFER,x.__webglFramebuffer[G]),x.__webglDepthbuffer[G]===void 0)x.__webglDepthbuffer[G]=n.createRenderbuffer(),at(x.__webglDepthbuffer[G],E,!1);else{let Z=E.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,oe=x.__webglDepthbuffer[G];n.bindRenderbuffer(n.RENDERBUFFER,oe),n.framebufferRenderbuffer(n.FRAMEBUFFER,Z,n.RENDERBUFFER,oe)}}else{let G=E.texture.mipmaps;if(G&&G.length>0?t.bindFramebuffer(n.FRAMEBUFFER,x.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=n.createRenderbuffer(),at(x.__webglDepthbuffer,E,!1);else{let Z=E.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,oe=x.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,oe),n.framebufferRenderbuffer(n.FRAMEBUFFER,Z,n.RENDERBUFFER,oe)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function se(E,x,O){let G=i.get(E);x!==void 0&&Fe(G.__webglFramebuffer,E,E.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),O!==void 0&&te(E)}function ne(E){let x=E.texture,O=i.get(E),G=i.get(x);E.addEventListener("dispose",v);let Z=E.textures,oe=E.isWebGLCubeRenderTarget===!0,le=Z.length>1;if(le||(G.__webglTexture===void 0&&(G.__webglTexture=n.createTexture()),G.__version=x.version,a.memory.textures++),oe){O.__webglFramebuffer=[];for(let J=0;J<6;J++)if(x.mipmaps&&x.mipmaps.length>0){O.__webglFramebuffer[J]=[];for(let Q=0;Q<x.mipmaps.length;Q++)O.__webglFramebuffer[J][Q]=n.createFramebuffer()}else O.__webglFramebuffer[J]=n.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){O.__webglFramebuffer=[];for(let J=0;J<x.mipmaps.length;J++)O.__webglFramebuffer[J]=n.createFramebuffer()}else O.__webglFramebuffer=n.createFramebuffer();if(le)for(let J=0,Q=Z.length;J<Q;J++){let fe=i.get(Z[J]);fe.__webglTexture===void 0&&(fe.__webglTexture=n.createTexture(),a.memory.textures++)}if(E.samples>0&&Xe(E)===!1){O.__webglMultisampledFramebuffer=n.createFramebuffer(),O.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let J=0;J<Z.length;J++){let Q=Z[J];O.__webglColorRenderbuffer[J]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,O.__webglColorRenderbuffer[J]);let fe=r.convert(Q.format,Q.colorSpace),Ie=r.convert(Q.type),xe=y(Q.internalFormat,fe,Ie,Q.normalized,Q.colorSpace,E.isXRRenderTarget===!0),pe=Ge(E);n.renderbufferStorageMultisample(n.RENDERBUFFER,pe,xe,E.width,E.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+J,n.RENDERBUFFER,O.__webglColorRenderbuffer[J])}n.bindRenderbuffer(n.RENDERBUFFER,null),E.depthBuffer&&(O.__webglDepthRenderbuffer=n.createRenderbuffer(),at(O.__webglDepthRenderbuffer,E,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(oe){t.bindTexture(n.TEXTURE_CUBE_MAP,G.__webglTexture),it(n.TEXTURE_CUBE_MAP,x);for(let J=0;J<6;J++)if(x.mipmaps&&x.mipmaps.length>0)for(let Q=0;Q<x.mipmaps.length;Q++)Fe(O.__webglFramebuffer[J][Q],E,x,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+J,Q);else Fe(O.__webglFramebuffer[J],E,x,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+J,0);p(x)&&T(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(le){for(let J=0,Q=Z.length;J<Q;J++){let fe=Z[J],Ie=i.get(fe),xe=n.TEXTURE_2D;(E.isWebGL3DRenderTarget||E.isWebGLArrayRenderTarget)&&(xe=E.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(xe,Ie.__webglTexture),it(xe,fe),Fe(O.__webglFramebuffer,E,fe,n.COLOR_ATTACHMENT0+J,xe,0),p(fe)&&T(xe)}t.unbindTexture()}else{let J=n.TEXTURE_2D;if((E.isWebGL3DRenderTarget||E.isWebGLArrayRenderTarget)&&(J=E.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(J,G.__webglTexture),it(J,x),x.mipmaps&&x.mipmaps.length>0)for(let Q=0;Q<x.mipmaps.length;Q++)Fe(O.__webglFramebuffer[Q],E,x,n.COLOR_ATTACHMENT0,J,Q);else Fe(O.__webglFramebuffer,E,x,n.COLOR_ATTACHMENT0,J,0);p(x)&&T(J),t.unbindTexture()}E.depthBuffer&&te(E)}function ye(E){let x=E.textures;for(let O=0,G=x.length;O<G;O++){let Z=x[O];if(p(Z)){let oe=S(E),le=i.get(Z).__webglTexture;t.bindTexture(oe,le),T(oe),t.unbindTexture()}}}let ge=[],Be=[];function Pe(E){if(E.samples>0){if(Xe(E)===!1){let x=E.textures,O=E.width,G=E.height,Z=n.COLOR_BUFFER_BIT,oe=E.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,le=i.get(E),J=x.length>1;if(J)for(let fe=0;fe<x.length;fe++)t.bindFramebuffer(n.FRAMEBUFFER,le.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+fe,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,le.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+fe,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,le.__webglMultisampledFramebuffer);let Q=E.texture.mipmaps;Q&&Q.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,le.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,le.__webglFramebuffer);for(let fe=0;fe<x.length;fe++){if(E.resolveDepthBuffer&&(E.depthBuffer&&(Z|=n.DEPTH_BUFFER_BIT),E.stencilBuffer&&E.resolveStencilBuffer&&(Z|=n.STENCIL_BUFFER_BIT)),J){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,le.__webglColorRenderbuffer[fe]);let Ie=i.get(x[fe]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,Ie,0)}n.blitFramebuffer(0,0,O,G,0,0,O,G,Z,n.NEAREST),l===!0&&(ge.length=0,Be.length=0,ge.push(n.COLOR_ATTACHMENT0+fe),E.depthBuffer&&E.resolveDepthBuffer===!1&&(ge.push(oe),Be.push(oe),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,Be)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,ge))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),J)for(let fe=0;fe<x.length;fe++){t.bindFramebuffer(n.FRAMEBUFFER,le.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+fe,n.RENDERBUFFER,le.__webglColorRenderbuffer[fe]);let Ie=i.get(x[fe]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,le.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+fe,n.TEXTURE_2D,Ie,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,le.__webglMultisampledFramebuffer)}else if(E.depthBuffer&&E.resolveDepthBuffer===!1&&l){let x=E.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[x])}}}function Ge(E){return Math.min(s.maxSamples,E.samples)}function Xe(E){let x=i.get(E);return E.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function D(E){let x=a.render.frame;h.get(E)!==x&&(h.set(E,x),E.update())}function ct(E,x){let O=E.colorSpace,G=E.format,Z=E.type;return E.isCompressedTexture===!0||E.isVideoTexture===!0||O!==lr&&O!==Qi&&($e.getTransfer(O)===st?(G!==fi||Z!==Yt)&&Oe("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):ke("WebGLTextures: Unsupported texture color space:",O)),x}function et(E){return typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement?(c.width=E.naturalWidth||E.width,c.height=E.naturalHeight||E.height):typeof VideoFrame<"u"&&E instanceof VideoFrame?(c.width=E.displayWidth,c.height=E.displayHeight):(c.width=E.width,c.height=E.height),c}this.allocateTextureUnit=X,this.resetTextureUnits=q,this.getTextureUnits=Y,this.setTextureUnits=B,this.setTexture2D=$,this.setTexture2DArray=re,this.setTexture3D=de,this.setTextureCube=ce,this.rebindTextures=se,this.setupRenderTarget=ne,this.updateRenderTargetMipmap=ye,this.updateMultisampleRenderTarget=Pe,this.setupDepthRenderbuffer=te,this.setupFrameBufferTexture=Fe,this.useMultisampledRTT=Xe,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function uy(n,e){function t(i,s=Qi){let r,a=$e.getTransfer(s);if(i===Yt)return n.UNSIGNED_BYTE;if(i===Wo)return n.UNSIGNED_SHORT_4_4_4_4;if(i===Xo)return n.UNSIGNED_SHORT_5_5_5_1;if(i===ih)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===nh)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===eh)return n.BYTE;if(i===th)return n.SHORT;if(i===Rs)return n.UNSIGNED_SHORT;if(i===Ho)return n.INT;if(i===Mi)return n.UNSIGNED_INT;if(i===di)return n.FLOAT;if(i===Ct)return n.HALF_FLOAT;if(i===sh)return n.ALPHA;if(i===rh)return n.RGB;if(i===fi)return n.RGBA;if(i===Di)return n.DEPTH_COMPONENT;if(i===gn)return n.DEPTH_STENCIL;if(i===qo)return n.RED;if(i===Yo)return n.RED_INTEGER;if(i===xn)return n.RG;if(i===Zo)return n.RG_INTEGER;if(i===Jo)return n.RGBA_INTEGER;if(i===ta||i===ia||i===na||i===sa)if(a===st)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===ta)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===ia)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===na)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===sa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===ta)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===ia)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===na)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===sa)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===jo||i===Ko||i===Qo||i===$o)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===jo)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Ko)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Qo)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===$o)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===el||i===tl||i===il||i===nl||i===sl||i===ra||i===rl)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===el||i===tl)return a===st?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===il)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===nl)return r.COMPRESSED_R11_EAC;if(i===sl)return r.COMPRESSED_SIGNED_R11_EAC;if(i===ra)return r.COMPRESSED_RG11_EAC;if(i===rl)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===al||i===ol||i===ll||i===cl||i===hl||i===ul||i===dl||i===fl||i===pl||i===ml||i===gl||i===xl||i===vl||i===yl)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===al)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===ol)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===ll)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===cl)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===hl)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===ul)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===dl)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===fl)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===pl)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===ml)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===gl)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===xl)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===vl)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===yl)return a===st?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===_l||i===bl||i===Sl)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===_l)return a===st?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===bl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Sl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Ml||i===Tl||i===aa||i===Al)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===Ml)return r.COMPRESSED_RED_RGTC1_EXT;if(i===Tl)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===aa)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Al)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Ps?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}var dy=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,fy=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,wh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let i=new Ar(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,i=new pt({vertexShader:dy,fragmentShader:fy,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new tt(new On(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Eh=class extends Ni{constructor(e,t){super();let i=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,d=null,u=null,f=null,g=null,b=typeof XRWebGLBinding<"u",m=new wh,p={},T=t.getContextAttributes(),S=null,y=null,A=[],M=[],C=new ee,v=null,w=new kt;w.viewport=new yt;let P=new kt;P.viewport=new yt;let I=[w,P],U=new Bo,q=null,Y=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(K){let he=A[K];return he===void 0&&(he=new vs,A[K]=he),he.getTargetRaySpace()},this.getControllerGrip=function(K){let he=A[K];return he===void 0&&(he=new vs,A[K]=he),he.getGripSpace()},this.getHand=function(K){let he=A[K];return he===void 0&&(he=new vs,A[K]=he),he.getHandSpace()};function B(K){let he=M.indexOf(K.inputSource);if(he===-1)return;let ae=A[he];ae!==void 0&&(ae.update(K.inputSource,K.frame,c||a),ae.dispatchEvent({type:K.type,data:K.inputSource}))}function X(){s.removeEventListener("select",B),s.removeEventListener("selectstart",B),s.removeEventListener("selectend",B),s.removeEventListener("squeeze",B),s.removeEventListener("squeezestart",B),s.removeEventListener("squeezeend",B),s.removeEventListener("end",X),s.removeEventListener("inputsourceschange",W);for(let K=0;K<A.length;K++){let he=M[K];he!==null&&(M[K]=null,A[K].disconnect(he))}q=null,Y=null,m.reset();for(let K in p)delete p[K];e.setRenderTarget(S),f=null,u=null,d=null,s=null,y=null,it.stop(),i.isPresenting=!1,e.setPixelRatio(v),e.setSize(C.width,C.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(K){r=K,i.isPresenting===!0&&Oe("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(K){o=K,i.isPresenting===!0&&Oe("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(K){c=K},this.getBaseLayer=function(){return u!==null?u:f},this.getBinding=function(){return d===null&&b&&(d=new XRWebGLBinding(s,t)),d},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(K){if(s=K,s!==null){if(S=e.getRenderTarget(),s.addEventListener("select",B),s.addEventListener("selectstart",B),s.addEventListener("selectend",B),s.addEventListener("squeeze",B),s.addEventListener("squeezestart",B),s.addEventListener("squeezeend",B),s.addEventListener("end",X),s.addEventListener("inputsourceschange",W),T.xrCompatible!==!0&&await t.makeXRCompatible(),v=e.getPixelRatio(),e.getSize(C),b&&"createProjectionLayer"in XRWebGLBinding.prototype){let ae=null,De=null,Ve=null;T.depth&&(Ve=T.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ae=T.stencil?gn:Di,De=T.stencil?Ps:Mi);let Fe={colorFormat:t.RGBA8,depthFormat:Ve,scaleFactor:r};d=this.getBinding(),u=d.createProjectionLayer(Fe),s.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),y=new _t(u.textureWidth,u.textureHeight,{format:fi,type:Yt,depthTexture:new ji(u.textureWidth,u.textureHeight,De,void 0,void 0,void 0,void 0,void 0,void 0,ae),stencilBuffer:T.stencil,colorSpace:e.outputColorSpace,samples:T.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1})}else{let ae={antialias:T.antialias,alpha:!0,depth:T.depth,stencil:T.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,ae),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new _t(f.framebufferWidth,f.framebufferHeight,{format:fi,type:Yt,colorSpace:e.outputColorSpace,stencilBuffer:T.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),it.setContext(s),it.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function W(K){for(let he=0;he<K.removed.length;he++){let ae=K.removed[he],De=M.indexOf(ae);De>=0&&(M[De]=null,A[De].disconnect(ae))}for(let he=0;he<K.added.length;he++){let ae=K.added[he],De=M.indexOf(ae);if(De===-1){for(let Fe=0;Fe<A.length;Fe++)if(Fe>=M.length){M.push(ae),De=Fe;break}else if(M[Fe]===null){M[Fe]=ae,De=Fe;break}if(De===-1)break}let Ve=A[De];Ve&&Ve.connect(ae)}}let $=new L,re=new L;function de(K,he,ae){$.setFromMatrixPosition(he.matrixWorld),re.setFromMatrixPosition(ae.matrixWorld);let De=$.distanceTo(re),Ve=he.projectionMatrix.elements,Fe=ae.projectionMatrix.elements,at=Ve[14]/(Ve[10]-1),He=Ve[14]/(Ve[10]+1),te=(Ve[9]+1)/Ve[5],se=(Ve[9]-1)/Ve[5],ne=(Ve[8]-1)/Ve[0],ye=(Fe[8]+1)/Fe[0],ge=at*ne,Be=at*ye,Pe=De/(-ne+ye),Ge=Pe*-ne;if(he.matrixWorld.decompose(K.position,K.quaternion,K.scale),K.translateX(Ge),K.translateZ(Pe),K.matrixWorld.compose(K.position,K.quaternion,K.scale),K.matrixWorldInverse.copy(K.matrixWorld).invert(),Ve[10]===-1)K.projectionMatrix.copy(he.projectionMatrix),K.projectionMatrixInverse.copy(he.projectionMatrixInverse);else{let Xe=at+Pe,D=He+Pe,ct=ge-Ge,et=Be+(De-Ge),E=te*He/D*Xe,x=se*He/D*Xe;K.projectionMatrix.makePerspective(ct,et,E,x,Xe,D),K.projectionMatrixInverse.copy(K.projectionMatrix).invert()}}function ce(K,he){he===null?K.matrixWorld.copy(K.matrix):K.matrixWorld.multiplyMatrices(he.matrixWorld,K.matrix),K.matrixWorldInverse.copy(K.matrixWorld).invert()}this.updateCamera=function(K){if(s===null)return;let he=K.near,ae=K.far;m.texture!==null&&(m.depthNear>0&&(he=m.depthNear),m.depthFar>0&&(ae=m.depthFar)),U.near=P.near=w.near=he,U.far=P.far=w.far=ae,(q!==U.near||Y!==U.far)&&(s.updateRenderState({depthNear:U.near,depthFar:U.far}),q=U.near,Y=U.far),U.layers.mask=K.layers.mask|6,w.layers.mask=U.layers.mask&-5,P.layers.mask=U.layers.mask&-3;let De=K.parent,Ve=U.cameras;ce(U,De);for(let Fe=0;Fe<Ve.length;Fe++)ce(Ve[Fe],De);Ve.length===2?de(U,w,P):U.projectionMatrix.copy(w.projectionMatrix),Me(K,U,De)};function Me(K,he,ae){ae===null?K.matrix.copy(he.matrixWorld):(K.matrix.copy(ae.matrixWorld),K.matrix.invert(),K.matrix.multiply(he.matrixWorld)),K.matrix.decompose(K.position,K.quaternion,K.scale),K.updateMatrixWorld(!0),K.projectionMatrix.copy(he.projectionMatrix),K.projectionMatrixInverse.copy(he.projectionMatrixInverse),K.isPerspectiveCamera&&(K.fov=gs*2*Math.atan(1/K.projectionMatrix.elements[5]),K.zoom=1)}this.getCamera=function(){return U},this.getFoveation=function(){if(!(u===null&&f===null))return l},this.setFoveation=function(K){l=K,u!==null&&(u.fixedFoveation=K),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=K)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(U)},this.getCameraTexture=function(K){return p[K]};let je=null;function ut(K,he){if(h=he.getViewerPose(c||a),g=he,h!==null){let ae=h.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let De=!1;ae.length!==U.cameras.length&&(U.cameras.length=0,De=!0);for(let He=0;He<ae.length;He++){let te=ae[He],se=null;if(f!==null)se=f.getViewport(te);else{let ye=d.getViewSubImage(u,te);se=ye.viewport,He===0&&(e.setRenderTargetTextures(y,ye.colorTexture,ye.depthStencilTexture),e.setRenderTarget(y))}let ne=I[He];ne===void 0&&(ne=new kt,ne.layers.enable(He),ne.viewport=new yt,I[He]=ne),ne.matrix.fromArray(te.transform.matrix),ne.matrix.decompose(ne.position,ne.quaternion,ne.scale),ne.projectionMatrix.fromArray(te.projectionMatrix),ne.projectionMatrixInverse.copy(ne.projectionMatrix).invert(),ne.viewport.set(se.x,se.y,se.width,se.height),He===0&&(U.matrix.copy(ne.matrix),U.matrix.decompose(U.position,U.quaternion,U.scale)),De===!0&&U.cameras.push(ne)}let Ve=s.enabledFeatures;if(Ve&&Ve.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&b){d=i.getBinding();let He=d.getDepthInformation(ae[0]);He&&He.isValid&&He.texture&&m.init(He,s.renderState)}if(Ve&&Ve.includes("camera-access")&&b){e.state.unbindTexture(),d=i.getBinding();for(let He=0;He<ae.length;He++){let te=ae[He].camera;if(te){let se=p[te];se||(se=new Ar,p[te]=se);let ne=d.getCameraImage(te);se.sourceTexture=ne}}}}for(let ae=0;ae<A.length;ae++){let De=M[ae],Ve=A[ae];De!==null&&Ve!==void 0&&Ve.update(De,he,c||a)}je&&je(K,he),he.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:he}),g=null}let it=new $d;it.setAnimationLoop(ut),this.setAnimationLoop=function(K){je=K},this.dispose=function(){}}},py=new rt,af=new We;af.set(-1,0,0,0,1,0,0,0,1);function my(n,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function i(m,p){p.color.getRGB(m.fogColor.value,ch(n)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,T,S,y){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(m,p):p.isMeshLambertMaterial?(r(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(m,p),d(m,p)):p.isMeshPhongMaterial?(r(m,p),h(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(m,p),u(m,p),p.isMeshPhysicalMaterial&&f(m,p,y)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),b(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(a(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?l(m,p,T,S):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Dt&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Dt&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let T=e.get(p),S=T.envMap,y=T.envMapRotation;S&&(m.envMap.value=S,m.envMapRotation.value.setFromMatrix4(py.makeRotationFromEuler(y)).transpose(),S.isCubeTexture&&S.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(af),m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function a(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,T,S){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*T,m.scale.value=S*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function d(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function u(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,T){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Dt&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=T.texture,m.transmissionSamplerSize.value.set(T.width,T.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function b(m,p){let T=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(T.matrixWorld),m.nearDistance.value=T.shadow.camera.near,m.farDistance.value=T.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function gy(n,e,t,i){let s={},r={},a=[],o=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,A){let M=A.program;i.uniformBlockBinding(y,M)}function c(y,A){let M=s[y.id];M===void 0&&(m(y),M=h(y),s[y.id]=M,y.addEventListener("dispose",T));let C=A.program;i.updateUBOMapping(y,C);let v=e.render.frame;r[y.id]!==v&&(u(y),r[y.id]=v)}function h(y){let A=d();y.__bindingPointIndex=A;let M=n.createBuffer(),C=y.__size,v=y.usage;return n.bindBuffer(n.UNIFORM_BUFFER,M),n.bufferData(n.UNIFORM_BUFFER,C,v),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,A,M),M}function d(){for(let y=0;y<o;y++)if(a.indexOf(y)===-1)return a.push(y),y;return ke("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(y){let A=s[y.id],M=y.uniforms,C=y.__cache;n.bindBuffer(n.UNIFORM_BUFFER,A);for(let v=0,w=M.length;v<w;v++){let P=M[v];if(Array.isArray(P))for(let I=0,U=P.length;I<U;I++)f(P[I],v,I,C);else f(P,v,0,C)}n.bindBuffer(n.UNIFORM_BUFFER,null)}function f(y,A,M,C){if(b(y,A,M,C)===!0){let v=y.__offset,w=y.value;if(Array.isArray(w)){let P=0;for(let I=0;I<w.length;I++){let U=w[I],q=p(U);g(U,y.__data,P),typeof U!="number"&&typeof U!="boolean"&&!U.isMatrix3&&!ArrayBuffer.isView(U)&&(P+=q.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(w,y.__data,0);n.bufferSubData(n.UNIFORM_BUFFER,v,y.__data)}}function g(y,A,M){typeof y=="number"||typeof y=="boolean"?A[0]=y:y.isMatrix3?(A[0]=y.elements[0],A[1]=y.elements[1],A[2]=y.elements[2],A[3]=0,A[4]=y.elements[3],A[5]=y.elements[4],A[6]=y.elements[5],A[7]=0,A[8]=y.elements[6],A[9]=y.elements[7],A[10]=y.elements[8],A[11]=0):ArrayBuffer.isView(y)?A.set(new y.constructor(y.buffer,y.byteOffset,A.length)):y.toArray(A,M)}function b(y,A,M,C){let v=y.value,w=A+"_"+M;if(C[w]===void 0)return typeof v=="number"||typeof v=="boolean"?C[w]=v:ArrayBuffer.isView(v)?C[w]=v.slice():C[w]=v.clone(),!0;{let P=C[w];if(typeof v=="number"||typeof v=="boolean"){if(P!==v)return C[w]=v,!0}else{if(ArrayBuffer.isView(v))return!0;if(P.equals(v)===!1)return P.copy(v),!0}}return!1}function m(y){let A=y.uniforms,M=0,C=16;for(let w=0,P=A.length;w<P;w++){let I=Array.isArray(A[w])?A[w]:[A[w]];for(let U=0,q=I.length;U<q;U++){let Y=I[U],B=Array.isArray(Y.value)?Y.value:[Y.value];for(let X=0,W=B.length;X<W;X++){let $=B[X],re=p($),de=M%C,ce=de%re.boundary,Me=de+ce;M+=ce,Me!==0&&C-Me<re.storage&&(M+=C-Me),Y.__data=new Float32Array(re.storage/Float32Array.BYTES_PER_ELEMENT),Y.__offset=M,M+=re.storage}}}let v=M%C;return v>0&&(M+=C-v),y.__size=M,y.__cache={},this}function p(y){let A={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(A.boundary=4,A.storage=4):y.isVector2?(A.boundary=8,A.storage=8):y.isVector3||y.isColor?(A.boundary=16,A.storage=12):y.isVector4?(A.boundary=16,A.storage=16):y.isMatrix3?(A.boundary=48,A.storage=48):y.isMatrix4?(A.boundary=64,A.storage=64):y.isTexture?Oe("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(A.boundary=16,A.storage=y.byteLength):Oe("WebGLRenderer: Unsupported uniform value type.",y),A}function T(y){let A=y.target;A.removeEventListener("dispose",T);let M=a.indexOf(A.__bindingPointIndex);a.splice(M,1),n.deleteBuffer(s[A.id]),delete s[A.id],delete r[A.id]}function S(){for(let y in s)n.deleteBuffer(s[y]);a=[],s={},r={}}return{bind:l,update:c,dispose:S}}var xy=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Oi=null;function vy(){return Oi===null&&(Oi=new _r(xy,16,16,xn,Ct),Oi.name="DFG_LUT",Oi.minFilter=Lt,Oi.magFilter=Lt,Oi.wrapS=Pi,Oi.wrapT=Pi,Oi.generateMipmaps=!1,Oi.needsUpdate=!0),Oi}var Ll=class{constructor(e={}){let{canvas:t=_d(),context:i=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:u=!1,outputBufferType:f=Yt}=e;this.isWebGLRenderer=!0;let g;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=i.getContextAttributes().alpha}else g=a;let b=f,m=new Set([Jo,Zo,Yo]),p=new Set([Yt,Mi,Rs,Ps,Wo,Xo]),T=new Uint32Array(4),S=new Int32Array(4),y=new L,A=null,M=null,C=[],v=[],w=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Si,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let P=this,I=!1,U=null,q=null,Y=null,B=null;this._outputColorSpace=Ht;let X=0,W=0,$=null,re=-1,de=null,ce=new yt,Me=new yt,je=null,ut=new Ee(0),it=0,K=t.width,he=t.height,ae=1,De=null,Ve=null,Fe=new yt(0,0,K,he),at=new yt(0,0,K,he),He=!1,te=new _s,se=!1,ne=!1,ye=new rt,ge=new L,Be=new yt,Pe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ge=!1;function Xe(){return $===null?ae:1}let D=i;function ct(_,F){return t.getContext(_,F)}try{let _={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"185"}`),t.addEventListener("webglcontextlost",St,!1),t.addEventListener("webglcontextrestored",mt,!1),t.addEventListener("webglcontextcreationerror",Ai,!1),D===null){let F="webgl2";if(D=ct(F,_),D===null)throw ct(F)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(_){throw ke("WebGLRenderer: "+_.message),_}let et,E,x,O,G,Z,oe,le,J,Q,fe,Ie,xe,pe,Ue,ze,qe,N,ue,j,me,Se,ie;function Re(){et=new Ax(D),et.init(),me=new uy(D,et),E=new xx(D,et,e,me),x=new cy(D,et),E.reversedDepthBuffer&&u&&x.buffers.depth.setReversed(!0),q=D.createFramebuffer(),Y=D.createFramebuffer(),B=D.createFramebuffer(),O=new Cx(D),G=new Jv,Z=new hy(D,et,x,G,E,me,O),oe=new Tx(P),le=new Lm(D),Se=new mx(D,le),J=new wx(D,le,O,Se),Q=new Px(D,J,le,Se,O),N=new Rx(D,E,Z),Ue=new vx(G),fe=new Zv(P,oe,et,E,Se,Ue),Ie=new my(P,G),xe=new Kv,pe=new ny(et),qe=new px(P,oe,x,Q,g,l),ze=new ly(P,Q,E),ie=new gy(D,O,E,x),ue=new gx(D,et,O),j=new Ex(D,et,O),O.programs=fe.programs,P.capabilities=E,P.extensions=et,P.properties=G,P.renderLists=xe,P.shadowMap=ze,P.state=x,P.info=O}Re(),b!==Yt&&(w=new Lx(b,t.width,t.height,o,s,r));let we=new Eh(P,D);this.xr=we,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){let _=et.get("WEBGL_lose_context");_&&_.loseContext()},this.forceContextRestore=function(){let _=et.get("WEBGL_lose_context");_&&_.restoreContext()},this.getPixelRatio=function(){return ae},this.setPixelRatio=function(_){_!==void 0&&(ae=_,this.setSize(K,he,!1))},this.getSize=function(_){return _.set(K,he)},this.setSize=function(_,F,H=!0){if(we.isPresenting){Oe("WebGLRenderer: Can't change size while VR device is presenting.");return}K=_,he=F,t.width=Math.floor(_*ae),t.height=Math.floor(F*ae),H===!0&&(t.style.width=_+"px",t.style.height=F+"px"),w!==null&&w.setSize(t.width,t.height),this.setViewport(0,0,_,F)},this.getDrawingBufferSize=function(_){return _.set(K*ae,he*ae).floor()},this.setDrawingBufferSize=function(_,F,H){K=_,he=F,ae=H,t.width=Math.floor(_*H),t.height=Math.floor(F*H),this.setViewport(0,0,_,F)},this.setEffects=function(_){if(b===Yt){ke("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(_){for(let F=0;F<_.length;F++)if(_[F].isOutputPass===!0){Oe("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}w.setEffects(_||[])},this.getCurrentViewport=function(_){return _.copy(ce)},this.getViewport=function(_){return _.copy(Fe)},this.setViewport=function(_,F,H,z){_.isVector4?Fe.set(_.x,_.y,_.z,_.w):Fe.set(_,F,H,z),x.viewport(ce.copy(Fe).multiplyScalar(ae).round())},this.getScissor=function(_){return _.copy(at)},this.setScissor=function(_,F,H,z){_.isVector4?at.set(_.x,_.y,_.z,_.w):at.set(_,F,H,z),x.scissor(Me.copy(at).multiplyScalar(ae).round())},this.getScissorTest=function(){return He},this.setScissorTest=function(_){x.setScissorTest(He=_)},this.setOpaqueSort=function(_){De=_},this.setTransparentSort=function(_){Ve=_},this.getClearColor=function(_){return _.copy(qe.getClearColor())},this.setClearColor=function(){qe.setClearColor(...arguments)},this.getClearAlpha=function(){return qe.getClearAlpha()},this.setClearAlpha=function(){qe.setClearAlpha(...arguments)},this.clear=function(_=!0,F=!0,H=!0){let z=0;if(_){let V=!1;if($!==null){let be=$.texture.format;V=m.has(be)}if(V){let be=$.texture.type,Ae=p.has(be),_e=qe.getClearColor(),Ce=qe.getClearAlpha(),Le=_e.r,Ye=_e.g,Ke=_e.b;Ae?(T[0]=Le,T[1]=Ye,T[2]=Ke,T[3]=Ce,D.clearBufferuiv(D.COLOR,0,T)):(S[0]=Le,S[1]=Ye,S[2]=Ke,S[3]=Ce,D.clearBufferiv(D.COLOR,0,S))}else z|=D.COLOR_BUFFER_BIT}F&&(z|=D.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),H&&(z|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),z!==0&&D.clear(z)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(_){_.setRenderer(this),U=_},this.dispose=function(){t.removeEventListener("webglcontextlost",St,!1),t.removeEventListener("webglcontextrestored",mt,!1),t.removeEventListener("webglcontextcreationerror",Ai,!1),qe.dispose(),xe.dispose(),pe.dispose(),G.dispose(),oe.dispose(),Q.dispose(),Se.dispose(),ie.dispose(),fe.dispose(),we.dispose(),we.removeEventListener("sessionstart",Hh),we.removeEventListener("sessionend",Wh),Sn.stop()};function St(_){_.preventDefault(),ur("WebGLRenderer: Context Lost."),I=!0}function mt(){ur("WebGLRenderer: Context Restored."),I=!1;let _=O.autoReset,F=ze.enabled,H=ze.autoUpdate,z=ze.needsUpdate,V=ze.type;Re(),O.autoReset=_,ze.enabled=F,ze.autoUpdate=H,ze.needsUpdate=z,ze.type=V}function Ai(_){ke("WebGLRenderer: A WebGL context could not be created. Reason: ",_.statusMessage)}function wi(_){let F=_.target;F.removeEventListener("dispose",wi),Vf(F)}function Vf(_){Gf(_),G.remove(_)}function Gf(_){let F=G.get(_).programs;F!==void 0&&(F.forEach(function(H){fe.releaseProgram(H)}),_.isShaderMaterial&&fe.releaseShaderCache(_))}this.renderBufferDirect=function(_,F,H,z,V,be){F===null&&(F=Pe);let Ae=V.isMesh&&V.matrixWorld.determinantAffine()<0,_e=Xf(_,F,H,z,V);x.setMaterial(z,Ae);let Ce=H.index,Le=1;if(z.wireframe===!0){if(Ce=J.getWireframeAttribute(H),Ce===void 0)return;Le=2}let Ye=H.drawRange,Ke=H.attributes.position,Ne=Ye.start*Le,ht=(Ye.start+Ye.count)*Le;be!==null&&(Ne=Math.max(Ne,be.start*Le),ht=Math.min(ht,(be.start+be.count)*Le)),Ce!==null?(Ne=Math.max(Ne,0),ht=Math.min(ht,Ce.count)):Ke!=null&&(Ne=Math.max(Ne,0),ht=Math.min(ht,Ke.count));let At=ht-Ne;if(At<0||At===1/0)return;Se.setup(V,z,_e,H,Ce);let Mt,dt=ue;if(Ce!==null&&(Mt=le.get(Ce),dt=j,dt.setIndex(Mt)),V.isMesh)z.wireframe===!0?(x.setLineWidth(z.wireframeLinewidth*Xe()),dt.setMode(D.LINES)):dt.setMode(D.TRIANGLES);else if(V.isLine){let zt=z.linewidth;zt===void 0&&(zt=1),x.setLineWidth(zt*Xe()),V.isLineSegments?dt.setMode(D.LINES):V.isLineLoop?dt.setMode(D.LINE_LOOP):dt.setMode(D.LINE_STRIP)}else V.isPoints?dt.setMode(D.POINTS):V.isSprite&&dt.setMode(D.TRIANGLES);if(V.isBatchedMesh)if(et.get("WEBGL_multi_draw"))dt.renderMultiDraw(V._multiDrawStarts,V._multiDrawCounts,V._multiDrawCount);else{let zt=V._multiDrawStarts,Te=V._multiDrawCounts,Zt=V._multiDrawCount,nt=Ce?le.get(Ce).bytesPerElement:1,ii=G.get(z).currentProgram.getUniforms();for(let Ei=0;Ei<Zt;Ei++)ii.setValue(D,"_gl_DrawID",Ei),dt.render(zt[Ei]/nt,Te[Ei])}else if(V.isInstancedMesh)dt.renderInstances(Ne,At,V.count);else if(H.isInstancedBufferGeometry){let zt=H._maxInstanceCount!==void 0?H._maxInstanceCount:1/0,Te=Math.min(H.instanceCount,zt);dt.renderInstances(Ne,At,Te)}else dt.render(Ne,At)};function Gh(_,F,H){_.transparent===!0&&_.side===ei&&_.forceSinglePass===!1?(_.side=Dt,_.needsUpdate=!0,ba(_,F,H),_.side=Yi,_.needsUpdate=!0,ba(_,F,H),_.side=ei):ba(_,F,H)}this.compile=function(_,F,H=null){H===null&&(H=_),M=pe.get(H),M.init(F),v.push(M),H.traverseVisible(function(V){V.isLight&&V.layers.test(F.layers)&&(M.pushLight(V),V.castShadow&&M.pushShadow(V))}),_!==H&&_.traverseVisible(function(V){V.isLight&&V.layers.test(F.layers)&&(M.pushLight(V),V.castShadow&&M.pushShadow(V))}),M.setupLights();let z=new Set;return _.traverse(function(V){if(!(V.isMesh||V.isPoints||V.isLine||V.isSprite))return;let be=V.material;if(be)if(Array.isArray(be))for(let Ae=0;Ae<be.length;Ae++){let _e=be[Ae];Gh(_e,H,V),z.add(_e)}else Gh(be,H,V),z.add(be)}),M=v.pop(),z},this.compileAsync=function(_,F,H=null){let z=this.compile(_,F,H);return new Promise(V=>{function be(){if(z.forEach(function(Ae){G.get(Ae).currentProgram.isReady()&&z.delete(Ae)}),z.size===0){V(_);return}setTimeout(be,10)}et.get("KHR_parallel_shader_compile")!==null?be():setTimeout(be,10)})};let ic=null;function Hf(_){ic&&ic(_)}function Hh(){Sn.stop()}function Wh(){Sn.start()}let Sn=new $d;Sn.setAnimationLoop(Hf),typeof self<"u"&&Sn.setContext(self),this.setAnimationLoop=function(_){ic=_,we.setAnimationLoop(_),_===null?Sn.stop():Sn.start()},we.addEventListener("sessionstart",Hh),we.addEventListener("sessionend",Wh),this.render=function(_,F){if(F!==void 0&&F.isCamera!==!0){ke("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;U!==null&&U.renderStart(_,F);let H=we.enabled===!0&&we.isPresenting===!0,z=w!==null&&($===null||H)&&w.begin(P,$);if(_.matrixWorldAutoUpdate===!0&&_.updateMatrixWorld(),F.parent===null&&F.matrixWorldAutoUpdate===!0&&F.updateMatrixWorld(),we.enabled===!0&&we.isPresenting===!0&&(w===null||w.isCompositing()===!1)&&(we.cameraAutoUpdate===!0&&we.updateCamera(F),F=we.getCamera()),_.isScene===!0&&_.onBeforeRender(P,_,F,$),M=pe.get(_,v.length),M.init(F),M.state.textureUnits=Z.getTextureUnits(),v.push(M),ye.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),te.setFromProjectionMatrix(ye,_i,F.reversedDepth),ne=this.localClippingEnabled,se=Ue.init(this.clippingPlanes,ne),A=xe.get(_,C.length),A.init(),C.push(A),we.enabled===!0&&we.isPresenting===!0){let Ae=P.xr.getDepthSensingMesh();Ae!==null&&nc(Ae,F,-1/0,P.sortObjects)}nc(_,F,0,P.sortObjects),A.finish(),P.sortObjects===!0&&A.sort(De,Ve,F.reversedDepth),Ge=we.enabled===!1||we.isPresenting===!1||we.hasDepthSensing()===!1,Ge&&qe.addToRenderList(A,_),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),se===!0&&Ue.beginShadows();let V=M.state.shadowsArray;if(ze.render(V,_,F),se===!0&&Ue.endShadows(),(z&&w.hasRenderPass())===!1){let Ae=A.opaque,_e=A.transmissive;if(M.setupLights(),F.isArrayCamera){let Ce=F.cameras;if(_e.length>0)for(let Le=0,Ye=Ce.length;Le<Ye;Le++){let Ke=Ce[Le];qh(Ae,_e,_,Ke)}Ge&&qe.render(_);for(let Le=0,Ye=Ce.length;Le<Ye;Le++){let Ke=Ce[Le];Xh(A,_,Ke,Ke.viewport)}}else _e.length>0&&qh(Ae,_e,_,F),Ge&&qe.render(_),Xh(A,_,F)}$!==null&&W===0&&(Z.updateMultisampleRenderTarget($),Z.updateRenderTargetMipmap($)),z&&w.end(P),_.isScene===!0&&_.onAfterRender(P,_,F),Se.resetDefaultState(),re=-1,de=null,v.pop(),v.length>0?(M=v[v.length-1],Z.setTextureUnits(M.state.textureUnits),se===!0&&Ue.setGlobalState(P.clippingPlanes,M.state.camera)):M=null,C.pop(),C.length>0?A=C[C.length-1]:A=null,U!==null&&U.renderEnd()};function nc(_,F,H,z){if(_.visible===!1)return;if(_.layers.test(F.layers)){if(_.isGroup)H=_.renderOrder;else if(_.isLOD)_.autoUpdate===!0&&_.update(F);else if(_.isLightProbeGrid)M.pushLightProbeGrid(_);else if(_.isLight)M.pushLight(_),_.castShadow&&M.pushShadow(_);else if(_.isSprite){if(!_.frustumCulled||te.intersectsSprite(_)){z&&Be.setFromMatrixPosition(_.matrixWorld).applyMatrix4(ye);let Ae=Q.update(_),_e=_.material;_e.visible&&A.push(_,Ae,_e,H,Be.z,null)}}else if((_.isMesh||_.isLine||_.isPoints)&&(!_.frustumCulled||te.intersectsObject(_))){let Ae=Q.update(_),_e=_.material;if(z&&(_.boundingSphere!==void 0?(_.boundingSphere===null&&_.computeBoundingSphere(),Be.copy(_.boundingSphere.center)):(Ae.boundingSphere===null&&Ae.computeBoundingSphere(),Be.copy(Ae.boundingSphere.center)),Be.applyMatrix4(_.matrixWorld).applyMatrix4(ye)),Array.isArray(_e)){let Ce=Ae.groups;for(let Le=0,Ye=Ce.length;Le<Ye;Le++){let Ke=Ce[Le],Ne=_e[Ke.materialIndex];Ne&&Ne.visible&&A.push(_,Ae,Ne,H,Be.z,Ke)}}else _e.visible&&A.push(_,Ae,_e,H,Be.z,null)}}let be=_.children;for(let Ae=0,_e=be.length;Ae<_e;Ae++)nc(be[Ae],F,H,z)}function Xh(_,F,H,z){let{opaque:V,transmissive:be,transparent:Ae}=_;M.setupLightsView(H),se===!0&&Ue.setGlobalState(P.clippingPlanes,H),z&&x.viewport(ce.copy(z)),V.length>0&&_a(V,F,H),be.length>0&&_a(be,F,H),Ae.length>0&&_a(Ae,F,H),x.buffers.depth.setTest(!0),x.buffers.depth.setMask(!0),x.buffers.color.setMask(!0),x.setPolygonOffset(!1)}function qh(_,F,H,z){if((H.isScene===!0?H.overrideMaterial:null)!==null)return;if(M.state.transmissionRenderTarget[z.id]===void 0){let Ne=et.has("EXT_color_buffer_half_float")||et.has("EXT_color_buffer_float");M.state.transmissionRenderTarget[z.id]=new _t(1,1,{generateMipmaps:!0,type:Ne?Ct:Yt,minFilter:mn,samples:Math.max(4,E.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:$e.workingColorSpace})}let be=M.state.transmissionRenderTarget[z.id],Ae=z.viewport||ce;be.setSize(Ae.z*P.transmissionResolutionScale,Ae.w*P.transmissionResolutionScale);let _e=P.getRenderTarget(),Ce=P.getActiveCubeFace(),Le=P.getActiveMipmapLevel();P.setRenderTarget(be),P.getClearColor(ut),it=P.getClearAlpha(),it<1&&P.setClearColor(16777215,.5),P.clear(),Ge&&qe.render(H);let Ye=P.toneMapping;P.toneMapping=Si;let Ke=z.viewport;if(z.viewport!==void 0&&(z.viewport=void 0),M.setupLightsView(z),se===!0&&Ue.setGlobalState(P.clippingPlanes,z),_a(_,H,z),Z.updateMultisampleRenderTarget(be),Z.updateRenderTargetMipmap(be),et.has("WEBGL_multisampled_render_to_texture")===!1){let Ne=!1;for(let ht=0,At=F.length;ht<At;ht++){let Mt=F[ht],{object:dt,geometry:zt,material:Te,group:Zt}=Mt;if(Te.side===ei&&dt.layers.test(z.layers)){let nt=Te.side;Te.side=Dt,Te.needsUpdate=!0,Yh(dt,H,z,zt,Te,Zt),Te.side=nt,Te.needsUpdate=!0,Ne=!0}}Ne===!0&&(Z.updateMultisampleRenderTarget(be),Z.updateRenderTargetMipmap(be))}P.setRenderTarget(_e,Ce,Le),P.setClearColor(ut,it),Ke!==void 0&&(z.viewport=Ke),P.toneMapping=Ye}function _a(_,F,H){let z=F.isScene===!0?F.overrideMaterial:null;for(let V=0,be=_.length;V<be;V++){let Ae=_[V],{object:_e,geometry:Ce,group:Le}=Ae,Ye=Ae.material;Ye.allowOverride===!0&&z!==null&&(Ye=z),_e.layers.test(H.layers)&&Yh(_e,F,H,Ce,Ye,Le)}}function Yh(_,F,H,z,V,be){_.onBeforeRender(P,F,H,z,V,be),_.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse,_.matrixWorld),_.normalMatrix.getNormalMatrix(_.modelViewMatrix),V.onBeforeRender(P,F,H,z,_,be),V.transparent===!0&&V.side===ei&&V.forceSinglePass===!1?(V.side=Dt,V.needsUpdate=!0,P.renderBufferDirect(H,F,z,V,_,be),V.side=Yi,V.needsUpdate=!0,P.renderBufferDirect(H,F,z,V,_,be),V.side=ei):P.renderBufferDirect(H,F,z,V,_,be),_.onAfterRender(P,F,H,z,V,be)}function ba(_,F,H){F.isScene!==!0&&(F=Pe);let z=G.get(_),V=M.state.lights,be=M.state.shadowsArray,Ae=V.state.version,_e=fe.getParameters(_,V.state,be,F,H,M.state.lightProbeGridArray),Ce=fe.getProgramCacheKey(_e),Le=z.programs;z.environment=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?F.environment:null,z.fog=F.fog;let Ye=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap;z.envMap=oe.get(_.envMap||z.environment,Ye),z.envMapRotation=z.environment!==null&&_.envMap===null?F.environmentRotation:_.envMapRotation,Le===void 0&&(_.addEventListener("dispose",wi),Le=new Map,z.programs=Le);let Ke=Le.get(Ce);if(Ke!==void 0){if(z.currentProgram===Ke&&z.lightsStateVersion===Ae)return Jh(_,_e),Ke}else _e.uniforms=fe.getUniforms(_),U!==null&&_.isNodeMaterial&&U.build(_,H,_e),_.onBeforeCompile(_e,P),Ke=fe.acquireProgram(_e,Ce),Le.set(Ce,Ke),z.uniforms=_e.uniforms;let Ne=z.uniforms;return(!_.isShaderMaterial&&!_.isRawShaderMaterial||_.clipping===!0)&&(Ne.clippingPlanes=Ue.uniform),Jh(_,_e),z.needsLights=Yf(_),z.lightsStateVersion=Ae,z.needsLights&&(Ne.ambientLightColor.value=V.state.ambient,Ne.lightProbe.value=V.state.probe,Ne.directionalLights.value=V.state.directional,Ne.directionalLightShadows.value=V.state.directionalShadow,Ne.spotLights.value=V.state.spot,Ne.spotLightShadows.value=V.state.spotShadow,Ne.rectAreaLights.value=V.state.rectArea,Ne.ltc_1.value=V.state.rectAreaLTC1,Ne.ltc_2.value=V.state.rectAreaLTC2,Ne.pointLights.value=V.state.point,Ne.pointLightShadows.value=V.state.pointShadow,Ne.hemisphereLights.value=V.state.hemi,Ne.directionalShadowMatrix.value=V.state.directionalShadowMatrix,Ne.spotLightMatrix.value=V.state.spotLightMatrix,Ne.spotLightMap.value=V.state.spotLightMap,Ne.pointShadowMatrix.value=V.state.pointShadowMatrix),z.lightProbeGrid=M.state.lightProbeGridArray.length>0,z.currentProgram=Ke,z.uniformsList=null,Ke}function Zh(_){if(_.uniformsList===null){let F=_.currentProgram.getUniforms();_.uniformsList=Ls.seqWithValue(F.seq,_.uniforms)}return _.uniformsList}function Jh(_,F){let H=G.get(_);H.outputColorSpace=F.outputColorSpace,H.batching=F.batching,H.batchingColor=F.batchingColor,H.instancing=F.instancing,H.instancingColor=F.instancingColor,H.instancingMorph=F.instancingMorph,H.skinning=F.skinning,H.morphTargets=F.morphTargets,H.morphNormals=F.morphNormals,H.morphColors=F.morphColors,H.morphTargetsCount=F.morphTargetsCount,H.numClippingPlanes=F.numClippingPlanes,H.numIntersection=F.numClipIntersection,H.vertexAlphas=F.vertexAlphas,H.vertexTangents=F.vertexTangents,H.toneMapping=F.toneMapping}function Wf(_,F){if(_.length===0)return null;if(_.length===1)return _[0].texture!==null?_[0]:null;y.setFromMatrixPosition(F.matrixWorld);for(let H=0,z=_.length;H<z;H++){let V=_[H];if(V.texture!==null&&V.boundingBox.containsPoint(y))return V}return null}function Xf(_,F,H,z,V){F.isScene!==!0&&(F=Pe),Z.resetTextureUnits();let be=F.fog,Ae=z.isMeshStandardMaterial||z.isMeshLambertMaterial||z.isMeshPhongMaterial?F.environment:null,_e=$===null?P.outputColorSpace:$.isXRRenderTarget===!0?$.texture.colorSpace:$e.workingColorSpace,Ce=z.isMeshStandardMaterial||z.isMeshLambertMaterial&&!z.envMap||z.isMeshPhongMaterial&&!z.envMap,Le=oe.get(z.envMap||Ae,Ce),Ye=z.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,Ke=!!H.attributes.tangent&&(!!z.normalMap||z.anisotropy>0),Ne=!!H.morphAttributes.position,ht=!!H.morphAttributes.normal,At=!!H.morphAttributes.color,Mt=Si;z.toneMapped&&($===null||$.isXRRenderTarget===!0)&&(Mt=P.toneMapping);let dt=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,zt=dt!==void 0?dt.length:0,Te=G.get(z),Zt=M.state.lights;if(se===!0&&(ne===!0||_!==de)){let gt=_===de&&z.id===re;Ue.setState(z,_,gt)}let nt=!1;z.version===Te.__version?(Te.needsLights&&Te.lightsStateVersion!==Zt.state.version||Te.outputColorSpace!==_e||V.isBatchedMesh&&Te.batching===!1||!V.isBatchedMesh&&Te.batching===!0||V.isBatchedMesh&&Te.batchingColor===!0&&V.colorTexture===null||V.isBatchedMesh&&Te.batchingColor===!1&&V.colorTexture!==null||V.isInstancedMesh&&Te.instancing===!1||!V.isInstancedMesh&&Te.instancing===!0||V.isSkinnedMesh&&Te.skinning===!1||!V.isSkinnedMesh&&Te.skinning===!0||V.isInstancedMesh&&Te.instancingColor===!0&&V.instanceColor===null||V.isInstancedMesh&&Te.instancingColor===!1&&V.instanceColor!==null||V.isInstancedMesh&&Te.instancingMorph===!0&&V.morphTexture===null||V.isInstancedMesh&&Te.instancingMorph===!1&&V.morphTexture!==null||Te.envMap!==Le||z.fog===!0&&Te.fog!==be||Te.numClippingPlanes!==void 0&&(Te.numClippingPlanes!==Ue.numPlanes||Te.numIntersection!==Ue.numIntersection)||Te.vertexAlphas!==Ye||Te.vertexTangents!==Ke||Te.morphTargets!==Ne||Te.morphNormals!==ht||Te.morphColors!==At||Te.toneMapping!==Mt||Te.morphTargetsCount!==zt||!!Te.lightProbeGrid!=M.state.lightProbeGridArray.length>0)&&(nt=!0):(nt=!0,Te.__version=z.version);let ii=Te.currentProgram;nt===!0&&(ii=ba(z,F,V),U&&z.isNodeMaterial&&U.onUpdateProgram(z,ii,Te));let Ei=!1,$i=!1,qn=!1,ft=ii.getUniforms(),wt=Te.uniforms;if(x.useProgram(ii.program)&&(Ei=!0,$i=!0,qn=!0),z.id!==re&&(re=z.id,$i=!0),Te.needsLights){let gt=Wf(M.state.lightProbeGridArray,V);Te.lightProbeGrid!==gt&&(Te.lightProbeGrid=gt,$i=!0)}if(Ei||de!==_){x.buffers.depth.getReversed()&&_.reversedDepth!==!0&&(_._reversedDepth=!0,_.updateProjectionMatrix()),ft.setValue(D,"projectionMatrix",_.projectionMatrix),ft.setValue(D,"viewMatrix",_.matrixWorldInverse);let tn=ft.map.cameraPosition;tn!==void 0&&tn.setValue(D,ge.setFromMatrixPosition(_.matrixWorld)),E.logarithmicDepthBuffer&&ft.setValue(D,"logDepthBufFC",2/(Math.log(_.far+1)/Math.LN2)),(z.isMeshPhongMaterial||z.isMeshToonMaterial||z.isMeshLambertMaterial||z.isMeshBasicMaterial||z.isMeshStandardMaterial||z.isShaderMaterial)&&ft.setValue(D,"isOrthographic",_.isOrthographicCamera===!0),de!==_&&(de=_,$i=!0,qn=!0)}if(Te.needsLights&&(Zt.state.directionalShadowMap.length>0&&ft.setValue(D,"directionalShadowMap",Zt.state.directionalShadowMap,Z),Zt.state.spotShadowMap.length>0&&ft.setValue(D,"spotShadowMap",Zt.state.spotShadowMap,Z),Zt.state.pointShadowMap.length>0&&ft.setValue(D,"pointShadowMap",Zt.state.pointShadowMap,Z)),V.isSkinnedMesh){ft.setOptional(D,V,"bindMatrix"),ft.setOptional(D,V,"bindMatrixInverse");let gt=V.skeleton;gt&&(gt.boneTexture===null&&gt.computeBoneTexture(),ft.setValue(D,"boneTexture",gt.boneTexture,Z))}V.isBatchedMesh&&(ft.setOptional(D,V,"batchingTexture"),ft.setValue(D,"batchingTexture",V._matricesTexture,Z),ft.setOptional(D,V,"batchingIdTexture"),ft.setValue(D,"batchingIdTexture",V._indirectTexture,Z),ft.setOptional(D,V,"batchingColorTexture"),V._colorsTexture!==null&&ft.setValue(D,"batchingColorTexture",V._colorsTexture,Z));let en=H.morphAttributes;if((en.position!==void 0||en.normal!==void 0||en.color!==void 0)&&N.update(V,H,ii),($i||Te.receiveShadow!==V.receiveShadow)&&(Te.receiveShadow=V.receiveShadow,ft.setValue(D,"receiveShadow",V.receiveShadow)),(z.isMeshStandardMaterial||z.isMeshLambertMaterial||z.isMeshPhongMaterial)&&z.envMap===null&&F.environment!==null&&(wt.envMapIntensity.value=F.environmentIntensity),wt.dfgLUT!==void 0&&(wt.dfgLUT.value=vy()),$i){if(ft.setValue(D,"toneMappingExposure",P.toneMappingExposure),Te.needsLights&&qf(wt,qn),be&&z.fog===!0&&Ie.refreshFogUniforms(wt,be),Ie.refreshMaterialUniforms(wt,z,ae,he,M.state.transmissionRenderTarget[_.id]),Te.needsLights&&Te.lightProbeGrid){let gt=Te.lightProbeGrid;wt.probesSH.value=gt.texture,wt.probesMin.value.copy(gt.boundingBox.min),wt.probesMax.value.copy(gt.boundingBox.max),wt.probesResolution.value.copy(gt.resolution)}Ls.upload(D,Zh(Te),wt,Z)}if(z.isShaderMaterial&&z.uniformsNeedUpdate===!0&&(Ls.upload(D,Zh(Te),wt,Z),z.uniformsNeedUpdate=!1),z.isSpriteMaterial&&ft.setValue(D,"center",V.center),ft.setValue(D,"modelViewMatrix",V.modelViewMatrix),ft.setValue(D,"normalMatrix",V.normalMatrix),ft.setValue(D,"modelMatrix",V.matrixWorld),z.uniformsGroups!==void 0){let gt=z.uniformsGroups;for(let tn=0,Yn=gt.length;tn<Yn;tn++){let jh=gt[tn];ie.update(jh,ii),ie.bind(jh,ii)}}return ii}function qf(_,F){_.ambientLightColor.needsUpdate=F,_.lightProbe.needsUpdate=F,_.directionalLights.needsUpdate=F,_.directionalLightShadows.needsUpdate=F,_.pointLights.needsUpdate=F,_.pointLightShadows.needsUpdate=F,_.spotLights.needsUpdate=F,_.spotLightShadows.needsUpdate=F,_.rectAreaLights.needsUpdate=F,_.hemisphereLights.needsUpdate=F}function Yf(_){return _.isMeshLambertMaterial||_.isMeshToonMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isShadowMaterial||_.isShaderMaterial&&_.lights===!0}this.getActiveCubeFace=function(){return X},this.getActiveMipmapLevel=function(){return W},this.getRenderTarget=function(){return $},this.setRenderTargetTextures=function(_,F,H){let z=G.get(_);z.__autoAllocateDepthBuffer=_.resolveDepthBuffer===!1,z.__autoAllocateDepthBuffer===!1&&(z.__useRenderToTexture=!1),G.get(_.texture).__webglTexture=F,G.get(_.depthTexture).__webglTexture=z.__autoAllocateDepthBuffer?void 0:H,z.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(_,F){let H=G.get(_);H.__webglFramebuffer=F,H.__useDefaultFramebuffer=F===void 0},this.setRenderTarget=function(_,F=0,H=0){$=_,X=F,W=H;let z=null,V=!1,be=!1;if(_){let _e=G.get(_);if(_e.__useDefaultFramebuffer!==void 0){x.bindFramebuffer(D.FRAMEBUFFER,_e.__webglFramebuffer),ce.copy(_.viewport),Me.copy(_.scissor),je=_.scissorTest,x.viewport(ce),x.scissor(Me),x.setScissorTest(je),re=-1;return}else if(_e.__webglFramebuffer===void 0)Z.setupRenderTarget(_);else if(_e.__hasExternalTextures)Z.rebindTextures(_,G.get(_.texture).__webglTexture,G.get(_.depthTexture).__webglTexture);else if(_.depthBuffer){let Ye=_.depthTexture;if(_e.__boundDepthTexture!==Ye){if(Ye!==null&&G.has(Ye)&&(_.width!==Ye.image.width||_.height!==Ye.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Z.setupDepthRenderbuffer(_)}}let Ce=_.texture;(Ce.isData3DTexture||Ce.isDataArrayTexture||Ce.isCompressedArrayTexture)&&(be=!0);let Le=G.get(_).__webglFramebuffer;_.isWebGLCubeRenderTarget?(Array.isArray(Le[F])?z=Le[F][H]:z=Le[F],V=!0):_.samples>0&&Z.useMultisampledRTT(_)===!1?z=G.get(_).__webglMultisampledFramebuffer:Array.isArray(Le)?z=Le[H]:z=Le,ce.copy(_.viewport),Me.copy(_.scissor),je=_.scissorTest}else ce.copy(Fe).multiplyScalar(ae).floor(),Me.copy(at).multiplyScalar(ae).floor(),je=He;if(H!==0&&(z=q),x.bindFramebuffer(D.FRAMEBUFFER,z)&&x.drawBuffers(_,z),x.viewport(ce),x.scissor(Me),x.setScissorTest(je),V){let _e=G.get(_.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+F,_e.__webglTexture,H)}else if(be){let _e=F;for(let Ce=0;Ce<_.textures.length;Ce++){let Le=G.get(_.textures[Ce]);D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0+Ce,Le.__webglTexture,H,_e)}}else if(_!==null&&H!==0){let _e=G.get(_.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,_e.__webglTexture,H)}re=-1},this.readRenderTargetPixels=function(_,F,H,z,V,be,Ae,_e=0){if(!(_&&_.isWebGLRenderTarget)){ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ce=G.get(_).__webglFramebuffer;if(_.isWebGLCubeRenderTarget&&Ae!==void 0&&(Ce=Ce[Ae]),Ce){x.bindFramebuffer(D.FRAMEBUFFER,Ce);try{let Le=_.textures[_e],Ye=Le.format,Ke=Le.type;if(_.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+_e),!E.textureFormatReadable(Ye)){ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!E.textureTypeReadable(Ke)){ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}F>=0&&F<=_.width-z&&H>=0&&H<=_.height-V&&D.readPixels(F,H,z,V,me.convert(Ye),me.convert(Ke),be)}finally{let Le=$!==null?G.get($).__webglFramebuffer:null;x.bindFramebuffer(D.FRAMEBUFFER,Le)}}},this.readRenderTargetPixelsAsync=async function(_,F,H,z,V,be,Ae,_e=0){if(!(_&&_.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ce=G.get(_).__webglFramebuffer;if(_.isWebGLCubeRenderTarget&&Ae!==void 0&&(Ce=Ce[Ae]),Ce)if(F>=0&&F<=_.width-z&&H>=0&&H<=_.height-V){x.bindFramebuffer(D.FRAMEBUFFER,Ce);let Le=_.textures[_e],Ye=Le.format,Ke=Le.type;if(_.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+_e),!E.textureFormatReadable(Ye))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!E.textureTypeReadable(Ke))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Ne=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,Ne),D.bufferData(D.PIXEL_PACK_BUFFER,be.byteLength,D.STREAM_READ),D.readPixels(F,H,z,V,me.convert(Ye),me.convert(Ke),0);let ht=$!==null?G.get($).__webglFramebuffer:null;x.bindFramebuffer(D.FRAMEBUFFER,ht);let At=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);return D.flush(),await Sd(D,At,4),D.bindBuffer(D.PIXEL_PACK_BUFFER,Ne),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,be),D.deleteBuffer(Ne),D.deleteSync(At),be}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(_,F=null,H=0){let z=Math.pow(2,-H),V=Math.floor(_.image.width*z),be=Math.floor(_.image.height*z),Ae=F!==null?F.x:0,_e=F!==null?F.y:0;Z.setTexture2D(_,0),D.copyTexSubImage2D(D.TEXTURE_2D,H,0,0,Ae,_e,V,be),x.unbindTexture()},this.copyTextureToTexture=function(_,F,H=null,z=null,V=0,be=0){let Ae,_e,Ce,Le,Ye,Ke,Ne,ht,At,Mt=_.isCompressedTexture?_.mipmaps[be]:_.image;if(H!==null)Ae=H.max.x-H.min.x,_e=H.max.y-H.min.y,Ce=H.isBox3?H.max.z-H.min.z:1,Le=H.min.x,Ye=H.min.y,Ke=H.isBox3?H.min.z:0;else{let wt=Math.pow(2,-V);Ae=Math.floor(Mt.width*wt),_e=Math.floor(Mt.height*wt),_.isDataArrayTexture?Ce=Mt.depth:_.isData3DTexture?Ce=Math.floor(Mt.depth*wt):Ce=1,Le=0,Ye=0,Ke=0}z!==null?(Ne=z.x,ht=z.y,At=z.z):(Ne=0,ht=0,At=0);let dt=me.convert(F.format),zt=me.convert(F.type),Te;F.isData3DTexture?(Z.setTexture3D(F,0),Te=D.TEXTURE_3D):F.isDataArrayTexture||F.isCompressedArrayTexture?(Z.setTexture2DArray(F,0),Te=D.TEXTURE_2D_ARRAY):(Z.setTexture2D(F,0),Te=D.TEXTURE_2D),x.activeTexture(D.TEXTURE0),x.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,F.flipY),x.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,F.premultiplyAlpha),x.pixelStorei(D.UNPACK_ALIGNMENT,F.unpackAlignment);let Zt=x.getParameter(D.UNPACK_ROW_LENGTH),nt=x.getParameter(D.UNPACK_IMAGE_HEIGHT),ii=x.getParameter(D.UNPACK_SKIP_PIXELS),Ei=x.getParameter(D.UNPACK_SKIP_ROWS),$i=x.getParameter(D.UNPACK_SKIP_IMAGES);x.pixelStorei(D.UNPACK_ROW_LENGTH,Mt.width),x.pixelStorei(D.UNPACK_IMAGE_HEIGHT,Mt.height),x.pixelStorei(D.UNPACK_SKIP_PIXELS,Le),x.pixelStorei(D.UNPACK_SKIP_ROWS,Ye),x.pixelStorei(D.UNPACK_SKIP_IMAGES,Ke);let qn=_.isDataArrayTexture||_.isData3DTexture,ft=F.isDataArrayTexture||F.isData3DTexture;if(_.isDepthTexture){let wt=G.get(_),en=G.get(F),gt=G.get(wt.__renderTarget),tn=G.get(en.__renderTarget);x.bindFramebuffer(D.READ_FRAMEBUFFER,gt.__webglFramebuffer),x.bindFramebuffer(D.DRAW_FRAMEBUFFER,tn.__webglFramebuffer);for(let Yn=0;Yn<Ce;Yn++)qn&&(D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,G.get(_).__webglTexture,V,Ke+Yn),D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,G.get(F).__webglTexture,be,At+Yn)),D.blitFramebuffer(Le,Ye,Ae,_e,Ne,ht,Ae,_e,D.DEPTH_BUFFER_BIT,D.NEAREST);x.bindFramebuffer(D.READ_FRAMEBUFFER,null),x.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else if(V!==0||_.isRenderTargetTexture||G.has(_)){let wt=G.get(_),en=G.get(F);x.bindFramebuffer(D.READ_FRAMEBUFFER,Y),x.bindFramebuffer(D.DRAW_FRAMEBUFFER,B);for(let gt=0;gt<Ce;gt++)qn?D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,wt.__webglTexture,V,Ke+gt):D.framebufferTexture2D(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,wt.__webglTexture,V),ft?D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,en.__webglTexture,be,At+gt):D.framebufferTexture2D(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,en.__webglTexture,be),V!==0?D.blitFramebuffer(Le,Ye,Ae,_e,Ne,ht,Ae,_e,D.COLOR_BUFFER_BIT,D.NEAREST):ft?D.copyTexSubImage3D(Te,be,Ne,ht,At+gt,Le,Ye,Ae,_e):D.copyTexSubImage2D(Te,be,Ne,ht,Le,Ye,Ae,_e);x.bindFramebuffer(D.READ_FRAMEBUFFER,null),x.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else ft?_.isDataTexture||_.isData3DTexture?D.texSubImage3D(Te,be,Ne,ht,At,Ae,_e,Ce,dt,zt,Mt.data):F.isCompressedArrayTexture?D.compressedTexSubImage3D(Te,be,Ne,ht,At,Ae,_e,Ce,dt,Mt.data):D.texSubImage3D(Te,be,Ne,ht,At,Ae,_e,Ce,dt,zt,Mt):_.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,be,Ne,ht,Ae,_e,dt,zt,Mt.data):_.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,be,Ne,ht,Mt.width,Mt.height,dt,Mt.data):D.texSubImage2D(D.TEXTURE_2D,be,Ne,ht,Ae,_e,dt,zt,Mt);x.pixelStorei(D.UNPACK_ROW_LENGTH,Zt),x.pixelStorei(D.UNPACK_IMAGE_HEIGHT,nt),x.pixelStorei(D.UNPACK_SKIP_PIXELS,ii),x.pixelStorei(D.UNPACK_SKIP_ROWS,Ei),x.pixelStorei(D.UNPACK_SKIP_IMAGES,$i),be===0&&F.generateMipmaps&&D.generateMipmap(Te),x.unbindTexture()},this.initRenderTarget=function(_){G.get(_).__webglFramebuffer===void 0&&Z.setupRenderTarget(_)},this.initTexture=function(_){_.isCubeTexture?Z.setTextureCube(_,0):_.isData3DTexture?Z.setTexture3D(_,0):_.isDataArrayTexture||_.isCompressedArrayTexture?Z.setTexture2DArray(_,0):Z.setTexture2D(_,0),x.unbindTexture()},this.resetState=function(){X=0,W=0,$=null,x.reset(),Se.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return _i}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=$e._getDrawingBufferColorSpace(e),t.unpackColorSpace=$e._getUnpackColorSpace()}};var Us={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};var qt=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},_y=new fn(-1,1,1,-1,0,1),Ch=class extends Tt{constructor(){super(),this.setAttribute("position",new lt([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new lt([0,2,0,0,2,0],2))}},by=new Ch,ki=class{constructor(e){this._mesh=new tt(by,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,_y)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}};var yn=class extends qt{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof pt?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=ti.clone(e.uniforms),this.material=new pt({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new ki(this.material)}render(e,t,i){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=i.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var ua=class extends qt{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,i){let s=e.getContext(),r=e.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,a,4294967295),r.buffers.stencil.setClear(o),r.buffers.stencil.setLocked(!0),e.setRenderTarget(i),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}},Ul=class extends qt{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}};var Fl=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let i=e.getSize(new ee);this._width=i.width,this._height=i.height,t=new _t(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Ct}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new yn(Us),this.copyPass.material.blending=ui,this.timer=new Xr}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),i=!1;for(let s=0,r=this.passes.length;s<r;s++){let a=this.passes[s];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),a.render(this.renderer,this.writeBuffer,this.readBuffer,e,i),a.needsSwap){if(i){let o=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}ua!==void 0&&(a instanceof ua?i=!0:a instanceof Ul&&(i=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new ee);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let i=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(i,s),this.renderTarget2.setSize(i,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(i,s)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var Ol=class extends qt{constructor(e,t,i=null,s=null,r=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=i,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new Ee}render(e,t,i){let s=e.autoClear;e.autoClear=!1;let r,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(r=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:i),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=s}};var da={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};var Bl=class extends qt{constructor(){super(),this.isOutputPass=!0,this.uniforms=ti.clone(da.uniforms),this.material=new ws({name:da.name,uniforms:this.uniforms,vertexShader:da.vertexShader,fragmentShader:da.fragmentShader}),this._fsQuad=new ki(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,i){this.uniforms.tDiffuse.value=i.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},$e.getTransfer(this._outputColorSpace)===st&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===Yr?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===Zr?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===Jr?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===zn?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===Kr?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===Qr?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===jr&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var of={name:"LuminosityHighPassShader",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new Ee(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};var Fs=class n extends qt{constructor(e,t=1,i,s){super(),this.strength=t,this.radius=i,this.threshold=s,this.resolution=e!==void 0?new ee(e.x,e.y):new ee(256,256),this.clearColor=new Ee(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new _t(r,a,{type:Ct}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let h=0;h<this.nMips;h++){let d=new _t(r,a,{type:Ct});d.texture.name="UnrealBloomPass.h"+h,d.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(d);let u=new _t(r,a,{type:Ct});u.texture.name="UnrealBloomPass.v"+h,u.texture.generateMipmaps=!1,this.renderTargetsVertical.push(u),r=Math.round(r/2),a=Math.round(a/2)}let o=of;this.highPassUniforms=ti.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new pt({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];let l=[6,10,14,18,22];r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let h=0;h<this.nMips;h++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[h])),this.separableBlurMaterials[h].uniforms.invSize.value=new ee(1/r,1/a),r=Math.round(r/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new L(1,1,1),new L(1,1,1),new L(1,1,1),new L(1,1,1),new L(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=ti.clone(Us.uniforms),this.blendMaterial=new pt({uniforms:this.copyUniforms,vertexShader:Us.vertexShader,fragmentShader:Us.fragmentShader,premultipliedAlpha:!0,blending:qr,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new Ee,this._oldClearAlpha=1,this._basic=new ci,this._fsQuad=new ki(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let i=Math.round(e/2),s=Math.round(t/2);this.renderTargetBright.setSize(i,s);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(i,s),this.renderTargetsVertical[r].setSize(i,s),this.separableBlurMaterials[r].uniforms.invSize.value=new ee(1/i,1/s),i=Math.round(i/2),s=Math.round(s/2)}render(e,t,i,s,r){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();let a=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),r&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=i.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=i.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let o=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[l].uniforms.direction.value=n.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=n.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this._fsQuad.render(e),o=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(i),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=a}_getSeparableBlurMaterial(e){let t=[],i=e/3;for(let s=0;s<e;s++)t.push(.39894*Math.exp(-.5*s*s/(i*i))/i);return new pt({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new ee(.5,.5)},direction:{value:new ee(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {

					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;

					for ( int i = 1; i < KERNEL_RADIUS; i ++ ) {

						float x = float( i );
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * w;

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new pt({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}};Fs.BlurDirectionX=new ee(1,0);Fs.BlurDirectionY=new ee(0,1);var fa={name:"SMAAEdgesShader",defines:{SMAA_THRESHOLD:"0.1"},uniforms:{tDiffuse:{value:null},resolution:{value:new ee(1/1024,1/512)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];

		void SMAAEdgeDetectionVS( vec2 texcoord ) {
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0,  1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4(  1.0, 0.0, 0.0, -1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 2 ] = texcoord.xyxy + resolution.xyxy * vec4( -2.0, 0.0, 0.0,  2.0 ); // WebGL port note: Changed sign in W component
		}

		void main() {

			vUv = uv;

			SMAAEdgeDetectionVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];

		vec4 SMAAColorEdgeDetectionPS( vec2 texcoord, vec4 offset[3], sampler2D colorTex ) {
			vec2 threshold = vec2( SMAA_THRESHOLD, SMAA_THRESHOLD );

			// Calculate color deltas:
			vec4 delta;
			vec3 C = texture2D( colorTex, texcoord ).rgb;

			vec3 Cleft = texture2D( colorTex, offset[0].xy ).rgb;
			vec3 t = abs( C - Cleft );
			delta.x = max( max( t.r, t.g ), t.b );

			vec3 Ctop = texture2D( colorTex, offset[0].zw ).rgb;
			t = abs( C - Ctop );
			delta.y = max( max( t.r, t.g ), t.b );

			// We do the usual threshold:
			vec2 edges = step( threshold, delta.xy );

			// Then discard if there is no edge:
			if ( dot( edges, vec2( 1.0, 1.0 ) ) == 0.0 )
				discard;

			// Calculate right and bottom deltas:
			vec3 Cright = texture2D( colorTex, offset[1].xy ).rgb;
			t = abs( C - Cright );
			delta.z = max( max( t.r, t.g ), t.b );

			vec3 Cbottom  = texture2D( colorTex, offset[1].zw ).rgb;
			t = abs( C - Cbottom );
			delta.w = max( max( t.r, t.g ), t.b );

			// Calculate the maximum delta in the direct neighborhood:
			float maxDelta = max( max( max( delta.x, delta.y ), delta.z ), delta.w );

			// Calculate left-left and top-top deltas:
			vec3 Cleftleft  = texture2D( colorTex, offset[2].xy ).rgb;
			t = abs( C - Cleftleft );
			delta.z = max( max( t.r, t.g ), t.b );

			vec3 Ctoptop = texture2D( colorTex, offset[2].zw ).rgb;
			t = abs( C - Ctoptop );
			delta.w = max( max( t.r, t.g ), t.b );

			// Calculate the final maximum delta:
			maxDelta = max( max( maxDelta, delta.z ), delta.w );

			// Local contrast adaptation in action:
			edges.xy *= step( 0.5 * maxDelta, delta.xy );

			return vec4( edges, 0.0, 0.0 );
		}

		void main() {

			gl_FragColor = SMAAColorEdgeDetectionPS( vUv, vOffset, tDiffuse );

		}`},pa={name:"SMAAWeightsShader",defines:{SMAA_MAX_SEARCH_STEPS:"8",SMAA_AREATEX_MAX_DISTANCE:"16",SMAA_AREATEX_PIXEL_SIZE:"( 1.0 / vec2( 160.0, 560.0 ) )",SMAA_AREATEX_SUBTEX_SIZE:"( 1.0 / 7.0 )"},uniforms:{tDiffuse:{value:null},tArea:{value:null},tSearch:{value:null},resolution:{value:new ee(1/1024,1/512)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 3 ];
		varying vec2 vPixcoord;

		void SMAABlendingWeightCalculationVS( vec2 texcoord ) {
			vPixcoord = texcoord / resolution;

			// We will use these offsets for the searches later on (see @PSEUDO_GATHER4):
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.25, 0.125, 1.25, 0.125 ); // WebGL port note: Changed sign in Y and W components
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.125, 0.25, -0.125, -1.25 ); // WebGL port note: Changed sign in Y and W components

			// And these for the searches, they indicate the ends of the loops:
			vOffset[ 2 ] = vec4( vOffset[ 0 ].xz, vOffset[ 1 ].yw ) + vec4( -2.0, 2.0, -2.0, 2.0 ) * resolution.xxyy * float( SMAA_MAX_SEARCH_STEPS );

		}

		void main() {

			vUv = uv;

			SMAABlendingWeightCalculationVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		#define SMAASampleLevelZeroOffset( tex, coord, offset ) texture2D( tex, coord + float( offset ) * resolution, 0.0 )

		uniform sampler2D tDiffuse;
		uniform sampler2D tArea;
		uniform sampler2D tSearch;
		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[3];
		varying vec2 vPixcoord;

		#if __VERSION__ == 100
		vec2 round( vec2 x ) {
			return sign( x ) * floor( abs( x ) + 0.5 );
		}
		#endif

		float SMAASearchLength( sampler2D searchTex, vec2 e, float bias, float scale ) {
			// Not required if searchTex accesses are set to point:
			// float2 SEARCH_TEX_PIXEL_SIZE = 1.0 / float2(66.0, 33.0);
			// e = float2(bias, 0.0) + 0.5 * SEARCH_TEX_PIXEL_SIZE +
			//     e * float2(scale, 1.0) * float2(64.0, 32.0) * SEARCH_TEX_PIXEL_SIZE;
			e.r = bias + e.r * scale;
			return 255.0 * texture2D( searchTex, e, 0.0 ).r;
		}

		float SMAASearchXLeft( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			/**
				* @PSEUDO_GATHER4
				* This texcoord has been offset by (-0.25, -0.125) in the vertex shader to
				* sample between edge, thus fetching four edges in a row.
				* Sampling with different offsets in each direction allows to disambiguate
				* which edges are active from the four fetched ones.
				*/
			vec2 e = vec2( 0.0, 1.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord -= vec2( 2.0, 0.0 ) * resolution;
				if ( ! ( texcoord.x > end && e.g > 0.8281 && e.r == 0.0 ) ) break;
			}

			// We correct the previous (-0.25, -0.125) offset we applied:
			texcoord.x += 0.25 * resolution.x;

			// The searches are bias by 1, so adjust the coords accordingly:
			texcoord.x += resolution.x;

			// Disambiguate the length added by the last step:
			texcoord.x += 2.0 * resolution.x; // Undo last step
			texcoord.x -= resolution.x * SMAASearchLength(searchTex, e, 0.0, 0.5);

			return texcoord.x;
		}

		float SMAASearchXRight( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 0.0, 1.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord += vec2( 2.0, 0.0 ) * resolution;
				if ( ! ( texcoord.x < end && e.g > 0.8281 && e.r == 0.0 ) ) break;
			}

			texcoord.x -= 0.25 * resolution.x;
			texcoord.x -= resolution.x;
			texcoord.x -= 2.0 * resolution.x;
			texcoord.x += resolution.x * SMAASearchLength( searchTex, e, 0.5, 0.5 );

			return texcoord.x;
		}

		float SMAASearchYUp( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 1.0, 0.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord += vec2( 0.0, 2.0 ) * resolution; // WebGL port note: Changed sign
				if ( ! ( texcoord.y > end && e.r > 0.8281 && e.g == 0.0 ) ) break;
			}

			texcoord.y -= 0.25 * resolution.y; // WebGL port note: Changed sign
			texcoord.y -= resolution.y; // WebGL port note: Changed sign
			texcoord.y -= 2.0 * resolution.y; // WebGL port note: Changed sign
			texcoord.y += resolution.y * SMAASearchLength( searchTex, e.gr, 0.0, 0.5 ); // WebGL port note: Changed sign

			return texcoord.y;
		}

		float SMAASearchYDown( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {
			vec2 e = vec2( 1.0, 0.0 );

			for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) { // WebGL port note: Changed while to for
				e = texture2D( edgesTex, texcoord, 0.0 ).rg;
				texcoord -= vec2( 0.0, 2.0 ) * resolution; // WebGL port note: Changed sign
				if ( ! ( texcoord.y < end && e.r > 0.8281 && e.g == 0.0 ) ) break;
			}

			texcoord.y += 0.25 * resolution.y; // WebGL port note: Changed sign
			texcoord.y += resolution.y; // WebGL port note: Changed sign
			texcoord.y += 2.0 * resolution.y; // WebGL port note: Changed sign
			texcoord.y -= resolution.y * SMAASearchLength( searchTex, e.gr, 0.5, 0.5 ); // WebGL port note: Changed sign

			return texcoord.y;
		}

		vec2 SMAAArea( sampler2D areaTex, vec2 dist, float e1, float e2, float offset ) {
			// Rounding prevents precision errors of bilinear filtering:
			vec2 texcoord = float( SMAA_AREATEX_MAX_DISTANCE ) * round( 4.0 * vec2( e1, e2 ) ) + dist;

			// We do a scale and bias for mapping to texel space:
			texcoord = SMAA_AREATEX_PIXEL_SIZE * texcoord + ( 0.5 * SMAA_AREATEX_PIXEL_SIZE );

			// Move to proper place, according to the subpixel offset:
			texcoord.y += SMAA_AREATEX_SUBTEX_SIZE * offset;

			return texture2D( areaTex, texcoord, 0.0 ).rg;
		}

		vec4 SMAABlendingWeightCalculationPS( vec2 texcoord, vec2 pixcoord, vec4 offset[ 3 ], sampler2D edgesTex, sampler2D areaTex, sampler2D searchTex, ivec4 subsampleIndices ) {
			vec4 weights = vec4( 0.0, 0.0, 0.0, 0.0 );

			vec2 e = texture2D( edgesTex, texcoord ).rg;

			if ( e.g > 0.0 ) { // Edge at north
				vec2 d;

				// Find the distance to the left:
				vec2 coords;
				coords.x = SMAASearchXLeft( edgesTex, searchTex, offset[ 0 ].xy, offset[ 2 ].x );
				coords.y = offset[ 1 ].y; // offset[1].y = texcoord.y - 0.25 * resolution.y (@CROSSING_OFFSET)
				d.x = coords.x;

				// Now fetch the left crossing edges, two at a time using bilinear
				// filtering. Sampling at -0.25 (see @CROSSING_OFFSET) enables to
				// discern what value each edge has:
				float e1 = texture2D( edgesTex, coords, 0.0 ).r;

				// Find the distance to the right:
				coords.x = SMAASearchXRight( edgesTex, searchTex, offset[ 0 ].zw, offset[ 2 ].y );
				d.y = coords.x;

				// We want the distances to be in pixel units (doing this here allow to
				// better interleave arithmetic and memory accesses):
				d = d / resolution.x - pixcoord.x;

				// SMAAArea below needs a sqrt, as the areas texture is compressed
				// quadratically:
				vec2 sqrt_d = sqrt( abs( d ) );

				// Fetch the right crossing edges:
				coords.y -= 1.0 * resolution.y; // WebGL port note: Added
				float e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 1, 0 ) ).r;

				// Ok, we know how this pattern looks like, now it is time for getting
				// the actual area:
				weights.rg = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.y ) );
			}

			if ( e.r > 0.0 ) { // Edge at west
				vec2 d;

				// Find the distance to the top:
				vec2 coords;

				coords.y = SMAASearchYUp( edgesTex, searchTex, offset[ 1 ].xy, offset[ 2 ].z );
				coords.x = offset[ 0 ].x; // offset[1].x = texcoord.x - 0.25 * resolution.x;
				d.x = coords.y;

				// Fetch the top crossing edges:
				float e1 = texture2D( edgesTex, coords, 0.0 ).g;

				// Find the distance to the bottom:
				coords.y = SMAASearchYDown( edgesTex, searchTex, offset[ 1 ].zw, offset[ 2 ].w );
				d.y = coords.y;

				// We want the distances to be in pixel units:
				d = d / resolution.y - pixcoord.y;

				// SMAAArea below needs a sqrt, as the areas texture is compressed
				// quadratically:
				vec2 sqrt_d = sqrt( abs( d ) );

				// Fetch the bottom crossing edges:
				coords.y -= 1.0 * resolution.y; // WebGL port note: Added
				float e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 0, 1 ) ).g;

				// Get the area for this direction:
				weights.ba = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.x ) );
			}

			return weights;
		}

		void main() {

			gl_FragColor = SMAABlendingWeightCalculationPS( vUv, vPixcoord, vOffset, tDiffuse, tArea, tSearch, ivec4( 0.0 ) );

		}`},kl={name:"SMAABlendShader",uniforms:{tDiffuse:{value:null},tColor:{value:null},resolution:{value:new ee(1/1024,1/512)}},vertexShader:`

		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 2 ];

		void SMAANeighborhoodBlendingVS( vec2 texcoord ) {
			vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0, 1.0 ); // WebGL port note: Changed sign in W component
			vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( 1.0, 0.0, 0.0, -1.0 ); // WebGL port note: Changed sign in W component
		}

		void main() {

			vUv = uv;

			SMAANeighborhoodBlendingVS( vUv );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform sampler2D tColor;
		uniform vec2 resolution;

		varying vec2 vUv;
		varying vec4 vOffset[ 2 ];

		vec4 SMAANeighborhoodBlendingPS( vec2 texcoord, vec4 offset[ 2 ], sampler2D colorTex, sampler2D blendTex ) {
			// Fetch the blending weights for current pixel:
			vec4 a;
			a.xz = texture2D( blendTex, texcoord ).xz;
			a.y = texture2D( blendTex, offset[ 1 ].zw ).g;
			a.w = texture2D( blendTex, offset[ 1 ].xy ).a;

			// Is there any blending weight with a value greater than 0.0?
			if ( dot(a, vec4( 1.0, 1.0, 1.0, 1.0 )) < 1e-5 ) {
				return texture2D( colorTex, texcoord, 0.0 );
			} else {
				// Up to 4 lines can be crossing a pixel (one through each edge). We
				// favor blending by choosing the line with the maximum weight for each
				// direction:
				vec2 offset;
				offset.x = a.a > a.b ? a.a : -a.b; // left vs. right
				offset.y = a.g > a.r ? -a.g : a.r; // top vs. bottom // WebGL port note: Changed signs

				// Then we go in the direction that has the maximum weight:
				if ( abs( offset.x ) > abs( offset.y )) { // horizontal vs. vertical
					offset.y = 0.0;
				} else {
					offset.x = 0.0;
				}

				// Fetch the opposite color and lerp by hand:
				vec4 C = texture2D( colorTex, texcoord, 0.0 );
				texcoord += sign( offset ) * resolution;
				vec4 Cop = texture2D( colorTex, texcoord, 0.0 );
				float s = abs( offset.x ) > abs( offset.y ) ? abs( offset.x ) : abs( offset.y );

				// WebGL port note: Added gamma correction
				C.xyz = pow(C.xyz, vec3(2.2));
				Cop.xyz = pow(Cop.xyz, vec3(2.2));
				vec4 mixed = mix(C, Cop, s);
				mixed.xyz = pow(mixed.xyz, vec3(1.0 / 2.2));

				return mixed;
			}
		}

		void main() {

			gl_FragColor = SMAANeighborhoodBlendingPS( vUv, vOffset, tColor, tDiffuse );

		}`};var zl=class extends qt{constructor(){super(),this._edgesRT=new _t(1,1,{depthBuffer:!1,type:Ct}),this._edgesRT.texture.name="SMAAPass.edges",this._weightsRT=new _t(1,1,{depthBuffer:!1,type:Ct}),this._weightsRT.texture.name="SMAAPass.weights";let e=this,t=new Image;t.src=this._getAreaTexture(),t.onload=function(){e._areaTexture.needsUpdate=!0},this._areaTexture=new Bt,this._areaTexture.name="SMAAPass.area",this._areaTexture.image=t,this._areaTexture.minFilter=Lt,this._areaTexture.generateMipmaps=!1,this._areaTexture.flipY=!1;let i=new Image;i.src=this._getSearchTexture(),i.onload=function(){e._searchTexture.needsUpdate=!0},this._searchTexture=new Bt,this._searchTexture.name="SMAAPass.search",this._searchTexture.image=i,this._searchTexture.magFilter=Et,this._searchTexture.minFilter=Et,this._searchTexture.generateMipmaps=!1,this._searchTexture.flipY=!1,this._uniformsEdges=ti.clone(fa.uniforms),this._materialEdges=new pt({defines:Object.assign({},fa.defines),uniforms:this._uniformsEdges,vertexShader:fa.vertexShader,fragmentShader:fa.fragmentShader}),this._uniformsWeights=ti.clone(pa.uniforms),this._uniformsWeights.tDiffuse.value=this._edgesRT.texture,this._uniformsWeights.tArea.value=this._areaTexture,this._uniformsWeights.tSearch.value=this._searchTexture,this._materialWeights=new pt({defines:Object.assign({},pa.defines),uniforms:this._uniformsWeights,vertexShader:pa.vertexShader,fragmentShader:pa.fragmentShader}),this._uniformsBlend=ti.clone(kl.uniforms),this._uniformsBlend.tDiffuse.value=this._weightsRT.texture,this._materialBlend=new pt({uniforms:this._uniformsBlend,vertexShader:kl.vertexShader,fragmentShader:kl.fragmentShader}),this._fsQuad=new ki(null)}render(e,t,i){this._uniformsEdges.tDiffuse.value=i.texture,this._fsQuad.material=this._materialEdges,e.setRenderTarget(this._edgesRT),this.clear&&e.clear(),this._fsQuad.render(e),this._fsQuad.material=this._materialWeights,e.setRenderTarget(this._weightsRT),this.clear&&e.clear(),this._fsQuad.render(e),this._uniformsBlend.tColor.value=i.texture,this._fsQuad.material=this._materialBlend,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(),this._fsQuad.render(e))}setSize(e,t){this._edgesRT.setSize(e,t),this._weightsRT.setSize(e,t),this._materialEdges.uniforms.resolution.value.set(1/e,1/t),this._materialWeights.uniforms.resolution.value.set(1/e,1/t),this._materialBlend.uniforms.resolution.value.set(1/e,1/t)}dispose(){this._edgesRT.dispose(),this._weightsRT.dispose(),this._areaTexture.dispose(),this._searchTexture.dispose(),this._materialEdges.dispose(),this._materialWeights.dispose(),this._materialBlend.dispose(),this._fsQuad.dispose()}_getAreaTexture(){return"data:image/png;base64,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"}_getSearchTexture(){return"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAhCAAAAABIXyLAAAAAOElEQVRIx2NgGAWjYBSMglEwEICREYRgFBZBqDCSLA2MGPUIVQETE9iNUAqLR5gIeoQKRgwXjwAAGn4AtaFeYLEAAAAASUVORK5CYII="}};var lf={name:"FXAAShader",uniforms:{tDiffuse:{value:null},resolution:{value:new ee(1/1024,1/512)}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec2 resolution;
		varying vec2 vUv;

		#define EDGE_STEP_COUNT 6
		#define EDGE_GUESS 8.0
		#define EDGE_STEPS 1.0, 1.5, 2.0, 2.0, 2.0, 4.0
		const float edgeSteps[EDGE_STEP_COUNT] = float[EDGE_STEP_COUNT]( EDGE_STEPS );

		float _ContrastThreshold = 0.0312;
		float _RelativeThreshold = 0.063;
		float _SubpixelBlending = 1.0;

		vec4 Sample( sampler2D  tex2D, vec2 uv ) {

			return texture( tex2D, uv );

		}

		float SampleLuminance( sampler2D tex2D, vec2 uv ) {

			return dot( Sample( tex2D, uv ).rgb, vec3( 0.3, 0.59, 0.11 ) );

		}

		float SampleLuminance( sampler2D tex2D, vec2 texSize, vec2 uv, float uOffset, float vOffset ) {

			uv += texSize * vec2(uOffset, vOffset);
			return SampleLuminance(tex2D, uv);

		}

		struct LuminanceData {

			float m, n, e, s, w;
			float ne, nw, se, sw;
			float highest, lowest, contrast;

		};

		LuminanceData SampleLuminanceNeighborhood( sampler2D tex2D, vec2 texSize, vec2 uv ) {

			LuminanceData l;
			l.m = SampleLuminance( tex2D, uv );
			l.n = SampleLuminance( tex2D, texSize, uv,  0.0,  1.0 );
			l.e = SampleLuminance( tex2D, texSize, uv,  1.0,  0.0 );
			l.s = SampleLuminance( tex2D, texSize, uv,  0.0, -1.0 );
			l.w = SampleLuminance( tex2D, texSize, uv, -1.0,  0.0 );

			l.ne = SampleLuminance( tex2D, texSize, uv,  1.0,  1.0 );
			l.nw = SampleLuminance( tex2D, texSize, uv, -1.0,  1.0 );
			l.se = SampleLuminance( tex2D, texSize, uv,  1.0, -1.0 );
			l.sw = SampleLuminance( tex2D, texSize, uv, -1.0, -1.0 );

			l.highest = max( max( max( max( l.n, l.e ), l.s ), l.w ), l.m );
			l.lowest = min( min( min( min( l.n, l.e ), l.s ), l.w ), l.m );
			l.contrast = l.highest - l.lowest;
			return l;

		}

		bool ShouldSkipPixel( LuminanceData l ) {

			float threshold = max( _ContrastThreshold, _RelativeThreshold * l.highest );
			return l.contrast < threshold;

		}

		float DeterminePixelBlendFactor( LuminanceData l ) {

			float f = 2.0 * ( l.n + l.e + l.s + l.w );
			f += l.ne + l.nw + l.se + l.sw;
			f *= 1.0 / 12.0;
			f = abs( f - l.m );
			f = clamp( f / l.contrast, 0.0, 1.0 );

			float blendFactor = smoothstep( 0.0, 1.0, f );
			return blendFactor * blendFactor * _SubpixelBlending;

		}

		struct EdgeData {

			bool isHorizontal;
			float pixelStep;
			float oppositeLuminance, gradient;

		};

		EdgeData DetermineEdge( vec2 texSize, LuminanceData l ) {

			EdgeData e;
			float horizontal =
				abs( l.n + l.s - 2.0 * l.m ) * 2.0 +
				abs( l.ne + l.se - 2.0 * l.e ) +
				abs( l.nw + l.sw - 2.0 * l.w );
			float vertical =
				abs( l.e + l.w - 2.0 * l.m ) * 2.0 +
				abs( l.ne + l.nw - 2.0 * l.n ) +
				abs( l.se + l.sw - 2.0 * l.s );
			e.isHorizontal = horizontal >= vertical;

			float pLuminance = e.isHorizontal ? l.n : l.e;
			float nLuminance = e.isHorizontal ? l.s : l.w;
			float pGradient = abs( pLuminance - l.m );
			float nGradient = abs( nLuminance - l.m );

			e.pixelStep = e.isHorizontal ? texSize.y : texSize.x;

			if (pGradient < nGradient) {

				e.pixelStep = -e.pixelStep;
				e.oppositeLuminance = nLuminance;
				e.gradient = nGradient;

			} else {

				e.oppositeLuminance = pLuminance;
				e.gradient = pGradient;

			}

			return e;

		}

		float DetermineEdgeBlendFactor( sampler2D  tex2D, vec2 texSize, LuminanceData l, EdgeData e, vec2 uv ) {

			vec2 uvEdge = uv;
			vec2 edgeStep;
			if (e.isHorizontal) {

				uvEdge.y += e.pixelStep * 0.5;
				edgeStep = vec2( texSize.x, 0.0 );

			} else {

				uvEdge.x += e.pixelStep * 0.5;
				edgeStep = vec2( 0.0, texSize.y );

			}

			float edgeLuminance = ( l.m + e.oppositeLuminance ) * 0.5;
			float gradientThreshold = e.gradient * 0.25;

			vec2 puv = uvEdge + edgeStep * edgeSteps[0];
			float pLuminanceDelta = SampleLuminance( tex2D, puv ) - edgeLuminance;
			bool pAtEnd = abs( pLuminanceDelta ) >= gradientThreshold;

			for ( int i = 1; i < EDGE_STEP_COUNT && !pAtEnd; i++ ) {

				puv += edgeStep * edgeSteps[i];
				pLuminanceDelta = SampleLuminance( tex2D, puv ) - edgeLuminance;
				pAtEnd = abs( pLuminanceDelta ) >= gradientThreshold;

			}

			if ( !pAtEnd ) {

				puv += edgeStep * EDGE_GUESS;

			}

			vec2 nuv = uvEdge - edgeStep * edgeSteps[0];
			float nLuminanceDelta = SampleLuminance( tex2D, nuv ) - edgeLuminance;
			bool nAtEnd = abs( nLuminanceDelta ) >= gradientThreshold;

			for ( int i = 1; i < EDGE_STEP_COUNT && !nAtEnd; i++ ) {

				nuv -= edgeStep * edgeSteps[i];
				nLuminanceDelta = SampleLuminance( tex2D, nuv ) - edgeLuminance;
				nAtEnd = abs( nLuminanceDelta ) >= gradientThreshold;

			}

			if ( !nAtEnd ) {

				nuv -= edgeStep * EDGE_GUESS;

			}

			float pDistance, nDistance;
			if ( e.isHorizontal ) {

				pDistance = puv.x - uv.x;
				nDistance = uv.x - nuv.x;

			} else {

				pDistance = puv.y - uv.y;
				nDistance = uv.y - nuv.y;

			}

			float shortestDistance;
			bool deltaSign;
			if ( pDistance <= nDistance ) {

				shortestDistance = pDistance;
				deltaSign = pLuminanceDelta >= 0.0;

			} else {

				shortestDistance = nDistance;
				deltaSign = nLuminanceDelta >= 0.0;

			}

			if ( deltaSign == ( l.m - edgeLuminance >= 0.0 ) ) {

				return 0.0;

			}

			return 0.5 - shortestDistance / ( pDistance + nDistance );

		}

		vec4 ApplyFXAA( sampler2D  tex2D, vec2 texSize, vec2 uv ) {

			LuminanceData luminance = SampleLuminanceNeighborhood( tex2D, texSize, uv );
			if ( ShouldSkipPixel( luminance ) ) {

				return Sample( tex2D, uv );

			}

			float pixelBlend = DeterminePixelBlendFactor( luminance );
			EdgeData edge = DetermineEdge( texSize, luminance );
			float edgeBlend = DetermineEdgeBlendFactor( tex2D, texSize, luminance, edge, uv );
			float finalBlend = max( pixelBlend, edgeBlend );

			if (edge.isHorizontal) {

				uv.y += edge.pixelStep * finalBlend;

			} else {

				uv.x += edge.pixelStep * finalBlend;

			}

			return Sample( tex2D, uv );

		}

		void main() {

			gl_FragColor = ApplyFXAA( tDiffuse, resolution.xy, vUv );

		}`};var Vl=class extends yn{constructor(){super(lf)}setSize(e,t){this.material.uniforms.resolution.value.set(1/e,1/t)}};var Gl=class extends Nn{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;let e=new Fi;e.deleteAttribute("uv");let t=new Ki({side:Dt}),i=new Ki,s=new Hr(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);let r=new tt(e,t);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);let a=new Ji(e,i,6),o=new It;o.position.set(-10.906,2.009,1.846),o.rotation.set(0,-.195,0),o.scale.set(2.328,7.905,4.651),o.updateMatrix(),a.setMatrixAt(0,o.matrix),o.position.set(-5.607,-.754,-.758),o.rotation.set(0,.994,0),o.scale.set(1.97,1.534,3.955),o.updateMatrix(),a.setMatrixAt(1,o.matrix),o.position.set(6.167,.857,7.803),o.rotation.set(0,.561,0),o.scale.set(3.927,6.285,3.687),o.updateMatrix(),a.setMatrixAt(2,o.matrix),o.position.set(-2.017,.018,6.124),o.rotation.set(0,.333,0),o.scale.set(2.002,4.566,2.064),o.updateMatrix(),a.setMatrixAt(3,o.matrix),o.position.set(2.291,-.756,-2.621),o.rotation.set(0,-.286,0),o.scale.set(1.546,1.552,1.496),o.updateMatrix(),a.setMatrixAt(4,o.matrix),o.position.set(-2.193,-.369,-5.547),o.rotation.set(0,.516,0),o.scale.set(3.875,3.487,2.986),o.updateMatrix(),a.setMatrixAt(5,o.matrix),this.add(a);let l=new tt(e,Os(50));l.position.set(-16.116,14.37,8.208),l.scale.set(.1,2.428,2.739),this.add(l);let c=new tt(e,Os(50));c.position.set(-16.109,18.021,-8.207),c.scale.set(.1,2.425,2.751),this.add(c);let h=new tt(e,Os(17));h.position.set(14.904,12.198,-1.832),h.scale.set(.15,4.265,6.331),this.add(h);let d=new tt(e,Os(43));d.position.set(-.462,8.89,14.52),d.scale.set(4.38,5.441,.088),this.add(d);let u=new tt(e,Os(20));u.position.set(3.235,11.486,-12.541),u.scale.set(2.5,2,.1),this.add(u);let f=new tt(e,Os(100));f.position.set(0,20,0),f.scale.set(1,.1,1),this.add(f)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function Os(n){return new Bn({color:0,emissive:16777215,emissiveIntensity:n})}var Wn=["low","balanced","high","ultra"],ga={shadows:["off","low","medium","high"],bloom:["off","on"],grade:["off","on"],antialias:["off","fxaa","smaa","msaa"],reflections:["off","on"],particles:["low","high"],background:["static","animated"],detail:["plain","detailed"]},hf={low:{cap:1,scale:1,shadows:"off",bloom:"off",grade:"off",antialias:"msaa",reflections:"off",particles:"low",background:"static",detail:"plain"},balanced:{cap:1.5,scale:1,shadows:"low",bloom:"on",grade:"on",antialias:"fxaa",reflections:"off",particles:"high",background:"animated",detail:"detailed"},high:{cap:2,scale:1,shadows:"medium",bloom:"on",grade:"on",antialias:"smaa",reflections:"on",particles:"high",background:"animated",detail:"detailed"},ultra:{cap:2,scale:1.25,shadows:"high",bloom:"on",grade:"on",antialias:"msaa",reflections:"on",particles:"high",background:"animated",detail:"detailed"}},Hl={off:0,low:512,medium:1024,high:2048},Wl=Object.freeze({preset:"auto",render_scale:1,adaptive:!0,show_fps:!1}),ma={low:0,balanced:4,high:10,ultra:17},Rh=()=>globalThis.StarHermitGpu;function uf(n,e){let t=Rh();return t?t.detectLevel({webgl:!0,webgl2:!0,...e||{},gpu:String(n||"")}):ma.balanced}function df(n){let e=Rh();return e?e.presetForLevel(n,ma):Wn.filter(t=>ma[t]<=n).pop()||"low"}var cf={low:{material:"lambert",segments:.5,texture:128,clouds:24,pollen:30,burst:16,bloomRes:.5},balanced:{material:"standard",segments:.75,texture:256,clouds:32,pollen:50,burst:28,bloomRes:.5},high:{material:"physical",segments:1,texture:256,clouds:40,pollen:70,burst:40,bloomRes:.5},ultra:{material:"physical",segments:1.5,texture:512,clouds:56,pollen:120,burst:56,bloomRes:1}},Sy=240,My=80;function Ty(n,e){let t={...cf[n]||cf.balanced},i=Rh(),s=ma[n]||0,r=Math.max(Number.isFinite(e)?e:s,s),a=i?Math.min(2,i.scaleBudget(1,r,s)):1;return t.pollen=Math.min(Sy,Math.round(t.pollen*a)),t.burst=Math.min(My,Math.round(t.burst*a)),t}function Xl(n,e,t){let i=n||{},s=!Wn.includes(i.preset),r=s?Wn.includes(e)?e:"balanced":i.preset,a=hf[r],o={preset:r,auto:s,cap:a.cap,scale:a.scale*gf(Number(i.render_scale)||1,.5,2)};for(let[l,c]of Object.entries(ga))o[l]=c.includes(i[l])?i[l]:a[l];return o.level=Number.isFinite(t)?t:ma[r],o.budget=Ty(r,o.level),o.adaptive=i.adaptive!==!1,o.showFps=!!i.show_fps,o.post=o.bloom==="on"||o.grade==="on"||o.antialias==="fxaa"||o.antialias==="smaa",o}function ff(n,e){let t=n||{};return{preset:Wn.includes(e)?e:"auto",render_scale:gf(Number(t.render_scale)||1,.5,2),adaptive:t.adaptive!==!1,show_fps:!!t.show_fps}}function pf(n,e){return hf[n]?.[e]}function mf(n,e,t){let i={noShadows:"no shadows",shadows:"shadows",bloom:"bloom",grade:"grade",reflections:"reflections",noAA:"no AA",...t||{}};return[n.shadows==="off"?i.noShadows:`${Hl[n.shadows]}\xB2 ${i.shadows}`,n.bloom==="on"?i.bloom:null,n.grade==="on"?i.grade:null,n.reflections==="on"?i.reflections:null,n.antialias==="off"?i.noAA:n.antialias.toUpperCase(),e?`${e[0]}\xD7${e[1]} px`:null].filter(Boolean).join(" \xB7 ")}function gf(n,e,t){return Math.min(t,Math.max(e,n))}var Ti={FOV:42,WORLD_WIDTH:vt,VIEW_HEIGHT:620,CAM_LOOK_AHEAD:210,CAM_Z_BASE:700,PLAYER_Z:0,PAD_TILT:.5},xa=0,Yl=1,xf=2,ql=3,Ay={plain:{clouds:24,puffs:1,cloudSubdiv:1,stalks:7,leaves:0,pollen:0},detailed:{clouds:40,puffs:4,cloudSubdiv:2,stalks:8,leaves:6,pollen:70}},vf=3400,yf=2600;function Ph(n,e,t,i=!0,s=1){let r=document.createElement("canvas");r.width=Math.round(n*s),r.height=Math.round(e*s);let a=r.getContext("2d");s!==1&&a.scale(s,s),t(a,n,e);let o=new Tr(r);return i&&(o.colorSpace=Ht),o}function wy(){return Ph(64,64,(n,e)=>{let t=n.createRadialGradient(e/2,e/2,0,e/2,e/2,e/2);t.addColorStop(0,"rgba(255,255,255,1)"),t.addColorStop(.35,"rgba(255,255,255,0.75)"),t.addColorStop(1,"rgba(255,255,255,0)"),n.fillStyle=t,n.fillRect(0,0,e,e)})}function Ey(n=1){return Ph(256,128,(e,t,i)=>{e.fillStyle="#f2f2f2",e.fillRect(0,0,t,i);let s=7,r=()=>(s=s*16807%2147483647,s/2147483647);for(let o=0;o<900;o++){let l=225+Math.floor(r()*30);e.fillStyle=`rgba(${l},${l},${l},0.35)`,e.fillRect(r()*t,r()*i,2,2)}let a=e.createRadialGradient(t/2,i/2,i*.2,t/2,i/2,t*.55);a.addColorStop(0,"rgba(0,0,0,0)"),a.addColorStop(1,"rgba(40,40,40,0.28)"),e.fillStyle=a,e.fillRect(0,0,t,i),e.strokeStyle="rgba(70,70,70,0.32)",e.lineWidth=2;for(let o=-5;o<=5;o++){if(!o)continue;let l=t/2+o*20;for(let c of[-1,1])e.beginPath(),e.moveTo(l,i/2),e.quadraticCurveTo(l+o*6,i/2+c*i*.25,l+o*14,i/2+c*i*.48),e.stroke()}e.strokeStyle="rgba(255,255,255,0.95)",e.lineWidth=5,e.beginPath(),e.moveTo(8,i/2),e.lineTo(t-8,i/2),e.stroke()},!0,n)}function Cy(n=1){return Ph(128,128,(e,t,i)=>{e.fillStyle="#f4f0ea",e.fillRect(0,0,t,i),e.strokeStyle="rgba(80,60,40,0.3)",e.lineWidth=1.5;for(let s=0;s<22;s++){let r=(s+.5)*(i/22);e.beginPath(),e.moveTo(0,i/2),e.quadraticCurveTo(t/2,r,t,i/2+(r-i/2)*.2),e.stroke()}e.fillStyle="rgba(60,40,20,0.35)";for(let s=0;s<6;s++)e.fillRect(20+s*17,30+s*37%60,3,3)},!0,n)}function _f(n,e,t){let i=n.attributes.position,s=new Float32Array(i.count*2);for(let r=0;r<i.count;r++)s[r*2]=i.getX(r)/e+.5,s[r*2+1]=i.getZ(r)/t+.5;return n.setAttribute("uv",new Pt(s,2)),n}function bn(n,e,t){return Math.max(t,Math.round(n*e))}function Ry(n,e,t,i=1){let s=new hi(1,bn(28,i,20),bn(12,i,6));s.scale(n/2,t,e/2);let r=s.attributes.position;for(let a=0;a<r.count;a++){let o=r.getY(a);r.setY(a,o>0?o*.25:o)}return s.translate(0,-t*.2,0),s.computeVertexNormals(),_f(s,n,e)}function Py(n,e){let t=new Ts;t.moveTo(-n/2,0),t.quadraticCurveTo(-n/4,e*.42,0,e*.3),t.quadraticCurveTo(n/4,e*.42,n/2,0),t.quadraticCurveTo(n/4,-e*.42,0,-e*.3),t.quadraticCurveTo(-n/4,-e*.42,-n/2,0);let i=new Ur(t,{depth:8,bevelEnabled:!0,bevelThickness:2,bevelSize:2,bevelSegments:2});return i.rotateX(-Math.PI/2),i.translate(0,-8,0),_f(i,n,e*.7)}function Iy(n,e=1){let t=[],i=new hi(n*.42,bn(16,e,8),bn(10,e,5));i.translate(0,6,0),t.push(i);for(let s=0;s<5;s++){let r=new hi(n*.3,bn(12,e,6),bn(8,e,4));r.scale(1.4,.35,.9);let a=s/5*Math.PI*2;r.rotateY(-a),r.translate(Math.cos(a)*n*.62,2,Math.sin(a)*n*.62),t.push(r)}return bf(t)}function Ly(n){let e=[],t=new Fi(n,5,14);t.translate(0,-2,0),e.push(t);let i=Math.max(3,Math.floor(n/16));for(let s=0;s<i;s++){let r=new Un(6,22,6);r.translate(-n/2+(s+.5)*(n/i),11,0),e.push(r)}return bf(e)}function bf(n){let e=n.map(o=>o.index?o.toNonIndexed():o),t=0;for(let o of e)t+=o.attributes.position.count;let i=new Float32Array(t*3),s=new Float32Array(t*3),r=0;for(let o of e)i.set(o.attributes.position.array,r*3),s.set(o.attributes.normal.array,r*3),r+=o.attributes.position.count;let a=new Tt;return a.setAttribute("position",new Pt(i,3)),a.setAttribute("normal",new Pt(s,3)),a}function Dy(n,e,t=1){let i=new Ii,s=new tt(new hi(ni,bn(24,t,12),bn(18,t,9)),n);s.scale.set(1,1.15,.9),i.add(s);let r=new tt(new Un(7,16,10),e);r.position.set(0,ni+6,0),r.rotation.z=.5,i.add(r);let a=new tt(new Un(5,12,10),e);a.position.set(-3,ni+4,2),a.rotation.z=-.7,i.add(a);let o=new ci({color:1712176}),l=new ci({color:16777215});for(let c of[-1,1]){let h=new tt(new hi(2.2,10,8),o);h.position.set(c*4.5,3,ni*.82),i.add(h);let d=new tt(new hi(.7,6,4),l);d.position.set(c*4.5+.8,3.9,ni*.82+1.9),i.add(d)}return i.traverse(c=>{c.layers.set(Yl),c.isMesh&&(c.castShadow=!0)}),i}var Ny=`
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`,Uy=`
  uniform vec3 uTop; uniform vec3 uBottom; uniform vec3 uSunColor; uniform vec3 uSunDir;
  uniform float uSun; uniform float uStars; uniform float uTime; uniform float uShift;
  varying vec3 vDir;
  float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  void main() {
    vec3 d = normalize(vDir);
    float t = smoothstep(-0.42 - uShift, 0.5 - uShift, d.y);
    vec3 col = mix(uBottom, uTop, t);
    // warm haze band just under the horizon line of the view
    col += uBottom * 0.12 * (1.0 - abs(t - 0.35) * 2.0) * uSun;
    float s = max(dot(d, uSunDir), 0.0);
    col += uSunColor * (pow(s, 8.0) * 0.22 + pow(s, 90.0) * 0.5 + pow(s, 900.0) * 1.6) * uSun;
    if (uStars > 0.0) {
      vec3 cell = floor(d * 260.0);
      float h = hash(cell);
      float r = length(fract(d * 260.0) - 0.5);
      float tw = 0.6 + 0.4 * sin(uTime * 2.0 + h * 40.0);
      col += vec3(step(0.996, h) * smoothstep(0.32, 0.05, r) * tw * uStars * smoothstep(-0.2, 0.3, d.y));
    }
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`,Fy={uniforms:{tDiffuse:{value:null},uAmount:{value:1},uVignette:{value:.2}},vertexShader:"varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`
    uniform sampler2D tDiffuse; uniform float uAmount; uniform float uVignette;
    varying vec2 vUv;
    void main() {
      vec4 src = texture2D(tDiffuse, vUv);
      vec3 c = src.rgb;
      vec3 lc = clamp(c, 0.0, 1.0);
      vec3 s = mix(lc, lc * lc * (3.0 - 2.0 * lc), 0.18);
      float l = dot(s, vec3(0.299, 0.587, 0.114));
      s = mix(vec3(l), s, 1.1);
      s *= mix(vec3(0.97, 0.99, 1.04), vec3(1.03, 1.0, 0.97), smoothstep(0.2, 0.8, l));
      c = mix(c, s + max(c - 1.0, 0.0), uAmount);
      float d = length((vUv - 0.5) * vec2(1.0, 0.85));
      c *= 1.0 - uVignette * smoothstep(0.4, 0.9, d);
      gl_FragColor = vec4(c, src.a);
    }`};function Oy(n){try{let e=n.getContext();if(/firefox/i.test(navigator.userAgent))return String(e.getParameter(e.RENDERER)||"");let t=e.getExtension("WEBGL_debug_renderer_info");return String(e.getParameter(t?t.UNMASKED_RENDERER_WEBGL:e.RENDERER)||"")}catch{return""}}function By(){let n=navigator.userAgent||"";return typeof matchMedia=="function"&&matchMedia("(pointer: coarse)").matches&&!matchMedia("(pointer: fine)").matches||/Android|iPhone|iPad|iPod|Mobile/i.test(n)}function ky(n,e){if(!(e<1))return n;let t=n.setSize.bind(n);return n.setSize=(i,s)=>t(Math.max(1,Math.round(i*e)),Math.max(1,Math.round(s*e))),n}function _n(n,e,t=!1){let i={...e};if(n==="lambert"){for(let s of["roughness","metalness","clearcoat","clearcoatRoughness","sheen","sheenColor"])delete i[s];return new Bn(i)}if(t&&n==="physical")return new kr(i);for(let s of["clearcoat","clearcoatRoughness","sheen","sheenColor"])delete i[s];return new Ki(i)}var Bs=class{constructor(e,t={}){this.container=e,this.opts=t,this.settings=t.settings||{reducedMotion:!1,cvdPalette:"default",graphics:{}},this.theme=null,this.padViews=new Map,this.tokenViews=new Map,this.camY=0,this.camVel=0,this.shake=0,this.time=0,this.playerSquash=0,this.ok=!1,this.adaptiveScale=1,this._frames=[],this.fps=0,this.pixelRatio=1,this.size=[0,0],this.postKey=null,this.composer=null,this.postFailed=!1;try{this.renderer=new Ll({antialias:!0,powerPreference:"high-performance"})}catch{this.ok=!1;return}let i=this.renderer.domElement;this.domElement=i,this.renderer.outputColorSpace=Ht,this.renderer.toneMapping=zn,this.renderer.toneMappingExposure=1.05,this.renderer.shadowMap.type=kn,this.gpu=Oy(this.renderer);let s={mobile:By()};try{let r=globalThis.StarHermitGpu;if(r){let a=r.detectSystem();s={...a,mobile:s.mobile||a.mobile,gpu:void 0}}}catch{}this.gpuLevel=uf(this.gpu,s),this.detected=df(this.gpuLevel),this._reduceQuery=typeof matchMedia=="function"?matchMedia("(prefers-reduced-motion: reduce)"):null,this.scene=new Nn,this.camera=new kt(Ti.FOV,1,10,12e3),this.camera.position.set(vt/2,300,Ti.CAM_Z_BASE),this.camera.lookAt(vt/2,300,0),this.camZ=Ti.CAM_Z_BASE,this.camera.layers.enable(xa),this.camera.layers.enable(Yl),this.camera.layers.enable(xf),this.camera.layers.enable(ql),this.keyDir=new L(300,800,600).normalize(),this.key=new Wr(16777215,1.7),this.key.shadow.bias=-4e-4,this.key.shadow.normalBias=1.2,this.key.shadow.radius=3,this.scene.add(this.key,this.key.target),this.hemi=new Vr(12573183,9083498,.95),this.scene.add(this.hemi),this.skyGeo=new hi(6e3,32,16),this.skyMat=new pt({uniforms:{uTop:{value:new Ee},uBottom:{value:new Ee},uSunColor:{value:new Ee},uSunDir:{value:new L(.32,.3,-.9).normalize()},uSun:{value:1},uStars:{value:0},uTime:{value:0},uShift:{value:0}},vertexShader:Ny,fragmentShader:Uy,side:Dt,depthWrite:!1,fog:!1}),this.sky=new tt(this.skyGeo,this.skyMat),this.sky.layers.set(xa),this.sky.frustumCulled=!1,this.sky.renderOrder=-10,this.scene.add(this.sky),this.dotTex=wy(),this.veinTex=null,this.petalTex=null,this.geoToken=new Or(9),this.geoStalk=new Ss(.42,.5,1,10,1,!0),this.geoLeaf=new hi(1,10,6),this.geoParticle=new On(7,7),this.player=null,this.pollenMat=new bs({color:16774872,size:7,map:this.dotTex,transparent:!0,opacity:.75,depthWrite:!1,sizeAttenuation:!0}),this.clouds=null,this.stalks=null,this.leaves=null,this.pollen=null,this.particlePool=[],this.particleMat=new ci({color:16773808,map:this.dotTex,transparent:!0,opacity:.95,depthWrite:!1,side:ei}),this.particleGroup=new Ii,this.particleGroup.traverse(r=>r.layers.set(ql)),this.scene.add(this.particleGroup),this.marker=new tt(new Br(14,18,24),new ci({color:16777215,transparent:!0,opacity:.6,side:ei})),this.marker.rotation.x=-Math.PI/2,this.marker.layers.set(xf),this.marker.visible=!1,this.scene.add(this.marker),i.addEventListener("webglcontextlost",r=>{r.preventDefault(),this.ok=!1,this.opts.onContextLost&&this.opts.onContextLost()}),i.addEventListener("webglcontextrestored",()=>{this.ok=!0,this.rebuildGpuResources(),this.opts.onContextRestored&&this.opts.onContextRestored()}),e.appendChild(i),this.ok=!0,this.setGraphics(this.settings.graphics),this.resize()}rebuildGpuResources(){this.postKey=null,this.envTex&&(this.envTex.dispose(),this.envTex=null),this.applyReflections(),this.resize()}reducedMotion(){return!!this.settings.reducedMotion||!!(this._reduceQuery&&this._reduceQuery.matches)}animated(){return this.q.background==="animated"&&!this.reducedMotion()}resize(){if(!this.ok)return;let e=this.container.clientWidth||320,t=this.container.clientHeight||480,i=e/t;this.camera.aspect=i;let r=vt/2/i/Math.tan(Cl.degToRad(Ti.FOV/2));this.camZ=Math.max(Ti.CAM_Z_BASE*.7,r*1.02),this.camera.updateProjectionMatrix(),this.applyFog(),this._applySize(!0)}_applySize(e){let t=this.container.clientWidth||320,i=this.container.clientHeight||480,s=Math.min(window.devicePixelRatio||1,this.q.cap)*this.q.scale*this.adaptiveScale;(e||t!==this.size[0]||i!==this.size[1]||s!==this.pixelRatio)&&(this.size=[t,i],this.pixelRatio=s,this.renderer.setPixelRatio(s),this.renderer.setSize(t,i,!1))}setGraphics(e){if(!this.ok)return;let t=JSON.stringify(e||{});if(t===this._gfxKey)return;this._gfxKey=t;let i=this.q,s=Xl(e||{},this.detected,this.gpuLevel);this.q=s;let r=s.budget,a=!i||i.preset!==s.preset;a&&this._applyBudgetAssets(r);let o=Hl[s.shadows],l=!i||Hl[i.shadows]>0!=o>0;if(this.renderer.shadowMap.enabled=o>0,this.key.castShadow=o>0,o>0&&this.key.shadow.mapSize.x!==o&&(this.key.shadow.mapSize.set(o,o),this.key.shadow.map&&(this.key.shadow.map.dispose(),this.key.shadow.map=null)),l&&this.scene.traverse(h=>{if(h.material)for(let d of Array.isArray(h.material)?h.material:[h.material])d.needsUpdate=!0}),a||i.detail!==s.detail){this._mats={},this._geoCache={};for(let h of this.padViews.values())this.scene.remove(h);this.padViews.clear(),this.playerMat.isMeshPhysicalMaterial&&(this.playerMat.clearcoat=s.detail==="detailed"?.6:0,this.playerMat.sheen=s.detail==="detailed"?.4:0,this.playerMat.needsUpdate=!0);for(let h of this.tokenViews.values())this.scene.remove(h);this.tokenViews.clear(),this.buildEnvironment()}else(i.particles!==s.particles||i.background!==s.background)&&this.buildEnvironment();this.applyReflections();for(let[h,d]of Object.entries(this._mats))/^token:[^:]+$/.test(h)&&(d.emissiveIntensity=s.bloom==="on"?3:1);this.adaptiveScale=1,this._frames=[],this.postKey=null,this.postFailed=!1,this._fpsVisible(s.showFps),this._applySize(!0);let c=this.renderer.domElement;c.dataset.gfxPreset=s.preset,document.body.dataset.gfxPreset=s.preset,document.body.dataset.gfxAuto=String(s.auto);for(let h of Object.keys(ga))c.dataset["gfx"+h[0].toUpperCase()+h.slice(1)]=s[h]}_applyBudgetAssets(e){let t=e.texture/256;this._texK!==t&&(this.veinTex?.dispose(),this.petalTex?.dispose(),this.veinTex=Ey(t),this.petalTex=Cy(t),this._texK=t);let i=this.player&&{p:this.player.position.clone(),r:this.player.rotation.clone(),s:this.player.scale.clone()};this.player&&(this.scene.remove(this.player),this.player.traverse(s=>{s.isMesh&&s.geometry.dispose()}),this.playerMat.dispose(),this.playerLeafMat.dispose()),this.playerMat=_n(e.material,{color:9359466,roughness:.5,clearcoat:.6,clearcoatRoughness:.3,sheen:.4,sheenColor:new Ee(15400912)},!0),this.playerLeafMat=_n(e.material,{color:5217871,roughness:.55}),this.player=Dy(this.playerMat,this.playerLeafMat,e.segments),i&&(this.player.position.copy(i.p),this.player.rotation.copy(i.r),this.player.scale.copy(i.s)),this.scene.add(this.player);for(let s of["cloudMat","stalkMat","leafMat"])this[s]?.dispose();this.cloudMat=_n(e.material,{color:16777215,roughness:1,emissive:16777215,emissiveIntensity:.12}),this.stalkMat=_n(e.material,{color:6982250,roughness:.9}),this.leafMat=_n(e.material,{color:6982250,roughness:.8}),this.theme&&this._tintEnv(this.theme)}graphicsInfo(e){let t=[Math.round(this.size[0]*this.pixelRatio),Math.round(this.size[1]*this.pixelRatio)];return{gpu:this.gpu||"unknown GPU",level:this.gpuLevel,detected:this.detected,resolved:this.q,summary:mf(this.q,t,e),fps:Math.round(this.fps||0),adaptiveScale:Math.round(this.adaptiveScale*100)/100,postFailed:!!this.postFailed}}applyReflections(){let e=this.q&&this.q.reflections==="on";if(e&&!this.envTex){let t=new Ds(this.renderer),i=new Gl;this.envTex=t.fromScene(i,.04).texture,i.traverse(s=>{s.geometry&&s.geometry.dispose(),s.material&&s.material.dispose()}),t.dispose()}this.scene.environment=e?this.envTex:null,this.scene.environmentIntensity=.35,this.hemi.intensity=e?.8:.95}_fpsVisible(e){let t=document.getElementById("fps-meter");e&&!t&&(t=document.createElement("div"),t.id="fps-meter",t.className="fps-meter",t.setAttribute("aria-hidden","true"),t.textContent="\u2026 fps",this.container.append(t)),t&&(t.hidden=!e)}_postKey(e,t){let i=this.q;return i.post&&!this.postFailed?[i.bloom,i.grade,i.antialias,e,t,this.pixelRatio].join("|"):"none"}_buildPost(e,t){let i=this.q;if(this.composer){this.composer.renderTarget1.dispose(),this.composer.renderTarget2.dispose();for(let s of this.composer.passes)s.dispose?.()}if(this.composer=null,!(!i.post||this.postFailed))try{let s=Math.max(1,Math.round(e*this.pixelRatio)),r=Math.max(1,Math.round(t*this.pixelRatio)),a=new _t(s,r,{type:Ct,samples:i.antialias==="msaa"?4:0}),o=new Fl(this.renderer,a);o.setPixelRatio(this.pixelRatio),o.setSize(e,t),o.addPass(new Ol(this.scene,this.camera)),i.bloom==="on"&&o.addPass(ky(new Fs(new ee(e,t),.6,.4,1.4),i.budget.bloomRes)),i.grade==="on"&&o.addPass(new yn(Fy)),o.addPass(new Bl),i.antialias==="smaa"&&o.addPass(new zl(s,r)),i.antialias==="fxaa"&&o.addPass(new Vl),this.composer=o}catch{this.postFailed=!0,this.composer=null}}_adapt(e){let t=this._frames;if(t.push(e),t.length<90)return;let i=t.reduce((r,a)=>r+a,0)/t.length;t.length=0,this.fps=1e3/i;let s=document.getElementById("fps-meter");s&&!s.hidden&&(s.textContent=`${Math.round(this.fps)} fps \xB7 ${Math.round(this.pixelRatio*100)/100}\xD7`),this.q.adaptive&&(i>26?this.adaptiveScale=Math.max(.6,this.adaptiveScale-.1):i<14&&this.adaptiveScale<1&&(this.adaptiveScale=Math.min(1,this.adaptiveScale+.05)))}applyFog(){if(!this.theme)return;let e=this.camZ+450;this.scene.fog=new pr(this.theme.fog,e,e+Math.max(1800,this.theme.fogFar-this.theme.fogNear))}setTheme(e){this.theme=e;let t=this.skyMat.uniforms;t.uTop.value.setHex(e.skyTop),t.uBottom.value.setHex(e.skyBottom),t.uSunColor.value.setHex(e.keyLight);let i=new Ee(e.skyTop),s=i.r+i.g+i.b<.12;t.uStars.value=s?.9:0,t.uSun.value=s?.35:1,this.applyFog(),this.key.color.setHex(e.keyLight),this.hemi.color.setHex(e.hemiSky),this.hemi.groundColor.setHex(e.hemiGround),this._tintEnv(e),this.buildEnvironment()}_tintEnv(e){this.cloudMat.color.setHex(e.cloud),this.cloudMat.emissive.setHex(e.cloud);let t=new Ee(e.fog);this.stalkMat.color.setHex(e.pad).lerp(t,.45),this.leafMat.color.setHex(e.padAlt).lerp(t,.3),this.pollenMat.color.setHex(e.accent).lerp(new Ee(16777215),.6)}palette(){return oc[this.settings.cvdPalette]||oc.default}_removeEnv(e){let t=this[e];t&&(this.scene.remove(t),t.isInstancedMesh?t.dispose():t.geometry&&t.geometry.dispose(),this[e]=null)}buildEnvironment(){if(!this.theme||!this.q)return;let e={...Ay[this.q.detail]},t=this.q.budget;this.q.detail==="detailed"&&(e.clouds=t.clouds);let i=zy(790741),s=new rt;this._removeEnv("clouds"),this.geoCloud?.dispose(),this.geoCloud=new Fr(1,e.cloudSubdiv),this.cloudData=[];for(let a=0;a<e.clouds;a++){let o={x:i()*1600-560,y:i()*vf,z:-500-i()*1800,s:40+i()*120,speed:2+i()*6,phase:i()*Math.PI*2,puffs:[]};for(let l=0;l<e.puffs;l++)o.puffs.push(l===0?[0,0,0,1]:[(i()-.5)*1.6,(i()-.2)*.4,(i()-.5)*.5,.45+i()*.35]);this.cloudData.push(o)}this.clouds=new Ji(this.geoCloud,this.cloudMat,e.clouds*e.puffs),this.clouds.layers.set(xa),this.clouds.frustumCulled=!1,this.scene.add(this.clouds),this._removeEnv("stalks"),this._removeEnv("leaves"),this.stalkData=[];for(let a=0;a<e.stalks;a++)this.stalkData.push({x:i()*1400-460,z:-1100-i()*1600,r:50+i()*50,phase:i()*6.28});if(this.stalks=new Ji(this.geoStalk,this.stalkMat,e.stalks),this.stalks.layers.set(xa),this.stalks.frustumCulled=!1,this.scene.add(this.stalks),this.leafData=[],e.leaves){for(let a of this.stalkData)for(let o=0;o<e.leaves;o++)this.leafData.push({st:a,y:i()*yf,side:i()<.5?-1:1,s:40+i()*45,tilt:(i()-.5)*.6});this.leaves=new Ji(this.geoLeaf,this.leafMat,this.leafData.length),this.leaves.layers.set(xa),this.leaves.frustumCulled=!1,this.scene.add(this.leaves)}this._removeEnv("pollen");let r=this.q.particles==="high"&&e.pollen?t.pollen:0;if(r){let a=new Float32Array(r*3);this.pollenSeed=[];for(let l=0;l<r;l++)this.pollenSeed.push({x:i()*(vt+200)-100,y:i()*1400,z:-350+i()*300,ph:i()*6.28,sp:8+i()*14});let o=new Tt;o.setAttribute("position",new Pt(a,3)),this.pollen=new Sr(o,this.pollenMat),this.pollen.layers.set(ql),this.pollen.frustumCulled=!1,this.scene.add(this.pollen)}this._envY=null,this.updateEnvironment(!0)}updateEnvironment(e){if(!this.clouds)return;let t=this.animated();if(!e&&!t&&this._envY!==null&&Math.abs(this._envY-this.camY)<.5)return;this._envY=this.camY;let i=new rt,s=new oi,r=new li,a=new L,o=new L,l=this.time,c=(d,u)=>(d%u+u)%u-u/2,h=0;for(let d of this.cloudData){let u=t?Math.sin(l*.05*d.speed+d.phase)*60+l*d.speed*.8:0,f=((d.x+u+700)%1900+1900)%1900-700,g=this.camY+c(d.y-this.camY*.15,vf);for(let b of d.puffs){let m=d.s*b[3];i.makeScale(m,m*.5,m*.7),i.setPosition(f+b[0]*d.s,g+b[1]*d.s,d.z+b[2]*d.s),this.clouds.setMatrixAt(h++,i)}}this.clouds.instanceMatrix.needsUpdate=!0;for(let d=0;d<this.stalkData.length;d++){let u=this.stalkData[d],f=t?Math.sin(l*.4+u.phase)*.012:0;s.setFromEuler(r.set(0,0,f)),i.compose(a.set(u.x,this.camY,u.z),s,o.set(u.r,5200,u.r)),this.stalks.setMatrixAt(d,i)}if(this.stalks.instanceMatrix.needsUpdate=!0,this.leaves){for(let d=0;d<this.leafData.length;d++){let u=this.leafData[d],f=this.camY+c(u.y-this.camY*.25,yf),g=t?Math.sin(l*.9+u.y)*.08:0;s.setFromEuler(r.set(.3,u.side*.4,u.side*(.5+u.tilt+g))),i.compose(a.set(u.st.x+u.side*(u.st.r*.45+u.s*.8),f,u.st.z),s,o.set(u.s,u.s*.18,u.s*.55)),this.leaves.setMatrixAt(d,i)}this.leaves.instanceMatrix.needsUpdate=!0}if(this.pollen){let d=this.pollen.geometry.attributes.position;for(let u=0;u<this.pollenSeed.length;u++){let f=this.pollenSeed[u],g=t?l*f.sp:0,b=this.camY+c(f.y+g-this.camY*.1,1400),m=f.x+(t?Math.sin(l*.6+f.ph)*18:0);d.setXYZ(u,m,b,f.z)}d.needsUpdate=!0}}materialFor(e){let t=this.palette(),i=this.q.detail==="detailed",s=e+":"+this.settings.cvdPalette;if(!this._mats[s]){let r={color:t[e]||t.bud,roughness:.6};e==="wisp"&&(r.transparent=!0,r.opacity=.7),e==="thorn"&&(r.color=t.thorn,r.roughness=.35);let a=this.q.budget.material;i?((e==="bud"||e==="drift"||e==="wisp")&&(r.map=this.veinTex),e==="crumb"&&(r.map=this.petalTex,r.roughness=.85),e==="spring"&&(r.emissive=t.spring,r.emissiveIntensity=.18,r.sheen=.6,r.sheenColor=new Ee(16777215)),e!=="crumb"&&(r.clearcoat=e==="thorn"?.8:.55,r.clearcoatRoughness=.35),this._mats[s]=_n(a,r,!0)):this._mats[s]=_n(a,r)}return this._mats[s]}padGeometry(e,t){let i=e+":"+Math.round(t/4);if(!this._geoCache[i]){let s=Math.round(t/4)*4;e==="crumb"?this._geoCache[i]=Py(s,s*.5):e==="spring"?this._geoCache[i]=Iy(s*.55,this.q.budget.segments):e==="thorn"?this._geoCache[i]=Ly(s):this._geoCache[i]=Ry(s,Math.min(46,s*.5),12,this.q.budget.segments)}return this._geoCache[i]}makePadView(e){let t=new tt(this.padGeometry(e.type,e.w),this.materialFor(e.type));return e.type==="wisp"&&t.scale.setScalar(.92),e.type!=="thorn"&&(t.rotation.x=Ti.PAD_TILT),t.position.set(e.x,e.y,0),t.castShadow=!0,t.receiveShadow=!0,t.userData.phase=e.id*1.7%6.28,t.traverse(i=>i.layers.set(Yl)),t}tokenMaterial(){let e=this.palette(),t="token:"+this.settings.cvdPalette;return this._mats[t]||(this._mats[t]=_n(this.q.budget.material,{color:e.token,emissive:e.token,emissiveIntensity:this.q.bloom==="on"?3:1,roughness:.25,metalness:.2}),this._mats[t+":halo"]=new ys({map:this.dotTex,color:e.token,transparent:!0,opacity:.55,depthWrite:!1})),this._mats[t]}makeTokenView(){let e=new tt(this.geoToken,this.tokenMaterial());if(this.q.detail==="detailed"){let t=new vr(this._mats["token:"+this.settings.cvdPalette+":halo"]);t.scale.setScalar(38),t.position.z=-4,e.add(t)}return e.traverse(t=>t.layers.set(Yl)),e}syncViews(e){let t=this.animated(),i=new Set;for(let r of e.platforms){if(!r.alive||r.y<e.camY-120||r.y>e.camY+Ti.VIEW_HEIGHT+250)continue;i.add(r.id);let a=this.padViews.get(r.id);a||(a=this.makePadView(r),this.padViews.set(r.id,a),this.scene.add(a)),a.position.x=r.x,a.position.y=r.y,a.rotation.z=t&&r.type!=="thorn"?Math.sin(this.time*1.3+a.userData.phase)*.03:0}for(let[r,a]of this.padViews)i.has(r)||(this.scene.remove(a),this.padViews.delete(r));let s=new Set;for(let r of e.tokens){if(r.taken||r.y<e.camY-60||r.y>e.camY+Ti.VIEW_HEIGHT+200)continue;s.add(r.id);let a=this.tokenViews.get(r.id);a||(a=this.makeTokenView(),this.tokenViews.set(r.id,a),this.scene.add(a)),a.position.set(r.x,r.y+Math.sin(this.time*2+r.id)*4,0),a.rotation.y=this.time*2+r.id}for(let[r,a]of this.tokenViews)s.has(r)||(this.scene.remove(a),this.tokenViews.delete(r))}burst(e,t,i,s,r=60){if(this.settings.reducedMotion)return;let a=this.q.budget.burst,o=Math.min(s,this.q.particles==="high"?a:Math.round(a/2)),l=this.q.bloom==="on"?2.6:1;for(let c=0;c<o;c++){let h=this.particlePool.find(d=>!d.userData.active);h||(h=new tt(this.geoParticle,this.particleMat.clone()),h.layers.set(ql),this.particleGroup.add(h),this.particlePool.push(h)),h.userData.active=!0,h.userData.vx=(Math.random()-.5)*r*2,h.userData.vy=Math.random()*r*1.6,h.userData.life=.5+Math.random()*.3,h.material.color.setHex(i).multiplyScalar(l),h.material.opacity=.95,h.position.set(e,t,10),h.scale.setScalar(.8+Math.random()*.8),h.visible=!0}}shakeCamera(e){this.settings.reducedMotion||(this.shake=Math.max(this.shake,e))}handleEvents(e,t){for(let i of e)switch(i.type){case"land":this.playerSquash=1,this.burst(t.player.x,i.y+4,14680008,6,40),i.chain>=8&&(this.burst(t.player.x,i.y+10,16769126,16,90),this.shakeCamera(3));break;case"spring":this.playerSquash=1.4,this.burst(t.player.x,i.y+6,16761053,18,100),this.shakeCamera(2);break;case"token":this.burst(t.player.x,t.player.y,16773274,12,70);break;case"thorn":this.burst(t.player.x,t.player.y,16738922,24,120),this.shakeCamera(8);break;case"terminal":i.reason==="goal-reached"&&this.burst(t.player.x,t.player.y,10551256,40,160),i.reason==="fell"&&this.shakeCamera(5);break}}_fitShadow(){if(!this.key.castShadow)return;let e=this.camZ*Math.tan(Cl.degToRad(Ti.FOV/2)),t=Math.max(vt/2+40,e+40),i=this.key.shadow,s=i.camera;s.right!==t&&(Object.assign(s,{left:-t,right:t,top:t,bottom:-t,near:200,far:2600}),s.updateProjectionMatrix());let r=2*t/i.mapSize.x,a=this.keyDir,o=new L(0,1,0).cross(a).normalize(),l=new L().crossVectors(a,o),c=new L(vt/2,this.camY,0),h=Math.round(c.dot(o)/r)*r,d=Math.round(c.dot(l)/r)*r,u=c.dot(a);c.copy(o).multiplyScalar(h).addScaledVector(l,d).addScaledVector(a,u),this.key.target.position.copy(c),this.key.position.copy(c).addScaledVector(a,1200)}render(e,t,i){if(!this.ok||i)return;if(this.time+=t,this._adapt(t*1e3),e){let c=e.player.x;this.player.position.set(c,e.player.y+ni,Ti.PLAYER_Z),this.player.rotation.z=-e.player.vx*6e-4,this.playerSquash=Math.max(0,this.playerSquash-t*6);let h=this.settings.reducedMotion?0:this.playerSquash;this.player.scale.set(1+h*.25,1-h*.3,1),this.syncViews(e)}for(let c of this.particlePool)if(c.userData.active){if(c.userData.life-=t,c.userData.life<=0){c.userData.active=!1,c.visible=!1;continue}c.position.x+=c.userData.vx*t,c.position.y+=c.userData.vy*t,c.userData.vy-=300*t,c.material.opacity=Math.min(.95,c.userData.life*2)}if(e){let c=e.camY+Ti.CAM_LOOK_AHEAD,h=6;this.camVel+=(-h*h*(this.camY-c)-2*h*this.camVel)*t,this.camY+=this.camVel*t}this.shake=Math.max(0,this.shake-t*26);let s=this.shake>0?(Math.random()-.5)*this.shake:0,r=this.shake>0?(Math.random()-.5)*this.shake:0;this.camera.position.set(vt/2+s,this.camY+r,this.camZ),this.camera.lookAt(vt/2+s,this.camY+r,0),this.sky.position.set(vt/2,this.camY,0),this.animated()&&(this.skyMat.uniforms.uTime.value=this.time),this.skyMat.uniforms.uShift.value=Math.min(.25,Math.max(0,this.camY)/2e4),this.updateEnvironment(!1),this._fitShadow(),this._applySize(!1);let[a,o]=this.size,l=this._postKey(a,o);if(l!==this.postKey&&(this.postKey=l,this._buildPost(a,o)),this.composer)try{globalThis.GameOptions?globalThis.GameOptions.draw(this.composer.renderer,()=>this.composer.render(t)):this.composer.render(t);return}catch{this.postFailed=!0,this.postKey=null,this._buildPost(a,o)}globalThis.GameOptions?globalThis.GameOptions.draw(this.renderer,()=>this.renderer.render(this.scene,this.camera)):this.renderer.render(this.scene,this.camera)}static boardMirror(e,t=(i,s)=>i.replace(/\{(\w+)\}/g,(r,a)=>s&&a in s?s[a]:r)){if(!e)return"";if(e.terminal)return t("Run over: {reason}. Altitude {alt}.",{reason:e.terminal.reason,alt:e.score.altitude});let i=e.platforms.filter(s=>s.alive&&s.y>e.player.y+20&&s.y<e.player.y+400).sort((s,r)=>s.y-r.y).slice(0,3).map(s=>{let r=s.x<e.player.x-30?t("{what} left",{}):s.x>e.player.x+30?t("{what} right",{}):t("{what} above",{}),a={bud:"leaf pad",drift:"moving leaf",crumb:"brittle petal",spring:"spring blossom",wisp:"wisp pad",thorn:"THORN hazard"};return r.replace("{what}",a[s.type]?t(a[s.type]):s.type)});return t("Altitude {alt}, chain {chain}. Next: {next}.",{alt:e.score.altitude,chain:e.chain,next:i.join(", ")||t("none in range")})}dispose(){this.ok&&(this.ok=!1,this.composer&&(this.composer.renderTarget1.dispose(),this.composer.renderTarget2.dispose(),this.composer=null),this.scene.traverse(e=>{if(e.geometry&&e.geometry.dispose(),e.material){let t=Array.isArray(e.material)?e.material:[e.material];for(let i of t)i.map&&i.map.dispose(),i.dispose()}}),this.envTex&&this.envTex.dispose(),this.renderer.dispose(),this.renderer.domElement.parentNode&&this.renderer.domElement.parentNode.removeChild(this.renderer.domElement))}};function zy(n){let e=n>>>0;return()=>{e=e+1831565813>>>0;let t=e;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}var Ih={graphics:"Graphics",quality:"Quality",auto:"Auto (detected: {tier})",low:"Low",balanced:"Balanced",high:"High",ultra:"Ultra",renderScale:"Render scale",fromPreset:"From preset ({tier})",adaptive:"Adaptive resolution",showFps:"Show frame rate",level:"Level {n}",postFailed:"Post-processing is unavailable on this device; the game renders without it.",cat:{shadows:"Shadows",bloom:"Bloom",grade:"Color grade & vignette",antialias:"Anti-aliasing",reflections:"Reflections",particles:"Particles",background:"Sky animation",detail:"Surface detail"},tier:{off:"Off",on:"On",low:"Low",medium:"Medium",high:"High",fxaa:"FXAA",smaa:"SMAA",msaa:"MSAA",static:"Static",animated:"Animated",plain:"Plain",detailed:"Detailed"},sum:{noShadows:"no shadows",shadows:"shadows",bloom:"bloom",grade:"grade",reflections:"reflections",noAA:"no AA"}},Vy={...Ih,cat:{...Ih.cat,grade:"Colour grade & vignette"}},Sf={graphics:"Gr\xE1ficos",quality:"Calidad",auto:"Autom\xE1tica (detectada: {tier})",low:"Baja",balanced:"Equilibrada",high:"Alta",ultra:"Ultra",renderScale:"Escala de renderizado",fromPreset:"Seg\xFAn el ajuste ({tier})",adaptive:"Resoluci\xF3n adaptativa",showFps:"Mostrar fotogramas por segundo",level:"Nivel {n}",postFailed:"El posprocesado no est\xE1 disponible en este dispositivo; el juego se muestra sin \xE9l.",cat:{shadows:"Sombras",bloom:"Resplandor",grade:"Correcci\xF3n de color y vi\xF1eta",antialias:"Antialiasing",reflections:"Reflejos",particles:"Part\xEDculas",background:"Animaci\xF3n del cielo",detail:"Detalle de superficies"},tier:{off:"No",on:"S\xED",low:"Baja",medium:"Media",high:"Alta",fxaa:"FXAA",smaa:"SMAA",msaa:"MSAA",static:"Est\xE1tico",animated:"Animado",plain:"Simple",detailed:"Detallado"},sum:{noShadows:"sin sombras",shadows:"sombras",bloom:"resplandor",grade:"color",reflections:"reflejos",noAA:"sin AA"}},Gy={...Sf,auto:"Autom\xE1tica (detectada: {tier})",postFailed:"El posprocesamiento no est\xE1 disponible en este dispositivo; el juego se muestra sin \xE9l."},Hy={graphics:"Grafik",quality:"Qualit\xE4t",auto:"Automatisch (erkannt: {tier})",low:"Niedrig",balanced:"Ausgewogen",high:"Hoch",ultra:"Ultra",renderScale:"Renderskalierung",fromPreset:"Aus Voreinstellung ({tier})",adaptive:"Adaptive Aufl\xF6sung",showFps:"Bildrate anzeigen",level:"Stufe {n}",postFailed:"Nachbearbeitung ist auf diesem Ger\xE4t nicht verf\xFCgbar; das Spiel wird ohne sie dargestellt.",cat:{shadows:"Schatten",bloom:"Leuchteffekt",grade:"Farbkorrektur & Vignette",antialias:"Kantengl\xE4ttung",reflections:"Spiegelungen",particles:"Partikel",background:"Himmelsanimation",detail:"Oberfl\xE4chendetails"},tier:{off:"Aus",on:"An",low:"Niedrig",medium:"Mittel",high:"Hoch",fxaa:"FXAA",smaa:"SMAA",msaa:"MSAA",static:"Statisch",animated:"Animiert",plain:"Einfach",detailed:"Detailliert"},sum:{noShadows:"keine Schatten",shadows:"Schatten",bloom:"Leuchten",grade:"Farbkorrektur",reflections:"Spiegelungen",noAA:"keine Gl\xE4ttung"}},Mf={graphics:"Graphismes",quality:"Qualit\xE9",auto:"Automatique (d\xE9tect\xE9e : {tier})",low:"Basse",balanced:"\xC9quilibr\xE9e",high:"Haute",ultra:"Ultra",renderScale:"\xC9chelle de rendu",fromPreset:"Selon le pr\xE9r\xE9glage ({tier})",adaptive:"R\xE9solution adaptative",showFps:"Afficher les images par seconde",level:"Niveau {n}",postFailed:"Le post-traitement n\u2019est pas disponible sur cet appareil ; le jeu s\u2019affiche sans.",cat:{shadows:"Ombres",bloom:"Halo lumineux",grade:"\xC9talonnage et vignette",antialias:"Anticr\xE9nelage",reflections:"Reflets",particles:"Particules",background:"Animation du ciel",detail:"D\xE9tail des surfaces"},tier:{off:"D\xE9sactiv\xE9",on:"Activ\xE9",low:"Bas",medium:"Moyen",high:"\xC9lev\xE9",fxaa:"FXAA",smaa:"SMAA",msaa:"MSAA",static:"Statique",animated:"Anim\xE9",plain:"Simple",detailed:"D\xE9taill\xE9"},sum:{noShadows:"sans ombres",shadows:"ombres",bloom:"halo",grade:"\xE9talonnage",reflections:"reflets",noAA:"sans anticr\xE9nelage"}},Wy={...Mf,showFps:"Afficher la fr\xE9quence d\u2019images",auto:"Automatique (d\xE9tect\xE9e : {tier})"},Xy={graphics:"Gr\xE1ficos",quality:"Qualidade",auto:"Autom\xE1tica (detectada: {tier})",low:"Baixa",balanced:"Equilibrada",high:"Alta",ultra:"Ultra",renderScale:"Escala de renderiza\xE7\xE3o",fromPreset:"Do predefinido ({tier})",adaptive:"Resolu\xE7\xE3o adaptativa",showFps:"Mostrar taxa de quadros",level:"N\xEDvel {n}",postFailed:"O p\xF3s-processamento n\xE3o est\xE1 dispon\xEDvel neste dispositivo; o jogo \xE9 exibido sem ele.",cat:{shadows:"Sombras",bloom:"Brilho",grade:"Corre\xE7\xE3o de cor e vinheta",antialias:"Suaviza\xE7\xE3o",reflections:"Reflexos",particles:"Part\xEDculas",background:"Anima\xE7\xE3o do c\xE9u",detail:"Detalhe das superf\xEDcies"},tier:{off:"Desligado",on:"Ligado",low:"Baixo",medium:"M\xE9dio",high:"Alto",fxaa:"FXAA",smaa:"SMAA",msaa:"MSAA",static:"Est\xE1tico",animated:"Animado",plain:"Simples",detailed:"Detalhado"},sum:{noShadows:"sem sombras",shadows:"sombras",bloom:"brilho",grade:"cor",reflections:"reflexos",noAA:"sem suaviza\xE7\xE3o"}},qy={graphics:"Grafica",quality:"Qualit\xE0",auto:"Automatica (rilevata: {tier})",low:"Bassa",balanced:"Bilanciata",high:"Alta",ultra:"Ultra",renderScale:"Scala di rendering",fromPreset:"Dal preset ({tier})",adaptive:"Risoluzione adattiva",showFps:"Mostra frequenza fotogrammi",level:"Livello {n}",postFailed:"La post-elaborazione non \xE8 disponibile su questo dispositivo; il gioco viene mostrato senza.",cat:{shadows:"Ombre",bloom:"Bagliore",grade:"Correzione colore e vignettatura",antialias:"Antialiasing",reflections:"Riflessi",particles:"Particelle",background:"Animazione del cielo",detail:"Dettaglio superfici"},tier:{off:"No",on:"S\xEC",low:"Basso",medium:"Medio",high:"Alto",fxaa:"FXAA",smaa:"SMAA",msaa:"MSAA",static:"Statico",animated:"Animato",plain:"Semplice",detailed:"Dettagliato"},sum:{noShadows:"senza ombre",shadows:"ombre",bloom:"bagliore",grade:"colore",reflections:"riflessi",noAA:"senza AA"}},Tf={"en-US":Ih,"en-GB":Vy,"es-419":Gy,"es-ES":Sf,"de-DE":Hy,"fr-FR":Mf,"fr-CA":Wy,"pt-BR":Xy,"it-IT":qy};function Lh(n){let e=String(n||"en-US");if(Tf[e])return e;let[t,i]=e.split("-");return t==="en"?["GB","IE","AU","NZ","IN","ZA"].includes(i)?"en-GB":"en-US":t==="es"?i==="ES"?"es-ES":"es-419":t==="fr"?i==="CA"?"fr-CA":"fr-FR":t==="pt"?"pt-BR":t==="de"?"de-DE":t==="it"?"it-IT":"en-US"}function Af(n){return Tf[Lh(n)]}var Dh={signIn:"Sign in with StarHermit",invite:"Invite a friend",copied:"Invite link copied",copyFailed:"Could not copy the invite link",signedOut:"Signed out of StarHermit \u2014 progress stays on this device",lbPosting:"Posting score to the leaderboard\u2026",lbRank:"Leaderboard rank: #{rank}",lbPosted:"Score posted to the leaderboard.",lbNotPosted:"Score not posted to the leaderboard."},wf={signIn:"Iniciar sesi\xF3n con StarHermit",invite:"Invitar a un amigo",copied:"Enlace de invitaci\xF3n copiado",copyFailed:"No se pudo copiar el enlace de invitaci\xF3n",signedOut:"Sesi\xF3n de StarHermit cerrada: el progreso se queda en este dispositivo",lbPosting:"Enviando la puntuaci\xF3n a la clasificaci\xF3n\u2026",lbRank:"Puesto en la clasificaci\xF3n: #{rank}",lbPosted:"Puntuaci\xF3n enviada a la clasificaci\xF3n.",lbNotPosted:"No se envi\xF3 la puntuaci\xF3n a la clasificaci\xF3n."},Ef={signIn:"Se connecter avec StarHermit",invite:"Inviter un ami",copied:"Lien d\u2019invitation copi\xE9",copyFailed:"Impossible de copier le lien d\u2019invitation",signedOut:"D\xE9connect\xE9 de StarHermit \u2014 la progression reste sur cet appareil",lbPosting:"Envoi du score au classement\u2026",lbRank:"Rang au classement : #{rank}",lbPosted:"Score envoy\xE9 au classement.",lbNotPosted:"Score non envoy\xE9 au classement."},Yy={"en-US":Dh,"en-GB":Dh,"es-419":wf,"es-ES":wf,"de-DE":{signIn:"Mit StarHermit anmelden",invite:"Freund einladen",copied:"Einladungslink kopiert",copyFailed:"Einladungslink konnte nicht kopiert werden",signedOut:"Von StarHermit abgemeldet \u2013 der Fortschritt bleibt auf diesem Ger\xE4t",lbPosting:"Punktzahl wird an die Bestenliste gesendet \u2026",lbRank:"Platz in der Bestenliste: #{rank}",lbPosted:"Punktzahl an die Bestenliste gesendet.",lbNotPosted:"Punktzahl nicht an die Bestenliste gesendet."},"fr-FR":Ef,"fr-CA":{...Ef,invite:"Inviter un ami ou une amie",lbPosting:"Envoi du pointage au classement\u2026",lbPosted:"Pointage envoy\xE9 au classement.",lbNotPosted:"Pointage non envoy\xE9 au classement."},"pt-BR":{signIn:"Entrar com StarHermit",invite:"Convidar um amigo",copied:"Link de convite copiado",copyFailed:"N\xE3o foi poss\xEDvel copiar o link de convite",signedOut:"Sess\xE3o do StarHermit encerrada \u2014 o progresso fica neste dispositivo",lbPosting:"Enviando a pontua\xE7\xE3o para o ranking\u2026",lbRank:"Posi\xE7\xE3o no ranking: #{rank}",lbPosted:"Pontua\xE7\xE3o enviada para o ranking.",lbNotPosted:"A pontua\xE7\xE3o n\xE3o foi enviada para o ranking."},"it-IT":{signIn:"Accedi con StarHermit",invite:"Invita un amico",copied:"Link di invito copiato",copyFailed:"Impossibile copiare il link di invito",signedOut:"Disconnesso da StarHermit: i progressi restano su questo dispositivo",lbPosting:"Invio del punteggio alla classifica\u2026",lbRank:"Posizione in classifica: #{rank}",lbPosted:"Punteggio inviato alla classifica.",lbNotPosted:"Punteggio non inviato alla classifica."}};function Nh(n){return Yy[Lh(n)]||Dh}var Cf=[["Mastery Gate {n}","Puerta de maestr\xEDa {n}","Meistertor {n}","Porte de ma\xEEtrise {n}","Port\xE3o de maestria {n}","Portale della maestria {n}"],["Ascent {n}","Ascenso {n}","Aufstieg {n}","Ascension {n}","Subida {n}","Ascesa {n}"],["Objective and progress","Objetivo y progreso","Ziel und Fortschritt","Objectif et progression","Objetivo e progresso","Obiettivo e progressi"],["Actions and status","Acciones y estado","Aktionen und Status","Actions et \xE9tat","A\xE7\xF5es e status","Azioni e stato"],["Touch steering","Direcci\xF3n t\xE1ctil","Touch-Steuerung","Direction tactile","Dire\xE7\xE3o por toque","Sterzo touch"],["Play status","Estado de la partida","Spielstatus","\xC9tat de la partie","Status da partida","Stato della partita"],["Objective","Objetivo","Ziel","Objectif","Objetivo","Obiettivo"],["Actions","Acciones","Aktionen","Actions","A\xE7\xF5es","Azioni"],["Close panel","Cerrar panel","Bereich schlie\xDFen","Fermer le panneau","Fechar painel","Chiudi pannello"],["Progress","Progreso","Fortschritt","Progression","Progresso","Progressi"],["Status","Estado","Status","\xC9tat","Status","Stato"],["Score","Puntuaci\xF3n","Punktzahl","Score","Pontua\xE7\xE3o","Punteggio"],["Chain","Cadena","Kette","Cha\xEEne","Sequ\xEAncia","Catena"],["Altitude","Altitud","H\xF6he","Altitude","Altitude","Altitudine"],["\u23F8 Pause","\u23F8 Pausa","\u23F8 Pause","\u23F8 Pause","\u23F8 Pausar","\u23F8 Pausa"],["Steer left","Girar a la izquierda","Nach links lenken","Diriger \xE0 gauche","Virar \xE0 esquerda","Sterza a sinistra"],["Steer right","Girar a la derecha","Nach rechts lenken","Diriger \xE0 droite","Virar \xE0 direita","Sterza a destra"],["Offline practice available.","Pr\xE1ctica sin conexi\xF3n disponible.","Offline-Training verf\xFCgbar.","Entra\xEEnement hors ligne disponible.","Treino offline dispon\xEDvel.","Allenamento offline disponibile."],["offline (local save)","sin conexi\xF3n (guardado local)","offline (lokal gespeichert)","hors ligne (sauvegarde locale)","offline (salvo localmente)","offline (salvataggio locale)"],["Error: {msg}","Error: {msg}","Fehler: {msg}","Erreur : {msg}","Erro: {msg}","Errore: {msg}"],["Online as {name}","En l\xEDnea como {name}","Online als {name}","En ligne : {name}","Online como {name}","Online come {name}"],["Offline \u2014 practice & local daily","Sin conexi\xF3n: pr\xE1ctica y diario local","Offline \u2013 Training & lokale Tagesrunde","Hors ligne \u2014 entra\xEEnement et d\xE9fi du jour local","Offline \u2014 treino e di\xE1rio local","Offline: allenamento e sfida del giorno locale"],["Bounce up the endless garden. Chain landings, dodge thorns, chase the sky.","Rebota por el jard\xEDn sin fin. Encadena aterrizajes, esquiva espinas, persigue el cielo.","H\xFCpf durch den endlosen Garten nach oben. Verkette Landungen, weich Dornen aus, jag dem Himmel nach.","Rebondissez dans le jardin sans fin. Encha\xEEnez les atterrissages, \xE9vitez les \xE9pines, visez le ciel.","Quique pelo jardim sem fim. Encadeie pousos, desvie dos espinhos, alcance o c\xE9u.","Rimbalza su per il giardino infinito. Concatena gli atterraggi, schiva le spine, insegui il cielo."],["\u25B6 Play","\u25B6 Jugar","\u25B6 Spielen","\u25B6 Jouer","\u25B6 Jogar","\u25B6 Gioca"],["Journey","Traves\xEDa","Reise","Voyage","Jornada","Viaggio"],["Daily ({date})","Diario ({date})","Tagesrunde ({date})","D\xE9fi du jour ({date})","Di\xE1rio ({date})","Sfida del giorno ({date})"],["Daily (offline seed)","Diario (semilla sin conexi\xF3n)","Tagesrunde (Offline-Seed)","D\xE9fi du jour (graine hors ligne)","Di\xE1rio (semente offline)","Sfida del giorno (seme offline)"],["Learn","Aprender","Lernen","Apprendre","Aprender","Impara"],["Practice","Pr\xE1ctica","Training","Entra\xEEnement","Treino","Allenamento"],["Challenges","Desaf\xEDos","Herausforderungen","D\xE9fis","Desafios","Sfide"],["Profile","Perfil","Profil","Profil","Perfil","Profilo"],["Settings","Ajustes","Einstellungen","Param\xE8tres","Configura\xE7\xF5es","Impostazioni"],["Help","Ayuda","Hilfe","Aide","Ajuda","Aiuto"],["Journey: {done}/40 stages \xB7 {online}","Traves\xEDa: {done}/40 etapas \xB7 {online}","Reise: {done}/40 Etappen \xB7 {online}","Voyage : {done}/40 \xE9tapes \xB7 {online}","Jornada: {done}/40 fases \xB7 {online}","Viaggio: {done}/40 tappe \xB7 {online}"],["collect {n} motes","recoge {n} motas","sammle {n} Funken","r\xE9coltez {n} lucioles","colete {n} fa\xEDscas","raccogli {n} lucciole"],["reach {n}m","llega a {n} m","erreiche {n} m","atteignez {n} m","alcance {n} m","raggiungi {n} m"],["par {n}s","par {n} s","Par {n} s","par {n} s","par {n} s","par {n} s"],["best {n}","mejor {n}","Bestwert {n}","record {n}","recorde {n}","record {n}"],["(locked)","(bloqueada)","(gesperrt)","(verrouill\xE9e)","(bloqueada)","(bloccata)"],["Mastery gates: {done}/{total} cleared","Puertas de maestr\xEDa: {done}/{total} superadas","Meistertore: {done}/{total} geschafft","Portes de ma\xEEtrise : {done}/{total} franchies","Port\xF5es de maestria: {done}/{total} conclu\xEDdos","Portali della maestria: {done}/{total} superati"],["Back","Volver","Zur\xFCck","Retour","Voltar","Indietro"],["Short interactive lessons. You must perform each move to advance.","Lecciones interactivas cortas. Debes realizar cada movimiento para avanzar.","Kurze interaktive Lektionen. Du musst jede Bewegung ausf\xFChren, um weiterzukommen.","Courtes le\xE7ons interactives. Effectuez chaque mouvement pour avancer.","Li\xE7\xF5es interativas curtas. Voc\xEA precisa fazer cada movimento para avan\xE7ar.","Brevi lezioni interattive. Devi eseguire ogni mossa per proseguire."],["Practice seed","Semilla de pr\xE1ctica","Trainings-Seed","Graine d\u2019entra\xEEnement","Semente do treino","Seme di allenamento"],["Unranked. Free restart, undo-to-last-landing (Z), any difficulty. Expected session: 2\u20135 minutes.","Sin clasificaci\xF3n. Reinicio libre, deshacer hasta el \xFAltimo aterrizaje (Z), cualquier dificultad. Sesi\xF3n prevista: 2\u20135 minutos.","Ohne Wertung. Freier Neustart, R\xFCckg\xE4ngig bis zur letzten Landung (Z), jede Schwierigkeit. Erwartete Dauer: 2\u20135 Minuten.","Non class\xE9. Red\xE9marrage libre, retour au dernier atterrissage (Z), toute difficult\xE9. Dur\xE9e pr\xE9vue : 2 \xE0 5 minutes.","Sem ranking. Rein\xEDcio livre, desfazer at\xE9 o \xFAltimo pouso (Z), qualquer dificuldade. Sess\xE3o prevista: 2\u20135 minutos.","Senza classifica. Riavvio libero, annulla fino all\u2019ultimo atterraggio (Z), qualsiasi difficolt\xE0. Sessione prevista: 2\u20135 minuti."],["Seed (shareable):","Semilla (compartible):","Seed (teilbar):","Graine (partageable) :","Semente (compartilh\xE1vel):","Seme (condivisibile):"],["Start practice run","Empezar pr\xE1ctica","Trainingslauf starten","Lancer l\u2019entra\xEEnement","Come\xE7ar treino","Inizia l\u2019allenamento"],["Difficulty: {tier} \xB7 Ranked: no \xB7 Expected: under 2 minutes","Dificultad: {tier} \xB7 Clasificatoria: no \xB7 Duraci\xF3n: menos de 2 minutos","Schwierigkeit: {tier} \xB7 Gewertet: nein \xB7 Dauer: unter 2 Minuten","Difficult\xE9 : {tier} \xB7 Class\xE9 : non \xB7 Dur\xE9e : moins de 2 minutes","Dificuldade: {tier} \xB7 Ranqueada: n\xE3o \xB7 Dura\xE7\xE3o: menos de 2 minutos","Difficolt\xE0: {tier} \xB7 In classifica: no \xB7 Durata: meno di 2 minuti"],["Attempt","Intentar","Versuchen","Tenter","Tentar","Prova"],["Display name","Nombre visible","Anzeigename","Nom affich\xE9","Nome de exibi\xE7\xE3o","Nome visualizzato"],["Account: {name}","Cuenta: {name}","Konto: {name}","Compte : {name}","Conta: {name}","Account: {name}"],["Cloud save: {state}","Guardado en la nube: {state}","Cloud-Speicherstand: {state}","Sauvegarde en ligne : {state}","Salvamento na nuvem: {state}","Salvataggio cloud: {state}"],["Display name:","Nombre visible:","Anzeigename:","Nom affich\xE9 :","Nome de exibi\xE7\xE3o:","Nome visualizzato:"],["Save","Guardar","Speichern","Enregistrer","Salvar","Salva"],["Name saved.","Nombre guardado.","Name gespeichert.","Nom enregistr\xE9.","Nome salvo.","Nome salvato."],["Loading boards\u2026","Cargando clasificaciones\u2026","Bestenlisten werden geladen \u2026","Chargement des classements\u2026","Carregando rankings\u2026","Caricamento classifiche\u2026"],["Achievements","Logros","Erfolge","Succ\xE8s","Conquistas","Obiettivi"],["\u2713 unlocked","\u2713 desbloqueado","\u2713 freigeschaltet","\u2713 d\xE9bloqu\xE9","\u2713 desbloqueada","\u2713 sbloccato"],["locked","bloqueado","gesperrt","verrouill\xE9","bloqueada","bloccato"],["Leaderboards","Clasificaciones","Bestenlisten","Classements","Rankings","Classifiche"],["Local bests \u2014 Practice: {practice} \xB7 Daily: {daily} \xB7 Journey stages: {stages}/40","Mejores locales: Pr\xE1ctica: {practice} \xB7 Diario: {daily} \xB7 Etapas de la traves\xEDa: {stages}/40","Lokale Bestwerte \u2013 Training: {practice} \xB7 Tagesrunde: {daily} \xB7 Reise-Etappen: {stages}/40","Records locaux \u2014 Entra\xEEnement : {practice} \xB7 D\xE9fi du jour : {daily} \xB7 \xC9tapes du voyage : {stages}/40","Recordes locais \u2014 Treino: {practice} \xB7 Di\xE1rio: {daily} \xB7 Fases da jornada: {stages}/40","Record locali: Allenamento: {practice} \xB7 Sfida del giorno: {daily} \xB7 Tappe del viaggio: {stages}/40"],["Global","Global","Global","Mondial","Global","Globale"],["Temporarily unavailable \u2014 try again soon.","No disponible por ahora: int\xE9ntalo pronto.","Vor\xFCbergehend nicht verf\xFCgbar \u2013 versuch es bald wieder.","Temporairement indisponible \u2014 r\xE9essayez bient\xF4t.","Indispon\xEDvel no momento \u2014 tente de novo em breve.","Temporaneamente non disponibile: riprova a breve."],["No platform leaderboard for this game yet \u2014 local bests below.","Este juego a\xFAn no tiene clasificaci\xF3n en la plataforma: abajo est\xE1n tus mejores locales.","F\xFCr dieses Spiel gibt es noch keine Plattform-Bestenliste \u2013 lokale Bestwerte unten.","Pas encore de classement de plateforme pour ce jeu \u2014 records locaux ci-dessous.","Ainda n\xE3o h\xE1 ranking da plataforma para este jogo \u2014 recordes locais abaixo.","Ancora nessuna classifica della piattaforma per questo gioco: record locali qui sotto."],["No entries yet \u2014 be the first!","A\xFAn no hay entradas: \xA1s\xE9 el primero!","Noch keine Eintr\xE4ge \u2013 sei die erste Person!","Aucune entr\xE9e pour l\u2019instant \u2014 soyez le premier !","Nenhuma entrada ainda \u2014 seja o primeiro!","Ancora nessuna voce: sii il primo!"],["Player","Jugador","Spieler","Joueur","Jogador","Giocatore"],["Player {id}","Jugador {id}","Spieler {id}","Joueur {id}","Jogador {id}","Giocatore {id}"],["Offline \u2014 online leaderboards need a StarHermit sign-in.","Sin conexi\xF3n: las clasificaciones en l\xEDnea requieren iniciar sesi\xF3n en StarHermit.","Offline \u2013 Online-Bestenlisten brauchen eine StarHermit-Anmeldung.","Hors ligne \u2014 les classements en ligne n\xE9cessitent une connexion StarHermit.","Offline \u2014 os rankings online exigem login no StarHermit.","Offline: le classifiche online richiedono l\u2019accesso a StarHermit."],["Paused","En pausa","Pausiert","En pause","Pausado","In pausa"],["\u25B6 Resume","\u25B6 Reanudar","\u25B6 Fortsetzen","\u25B6 Reprendre","\u25B6 Continuar","\u25B6 Riprendi"],["Resume","Reanudar","Fortsetzen","Reprendre","Continuar","Riprendi"],["Restart","Reiniciar","Neu starten","Recommencer","Reiniciar","Ricomincia"],["Undo to last landing (Z)","Deshacer hasta el \xFAltimo aterrizaje (Z)","Zur\xFCck zur letzten Landung (Z)","Revenir au dernier atterrissage (Z)","Desfazer at\xE9 o \xFAltimo pouso (Z)","Torna all\u2019ultimo atterraggio (Z)"],["Leave run","Abandonar partida","Lauf verlassen","Quitter la partie","Sair da partida","Abbandona la partita"],["Mode: {mode} \xB7 Ranked: {ranked} \xB7 Tick {tick}","Modo: {mode} \xB7 Clasificatoria: {ranked} \xB7 Tic {tick}","Modus: {mode} \xB7 Gewertet: {ranked} \xB7 Tick {tick}","Mode : {mode} \xB7 Class\xE9 : {ranked} \xB7 Tic {tick}","Modo: {mode} \xB7 Ranqueada: {ranked} \xB7 Tique {tick}","Modalit\xE0: {mode} \xB7 In classifica: {ranked} \xB7 Tick {tick}"],["yes","s\xED","ja","oui","sim","s\xEC"],["no","no","nein","non","n\xE3o","no"],["You fell below the garden.","Ca\xEDste por debajo del jard\xEDn.","Du bist unter den Garten gefallen.","Vous \xEAtes tomb\xE9 sous le jardin.","Voc\xEA caiu abaixo do jardim.","Sei caduto sotto il giardino."],["Thorns got you.","Te atraparon las espinas.","Die Dornen haben dich erwischt.","Les \xE9pines vous ont eu.","Os espinhos te pegaram.","Le spine ti hanno preso."],["Goal reached!","\xA1Meta alcanzada!","Ziel erreicht!","Objectif atteint !","Meta alcan\xE7ada!","Obiettivo raggiunto!"],["Steering budget spent.","Se agot\xF3 el presupuesto de direcci\xF3n.","Lenkbudget aufgebraucht.","Budget de direction \xE9puis\xE9.","Limite de dire\xE7\xE3o esgotado.","Budget di sterzata esaurito."],["Out of time.","Se acab\xF3 el tiempo.","Die Zeit ist um.","Temps \xE9coul\xE9.","O tempo acabou.","Tempo scaduto."],["\u{1F33C} Goal reached!","\u{1F33C} \xA1Meta alcanzada!","\u{1F33C} Ziel erreicht!","\u{1F33C} Objectif atteint !","\u{1F33C} Meta alcan\xE7ada!","\u{1F33C} Obiettivo raggiunto!"],["Run over","Partida terminada","Lauf vorbei","Partie termin\xE9e","Partida encerrada","Partita finita"],["Score breakdown","Desglose de puntuaci\xF3n","Punkteaufschl\xFCsselung","D\xE9tail du score","Detalhes da pontua\xE7\xE3o","Dettaglio del punteggio"],["Chain bonus","Bonificaci\xF3n de cadena","Kettenbonus","Bonus de cha\xEEne","B\xF4nus de sequ\xEAncia","Bonus catena"],["Glow motes","Motas brillantes","Leuchtfunken","Lucioles","Fa\xEDscas brilhantes","Lucciole"],["Total","Total","Gesamt","Total","Total","Totale"],["Par: {n}s","Par: {n} s","Par: {n} s","Par : {n} s","Par: {n} s","Par: {n} s"],["New best! (was {n})","\xA1Nuevo r\xE9cord! (antes {n})","Neuer Bestwert! (vorher {n})","Nouveau record ! (avant : {n})","Novo recorde! (antes {n})","Nuovo record! (prima {n})"],["New best!","\xA1Nuevo r\xE9cord!","Neuer Bestwert!","Nouveau record !","Novo recorde!","Nuovo record!"],["Best: {n}","R\xE9cord: {n}","Bestwert: {n}","Record : {n}","Recorde: {n}","Record: {n}"],["Achievement unlocked: {list}","Logro desbloqueado: {list}","Erfolg freigeschaltet: {list}","Succ\xE8s d\xE9bloqu\xE9 : {list}","Conquista desbloqueada: {list}","Obiettivo sbloccato: {list}"],["Achievement unlocked: {name}!","\xA1Logro desbloqueado: {name}!","Erfolg freigeschaltet: {name}!","Succ\xE8s d\xE9bloqu\xE9 : {name} !","Conquista desbloqueada: {name}!","Obiettivo sbloccato: {name}!"],["Score saved to your local bests.","Puntuaci\xF3n guardada en tus r\xE9cords locales.","Punktzahl in deinen lokalen Bestwerten gespeichert.","Score enregistr\xE9 dans vos records locaux.","Pontua\xE7\xE3o salva nos seus recordes locais.","Punteggio salvato nei tuoi record locali."],["Retry","Reintentar","Nochmal","R\xE9essayer","Tentar de novo","Riprova"],["Watch replay","Ver repetici\xF3n","Wiederholung ansehen","Voir le replay","Ver replay","Guarda il replay"],["Continue","Continuar","Weiter","Continuer","Continuar","Continua"],["Run over. {reason} Total score {n}.","Partida terminada. {reason} Puntuaci\xF3n total {n}.","Lauf vorbei. {reason} Gesamtpunktzahl {n}.","Partie termin\xE9e. {reason} Score total {n}.","Partida encerrada. {reason} Pontua\xE7\xE3o total {n}.","Partita finita. {reason} Punteggio totale {n}."],["Go!","\xA1Ya!","Los!","Partez !","J\xE1!","Via!"],["Welcome back","Bienvenido de nuevo","Willkommen zur\xFCck","Bon retour","Bem-vindo de volta","Bentornato"],["You were away {n}s. The run was paused \u2014 nothing happened while you were gone.","Estuviste fuera {n} s. La partida se paus\xF3: no pas\xF3 nada mientras no estabas.","Du warst {n} s weg. Der Lauf war pausiert \u2013 in der Zwischenzeit ist nichts passiert.","Vous \xE9tiez absent {n} s. La partie \xE9tait en pause \u2014 rien ne s\u2019est pass\xE9 pendant votre absence.","Voc\xEA ficou fora por {n} s. A partida foi pausada \u2014 nada aconteceu enquanto voc\xEA esteve fora.","Sei stato via {n} s. La partita era in pausa: non \xE8 successo nulla mentre eri via."],["Altitude reached: {n}m.","Altitud alcanzada: {n} m.","Erreichte H\xF6he: {n} m.","Altitude atteinte : {n} m.","Altitude alcan\xE7ada: {n} m.","Altitudine raggiunta: {n} m."],["Lesson {n}/{total}","Lecci\xF3n {n}/{total}","Lektion {n}/{total}","Le\xE7on {n}/{total}","Li\xE7\xE3o {n}/{total}","Lezione {n}/{total}"],["Skip lesson","Saltar lecci\xF3n","Lektion \xFCberspringen","Passer la le\xE7on","Pular li\xE7\xE3o","Salta la lezione"],["Auto-bounce","Rebote autom\xE1tico","Auto-Sprung","Rebond automatique","Quique autom\xE1tico","Rimbalzo automatico"],["Your sprout-hopper bounces on its own. Land on pads to keep climbing \u2014 each landing bounces you again.","Tu brote saltar\xEDn rebota solo. Aterriza en plataformas para seguir subiendo: cada aterrizaje te impulsa de nuevo.","Dein Sprossenh\xFCpfer springt von allein. Lande auf Plattformen, um weiter zu steigen \u2013 jede Landung l\xE4sst dich erneut abspringen.","Votre pousse sauteuse rebondit toute seule. Atterrissez sur les plateformes pour continuer \xE0 grimper \u2014 chaque atterrissage vous relance.","Seu broto saltitante quica sozinho. Pouse nas plataformas para continuar subindo \u2014 cada pouso te impulsiona de novo.","Il tuo germoglio saltellante rimbalza da solo. Atterra sulle piattaforme per continuare a salire: ogni atterraggio ti rilancia."],["Steering","Direcci\xF3n","Lenken","Direction","Dire\xE7\xE3o","Sterzata"],["Hold {left} or {right} to drift sideways. On touch, drag or hold the bottom corners. Gamepad: left stick or D-pad.","Mant\xE9n {left} o {right} para desplazarte de lado. En pantallas t\xE1ctiles, arrastra o mant\xE9n pulsadas las esquinas inferiores. Control: stick izquierdo o cruceta.","Halte {left} oder {right}, um seitlich zu gleiten. Auf Touchger\xE4ten ziehen oder die unteren Ecken halten. Gamepad: linker Stick oder Steuerkreuz.","Maintenez {left} ou {right} pour d\xE9river sur le c\xF4t\xE9. Sur \xE9cran tactile, glissez ou maintenez les coins inf\xE9rieurs. Manette : stick gauche ou croix directionnelle.","Segure {left} ou {right} para deslizar para os lados. No toque, arraste ou segure os cantos inferiores. Controle: anal\xF3gico esquerdo ou direcional.","Tieni premuto {left} o {right} per spostarti di lato. Sul touch, trascina o tieni premuti gli angoli in basso. Gamepad: levetta sinistra o croce direzionale."],["Screen wrap","Bordes conectados","Bildschirmrand-\xDCbergang","Bords reli\xE9s","Bordas conectadas","Bordi collegati"],["Fly off the left edge and you reappear on the right (and vice versa). Classic garden physics!","Sal por el borde izquierdo y reaparecer\xE1s por el derecho (y al rev\xE9s). \xA1F\xEDsica cl\xE1sica de jard\xEDn!","Flieg links aus dem Bild und du tauchst rechts wieder auf (und umgekehrt). Klassische Gartenphysik!","Sortez par le bord gauche et vous r\xE9apparaissez \xE0 droite (et inversement). La physique classique du jardin !","Saia pela borda esquerda e reapare\xE7a na direita (e vice-versa). F\xEDsica cl\xE1ssica de jardim!","Esci dal bordo sinistro e riappari a destra (e viceversa). Fisica da giardino classica!"],["Leaf pads (green)","Hojas (verdes)","Blattplattformen (gr\xFCn)","Feuilles (vertes)","Folhas (verdes)","Foglie (verdi)"],["Safe, sturdy, unlimited bounces.","Seguras, firmes, rebotes ilimitados.","Sicher, stabil, unbegrenzt viele Spr\xFCnge.","S\xFBres, solides, rebonds illimit\xE9s.","Seguras, firmes, quiques ilimitados.","Sicure, robuste, rimbalzi illimitati."],["Moving leaves (blue)","Hojas m\xF3viles (azules)","Bewegliche Bl\xE4tter (blau)","Feuilles mobiles (bleues)","Folhas m\xF3veis (azuis)","Foglie mobili (blu)"],["Slide sideways near their perch. Time your landing.","Se deslizan de lado cerca de su sitio. Calcula bien el aterrizaje.","Gleiten seitlich um ihren Platz. Pass deine Landung ab.","Glissent sur le c\xF4t\xE9 pr\xE8s de leur perchoir. Choisissez le bon moment pour atterrir.","Deslizam para os lados perto do lugar delas. Calcule o pouso.","Scivolano di lato vicino al loro posto. Calcola bene l\u2019atterraggio."],["Brittle petals (brown)","P\xE9talos fr\xE1giles (marrones)","Spr\xF6de Bl\xFCtenbl\xE4tter (braun)","P\xE9tales fragiles (bruns)","P\xE9talas fr\xE1geis (marrons)","Petali fragili (marroni)"],["Break after one landing. Never plan to come back.","Se rompen tras un aterrizaje. No pienses en volver.","Zerbrechen nach einer Landung. Plane nie, zur\xFCckzukehren.","Se brisent apr\xE8s un atterrissage. Ne comptez pas y revenir.","Quebram depois de um pouso. N\xE3o conte em voltar.","Si rompono dopo un atterraggio. Non contare di tornarci."],["Spring blossoms (pink)","Flores resorte (rosas)","Federbl\xFCten (rosa)","Fleurs ressorts (roses)","Flores-mola (rosa)","Fiori a molla (rosa)"],["Launch you nearly twice as high. Chain them for huge climbs.","Te lanzan casi el doble de alto. Encad\xE9nalas para subir much\xEDsimo.","Schleudern dich fast doppelt so hoch. Verkette sie f\xFCr riesige Aufstiege.","Vous propulsent presque deux fois plus haut. Encha\xEEnez-les pour d\u2019\xE9normes ascensions.","Lan\xE7am voc\xEA quase duas vezes mais alto. Encadeie para subidas enormes.","Ti lanciano quasi il doppio pi\xF9 in alto. Concatenali per salite enormi."],["Wisp pads (pale)","Plataformas et\xE9reas (p\xE1lidas)","Hauchplattformen (blass)","Plateformes \xE9vanescentes (p\xE2les)","Plataformas et\xE9reas (claras)","Piattaforme eteree (pallide)"],["Fragile: one landing and they fade.","Fr\xE1giles: un aterrizaje y se desvanecen.","Zerbrechlich: eine Landung und sie verblassen.","Fragiles : un atterrissage et elles s\u2019effacent.","Fr\xE1geis: um pouso e elas somem.","Fragili: un atterraggio e svaniscono."],["Thorn clusters (red spikes)","Matas de espinas (p\xFAas rojas)","Dornenb\xFCschel (rote Stacheln)","Touffes d\u2019\xE9pines (piques rouges)","Moitas de espinhos (pontas vermelhas)","Ciuffi di spine (punte rosse)"],["Never land on thorns \u2014 the run ends instantly.","Nunca aterrices en espinas: la partida termina al instante.","Lande nie auf Dornen \u2013 der Lauf endet sofort.","N\u2019atterrissez jamais sur des \xE9pines \u2014 la partie s\u2019arr\xEAte aussit\xF4t.","Nunca pouse em espinhos \u2014 a partida acaba na hora.","Non atterrare mai sulle spine: la partita finisce subito."],["Glow motes (gold)","Motas brillantes (doradas)","Leuchtfunken (gold)","Lucioles (dor\xE9es)","Fa\xEDscas brilhantes (douradas)","Lucciole (dorate)"],["Worth 100 points each. Grab them mid-flight.","Valen 100 puntos cada una. Atr\xE1palas en pleno vuelo.","Je 100 Punkte wert. Schnapp sie dir im Flug.","100 points chacune. Attrapez-les en plein vol.","Valem 100 pontos cada. Pegue no meio do voo.","Valgono 100 punti ciascuna. Prendile in volo."],["Chains","Cadenas","Ketten","Cha\xEEnes","Sequ\xEAncias","Catene"],["Land on successively higher pads to grow your chain bonus. Dropping to a lower pad resets it.","Aterriza en plataformas cada vez m\xE1s altas para aumentar la bonificaci\xF3n de cadena. Bajar a una plataforma inferior la reinicia.","Lande auf immer h\xF6heren Plattformen, um deinen Kettenbonus zu steigern. F\xE4llst du auf eine tiefere, beginnt er neu.","Atterrissez sur des plateformes de plus en plus hautes pour augmenter le bonus de cha\xEEne. Redescendre sur une plateforme plus basse le remet \xE0 z\xE9ro.","Pouse em plataformas cada vez mais altas para aumentar o b\xF4nus de sequ\xEAncia. Descer para uma plataforma mais baixa zera o b\xF4nus.","Atterra su piattaforme sempre pi\xF9 alte per aumentare il bonus catena. Scendere su una piattaforma pi\xF9 bassa lo azzera."],["Falling","Ca\xEDdas","Fallen","Chute","Queda","Cadute"],["The camera only moves up. Fall below the bottom of the view and the run ends.","La c\xE1mara solo sube. Si caes por debajo del borde inferior, la partida termina.","Die Kamera bewegt sich nur nach oben. F\xE4llst du unter den unteren Bildrand, endet der Lauf.","La cam\xE9ra ne fait que monter. Tombez sous le bas de l\u2019\xE9cran et la partie s\u2019arr\xEAte.","A c\xE2mera s\xF3 sobe. Caia abaixo da borda inferior e a partida acaba.","La telecamera sale soltanto. Se cadi sotto il bordo inferiore, la partita finisce."],["Undo (practice)","Deshacer (pr\xE1ctica)","R\xFCckg\xE4ngig (Training)","Annuler (entra\xEEnement)","Desfazer (treino)","Annulla (allenamento)"],["Press {key} in practice to jump back to your last landing.","Pulsa {key} en la pr\xE1ctica para volver a tu \xFAltimo aterrizaje.","Dr\xFCck im Training {key}, um zu deiner letzten Landung zur\xFCckzuspringen.","Appuyez sur {key} \xE0 l\u2019entra\xEEnement pour revenir \xE0 votre dernier atterrissage.","Pressione {key} no treino para voltar ao \xFAltimo pouso.","Premi {key} in allenamento per tornare all\u2019ultimo atterraggio."],["Pause","Pausa","Pause","Pause","Pausa","Pausa"],["Press {key} to pause or resume.","Pulsa {key} para pausar o reanudar.","Dr\xFCck {key} zum Pausieren oder Fortsetzen.","Appuyez sur {key} pour mettre en pause ou reprendre.","Pressione {key} para pausar ou continuar.","Premi {key} per mettere in pausa o riprendere."],["How to play","C\xF3mo jugar","So wird gespielt","Comment jouer","Como jogar","Come si gioca"],["Audio","Audio","Audio","Audio","\xC1udio","Audio"],["Music","M\xFAsica","Musik","Musique","M\xFAsica","Musica"],["Effects","Efectos","Effekte","Effets","Efeitos","Effetti"],["Ambience","Ambiente","Atmosph\xE4re","Ambiance","Ambiente","Ambiente"],["Mute all","Silenciar todo","Alles stumm","Tout couper","Silenciar tudo","Silenzia tutto"],["Mute when tab hidden","Silenciar con la pesta\xF1a oculta","Stumm, wenn Tab verborgen","Couper le son si l\u2019onglet est masqu\xE9","Silenciar com a aba oculta","Silenzia con la scheda nascosta"],["Captions (text cues for sounds)","Subt\xEDtulos (texto para los sonidos)","Untertitel (Texthinweise f\xFCr T\xF6ne)","Sous-titres (rep\xE8res texte des sons)","Legendas (texto para os sons)","Sottotitoli (testo per i suoni)"],["Controls","Controles","Steuerung","Commandes","Controles","Comandi"],["Left-handed layout","Dise\xF1o para zurdos","Linksh\xE4nder-Layout","Disposition gaucher","Layout para canhotos","Layout per mancini"],["Hold-to-steer off (toggle steering)","Sin mantener para girar (direcci\xF3n alterna)","Halten zum Lenken aus (Lenken umschalten)","Maintien d\xE9sactiv\xE9 (direction \xE0 bascule)","Segurar para virar desligado (dire\xE7\xE3o alternada)","Tieni premuto per sterzare disattivato (sterzo a commutazione)"],["Haptics off","Vibraci\xF3n desactivada","Haptik aus","Retour haptique d\xE9sactiv\xE9","Vibra\xE7\xE3o desligada","Vibrazione disattivata"],["Accessibility","Accesibilidad","Barrierefreiheit","Accessibilit\xE9","Acessibilidade","Accessibilit\xE0"],["Larger text","Texto m\xE1s grande","Gr\xF6\xDFerer Text","Texte plus grand","Texto maior","Testo pi\xF9 grande"],["High contrast","Alto contraste","Hoher Kontrast","Contraste \xE9lev\xE9","Alto contraste","Contrasto elevato"],["Reduced motion (no shake/swoops/dense particles)","Movimiento reducido (sin sacudidas, barridos ni part\xEDculas densas)","Weniger Bewegung (kein Wackeln, keine Schwenks, wenige Partikel)","Mouvements r\xE9duits (sans secousses, balayages ni particules denses)","Movimento reduzido (sem tremores, varreduras ou part\xEDculas densas)","Movimento ridotto (niente scosse, panoramiche o particelle dense)"],["Color-vision palette","Paleta para visi\xF3n del color","Farbsehen-Palette","Palette de vision des couleurs","Paleta de vis\xE3o de cores","Tavolozza per la visione dei colori"],["Default","Predeterminada","Standard","Par d\xE9faut","Padr\xE3o","Predefinita"],["Deuteranopia-safe","Apta para deuteranop\xEDa","Deuteranopie-geeignet","Adapt\xE9e \xE0 la deut\xE9ranopie","Adequada a deuteranopia","Adatta alla deuteranopia"],["Tritanopia-safe","Apta para tritanop\xEDa","Tritanopie-geeignet","Adapt\xE9e \xE0 la tritanopie","Adequada a tritanopia","Adatta alla tritanopia"],["Timing assist (wider landing forgiveness in practice)","Ayuda de tiempo (aterrizajes m\xE1s tolerantes en la pr\xE1ctica)","Timing-Hilfe (nachsichtigere Landungen im Training)","Aide au timing (atterrissages plus tol\xE9rants \xE0 l\u2019entra\xEEnement)","Ajuda de tempo (pousos mais tolerantes no treino)","Aiuto tempismo (atterraggi pi\xF9 tolleranti in allenamento)"],["Data","Datos","Daten","Donn\xE9es","Dados","Dati"],["Anonymous usage analytics (start/round-end/settings only)","Anal\xEDticas de uso an\xF3nimas (solo inicio, fin de ronda y ajustes)","Anonyme Nutzungsstatistik (nur Start, Rundenende, Einstellungen)","Statistiques d\u2019utilisation anonymes (d\xE9but, fin de manche et param\xE8tres uniquement)","An\xE1lise de uso an\xF4nima (s\xF3 in\xEDcio, fim de rodada e configura\xE7\xF5es)","Statistiche d\u2019uso anonime (solo inizio, fine round e impostazioni)"],["Replay tutorials from the start","Repetir los tutoriales desde el principio","Tutorials von vorn wiederholen","Rejouer les tutoriels depuis le d\xE9but","Repetir os tutoriais do in\xEDcio","Ripeti i tutorial dall\u2019inizio"],["Score {n}","Puntuaci\xF3n {n}","Punkte {n}","Score {n}","Pontos {n}","Punti {n}"],["Chain \xD7{n}","Cadena \xD7{n}","Kette \xD7{n}","Cha\xEEne \xD7{n}","Sequ\xEAncia \xD7{n}","Catena \xD7{n}"],["Altitude {alt} \xB7 motes {motes} \xB7 chain \xD7{chain}","Altitud {alt} \xB7 motas {motes} \xB7 cadena \xD7{chain}","H\xF6he {alt} \xB7 Funken {motes} \xB7 Kette \xD7{chain}","Altitude {alt} \xB7 lucioles {motes} \xB7 cha\xEEne \xD7{chain}","Altitude {alt} \xB7 fa\xEDscas {motes} \xB7 sequ\xEAncia \xD7{chain}","Altitudine {alt} \xB7 lucciole {motes} \xB7 catena \xD7{chain}"],["Title","Inicio","Titel","Accueil","In\xEDcio","Inizio"],["Results","Resultados","Ergebnisse","R\xE9sultats","Resultados","Risultati"],["Countdown","Cuenta regresiva","Countdown","Compte \xE0 rebours","Contagem regressiva","Conto alla rovescia"],["Away","Ausente","Abwesend","Absence","Ausente","Assenza"],["bounce","rebote","Sprung","rebond","quique","rimbalzo"],["spring boost!","\xA1impulso de resorte!","Federschub!","propulsion ressort !","impulso de mola!","spinta a molla!"],["petal breaks","el p\xE9talo se rompe","Bl\xFCtenblatt zerbricht","le p\xE9tale se brise","a p\xE9tala quebra","il petalo si rompe"],["glow mote collected","mota brillante recogida","Leuchtfunke gesammelt","luciole r\xE9colt\xE9e","fa\xEDsca coletada","lucciola raccolta"],["chain bonus","bonificaci\xF3n de cadena","Kettenbonus","bonus de cha\xEEne","b\xF4nus de sequ\xEAncia","bonus catena"],["milestone reached","hito alcanzado","Meilenstein erreicht","palier atteint","marco alcan\xE7ado","traguardo raggiunto"],["falling!","\xA1cayendo!","Absturz!","chute !","caindo!","stai cadendo!"],["thorns!","\xA1espinas!","Dornen!","\xE9pines !","espinhos!","spine!"],["goal reached!","\xA1meta alcanzada!","Ziel erreicht!","objectif atteint !","meta alcan\xE7ada!","obiettivo raggiunto!"],["click","clic","Klick","clic","clique","clic"],["cloud: not uploaded yet","nube: a\xFAn sin subir","Cloud: noch nicht hochgeladen","en ligne : pas encore envoy\xE9","nuvem: ainda n\xE3o enviado","cloud: non ancora caricato"],["cloud: saving\u2026","nube: guardando\u2026","Cloud: wird gespeichert \u2026","en ligne : enregistrement\u2026","nuvem: salvando\u2026","cloud: salvataggio\u2026"],["cloud: synced","nube: sincronizado","Cloud: synchronisiert","en ligne : synchronis\xE9","nuvem: sincronizado","cloud: sincronizzato"],["cloud: sync error","nube: error de sincronizaci\xF3n","Cloud: Synchronisierungsfehler","en ligne : erreur de synchronisation","nuvem: erro de sincroniza\xE7\xE3o","cloud: errore di sincronizzazione"],["Loading the garden\u2026","Cargando el jard\xEDn\u2026","Garten wird geladen \u2026","Chargement du jardin\u2026","Carregando o jardim\u2026","Caricamento del giardino\u2026"],["Graphics context lost \u2014 your run is paused and safe. Restoring\u2026","Se perdi\xF3 el contexto gr\xE1fico: tu partida est\xE1 en pausa y a salvo. Restaurando\u2026","Grafikkontext verloren \u2013 dein Lauf ist pausiert und sicher. Wird wiederhergestellt \u2026","Contexte graphique perdu \u2014 votre partie est en pause et pr\xE9serv\xE9e. Restauration\u2026","Contexto gr\xE1fico perdido \u2014 sua partida est\xE1 pausada e segura. Restaurando\u2026","Contesto grafico perso: la partita \xE8 in pausa e al sicuro. Ripristino\u2026"],["Graphics restored.","Gr\xE1ficos restaurados.","Grafik wiederhergestellt.","Graphismes restaur\xE9s.","Gr\xE1ficos restaurados.","Grafica ripristinata."],["Cloud progress loaded.","Progreso de la nube cargado.","Cloud-Fortschritt geladen.","Progression en ligne charg\xE9e.","Progresso da nuvem carregado.","Progressi cloud caricati."],["Compatibility","Compatibilidad","Kompatibilit\xE4t","Compatibilit\xE9","Compatibilidade","Compatibilit\xE0"],["Skybound Spring needs WebGL. Your progress and settings are preserved in this browser; the game is unplayable without 3D.","Skybound Spring necesita WebGL. Tu progreso y ajustes se conservan en este navegador; el juego no se puede jugar sin 3D.","Skybound Spring braucht WebGL. Dein Fortschritt und deine Einstellungen bleiben in diesem Browser erhalten; ohne 3D ist das Spiel nicht spielbar.","Skybound Spring n\xE9cessite WebGL. Votre progression et vos param\xE8tres sont conserv\xE9s dans ce navigateur ; le jeu est injouable sans 3D.","Skybound Spring precisa de WebGL. Seu progresso e suas configura\xE7\xF5es ficam guardados neste navegador; o jogo n\xE3o funciona sem 3D.","Skybound Spring richiede WebGL. Progressi e impostazioni restano in questo browser; senza 3D il gioco non \xE8 giocabile."],["{label}: climb as high as you can.","{label}: sube lo m\xE1s alto que puedas.","{label}: steig so hoch du kannst.","{label} : grimpez le plus haut possible.","{label}: suba o mais alto que puder.","{label}: sali pi\xF9 in alto che puoi."],["{label}: reach {n}m altitude in {s}s.","{label}: llega a {n} m de altitud en {s} s.","{label}: erreiche {n} m H\xF6he in {s} s.","{label} : atteignez {n} m d\u2019altitude en {s} s.","{label}: alcance {n} m de altitude em {s} s.","{label}: raggiungi {n} m di altitudine in {s} s."],["{label}: reach {n}m altitude.","{label}: llega a {n} m de altitud.","{label}: erreiche {n} m H\xF6he.","{label} : atteignez {n} m d\u2019altitude.","{label}: alcance {n} m de altitude.","{label}: raggiungi {n} m di altitudine."],["{label}: collect {n} glow motes.","{label}: recoge {n} motas brillantes.","{label}: sammle {n} Leuchtfunken.","{label} : r\xE9coltez {n} lucioles.","{label}: colete {n} fa\xEDscas brilhantes.","{label}: raccogli {n} lucciole."],["Next: {name}","Siguiente: {name}","Weiter: {name}","Suivant : {name}","Pr\xF3xima: {name}","Prossima: {name}"],["More lessons","M\xE1s lecciones","Weitere Lektionen","Plus de le\xE7ons","Mais li\xE7\xF5es","Altre lezioni"],["Lesson: {name}","Lecci\xF3n: {name}","Lektion: {name}","Le\xE7on : {name}","Li\xE7\xE3o: {name}","Lezione: {name}"],["Lesson complete! Keep climbing to finish the run.","\xA1Lecci\xF3n completada! Sigue subiendo para terminar la partida.","Lektion abgeschlossen! Steig weiter, um den Lauf zu beenden.","Le\xE7on termin\xE9e ! Continuez \xE0 grimper pour finir la partie.","Li\xE7\xE3o conclu\xEDda! Continue subindo para terminar a partida.","Lezione completata! Continua a salire per finire la partita."],["Tip: a lesson for this mechanic is available in Learn.","Consejo: en Aprender hay una lecci\xF3n sobre esta mec\xE1nica.","Tipp: Unter \u201ELernen\u201C gibt es eine Lektion zu dieser Mechanik.","Astuce : une le\xE7on sur cette m\xE9canique est disponible dans Apprendre.","Dica: h\xE1 uma li\xE7\xE3o sobre essa mec\xE2nica em Aprender.","Suggerimento: in Impara c\u2019\xE8 una lezione su questa meccanica."],["Daily {date}","Diario {date}","Tagesrunde {date}","D\xE9fi du jour {date}","Di\xE1rio {date}","Sfida del giorno {date}"],["Daily challenge","Desaf\xEDo diario","Tagesrunde","D\xE9fi du jour","Desafio di\xE1rio","Sfida del giorno"],["Practice ({tier})","Pr\xE1ctica ({tier})","Training ({tier})","Entra\xEEnement ({tier})","Treino ({tier})","Allenamento ({tier})"],["Challenge: {name}","Desaf\xEDo: {name}","Herausforderung: {name}","D\xE9fi : {name}","Desafio: {name}","Sfida: {name}"],["Replay verified: identical end state, score {n}.","Repetici\xF3n verificada: estado final id\xE9ntico, puntuaci\xF3n {n}.","Wiederholung gepr\xFCft: identischer Endzustand, Punktzahl {n}.","Replay v\xE9rifi\xE9 : \xE9tat final identique, score {n}.","Replay verificado: estado final id\xEAntico, pontua\xE7\xE3o {n}.","Replay verificato: stato finale identico, punteggio {n}."],["Replay mismatch \u2014 local only.","La repetici\xF3n no coincide: solo local.","Wiederholung weicht ab \u2013 nur lokal.","Le replay ne correspond pas \u2014 local uniquement.","Replay divergente \u2014 apenas local.","Il replay non corrisponde: solo locale."],["Undone to last landing.","Deshecho hasta el \xFAltimo aterrizaje.","Zur letzten Landung zur\xFCckgesetzt.","Retour au dernier atterrissage.","Desfeito at\xE9 o \xFAltimo pouso.","Tornato all\u2019ultimo atterraggio."],["Tutorials reset \u2014 find them under Learn.","Tutoriales reiniciados: est\xE1n en Aprender.","Tutorials zur\xFCckgesetzt \u2013 du findest sie unter \u201ELernen\u201C.","Tutoriels r\xE9initialis\xE9s \u2014 retrouvez-les dans Apprendre.","Tutoriais reiniciados \u2014 est\xE3o em Aprender.","Tutorial azzerati: li trovi in Impara."],["Failed to start: {error}","No se pudo iniciar: {error}","Start fehlgeschlagen: {error}","\xC9chec du d\xE9marrage : {error}","Falha ao iniciar: {error}","Avvio non riuscito: {error}"],["Offline mode \u2014 practice and local daily fully playable.","Modo sin conexi\xF3n: la pr\xE1ctica y el diario local se pueden jugar por completo.","Offline-Modus \u2013 Training und lokale Tagesrunde sind voll spielbar.","Mode hors ligne \u2014 entra\xEEnement et d\xE9fi du jour local enti\xE8rement jouables.","Modo offline \u2014 treino e di\xE1rio local totalmente jog\xE1veis.","Modalit\xE0 offline: allenamento e sfida del giorno locale completamente giocabili."],["Online as {name} \u2014 cloud save active.","En l\xEDnea como {name}: guardado en la nube activo.","Online als {name} \u2013 Cloud-Speicherung aktiv.","En ligne : {name} \u2014 sauvegarde en ligne active.","Online como {name} \u2014 salvamento na nuvem ativo.","Online come {name}: salvataggio cloud attivo."],["Online \u2014 cloud save active.","En l\xEDnea: guardado en la nube activo.","Online \u2013 Cloud-Speicherung aktiv.","En ligne \u2014 sauvegarde en ligne active.","Online \u2014 salvamento na nuvem ativo.","Online: salvataggio cloud attivo."],["Play","Jugar","Spielen","Jouer","Jogar","Gioca"],["Pause (P)","Pausa (P)","Pause (P)","Pause (P)","Pausar (P)","Pausa (P)"],["Undo (Z)","Deshacer (Z)","R\xFCckg\xE4ngig (Z)","Annuler (Z)","Desfazer (Z)","Annulla (Z)"],["Leave","Salir","Verlassen","Quitter","Sair","Esci"],["Loading","Cargando","L\xE4dt","Chargement","Carregando","Caricamento"],["Title screen","Pantalla de inicio","Titelbildschirm","\xC9cran d\u2019accueil","Tela inicial","Schermata iniziale"],["Preparing the run","Preparando la partida","Lauf wird vorbereitet","Pr\xE9paration de la partie","Preparando a partida","Preparazione della partita"],["Climbing","Subiendo","Aufstieg l\xE4uft","Ascension en cours","Subindo","In salita"],["Scoring the run","Calculando la puntuaci\xF3n","Lauf wird gewertet","Calcul du score","Calculando a pontua\xE7\xE3o","Calcolo del punteggio"],["Run over: {reason}. Altitude {alt}.","Partida terminada: {reason}. Altitud {alt}.","Lauf vorbei: {reason}. H\xF6he {alt}.","Partie termin\xE9e : {reason}. Altitude {alt}.","Partida encerrada: {reason}. Altitude {alt}.","Partita finita: {reason}. Altitudine {alt}."],["{what} left","{what} a la izquierda","{what} links","{what} \xE0 gauche","{what} \xE0 esquerda","{what} a sinistra"],["{what} right","{what} a la derecha","{what} rechts","{what} \xE0 droite","{what} \xE0 direita","{what} a destra"],["{what} above","{what} arriba","{what} oben","{what} au-dessus","{what} acima","{what} sopra"],["Altitude {alt}, chain {chain}. Next: {next}.","Altitud {alt}, cadena {chain}. Siguiente: {next}.","H\xF6he {alt}, Kette {chain}. Als N\xE4chstes: {next}.","Altitude {alt}, cha\xEEne {chain}. Ensuite : {next}.","Altitude {alt}, sequ\xEAncia {chain}. Pr\xF3ximo: {next}.","Altitudine {alt}, catena {chain}. Prossimo: {next}."],["none in range","nada al alcance","nichts in Reichweite","rien \xE0 port\xE9e","nada ao alcance","niente a portata"],["leaf pad","hoja","Blattplattform","feuille","folha","foglia"],["moving leaf","hoja m\xF3vil","bewegliches Blatt","feuille mobile","folha m\xF3vel","foglia mobile"],["brittle petal","p\xE9talo fr\xE1gil","spr\xF6des Bl\xFCtenblatt","p\xE9tale fragile","p\xE9tala fr\xE1gil","petalo fragile"],["spring blossom","flor resorte","Federbl\xFCte","fleur ressort","flor-mola","fiore a molla"],["wisp pad","plataforma et\xE9rea","Hauchplattform","plateforme \xE9vanescente","plataforma et\xE9rea","piattaforma eterea"],["THORN hazard","peligro: ESPINAS","Gefahr: DORNEN","danger : \xC9PINES","perigo: ESPINHOS","pericolo: SPINE"],["Dawn Meadow","Prado del alba","Morgenwiese","Prairie de l\u2019aube","Campina da aurora","Prato dell\u2019alba"],["Cloud Terrace","Terraza de nubes","Wolkenterrasse","Terrasse des nuages","Terra\xE7o das nuvens","Terrazza di nuvole"],["Dusk Canopy","Dosel del ocaso","Abenddach","Canop\xE9e du cr\xE9puscule","Copa do crep\xFAsculo","Chioma del tramonto"],["Frostline","L\xEDnea de escarcha","Frostgrenze","Ligne de givre","Linha de geada","Linea del gelo"],["Night Bloom","Flor nocturna","Nachtbl\xFCte","Floraison nocturne","Flor noturna","Fioritura notturna"],["Steady Hands","Pulso firme","Ruhige H\xE4nde","Mains s\xFBres","M\xE3os firmes","Mani ferme"],["Reach 900 altitude with a limited steering budget. Every tick you steer counts.","Llega a 900 de altitud con un presupuesto de direcci\xF3n limitado. Cada tic que giras cuenta.","Erreiche H\xF6he 900 mit begrenztem Lenkbudget. Jeder Tick, in dem du lenkst, z\xE4hlt.","Atteignez 900 d\u2019altitude avec un budget de direction limit\xE9. Chaque tic pass\xE9 \xE0 diriger compte.","Alcance 900 de altitude com limite de dire\xE7\xE3o. Cada tique virando conta.","Raggiungi 900 di altitudine con un budget di sterzata limitato. Ogni tick di sterzata conta."],["Sky Sprint","Sprint celeste","Himmelssprint","Sprint c\xE9leste","Corrida celeste","Sprint nel cielo"],["Reach 700 altitude before the clock runs out. Keep bouncing, keep climbing.","Llega a 700 de altitud antes de que se acabe el tiempo. Sigue rebotando, sigue subiendo.","Erreiche H\xF6he 700, bevor die Zeit abl\xE4uft. Weiter springen, weiter steigen.","Atteignez 700 d\u2019altitude avant la fin du chrono. Rebondissez, grimpez.","Alcance 700 de altitude antes que o tempo acabe. Continue quicando, continue subindo.","Raggiungi 700 di altitudine prima che scada il tempo. Continua a rimbalzare, continua a salire."],["Find the Wind","Encuentra el viento","Finde den Wind","Trouver le vent","Encontre o vento","Trova il vento"],["You bounce on your own. Steer with \u2190 \u2192 (or A / D), or drag on touch.","Rebotas solo. Gira con \u2190 \u2192 (o A / D), o arrastra en pantallas t\xE1ctiles.","Du springst von allein. Lenke mit \u2190 \u2192 (oder A / D) oder ziehe auf Touchger\xE4ten.","Vous rebondissez tout seul. Dirigez avec \u2190 \u2192 (ou A / D), ou glissez sur \xE9cran tactile.","Voc\xEA quica sozinho. Vire com \u2190 \u2192 (ou A / D), ou arraste no toque.","Rimbalzi da solo. Sterza con \u2190 \u2192 (o A / D), oppure trascina sul touch."],["Steer left until the arrow fills.","Gira a la izquierda hasta que se llene la flecha.","Lenke nach links, bis sich der Pfeil f\xFCllt.","Dirigez \xE0 gauche jusqu\u2019\xE0 ce que la fl\xE8che se remplisse.","Vire \xE0 esquerda at\xE9 a seta encher.","Sterza a sinistra finch\xE9 la freccia non si riempie."],["Now steer right until the arrow fills.","Ahora gira a la derecha hasta que se llene la flecha.","Jetzt nach rechts lenken, bis sich der Pfeil f\xFCllt.","Dirigez maintenant \xE0 droite jusqu\u2019\xE0 ce que la fl\xE8che se remplisse.","Agora vire \xE0 direita at\xE9 a seta encher.","Ora sterza a destra finch\xE9 la freccia non si riempie."],["You can wrap around the screen edges \u2014 fly off one side, appear on the other!","Puedes cruzar los bordes de la pantalla: sal por un lado y aparece por el otro.","Die Bildschirmr\xE4nder sind verbunden \u2013 flieg auf einer Seite hinaus und tauche auf der anderen auf!","Les bords de l\u2019\xE9cran sont reli\xE9s \u2014 sortez d\u2019un c\xF4t\xE9, r\xE9apparaissez de l\u2019autre !","As bordas da tela se conectam \u2014 saia por um lado e apare\xE7a no outro!","I bordi dello schermo sono collegati: esci da un lato e ricompari dall\u2019altro!"],["Spring Blooms","Flores resorte","Federbl\xFCten","Fleurs ressorts","Flores-mola","Fiori a molla"],["Pink blossom pads launch you high. Land on one!","Las flores rosas te lanzan alto. \xA1Aterriza en una!","Rosa Bl\xFCten schleudern dich hoch. Lande auf einer!","Les fleurs roses vous propulsent haut. Atterrissez sur l\u2019une d\u2019elles !","As flores rosa lan\xE7am voc\xEA alto. Pouse em uma!","I fiori rosa ti lanciano in alto. Atterrane su uno!"],["Ride the boost and climb!","\xA1Aprovecha el impulso y sube!","Nutze den Schub und steig auf!","Profitez de l\u2019\xE9lan et grimpez !","Aproveite o impulso e suba!","Sfrutta la spinta e sali!"],["Drifting Leaves","Hojas a la deriva","Treibende Bl\xE4tter","Feuilles \xE0 la d\xE9rive","Folhas \xE0 deriva","Foglie alla deriva"],["Blue leaf pads slide sideways. Time your landing!","Las hojas azules se deslizan de lado. \xA1Calcula el aterrizaje!","Blaue Bl\xE4tter gleiten seitlich. Pass deine Landung ab!","Les feuilles bleues glissent sur le c\xF4t\xE9. Choisissez le bon moment pour atterrir !","As folhas azuis deslizam para os lados. Calcule o pouso!","Le foglie blu scivolano di lato. Calcola l\u2019atterraggio!"],["Brittle Petals","P\xE9talos fr\xE1giles","Spr\xF6de Bl\xFCtenbl\xE4tter","P\xE9tales fragiles","P\xE9talas fr\xE1geis","Petali fragili"],["Brown petals break after one landing. Never plan to return to them.","Los p\xE9talos marrones se rompen tras un aterrizaje. No pienses en volver a ellos.","Braune Bl\xFCtenbl\xE4tter zerbrechen nach einer Landung. Plane nie, zu ihnen zur\xFCckzukehren.","Les p\xE9tales bruns se brisent apr\xE8s un atterrissage. Ne comptez pas y revenir.","As p\xE9talas marrons quebram depois de um pouso. N\xE3o conte em voltar a elas.","I petali marroni si rompono dopo un atterraggio. Non contare di tornarci."],["First Ascent","Primer ascenso","Erster Aufstieg","Premi\xE8re ascension","Primeira subida","Prima ascesa"],["Complete any stage or climb 300 altitude.","Completa cualquier etapa o sube 300 de altitud.","Schlie\xDFe eine Etappe ab oder steig auf H\xF6he 300.","Terminez une \xE9tape ou grimpez \xE0 300 d\u2019altitude.","Conclua qualquer fase ou suba 300 de altitude.","Completa una tappa o sali a 300 di altitudine."],["Spring Master","Maestro del resorte","Federmeister","Ma\xEEtre des ressorts","Mestre das molas","Maestro delle molle"],["Bounce on 25 spring pads in one run.","Rebota en 25 flores resorte en una partida.","Spring in einem Lauf auf 25 Federbl\xFCten.","Rebondissez sur 25 fleurs ressorts en une partie.","Quique em 25 flores-mola numa partida.","Rimbalza su 25 fiori a molla in una partita."],["Streak Tender","Guardi\xE1n de rachas","Kettenpfleger","Gardien de s\xE9rie","Guardi\xE3o da sequ\xEAncia","Custode della serie"],["Reach a landing chain of 30.","Logra una cadena de 30 aterrizajes.","Erreiche eine Landekette von 30.","Atteignez une cha\xEEne de 30 atterrissages.","Fa\xE7a uma sequ\xEAncia de 30 pousos.","Raggiungi una catena di 30 atterraggi."],["Storm Summit","Cumbre de tormenta","Sturmgipfel","Sommet de la temp\xEAte","Cume da tempestade","Vetta della tempesta"],["Complete a Journey stage on Storm difficulty.","Completa una etapa de la traves\xEDa en dificultad Tormenta.","Schlie\xDFe eine Reise-Etappe auf Schwierigkeit Sturm ab.","Terminez une \xE9tape du voyage en difficult\xE9 Temp\xEAte.","Conclua uma fase da jornada na dificuldade Tempestade.","Completa una tappa del viaggio a difficolt\xE0 Tempesta."],["Evergreen","Siempreverde","Immergr\xFCn","Persistant","Sempre-verde","Sempreverde"],["Play on 7 different days.","Juega 7 d\xEDas distintos.","Spiele an 7 verschiedenen Tagen.","Jouez 7 jours diff\xE9rents.","Jogue em 7 dias diferentes.","Gioca in 7 giorni diversi."],["Sprout (easy)","Brote (f\xE1cil)","Spross (leicht)","Pousse (facile)","Broto (f\xE1cil)","Germoglio (facile)"],["Bloom (medium)","Flor (media)","Bl\xFCte (mittel)","Floraison (moyen)","Flor (m\xE9dio)","Fioritura (medio)"],["Storm (hard)","Tormenta (dif\xEDcil)","Sturm (schwer)","Temp\xEAte (difficile)","Tempestade (dif\xEDcil)","Tempesta (difficile)"]],Rf={"en-GB":{"Color-vision palette":"Colour-vision palette"},"es-ES":{Countdown:"Cuenta atr\xE1s","Hold {left} or {right} to drift sideways. On touch, drag or hold the bottom corners. Gamepad: left stick or D-pad.":"Mant\xE9n {left} o {right} para desplazarte de lado. En pantallas t\xE1ctiles, arrastra o mant\xE9n pulsadas las esquinas inferiores. Mando: joystick izquierdo o cruceta."},"fr-CA":{Score:"Pointage","Score {n}":"Pointage {n}","Score breakdown":"D\xE9tail du pointage","Score saved to your local bests.":"Pointage enregistr\xE9 dans vos records locaux.","Run over. {reason} Total score {n}.":"Partie termin\xE9e. {reason} Pointage total {n}.","Replay verified: identical end state, score {n}.":"Reprise v\xE9rifi\xE9e : \xE9tat final identique, pointage {n}.","Replay mismatch \u2014 local only.":"La reprise ne correspond pas \u2014 local seulement.","Watch replay":"Voir la reprise","Scoring the run":"Calcul du pointage","Mute when tab hidden":"Couper le son si l\u2019onglet est cach\xE9"}};var Oh=["en-US","en-GB","es-419","es-ES","de-DE","fr-FR","fr-CA","pt-BR","it-IT"],Zy=["es-419","de-DE","fr-FR","pt-BR","it-IT"],Jy={"en-GB":"en-US","es-ES":"es-419","fr-CA":"fr-FR"},va={"en-US":{}};for(let n of Cf)va["en-US"][n[0]]=n[0],Zy.forEach((e,t)=>{(va[e]||(va[e]={}))[n[0]]=n[t+1]});for(let[n,e]of Object.entries(Rf))va[n]={...e};var Xn="en-US",Uh=new Set;function jy(n){for(let e=Xn;e;e=Jy[e]){let t=va[e];if(t&&Object.prototype.hasOwnProperty.call(t,n))return t[n]}return n}function R(n,e){let t=jy(String(n));return e&&(t=t.replace(/\{(\w+)\}/g,(i,s)=>Object.prototype.hasOwnProperty.call(e,s)?String(e[s]):i)),t}function Jl(){return Xn}function If(n){return Uh.add(n),()=>Uh.delete(n)}function Lf(n){let e=n!==Xn;if(Xn=Oh.includes(n)?n:"en-US",typeof document<"u"&&(document.documentElement.lang=Xn),!!e){for(let t of[...Uh])try{t(Xn)}catch(i){console.error(i)}typeof document<"u"&&typeof CustomEvent=="function"&&document.dispatchEvent(new CustomEvent("ss-language",{detail:{lang:Xn}}))}}var Zl=typeof window<"u"?window.StarHermitLanguage:null,Fh=null;try{Fh=new URLSearchParams(window.location.search).get("lang")}catch{}var Pf=Fh&&Zl?Zl.match(Fh,Oh):null,Ky=Zl?Zl.create({game:"skybound-spring",supported:Oh,panel:!Pf,apply:n=>Lf(Pf||n)}):null;Ky||Lf("en-US");function Kl(n){return n.mastery?R("Mastery Gate {n}",{n:Math.floor(n.index/8)+1}):R("Ascent {n}",{n:n.index+1})}var Qy={bounce:"bounce",spring:"spring boost!",crumble:"petal breaks",token:"glow mote collected",combo:"chain bonus",milestone:"milestone reached",fall:"falling!",thorn:"thorns!",goal:"goal reached!",click:"click"},Df={offline:"offline (local save)",local:"cloud: not uploaded yet",saving:"cloud: saving\u2026",synced:"cloud: synced",error:"cloud: sync error"};function k(n,e={},...t){let i=document.createElement(n);for(let[s,r]of Object.entries(e))s==="class"?i.className=r:s==="text"?i.textContent=r:s.startsWith("on")?i.addEventListener(s.slice(2),r):s==="html"?i.innerHTML=r:i.setAttribute(s,r);for(let s of t)s&&i.append(s);return i}function Ze(n,e,t="btn"){return k("button",{class:t,type:"button",onclick:i=>{i.currentTarget.blur(),e(i)}},n)}var jl=class{constructor(e,t,i){this.root=e,this.actions=t,this.settings=i,this.screenStack=[],this.lastFocus=null,this.sh=Nh(Jl()),this.keys={left:"\u2190 / A",right:"\u2192 / D",pause:"Esc / P",undo:"Z"},this.build(),this.applySettings(),If(()=>this.relocalize())}relocalize(){if(this.sh=Nh(Jl()),this.labelStatic(),this._actions&&this.setActions(this._actions),this._status&&this.setStatus(...this._status),this._sync&&this.setSyncStatus(this._sync),this._hudArgs&&this.updateHud(...this._hudArgs),this._tut&&document.getElementById("tut-bar")&&this.showTutorialOverlay(...this._tut),this.currentScreen&&this._redraw){let e=this.screens.querySelector(".screen .panel"),t=e?e.scrollTop:0,i=document.activeElement&&document.activeElement.matches&&document.activeElement.matches("[data-game-language]"),s=this.lastFocus;this._redraw(),this.lastFocus=s,setTimeout(()=>{let r=this.screens.querySelector(".screen .panel");r&&(r.scrollTop=t),i&&this.screens.querySelector('[data-game-language="choice"]')?.focus()},30)}}labelStatic(){this.railLeft.setAttribute("aria-label",R("Objective and progress")),this.railRight.setAttribute("aria-label",R("Actions and status")),this.thumbTray.setAttribute("aria-label",R("Touch steering")),this.hud.setAttribute("aria-label",R("Play status")),this.toggleLeft.textContent=R("Objective"),this.toggleRight.textContent=R("Actions");for(let e of this.root.querySelectorAll(".rail-close"))e.setAttribute("aria-label",R("Close panel"));this.objectiveHead.textContent=R("Objective"),this.progressHead.textContent=R("Progress"),this.statusHead.textContent=R("Status"),this.hudScore.setAttribute("aria-label",R("Score")),this.hudChain.setAttribute("aria-label",R("Chain")),this.hudAlt.setAttribute("aria-label",R("Altitude")),this.hudPause.textContent=R("\u23F8 Pause"),this.steerLeft.setAttribute("aria-label",R("Steer left")),this.steerRight.setAttribute("aria-label",R("Steer right"))}build(){this.root.innerHTML="",this.root.className="app",this.livePolite=k("div",{class:"sr-only","aria-live":"polite",role:"status"}),this.liveAssertive=k("div",{class:"sr-only","aria-live":"assertive",role:"alert"}),this.boardMirror=k("div",{class:"sr-only","aria-live":"polite",id:"board-mirror"}),this.captions=k("div",{class:"captions","aria-hidden":"false"}),this.sceneHost=k("div",{class:"scene-host",id:"scene-host"}),this.railLeft=k("aside",{class:"rail rail-left","aria-label":"Objective and progress"}),this.railRight=k("aside",{class:"rail rail-right","aria-label":"Actions and status"}),this.topBar=k("header",{class:"top-bar"}),this.thumbTray=k("nav",{class:"thumb-tray","aria-label":"Touch steering"}),this.hud=k("div",{class:"hud",role:"region","aria-label":"Play status"}),this.screens=k("div",{class:"screens"}),this.railToggles=k("div",{class:"rail-toggles"},this.toggleLeft=Ze(R("Objective"),()=>this.toggleRail("left"),"btn btn-small rail-toggle"),this.toggleRight=Ze(R("Actions"),()=>this.toggleRail("right"),"btn btn-small rail-toggle")),this.toggleLeft.setAttribute("aria-expanded","false"),this.toggleRight.setAttribute("aria-expanded","false"),this.railScrim=k("div",{class:"rail-scrim",hidden:""}),this.railScrim.addEventListener("click",()=>this.toggleRail(null));for(let[e,t]of[[this.railLeft,"left"],[this.railRight,"right"]]){let i=Ze("\u2715",()=>this.toggleRail(null),"btn btn-small rail-close");i.setAttribute("aria-label",R("Close panel")),e.prepend(i),e.dataset.side=t}this.root.append(this.livePolite,this.liveAssertive,this.boardMirror,this.captions,this.topBar,this.railLeft,this.sceneHost,this.railRight,this.hud,this.thumbTray,this.railToggles,this.railScrim),this.sceneHost.append(this.screens),this.buildRails(),this.buildHud(),this.buildThumbTray(),this.labelStatic()}toggleRail(e){let t=e==="left"&&!this.railLeft.classList.contains("open"),i=e==="right"&&!this.railRight.classList.contains("open");this.railLeft.classList.toggle("open",t),this.railRight.classList.toggle("open",i),this.toggleLeft.setAttribute("aria-expanded",String(t)),this.toggleRight.setAttribute("aria-expanded",String(i)),this.railScrim.hidden=!(t||i),t&&this.railLeft.focus?.(),i&&this.railRight.focus?.()}buildRails(){let e=s=>s.querySelector(".rail-close"),t=e(this.railLeft),i=e(this.railRight);this.railLeft.innerHTML="",t&&this.railLeft.append(t),this.objectiveBox=k("div",{class:"card"},this.objectiveHead=k("h2",{text:R("Objective")}),this.objectiveText=k("p",{text:"\u2014"})),this.progressBox=k("div",{class:"card"},this.progressHead=k("h2",{text:R("Progress")}),this.progressText=k("p",{text:"\u2014"})),this.railLeft.append(this.objectiveBox,this.progressBox),this.railRight.innerHTML="",i&&this.railRight.append(i),this.actionsBox=k("div",{class:"card actions-card"}),this.statusBox=k("div",{class:"card"},this.statusHead=k("h2",{text:R("Status")}),this.statusText=k("p",{text:R("Offline practice available.")}),this.syncText=k("p",{class:"muted small",text:R("offline (local save)")})),this.railRight.append(this.actionsBox,this.statusBox)}buildHud(){this.hud.innerHTML="",this.hudScore=k("div",{class:"hud-item","aria-label":"Score"}),this.hudChain=k("div",{class:"hud-item","aria-label":"Chain"}),this.hudAlt=k("div",{class:"hud-item","aria-label":"Altitude"}),this.hudPause=Ze(R("\u23F8 Pause"),()=>this.actions.pause(),"btn btn-small"),this.hud.append(this.hudAlt,this.hudScore,this.hudChain,this.hudPause),this.hud.hidden=!0}buildThumbTray(){this.thumbTray.innerHTML="";let e=this.steerLeft=k("button",{class:"thumb-btn",type:"button","aria-label":R("Steer left"),text:"\u25C0"}),t=this.steerRight=k("button",{class:"thumb-btn",type:"button","aria-label":R("Steer right"),text:"\u25B6"}),i=(s,r)=>{let a=l=>{l.preventDefault(),this.actions.steerStart(r)},o=l=>{l.preventDefault(),this.actions.steerStop(r)};s.addEventListener("pointerdown",a),s.addEventListener("pointerup",o),s.addEventListener("pointercancel",o),s.addEventListener("lostpointercapture",o)};i(e,-1),i(t,1),this.thumbTray.append(e,t),this.thumbTray.hidden=!0}announce(e,t=!1){(t?this.liveAssertive:this.livePolite).textContent="",(t?this.liveAssertive:this.livePolite).textContent=e}announceError(e){this.announce(R("Error: {msg}",{msg:e}),!0)}caption(e){this.captions.textContent=R(Qy[e]||e),clearTimeout(this._capT),this._capT=setTimeout(()=>{this.captions.textContent=""},1600)}showScreen(e,t){if(this.lastFocus=document.activeElement,this.screens.innerHTML="",t){let i=k("section",{class:"screen",role:"dialog","aria-label":R(e),tabindex:"-1"});i.append(t),this.screens.append(i),i.focus(),this.screens.classList.add("open")}else this.screens.classList.remove("open");this.currentScreen=e}closeScreen(e){this.screens.innerHTML="",this.screens.classList.remove("open"),this.currentScreen=null,this._redraw=null;let t=e||this.lastFocus;t&&t.isConnected&&t.focus&&t.focus()}showTitle(e){this._redraw=()=>this.showTitle(e);let{progress:t,daily:i,name:s,canSignIn:r,inviteLink:a}=e,o=Object.keys(t.stagesCompleted).length,l=s?R("Online as {name}",{name:s}):R("Offline \u2014 practice & local daily"),c=k("div",{class:"panel title-panel"},k("h1",{class:"game-title",text:"Skybound Spring"}),k("p",{class:"tagline",text:R("Bounce up the endless garden. Chain landings, dodge thorns, chase the sky.")}),Ze(R("\u25B6 Play"),()=>this.actions.quickPlay(),"btn btn-primary btn-huge"),k("div",{class:"row gap"},Ze(R("Journey"),()=>this.actions.openJourney()),Ze(i?R("Daily ({date})",{date:i.date}):R("Daily (offline seed)"),()=>this.actions.playDaily()),Ze(R("Learn"),()=>this.actions.openLearn())),k("div",{class:"row gap"},Ze(R("Practice"),()=>this.actions.openPractice()),Ze(R("Challenges"),()=>this.actions.openChallenges()),Ze(R("Profile"),()=>this.actions.openProfile())),k("div",{class:"row gap"},Ze(R("Settings"),()=>this.showSettings()),Ze(R("Help"),()=>this.showHelp())),r||a?k("div",{class:"row gap"},r?Ze(this.sh.signIn,()=>this.actions.signIn()):null,a?Ze(this.sh.invite,()=>this.actions.copyInvite()):null):null,k("p",{class:"muted",text:R("Journey: {done}/40 stages \xB7 {online}",{done:o,online:l})}));this.showScreen("Title",c)}showJourney(e){this._redraw=()=>this.showJourney(e);let t=Xs(),i=t.findIndex((o,l)=>l>0&&!e.stagesCompleted[t[l-1].id]),s=k("div",{class:"stage-grid",role:"list"});t.forEach((o,l)=>{let c=l===0||!!e.stagesCompleted[t[l-1].id],h=e.stagesCompleted[o.id],d=Jt.find(b=>b.key===o.theme),u=o.goal.type==="tokens"?R("collect {n} motes",{n:o.goal.target}):R("reach {n}m",{n:o.goal.target}),f=[Kl(o)+" \u2014 "+u,R("par {n}s",{n:o.parSeconds}),R(d.name),R(si[o.difficulty].label)].join(" \xB7 ")+(h!==void 0?" \xB7 "+R("best {n}",{n:h}):"")+(c?"":" "+R("(locked)")),g=Ze(`${o.mastery?"\u2605":""}${l+1}${h!==void 0?"\u2713":""}`,c?()=>this.actions.playStage(o):null,"btn btn-stage-cell"+(o.mastery?" stage-mastery":"")+(c?"":" btn-locked"));g.setAttribute("aria-label",f),g.title=f,g.setAttribute("role","listitem"),c||(g.disabled=!0),l===i&&g.classList.add("next-up"),s.append(g)});let r=lu(e),a=k("div",{class:"panel"},k("h1",{text:R("Journey")}),k("p",{class:"muted",text:R("Mastery gates: {done}/{total} cleared",{done:r.filter(o=>o.completed).length,total:r.length})}),s,Ze(R("Back"),()=>this.actions.toTitle()));this.showScreen("Journey",a)}showLearn(e){this._redraw=()=>this.showLearn(e);let t=k("div",{class:"panel"},k("h1",{text:R("Learn")}),k("p",{class:"muted",text:R("Short interactive lessons. You must perform each move to advance.")}),...Ma.map(i=>k("div",{class:"row gap"},Ze(`${R(i.name)}${e.tutorialsDone.includes(i.id)?" \u2713":""}`,()=>this.actions.playTutorial(i)),k("span",{class:"muted small",text:R(i.steps[0].text).slice(0,60)+"\u2026"}))),Ze(R("Back"),()=>this.actions.toTitle()));this.showScreen("Learn",t)}showPractice(){let e=this._practice?this._practice.tier:"sprout",t=this._practice?this._practice.seed:String(Math.floor(Math.random()*1e9));this._practice={tier:e,seed:t},this._redraw=()=>this.showPractice();let i=k("input",{type:"text",value:t,"aria-label":R("Practice seed"),maxlength:"12"});i.addEventListener("input",()=>{t=this._practice.seed=i.value});let s=k("div",{class:"panel"},k("h1",{text:R("Practice")}),k("p",{class:"muted",text:R("Unranked. Free restart, undo-to-last-landing (Z), any difficulty. Expected session: 2\u20135 minutes.")}),k("div",{class:"row gap"},Object.values(si).map(r=>{let a=Ze(R(r.label),()=>{e=this._practice.tier=r.key,s.querySelectorAll(".tier-btn").forEach(o=>o.classList.remove("active")),a.classList.add("active")},"btn tier-btn");return r.key===e&&a.classList.add("active"),a})),k("label",{class:"row gap"},R("Seed (shareable):")+" ",i),Ze(R("Start practice run"),()=>{let r=/^\d+$/.test(t)?Number(t)>>>0:t.split("").reduce((a,o)=>a*31+o.charCodeAt(0)>>>0,7);this._practice=null,this.actions.playPractice(e,r)},"btn btn-primary"),Ze(R("Back"),()=>{this._practice=null,this.actions.toTitle()}));this.showScreen("Practice",s)}showChallenges(){this._redraw=()=>this.showChallenges();let e=k("div",{class:"panel"},k("h1",{text:R("Challenges")}),...ou.map(t=>k("div",{class:"card"},k("h2",{text:R(t.name)}),k("p",{text:R(t.description)}),k("p",{class:"muted small",text:R("Difficulty: {tier} \xB7 Ranked: no \xB7 Expected: under 2 minutes",{tier:R(si[t.difficulty].label)})}),Ze(R("Attempt"),()=>this.actions.playChallenge(t),"btn btn-primary"))),Ze(R("Back"),()=>this.actions.toTitle()));this.showScreen("Challenges",e)}async showProfile(e){this._redraw=()=>this.showProfile(e);let{progress:t,platform:i}=e,s=k("input",{type:"text",value:i.playerName,"aria-label":R("Display name"),maxlength:"32"}),r=i.hosted?k("p",{class:"row gap"},k("strong",{text:R("Account: {name}",{name:i.nickname})}),k("span",{class:"muted small",text:R("Cloud save: {state}",{state:R(Df[i.syncState]||i.syncState)})})):k("label",{class:"row gap"},R("Display name:")+" ",s,Ze(R("Save"),()=>{i.setPlayerName(s.value),this.announce(R("Name saved."))})),a=k("div",{class:"boards"},k("p",{class:"muted",text:R("Loading boards\u2026")})),o=k("div",{class:"panel"},k("h1",{text:R("Profile")}),r,k("h2",{text:R("Achievements")}),k("ul",{},...qs.map(c=>k("li",{},k("strong",{text:R(c.name)}),` \u2014 ${R(c.description)} `,k("span",{class:t.achievements[c.key]?"unlocked":"muted",text:t.achievements[c.key]?R("\u2713 unlocked"):R("locked")})))),k("h2",{text:R("Leaderboards")}),a,Ze(R("Back"),()=>this.actions.toTitle()));this.showScreen("Profile",o);let l=k("p",{class:"muted"},R("Local bests \u2014 Practice: {practice} \xB7 Daily: {daily} \xB7 Journey stages: {stages}/40",{practice:t.bests.practice||0,daily:t.bests.daily||0,stages:Object.keys(t.stagesCompleted).length}));if(a.innerHTML="",i.hosted){let c=k("div",{class:"card"},k("h3",{text:R("Global")}),k("ol",{class:"board-list"}));a.append(c,l);let h=await i.leaderboard("global");if(!h.ok){c.append(k("p",{class:"muted",text:h.recoverable?R("Temporarily unavailable \u2014 try again soon."):R("No platform leaderboard for this game yet \u2014 local bests below.")}));return}if(!h.entries.length){c.append(k("p",{class:"muted",text:R("No entries yet \u2014 be the first!")}));return}let d=c.querySelector(".board-list");for(let u of h.entries.slice(0,10))d.append(k("li",{},`${u.name||R("Player")} \u2014 ${u.score}${u.rank?` (#${u.rank})`:""}`));return}a.append(k("p",{class:"muted",text:R("Offline \u2014 online leaderboards need a StarHermit sign-in.")}),l)}showPause(e){this._redraw=()=>this.showPause(e);let t=typeof e.mode=="function"?e.mode():e.mode,i=k("div",{class:"panel"},k("h1",{text:R("Paused")}),Ze(R("\u25B6 Resume"),()=>this.actions.resume(),"btn btn-primary btn-huge"),k("div",{class:"row gap"},Ze(R("Restart"),()=>this.actions.restartRun()),e.allowUndo?Ze(R("Undo to last landing (Z)"),()=>this.actions.undo()):null,Ze(R("Settings"),()=>this.showSettings(()=>this.showPause(e))),Ze(R("Help"),()=>this.showHelp(()=>this.showPause(e)))),Ze(R("Leave run"),()=>this.actions.leaveRun(),"btn btn-danger"),k("p",{class:"muted small",text:R("Mode: {mode} \xB7 Ranked: {ranked} \xB7 Tick {tick}",{mode:t,ranked:e.ranked?R("yes"):R("no"),tick:e.tick})}));this.showScreen("Paused",i)}showResults(e,t=!1){this._redraw=()=>{this.showResults(e,!0),this._lb&&this.setLeaderboardResult(this._lb)},t||(this._lb=null);let{score:i,terminal:s,isBest:r,best:a,prevBest:o,newAchievements:l,nextAction:c,par:h}=e,d={fell:R("You fell below the garden."),hazard:R("Thorns got you."),"goal-reached":R("Goal reached!"),"move-limit":R("Steering budget spent."),"time-out":R("Out of time.")},u=c?typeof c.label=="function"?c.label():c.label:null,f=k("div",{class:"panel"},k("h1",{text:s.reason==="goal-reached"?R("\u{1F33C} Goal reached!"):R("Run over")}),k("p",{class:"result-reason",text:d[s.reason]||s.reason}),k("div",{class:"score-breakdown",role:"table","aria-label":R("Score breakdown")},k("div",{role:"row"},k("span",{text:R("Altitude")}),k("strong",{text:String(i.altitude)})),k("div",{role:"row"},k("span",{text:R("Chain bonus")}),k("strong",{text:String(i.chainBonus)})),k("div",{role:"row"},k("span",{text:R("Glow motes")}),k("strong",{text:String(i.tokens)})),k("div",{role:"row",class:"total"},k("span",{text:R("Total")}),k("strong",{text:String(i.total)}))),h?k("p",{class:"muted",text:R("Par: {n}s",{n:h})}):null,k("p",{class:"muted",text:r?o?R("New best! (was {n})",{n:o}):R("New best!"):R("Best: {n}",{n:a})}),l.length?k("p",{class:"achv",text:R("Achievement unlocked: {list}",{list:l.map(g=>R(qs.find(b=>b.key===g)?.name||g)).join(", ")})}):null,k("p",{class:"muted small",text:R("Score saved to your local bests.")}),e.postLeaderboard?k("p",{class:"muted",id:"results-lb",role:"status",text:this.sh.lbPosting}):null,k("div",{class:"row gap"},Ze(R("Retry"),()=>this.actions.restartRun(),"btn btn-primary"),Ze(R("Watch replay"),()=>this.actions.replayRun()),c?Ze(u,c.fn):null),Ze(R("Continue"),()=>this.actions.toTitle()));this.showScreen("Results",f),t||this.announce(R("Run over. {reason} Total score {n}.",{reason:d[s.reason]||s.reason,n:i.total}),!0)}setLeaderboardResult(e){this._lb=e;let t=document.getElementById("results-lb");t&&(t.textContent=e.posted?e.rank?this.sh.lbRank.replace("{rank}",e.rank):this.sh.lbPosted:this.sh.lbNotPosted)}showCountdown(e){this._redraw=()=>this.showCountdown(e),this.showScreen("Countdown",k("div",{class:"panel countdown-panel"},k("p",{class:"countdown-num",text:e>0?String(e):R("Go!")})))}showAwaySummary(e,t){this._redraw=()=>this.showAwaySummary(e,t);let i=k("div",{class:"panel"},k("h1",{text:R("Welcome back")}),k("p",{text:R("You were away {n}s. The run was paused \u2014 nothing happened while you were gone.",{n:Math.round(e)})}),k("p",{class:"muted",text:R("Altitude reached: {n}m.",{n:t})}),Ze(R("Resume"),()=>this.actions.resume(),"btn btn-primary"));this.showScreen("Away",i)}showTutorialOverlay(e,t,i){this._tut=[e,t,i];let s=document.getElementById("tut-bar");s||(s=k("div",{class:"tutorial-bar",id:"tut-bar",role:"status"}),this.root.append(s)),s.innerHTML="",s.append(k("span",{class:"tutorial-step",text:R("Lesson {n}/{total}",{n:t+1,total:i})}),k("p",{text:R(e)}),Ze(R("Skip lesson"),()=>this.actions.skipTutorial(),"btn btn-small"))}hideTutorialOverlay(){this._tut=null;let e=document.getElementById("tut-bar");e&&e.remove()}showHelp(e){this._redraw=()=>this.showHelp(e);let t=[[R("Auto-bounce"),R("Your sprout-hopper bounces on its own. Land on pads to keep climbing \u2014 each landing bounces you again.")],[R("Steering"),R("Hold {left} or {right} to drift sideways. On touch, drag or hold the bottom corners. Gamepad: left stick or D-pad.",{left:this.keys.left,right:this.keys.right})],[R("Screen wrap"),R("Fly off the left edge and you reappear on the right (and vice versa). Classic garden physics!")],[R("Leaf pads (green)"),R("Safe, sturdy, unlimited bounces.")],[R("Moving leaves (blue)"),R("Slide sideways near their perch. Time your landing.")],[R("Brittle petals (brown)"),R("Break after one landing. Never plan to come back.")],[R("Spring blossoms (pink)"),R("Launch you nearly twice as high. Chain them for huge climbs.")],[R("Wisp pads (pale)"),R("Fragile: one landing and they fade.")],[R("Thorn clusters (red spikes)"),R("Never land on thorns \u2014 the run ends instantly.")],[R("Glow motes (gold)"),R("Worth 100 points each. Grab them mid-flight.")],[R("Chains"),R("Land on successively higher pads to grow your chain bonus. Dropping to a lower pad resets it.")],[R("Falling"),R("The camera only moves up. Fall below the bottom of the view and the run ends.")],[R("Undo (practice)"),R("Press {key} in practice to jump back to your last landing.",{key:this.keys.undo})],[R("Pause"),R("Press {key} to pause or resume.",{key:this.keys.pause})]],i=k("div",{class:"panel"},k("h1",{text:R("How to play")}),k("div",{class:"help-grid"},...t.map(([s,r])=>k("div",{class:"card"},k("h3",{text:s}),k("p",{text:r})))),Ze(R("Back"),()=>e?e():this.actions.toTitle()));this.showScreen("Help",i)}showSettings(e){this._redraw=()=>this.showSettings(e);let t=this.settings,i=(o,l,c=0,h=1)=>{let d=k("input",{type:"range",min:c,max:h,step:"0.05",value:t[l],"aria-label":o});return d.addEventListener("input",()=>{t[l]=Number(d.value),this.actions.settingsChanged()}),k("label",{class:"row slider-row"},k("span",{text:o}),d)},s=(o,l)=>{let c=k("input",{type:"checkbox","aria-label":o});return c.checked=!!t[l],c.addEventListener("change",()=>{t[l]=c.checked,this.actions.settingsChanged()}),k("label",{class:"row"},c,k("span",{text:o}))},r=(o,l,c)=>{let h=k("select",{"aria-label":o});for(let[d,u]of c)h.append(k("option",{value:d,text:u,selected:t[l]===d?"":null}));return h.value=t[l],h.addEventListener("change",()=>{t[l]=h.value,this.actions.settingsChanged()}),k("label",{class:"row gap"},k("span",{text:o}),h)},a=k("div",{class:"panel settings-panel"},k("h1",{text:R("Settings")}),k("h2",{text:R("Audio")}),i(R("Music"),"music"),i(R("Effects"),"effects"),i(R("Ambience"),"ambience"),s(R("Mute all"),"muted"),s(R("Mute when tab hidden"),"muteWhenHidden"),s(R("Captions (text cues for sounds)"),"captions"),this.buildGraphicsSection(),k("h2",{text:R("Controls")}),s(R("Left-handed layout"),"leftHanded"),s(R("Hold-to-steer off (toggle steering)"),"toggleSteer"),s(R("Haptics off"),"hapticsOff"),k("h2",{text:R("Accessibility")}),s(R("Larger text"),"largeText"),s(R("High contrast"),"highContrast"),s(R("Reduced motion (no shake/swoops/dense particles)"),"reducedMotion"),r(R("Color-vision palette"),"cvdPalette",[["default",R("Default")],["deuteranopia",R("Deuteranopia-safe")],["tritanopia",R("Tritanopia-safe")]]),s(R("Timing assist (wider landing forgiveness in practice)"),"timingAssist"),k("h2",{text:R("Data")}),s(R("Anonymous usage analytics (start/round-end/settings only)"),"analyticsConsent"),Ze(R("Replay tutorials from the start"),()=>this.actions.resetTutorials()),Ze(R("Back"),()=>e?e():this.actions.toTitle()));this.showScreen("Settings",a)}buildGraphicsSection(){let e=Af(Jl()),t=k("section",{id:"gfx-section",class:"gfx-section","aria-labelledby":"gfx-heading","data-options-graphics":""}),i=k("div",{class:"gfx-inner"});t.append(i);let s=()=>{this.actions.settingsChanged(),r()},r=()=>{let a=i.contains(document.activeElement)?document.activeElement.id:null,o=this.settings.graphics||(this.settings.graphics={}),l=this.actions.graphicsInfo?this.actions.graphicsInfo(e.sum):null,c=l?l.detected:"balanced",h=l?l.resolved:Xl(o,c);i.innerHTML="",i.append(k("h2",{id:"gfx-heading",text:e.graphics}));let d=k("select",{id:"gfx-preset","data-gfx":"preset","aria-label":e.quality});d.append(k("option",{value:"auto",text:e.auto.replace("{tier}",e[c])}));for(let S of Wn)d.append(k("option",{value:S,text:e[S]}));d.value=Wn.includes(o.preset)?o.preset:"auto",d.addEventListener("change",()=>{this.settings.graphics=ff(o,d.value),s()}),i.append(k("label",{class:"gfx-row"},k("span",{text:e.quality}),d));let u=Math.round((Number(o.render_scale)||1)*100),f=k("input",{id:"gfx-scale","data-gfx":"render_scale",type:"range",min:"50",max:"200",step:"5",value:String(u),"aria-label":e.renderScale}),g=k("output",{class:"gfx-scale-value",for:"gfx-scale",text:u+"%"});f.addEventListener("input",()=>{g.textContent=f.value+"%"}),f.addEventListener("change",()=>{o.render_scale=Number(f.value)/100,s()}),i.append(k("label",{class:"gfx-row gfx-slider"},k("span",{text:e.renderScale}),f,g));for(let[S,y]of Object.entries(ga)){let A=k("select",{id:"gfx-cat-"+S,"data-gfx-cat":S,"aria-label":e.cat[S]});A.append(k("option",{value:"",text:e.fromPreset.replace("{tier}",e.tier[pf(h.preset,S)])}));for(let M of y)A.append(k("option",{value:M,text:e.tier[M]}));A.value=y.includes(o[S])?o[S]:"",A.addEventListener("change",()=>{A.value?o[S]=A.value:delete o[S],s()}),i.append(k("label",{class:"gfx-row"},k("span",{text:e.cat[S]}),A))}let b=(S,y,A,M)=>{let C=k("input",{id:S,type:"checkbox","data-gfx":y,"aria-label":A});return C.checked=o[y]===void 0?M:!!o[y],C.addEventListener("change",()=>{o[y]=C.checked,s()}),k("label",{class:"row"},C,k("span",{text:A}))};i.append(b("gfx-adaptive","adaptive",e.adaptive,!0),b("gfx-fps","show_fps",e.showFps,!1));let m=k("p",{id:"gfx-summary",class:"muted small gfx-summary","aria-live":"polite"}),p=k("p",{id:"gfx-post-note",class:"small gfx-note",text:e.postFailed}),T=()=>{let S=this.actions.graphicsInfo?this.actions.graphicsInfo(e.sum):null;m.textContent=S?[S.gpu,S.level!=null?e.level.replace("{n}",S.level):null,S.summary].filter(Boolean).join(" \xB7 "):"",p.hidden=!(S&&S.postFailed)};T(),i.append(m,p),clearInterval(this._gfxTimer),this._gfxTimer=setInterval(()=>{t.isConnected?T():clearInterval(this._gfxTimer)},1e3),a&&document.getElementById(a)?.focus()};return r(),t}updateHud(e,t){if(this._hudArgs=e?[e,t]:null,!e){this.hud.hidden=!0,this.thumbTray.hidden=!0;return}let i=typeof t=="function"?t():t;this.hud.hidden=!1,this.thumbTray.hidden=!1,this.hudAlt.textContent=`${e.score.altitude} m`,this.hudScore.textContent=R("Score {n}",{n:e.score.altitude+e.score.chainBonus+e.score.tokens}),this.hudChain.textContent=e.chain>1?R("Chain \xD7{n}",{n:e.chain}):"",this.objectiveText.textContent=i,this.progressText.textContent=R("Altitude {alt} \xB7 motes {motes} \xB7 chain \xD7{chain}",{alt:e.score.altitude,motes:e.score.tokens/100,chain:e.chain}),this.boardMirror.textContent=Bs.boardMirror(e,R)}setStatus(e,t){this._status=[e,t],this.statusText.textContent=R(e,t)}setKeyLabels(e){this.keys=e}toast(e){this.toastEl||(this.toastEl=k("p",{class:"sh-toast",role:"status","aria-live":"polite"}),this.root.append(this.toastEl)),this.toastEl.textContent=e,this.toastEl.hidden=!1,clearTimeout(this._toastTimer),this._toastTimer=setTimeout(()=>{this.toastEl.hidden=!0},3200)}setSyncStatus(e){this._sync=e,this.syncText.textContent=R(Df[e]||e)}setActions(e){this._actions=e,this.actionsBox.innerHTML="",this.actionsBox.append(k("h2",{text:R("Actions")}));for(let[t,i,s]of e)this.actionsBox.append(Ze(R(t),i,s?"btn btn-primary btn-block":"btn btn-block"))}applySettings(){let e=this.settings;document.documentElement.classList.toggle("left-handed",!!e.leftHanded),document.documentElement.classList.toggle("large-text",!!e.largeText),document.documentElement.classList.toggle("high-contrast",!!e.highContrast),document.documentElement.classList.toggle("reduced-motion",!!e.reducedMotion)}};var Ql=class{constructor(e,t){this.settings=e,this.onCaption=t||(()=>{}),this.ctx=null,this.buses={},this.rng=Sa(658704),this.musicTimer=null,this.intensity=0,this.started=!1,this.sfxManifest=null,this.eventSamples=new Map,this.sfxBuffers=new Map,this.sfxPending=new Map}ensure(){if(this.ctx){this.ctx.state==="suspended"&&this.ctx.resume();return}let e=window.AudioContext||window.webkitAudioContext;if(!e)return;this.ctx=new e;let t=i=>{let s=this.ctx.createGain();return s.gain.value=i,s.connect(this.ctx.destination),s};this.buses={music:globalThis.GameOptions?globalThis.GameOptions.tagBus(t(this.settings.music),"music"):t(this.settings.music),effects:globalThis.GameOptions?globalThis.GameOptions.tagBus(t(this.settings.effects),"effects"):t(this.settings.effects),ambience:globalThis.GameOptions?globalThis.GameOptions.tagBus(t(this.settings.ambience),"ambience"):t(this.settings.ambience)},this.startAmbience(),this.startMusic(),this.loadSfxManifest()}applySettings(){this.ctx&&(this.buses.music.gain.value=this.settings.muted?0:this.settings.music,this.buses.effects.gain.value=this.settings.muted?0:this.settings.effects,this.buses.ambience.gain.value=this.settings.muted?0:this.settings.ambience)}setHidden(e){this.ctx&&(e&&this.settings.muteWhenHidden?this.ctx.suspend():this.ctx.resume())}caption(e){this.settings.captions&&this.onCaption(e)}blip(e,{type:t="sine",f0:i=440,f1:s=i,dur:r=.12,gain:a=.2,attack:o=.004}){if(!this.ctx)return;let l=this.ctx.currentTime,c=globalThis.GameOptions?globalThis.GameOptions.trackSource(this.ctx.createOscillator(),e):this.ctx.createOscillator(),h=this.ctx.createGain();c.type=t,c.frequency.setValueAtTime(i,l),c.frequency.exponentialRampToValueAtTime(Math.max(20,s),l+r),h.gain.setValueAtTime(0,l),h.gain.linearRampToValueAtTime(a,l+o),h.gain.exponentialRampToValueAtTime(1e-4,l+r),c.connect(h).connect(e),c.start(l),c.stop(l+r+.02)}noiseBurst(e,{dur:t=.15,gain:i=.15,freq:s=1200,q:r=1.2}){if(!this.ctx)return;let a=this.ctx.currentTime,o=Math.max(1,Math.floor(this.ctx.sampleRate*t)),l=this.ctx.createBuffer(1,o,this.ctx.sampleRate),c=l.getChannelData(0);for(let f=0;f<o;f++)c[f]=(Math.random()*2-1)*(1-f/o)**1.6;let h=globalThis.GameOptions?globalThis.GameOptions.trackSource(this.ctx.createBufferSource(),e):this.ctx.createBufferSource();h.buffer=l;let d=this.ctx.createBiquadFilter();d.type="bandpass",d.frequency.value=s,d.Q.value=r;let u=this.ctx.createGain();u.gain.value=i,h.connect(d).connect(u).connect(e),h.start(a)}variant(e){return e*(1+pi(this.rng,-.06,.06))}async loadSfxManifest(){if(!this.sfxManifest)try{let e=await fetch("sfx/manifest.json");if(!e.ok)return;let t=await e.json();if(!Array.isArray(t))return;this.sfxManifest=t;for(let i of t){if(!i||typeof i.name!="string"||typeof i.event!="string")continue;let s=this.eventSamples.get(i.event)||[];s.push(i.name),this.eventSamples.set(i.event,s)}}catch{}}loadSample(e){if(this.sfxBuffers.has(e))return Promise.resolve(this.sfxBuffers.get(e));if(this.sfxPending.has(e))return this.sfxPending.get(e);let t=fetch(`sfx/${e}.opus`).then(i=>{if(!i.ok)throw new Error("http "+i.status);return i.arrayBuffer()}).then(i=>this.ctx.decodeAudioData(i)).then(i=>(this.sfxBuffers.set(e,i),i)).catch(()=>(this.sfxBuffers.set(e,null),null)).finally(()=>{this.sfxPending.delete(e)});return this.sfxPending.set(e,t),t}playSample(e){let t=this.eventSamples.get(e);if(!t||!t.length)return!1;let i=t[Math.floor(pi(this.rng,0,t.length))%t.length],s=this.sfxBuffers.get(i);if(s){let r=globalThis.GameOptions?globalThis.GameOptions.trackSource(this.ctx.createBufferSource(),e):this.ctx.createBufferSource();return r.buffer=s,r.connect(this.buses.effects),r.start(),!0}return s===void 0&&this.loadSample(i),!1}play(e){if(!this.ctx||this.settings.muted){this.caption(e);return}let t=this.buses.effects;switch(e){case"bounce":this.playSample("bounce")||this.blip(t,{type:"triangle",f0:this.variant(300),f1:520,dur:.09,gain:.16}),this.caption("bounce");break;case"spring":this.playSample("spring")||this.blip(t,{type:"sine",f0:this.variant(240),f1:980,dur:.22,gain:.22}),this.caption("spring boost!");break;case"crumble":this.playSample("crumble")||this.noiseBurst(t,{dur:.12,gain:.14,freq:700,q:.8}),this.caption("petal breaks");break;case"token":this.playSample("token")||this.blip(t,{type:"sine",f0:this.variant(880),f1:1320,dur:.14,gain:.18}),this.caption("glow mote collected");break;case"combo":this.playSample("combo")||(this.blip(t,{type:"square",f0:520,f1:780,dur:.08,gain:.1}),this.blip(t,{type:"square",f0:780,f1:1170,dur:.12,gain:.1})),this.caption("chain bonus");break;case"milestone":this.playSample("milestone")||[523,659,784].forEach((i,s)=>setTimeout(()=>this.blip(this.buses.effects,{type:"sine",f0:i,dur:.18,gain:.16}),s*90)),this.caption("milestone reached");break;case"fall":this.playSample("fall")||this.blip(t,{type:"sawtooth",f0:500,f1:90,dur:.5,gain:.16}),this.caption("falling!");break;case"thorn":this.playSample("thorn")||(this.noiseBurst(t,{dur:.2,gain:.2,freq:300,q:2}),this.blip(t,{type:"sawtooth",f0:200,f1:60,dur:.3,gain:.14})),this.caption("thorns!");break;case"click":this.playSample("click")||this.blip(t,{type:"sine",f0:700,f1:700,dur:.04,gain:.08});break;case"goal":this.playSample("goal")||[523,659,784,1047].forEach((i,s)=>setTimeout(()=>this.blip(this.buses.effects,{type:"triangle",f0:i,dur:.22,gain:.16}),s*110)),this.caption("goal reached!");break}}startAmbience(){let e=this.ctx,t=e.sampleRate*3,i=e.createBuffer(1,t,e.sampleRate),s=i.getChannelData(0),r=0;for(let d=0;d<t;d++)r=r*.97+(Math.random()*2-1)*.05,s[d]=r;let a=globalThis.GameOptions?globalThis.GameOptions.trackSource(e.createBufferSource(),null):e.createBufferSource();a.buffer=i,a.loop=!0;let o=e.createBiquadFilter();o.type="lowpass",o.frequency.value=480;let l=e.createGain();l.gain.value=.5;let c=globalThis.GameOptions?globalThis.GameOptions.trackSource(e.createOscillator(),null):e.createOscillator();c.frequency.value=.07;let h=e.createGain();h.gain.value=.2,c.connect(h).connect(l.gain),a.connect(o).connect(l).connect(this.buses.ambience),a.start(),c.start()}startMusic(){if(this.musicTimer)return;let e=[261.6,311.1,392,466.2,523.3],t=0,i=()=>{if(this.ctx&&!this.settings.muted&&this.ctx.state==="running"){let s=.25+this.intensity*.6;if(pi(this.rng,0,1)<s){let r=e[Math.floor(pi(this.rng,0,e.length))%e.length]*(pi(this.rng,0,1)<.25+this.intensity*.3?2:1);this.blip(this.buses.music,{type:"sine",f0:r,dur:.5+this.intensity*.2,gain:.05+this.intensity*.05,attack:.05})}t%16===0&&this.blip(this.buses.music,{type:"triangle",f0:130.8,dur:1.8,gain:.05,attack:.3}),t++}this.musicTimer=setTimeout(i,330-this.intensity*120)};i()}setIntensity(e){this.intensity=Math.max(0,Math.min(1,e))}};var Nf={left:["ArrowLeft","KeyA"],right:["ArrowRight","KeyD"],pause:["Escape","KeyP"],undo:["KeyZ"]},Ft=()=>globalThis.StarHermit||null;function $y(n){let e={};for(let t of Object.keys(n))e[t]=n[t].slice();return e}var $l=class{constructor(){this.hosted=!1,this.slug=null,this.userId=null,this.daily=null,this.nickname=null,this.syncState="offline",this.onSync=null,this.onSignedOut=null,this.onConflict=null,this.controls=$y(Nf),this.playerId=null,this.playerName="Guest";try{this.playerId=localStorage.getItem("skybound-spring:guest-id"),this.playerId||(this.playerId="guest-"+Math.random().toString(36).slice(2,10),localStorage.setItem("skybound-spring:guest-id",this.playerId)),this.playerName=localStorage.getItem("skybound-spring:guest-name")||"Guest"}catch{this.playerId="guest-local"}let e=Ft();e&&(e.token||e.init(),e.on("saved",t=>this._setSync(t?"synced":"error")),e.on("saveconflict",()=>this._resolveConflict()),e.on("auth",t=>{let i=this.hosted;this._syncFromSdk(),i&&!t.signedIn&&(this.nickname=null,this.playerName="Guest",this._setSync("offline"),this.onSignedOut&&this.onSignedOut())}),this._syncFromSdk()),this.hosted&&(this.playerId=this.userId,this.nickname=R("Player {id}",{id:this.userId.slice(0,6)}),this.playerName=this.nickname,this.syncState="local")}_syncFromSdk(){let e=Ft();this.hosted=!!(e&&e.signedIn&&e.userId),this.userId=this.hosted?String(e.userId):null,this.slug=e?e.slug:null}get token(){let e=Ft();return e?e.token:null}canSignIn(){let e=Ft();return!!(e&&e.canSignIn())}signIn(){let e=Ft();return!!(e&&e.signIn())}inviteLink(){return this.hosted?Ft().inviteLink():null}setPlayerName(e){if(!this.hosted&&typeof e=="string"&&e.trim()&&e.length<=32){this.playerName=e.trim();try{localStorage.setItem("skybound-spring:guest-name",this.playerName)}catch{}}}async fetchProfile(){if(!this.hosted)return this.playerName;let e=await Ft().profile().catch(()=>null);return e&&(this.nickname=e.displayName.slice(0,32),this.playerName=this.nickname),this.nickname}async profileName(e){let t=String(e||"");if(!t)return R("Player");let i=this.hosted?await Ft().profile(t).catch(()=>null):null;return i?i.displayName.slice(0,32):R("Player {id}",{id:t.slice(0,6)})}_setSync(e){this.syncState=e,this.onSync&&this.onSync(e)}queueCloudSave(e){if(!this.hosted){this.syncState!=="offline"&&this._setSync("offline");return}this._setSync("saving"),Ft().saveJSON({v:1,savedAt:Date.now(),progress:e})}saveConflicted(){let e=Ft();return!!(e&&typeof e.saveConflicted=="function"&&e.saveConflicted())}async _resolveConflict(){if(!this.hosted)return;this._setSync("saving");let e=await Ft().loadJSON().catch(()=>null),t=Ft();if(this.saveConflicted()||t.saveLoadFailed&&t.saveLoadFailed()){this._setSync("error");return}this.onConflict&&this.onConflict(e&&e.progress?e.progress:null)}flushCloud(){return this.hosted?Ft().flushSave(!0):Promise.resolve(!1)}async loadCloudSave(){if(!this.hosted)return null;this._setSync("saving");let e=await Ft().loadJSON().catch(()=>null);return this._setSync(e?"synced":"local"),e&&e.progress?e.progress:null}async loadSettings(){return this.hosted?await Ft().getSettings().catch(()=>null)||{}:{}}pushSettings(e){this.hosted&&Ft().patchSettings({...e})}async loadControls(){return this.hosted&&(this.controls=await Ft().loadBindings(Nf).catch(()=>this.controls)),this.controls}actionFor(e){for(let t of Object.keys(this.controls))if(this.controls[t].includes(e))return t;return null}keyLabel(e){let t={ArrowLeft:"\u2190",ArrowRight:"\u2192",ArrowUp:"\u2191",ArrowDown:"\u2193",Escape:"Esc"};return(this.controls[e]||[]).map(i=>t[i]||i.replace(/^Key|^Digit/,"")).join(" / ")}async submitScore(e){if(!this.hosted)return{posted:!1,rank:null};let t=Ft();try{if(!(await t.submitScores({"high-score":e})||[]).includes("high-score"))return{posted:!1,rank:null};try{let r=((await t.leaderboard("high-score",{pageSize:100})).items||[]).find(a=>String(a.userId)===this.userId);return{posted:!0,rank:r?r.rank:null}}catch{return{posted:!0,rank:null}}}catch{return{posted:!1,rank:null}}}async leaderboard(e="global",t=[]){if(this.hosted){let i=await Ft().leaderboard(null,{pageSize:10,scope:t.length?"friends":void 0}).catch(()=>null);if(!i||!i.board)return{ok:!1,error:"no platform leaderboard",entries:[]};let s=[];for(let r of(i.items||[]).slice(0,10))s.push({name:await this.profileName(r.userId),score:r.score,rank:r.rank});return{ok:!0,entries:s,scope:e}}return{ok:!1,error:"offline",entries:[]}}async unlockAchievement(e){return{ok:!0,local:!0,key:e}}};var Bh=1,kh="skybound-spring:";function Uf(n){return ri(n).toString(16).padStart(8,"0")}function ya(n,e){try{let t=JSON.stringify({v:Bh,data:e});return localStorage.setItem(kh+n,JSON.stringify({payload:t,checksum:Uf(t)})),!0}catch{return!1}}function tc(n,e){try{let t=localStorage.getItem(kh+n);if(!t)return null;let i=JSON.parse(t);if(!i||Uf(i.payload)!==i.checksum)return localStorage.setItem(kh+n+".corrupt",t),null;let s=JSON.parse(i.payload);return s.v!==Bh&&(!e||(s=e(s),!s||s.v!==Bh))?null:s.data}catch{return null}}var t_=new Set(["start","tutorial-step","round-end","retry","settings-change","error-category"]),ec=class{constructor(e){this.consent=!!e,this.sessionId="s-"+Math.random().toString(36).slice(2,10),this.buffer=tc("analytics-buffer",null)||[]}setConsent(e){this.consent=!!e}track(e,t={}){!this.consent||!t_.has(e)||(this.buffer.push({t:Date.now(),session:this.sessionId,event:e,data:t}),this.buffer.length>200&&this.buffer.splice(0,100),ya("analytics-buffer",this.buffer))}flush(){this.buffer=[],ya("analytics-buffer",this.buffer)}},ks=class{constructor(e,t={}){this.cfg=e,this.mode=t.mode||"practice",this.ranked=!!t.ranked,this.allowUndo=!!t.allowUndo,this.onEvents=t.onEvents||(()=>{}),this.runId="run-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8),this.cmdCounter=0,this.state=rc(e),this.initialHash=Zn(this.state),this.commands=[],this.hashes=[{tick:0,hash:this.initialHash}],this.undoStack=[],this.tutorialEvents=[],this.finished=!1}get terminal(){return this.state.terminal}steer(e){if(this.state.dir===e||this.finished)return!0;let t={id:`${this.runId}:${this.cmdCounter++}`,tick:this.state.tick+1,type:"steer",dir:e};return Gs(this.state,t).invalidReason?!1:(this.commands.push(t),!0)}tick(){if(this.finished)return;let e=!!this.state.terminal,t=ac(this.state);for(let i of t)this.tutorialEvents.push({...i,tick:this.state.tick,dir:this.state.dir}),(i.type==="land"||i.type==="spring")&&this.allowUndo&&(this.undoStack.push(su(this.state)),this.undoStack.length>24&&this.undoStack.shift());t.length&&this.onEvents(t,this.state),this.state.tick%240===0&&this.hashes.push({tick:this.state.tick,hash:Zn(this.state)}),this.state.terminal&&!e&&(this.finished=!0,this.hashes.push({tick:this.state.tick,hash:Zn(this.state)}))}undo(){if(!this.allowUndo||this.undoStack.length===0)return!1;let e=this.undoStack.pop();return this.state=ru(e),this.finished=!1,this.commands=this.commands.filter(t=>t.tick<=this.state.tick),this.hashes=this.hashes.filter(t=>t.tick<=this.state.tick),!0}buildEnvelope(){return{schemaVersion:1,buildVersion:eu,contentVersion:1,seed:this.cfg.seed,settings:{difficulty:this.cfg.difficulty,goal:this.cfg.goal,moveLimitTicks:this.cfg.moveLimitTicks||0,mechanics:this.cfg.mechanics,assists:this.cfg.assists||[]},initialHash:this.initialHash,timestampOffset:0,commands:[...this.commands],hashes:[...this.hashes],terminal:this.state.terminal,scoreComponents:{...this.state.score,total:Hs(this.state)},checksum:Zn(this.state)}}static replaySettle(e){let t={seed:e.seed,difficulty:e.settings.difficulty,goal:e.settings.goal,moveLimitTicks:e.settings.moveLimitTicks||0,mechanics:e.settings.mechanics},i=iu(t,e.commands);return{...i,matchesTerminal:i.hash===e.checksum,periodicOk:(e.hashes||[]).every(s=>typeof s.hash=="string"&&Number.isInteger(s.tick))}}};function Ff(){return tc("progress",n=>n.v===0?{v:1,data:{stagesCompleted:{},bests:{},achievements:{},daysPlayed:[],tutorialsDone:[]}}:null)||{stagesCompleted:{},bests:{},achievements:{},daysPlayed:[],tutorialsDone:[]}}function zs(n){ya("progress",n)}function zh(n,e){let t=c=>c&&typeof c=="object"?c:{},i=c=>c&&typeof c=="object"&&!Array.isArray(c)?c:{},s=c=>Array.isArray(c)?c:[],r=t(n),a=t(e),o=(c,h)=>{let d={...i(c)};for(let[u,f]of Object.entries(i(h)))Number(d[u])>=Number(f)||(d[u]=f);return d},l={...i(r.achievements)};for(let[c,h]of Object.entries(i(a.achievements)))(!l[c]||h&&Number(h)<Number(l[c]))&&(l[c]=h);return{...r,...a,stagesCompleted:o(r.stagesCompleted,a.stagesCompleted),bests:o(r.bests,a.bests),achievements:l,daysPlayed:[...new Set([...s(r.daysPlayed),...s(a.daysPlayed)])].sort(),tutorialsDone:[...new Set([...s(r.tutorialsDone),...s(a.tutorialsDone)])]}}function Of(n,e,t,i,s){let r=s&&s.reason==="goal-reached";if(e==="journey"){let c=n.stagesCompleted[t]||0;r&&i>c&&(n.stagesCompleted[t]=i)}let a=n.bests[e]||0,o=i>a;o&&(n.bests[e]=i);let l=new Date().toISOString().slice(0,10);return n.daysPlayed.includes(l)||n.daysPlayed.push(l),zs(n),{completed:r,isBest:o,prevBest:a,best:Math.max(a,i)}}function Bf(n,e){let t=[],i=s=>{n.achievements[s]||(n.achievements[s]=Date.now(),t.push(s))};return(e.completed||e.altitude>=300)&&i("first-ascent"),e.springs>=25&&i("spring-master"),e.maxChain>=30&&i("streak-tender"),e.completed&&e.difficulty==="storm"&&i("storm-summit"),n.daysPlayed.length>=7&&i("evergreen"),zs(n),t}var i_={boot:"Loading",title:"Title screen",preparing:"Preparing the run",countdown:"Countdown",active:"Climbing",paused:"Paused",resolving:"Scoring the run",results:"Results"},n_=n=>typeof n.label=="function"?n.label():n.label,kf={music:.5,effects:.7,ambience:.4,muted:!1,muteWhenHidden:!0,captions:!1,graphics:{...Wl},leftHanded:!1,toggleSteer:!1,hapticsOff:!1,largeText:!1,highContrast:!1,reducedMotion:!1,cvdPalette:"default",timingAssist:!1,analyticsConsent:!1};function s_(){let n=tc("settings",null)||{},e={...kf,...n};return e.graphics={...Wl,...n.graphics&&typeof n.graphics=="object"?n.graphics:{}},delete e.quality,e}var Vh=class{constructor(e){this.state="boot",this.settings=s_(),this.progress=Ff(),this.platform=new $l,this.analytics=new ec(this.settings.analyticsConsent),this.actions=this.makeActions(),this.ui=new jl(e,this.actions,this.settings),this.platform.onSync=t=>this.ui.setSyncStatus(t),this.platform.onSignedOut=()=>{this.ui.toast(this.ui.sh.signedOut),this.ui.setStatus("Offline mode \u2014 practice and local daily fully playable."),this.state==="title"&&this.toTitle("signed out")},this.audio=new Ql(this.settings,t=>this.ui.caption(t)),this.renderer=null,this.session=null,this.runMeta=null,this.keys=new Set,this.touchDir=0,this.accumulator=0,this.lastFrame=0,this.hiddenAt=null,this.replayPlayback=null,this.tutorial=null}setState(e,t){this.state=e,this.stateReason=t,this.ui.setStatus(i_[e]||e)}async start(){this.setState("boot","initial load"),this.ui.screens.innerHTML='<div class="screen open"><div class="panel"><h1>Skybound Spring</h1><p></p><progress></progress></div></div>',this.ui.screens.querySelector("p").textContent=R("Loading the garden\u2026");let e=document.getElementById("scene-host");if(this.renderer=new Bs(e,{settings:this.settings,onContextLost:()=>{this.state==="active"&&this.pause("webgl context lost"),this.ui.announceError(R("Graphics context lost \u2014 your run is paused and safe. Restoring\u2026"))},onContextRestored:()=>{this.ui.announce(R("Graphics restored."))}}),!this.renderer.ok){this.ui.screens.innerHTML="",this.ui.showScreen("Compatibility",this.compatPanel());return}if(this.applyTheme(Jt[0]),window.addEventListener("resize",()=>this.renderer.resize()),window.addEventListener("orientationchange",()=>setTimeout(()=>this.renderer.resize(),60)),document.addEventListener("visibilitychange",()=>this.onVisibility()),window.addEventListener("pagehide",()=>this.platform.flushCloud()),this.bindInput(),this.platform.hosted){this.platform.fetchProfile().then(()=>{this.ui.setStatus("Online as {name} \u2014 cloud save active.",{name:this.platform.nickname})}),this.platform.onConflict=s=>this.adoptRemote(s,!0);let t=await this.platform.loadCloudSave();t&&(this.adoptRemote(t,!1),this.ui.announce(R("Cloud progress loaded.")));let i=await this.platform.loadSettings();if(Object.keys(i).length){for(let s of Object.keys(kf))i[s]!==void 0&&i[s]!==null&&(this.settings[s]=i[s]);this.settings.graphics={...Wl,...this.settings.graphics||{}},this.applySettingsLocal()}await this.platform.loadControls(),this.ui.setKeyLabels(this.keyLabels()),this.ui.setStatus("Online \u2014 cloud save active.")}else this.ui.setStatus("Offline mode \u2014 practice and local daily fully playable.");this.toTitle("boot complete"),requestAnimationFrame(t=>this.frame(t))}adoptRemote(e,t){let i=zh(e,this.progress),s=JSON.stringify(zh(e,null))!==JSON.stringify(i);for(let r of Object.keys(this.progress))delete this.progress[r];Object.assign(this.progress,i),zs(this.progress),(s||t)&&!this.platform.saveConflicted()&&this.platform.queueCloudSave(this.progress),this.state==="title"&&this.ui.showTitle(this.titleData())}applySettingsLocal(){ya("settings",this.settings),this.ui.applySettings(),this.audio.applySettings(),this.analytics.setConsent(this.settings.analyticsConsent),this.renderer&&(this.renderer.settings=this.settings,this.renderer.setGraphics(this.settings.graphics))}keyLabels(){let e=this.platform;return{left:e.keyLabel("left"),right:e.keyLabel("right"),pause:e.keyLabel("pause"),undo:e.keyLabel("undo")}}compatPanel(){let e=document.createElement("div");e.className="panel";let t=document.createElement("h1");t.textContent=R("Compatibility");let i=document.createElement("p");return i.textContent=R("Skybound Spring needs WebGL. Your progress and settings are preserved in this browser; the game is unplayable without 3D."),e.append(t,i),e}applyTheme(e){let t=typeof e=="string"?Jt.find(i=>i.key===e):e;this.renderer.setTheme(t||Jt[0])}toTitle(e){clearInterval(this._cd),this.setState("title",e),this.session=null,this.tutorial=null,this.replayPlayback=null,this.ui.updateHud(null),this.ui.hideTutorialOverlay(),this.ui.showTitle(this.titleData()),this.ui.setActions([["Play",()=>this.actions.quickPlay(),!0],["Journey",()=>this.actions.openJourney()],["Settings",()=>this.ui.showSettings()]])}titleData(){return{progress:this.progress,daily:cc(),name:this.platform.hosted?this.platform.nickname:null,canSignIn:this.platform.canSignIn(),inviteLink:this.platform.inviteLink()}}goalText(e,t){return!e.goal||e.goal.type==="none"?R("{label}: climb as high as you can.",{label:t}):e.goal.type==="altitude"?e.goal.timeLimitTicks?R("{label}: reach {n}m altitude in {s}s.",{label:t,n:e.goal.target,s:Math.round(e.goal.timeLimitTicks/120)}):R("{label}: reach {n}m altitude.",{label:t,n:e.goal.target}):R("{label}: collect {n} glow motes.",{label:t,n:e.goal.target})}startRun(e,t){let i={...e};e={...e};let s=[];this.settings.timingAssist&&t.mode==="practice"&&typeof e.difficulty=="string"&&(e={...e,difficulty:{...si[e.difficulty],gravity:si[e.difficulty].gravity*.92}},s.push("timing")),e.assists=s,this.setState("preparing",t.reason||"run setup"),this.session=new ks(e,{mode:t.mode,ranked:t.ranked&&!s.length,allowUndo:t.allowUndo,onEvents:(a,o)=>this.onSimEvents(a,o)}),this.runMeta={...t,cfg:i},this.applyTheme(t.theme||Jt[0]),this.ui.closeScreen(),this.analytics.track("start",{mode:t.mode});let r=3;this.setState("countdown","pre-run countdown"),this.ui.showCountdown(r),clearInterval(this._cd),this._cd=setInterval(()=>{r--,this.audio.ensure(),this.audio.play("click"),r<0?(clearInterval(this._cd),this.ui.closeScreen(),this.setState("active","countdown finished"),this.deriveActions()):this.ui.showCountdown(r)},650)}pause(e){this.state==="active"&&(this.setState("paused",e),this.ui.showPause({mode:this.runMeta.label,ranked:this.session.ranked,allowUndo:this.session.allowUndo,tick:this.session.state.tick}),this.analytics.track("pause",{mode:this.runMeta.mode}))}resume(e){this.state==="paused"&&(this.ui.closeScreen(),this.setState("active",e||"player resumed"))}finishRun(){this.setState("resolving","terminal state reached");let e=this.session.state,t=this.runMeta,i={...e.score,total:Hs(e)},s={completed:e.terminal.reason==="goal-reached",altitude:i.altitude,springs:this.session.tutorialEvents.filter(h=>h.type==="spring").length,maxChain:Math.max(...this.session.tutorialEvents.map(h=>h.chain||0),0),difficulty:t.cfg.difficulty},r=t.stageId||t.mode,a=Of(this.progress,t.mode,r,i.total,e.terminal),o=Bf(this.progress,s);this.platform.queueCloudSave(this.progress);for(let h of o){let d=qs.find(u=>u.key===h);this.ui.announce(R("Achievement unlocked: {name}!",{name:d?R(d.name):h})),this.platform.unlockAchievement(h)}this.analytics.track("round-end",{mode:t.mode,score:i.total,reason:e.terminal.reason});let l=this.platform.hosted&&["journey","daily","challenge"].includes(t.mode);this.setState("results","run resolved");let c=this.nextRecommendedAction(t,a);this.ui.showResults({score:i,terminal:e.terminal,isBest:a.isBest,best:a.best,prevBest:a.prevBest,newAchievements:o,nextAction:c,modeLabel:t.label,par:t.par,postLeaderboard:l}),l&&this.platform.submitScore(i.total).then(h=>this.ui.setLeaderboardResult(h)),this.ui.setActions([["Retry",()=>this.actions.restartRun(),!0],["Title",()=>this.toTitle("results done")]])}nextRecommendedAction(e,t){if(e.mode==="journey"&&t.completed&&e.stage){let i=lc(Math.min(e.stage.index+1,Ws-1));if(e.stage.index+1<Ws)return{label:()=>R("Next: {name}",{name:Kl(i)}),fn:()=>this.actions.playStage(i)}}return e.mode==="tutorial"?{label:()=>R("More lessons"),fn:()=>this.actions.openLearn()}:{label:()=>R("Journey"),fn:()=>this.actions.openJourney()}}startTutorial(e){let t={seed:e.seed,difficulty:e.difficulty,goal:e.goal,mechanics:e.mechanics};this.tutorial={def:e,stepIdx:0,steerTicks:0,counted:0},this.startRun(t,{mode:"tutorial",label:()=>R("Lesson: {name}",{name:R(e.name)}),theme:e.theme,ranked:!1,allowUndo:!1,reason:"tutorial start"}),this.ui.showTutorialOverlay(e.steps[0].text,0,e.steps.length),this.ui.announce(R(e.steps[0].text))}tutorialTick(){let e=this.tutorial;if(!e)return;let t=e.def.steps[e.stepIdx],i=this.session.tutorialEvents,s=!1;if(t.check.event?(e.counted=i.filter(r=>r.type===t.check.event).length,s=e.counted>=t.check.count):t.check.steerDir!==void 0&&(this.session.state.dir===t.check.steerDir&&e.steerTicks++,s=e.steerTicks>=t.check.ticks),s){if(e.stepIdx++,e.steerTicks=0,this.analytics.track("tutorial-step",{lesson:e.def.id,step:e.stepIdx}),e.stepIdx>=e.def.steps.length){this.progress.tutorialsDone.includes(e.def.id)||(this.progress.tutorialsDone.push(e.def.id),zs(this.progress),this.platform.queueCloudSave(this.progress)),this.ui.hideTutorialOverlay(),this.ui.announce(R("Lesson complete! Keep climbing to finish the run.")),this.tutorial=null;return}this.ui.showTutorialOverlay(e.def.steps[e.stepIdx].text,e.stepIdx,e.def.steps.length),this.ui.announce(R(e.def.steps[e.stepIdx].text))}}onSimEvents(e,t){this.renderer.handleEvents(e,t);for(let i of e){switch(i.type){case"land":this.audio.play("bounce"),i.chain>0&&i.chain%8===0&&(this.audio.play("combo"),this.ui.announce(R("Chain \xD7{n}",{n:i.chain})));break;case"spring":this.audio.play("spring");break;case"token":this.audio.play("token");break;case"thorn":this.audio.play("thorn");break;case"terminal":i.reason==="goal-reached"?this.audio.play("goal"):i.reason==="fell"?this.audio.play("fall"):i.reason==="hazard"&&this.audio.play("thorn"),this.audio.play("milestone");break}if(i.type==="land"){let s=t.platforms.find(r=>r.id===i.id);s&&!s.alive&&this.audio.play("crumble")}}!this.settings.hapticsOff&&navigator.vibrate&&e.some(i=>i.type==="spring")&&navigator.vibrate(15)}bindInput(){let e=o=>(this.platform.controls[o]||[]).some(l=>this.keys.has(l)),t=()=>{let o=e("left");return(e("right")?1:0)-(o?1:0)};window.addEventListener("keydown",o=>{if(o.repeat)return;this.keys.add(o.code);let l=this.platform.actionFor(o.code);if(l==="pause"){this.state==="active"?this.pause("keyboard"):this.state==="paused"&&this.resume("keyboard");return}if(l==="undo"&&this.state==="active"&&this.session&&this.session.allowUndo){this.actions.undo();return}(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Space"].includes(o.code)||l==="left"||l==="right")&&["active","countdown"].includes(this.state)&&o.preventDefault()}),window.addEventListener("keyup",o=>this.keys.delete(o.code)),window.addEventListener("blur",()=>this.keys.clear());let i=document.getElementById("scene-host"),s=this.renderer&&this.renderer.domElement,r=null;i.addEventListener("pointerdown",o=>{o.target===s&&(r={id:o.pointerId,x0:o.clientX,x:o.clientX,moved:!1},i.setPointerCapture(o.pointerId))}),i.addEventListener("pointermove",o=>{if(!r||o.pointerId!==r.id)return;r.x=o.clientX;let l=r.x-r.x0;Math.abs(l)>24&&(r.moved=!0),this.touchDir=r.moved?Math.abs(l)<24?0:Math.sign(l):0});let a=o=>{r&&o.pointerId===r.id&&(r=null,this.touchDir=0)};i.addEventListener("pointerup",a),i.addEventListener("pointercancel",a),i.addEventListener("lostpointercapture",a),this._keyDir=t,this._gamepadTimer=0}pollGamepad(){let e=navigator.getGamepads?navigator.getGamepads():[];for(let t of e){if(!t||!t.connected)continue;let i=t.axes[0]||0,r=(t.buttons[15]&&t.buttons[15].pressed?1:0)-(t.buttons[14]&&t.buttons[14].pressed?1:0)||(Math.abs(i)>.3?Math.sign(i):0);if(t.buttons[9]&&t.buttons[9].pressed){let a=performance.now();a-this._gamepadTimer>400&&(this._gamepadTimer=a,this.state==="active"?this.pause("gamepad"):this.state==="paused"&&this.resume("gamepad"))}return r}return 0}onVisibility(){if(document.hidden)this.audio.setHidden(!0),this.platform.flushCloud(),this.state==="active"&&(this.hiddenAt=Date.now(),this.pause("tab hidden"));else if(this.audio.setHidden(!1),this.hiddenAt&&this.state==="paused"){let e=(Date.now()-this.hiddenAt)/1e3;this.hiddenAt=null,e>5&&this.ui.showAwaySummary(e,this.session?this.session.state.score.altitude:0)}}frame(e){requestAnimationFrame(s=>this.frame(s));let t=Math.min(.1,(e-this.lastFrame)/1e3||.016);if(this.lastFrame=e,this.state==="active"&&this.replayPlayback){this.replayTick(),this.renderer.render(this.session?this.session.state:null,t,document.hidden);return}if(this.state==="active"&&this.session&&!document.hidden){let s=this._keyDir()||this.touchDir||this.pollGamepad();this.settings.toggleSteer?(s!==0&&(this._toggleDir=s),this._toggleDir!==void 0&&(s=this._toggleDir)):this._toggleDir=void 0,this.session.steer(s),this.accumulator+=t;let r=1/120,a=0;for(;this.accumulator>=r&&a<12;)this.session.tick(),this.accumulator-=r,a++;a>=12&&(this.accumulator=0),this.tutorialTick(),this.audio.setIntensity(Math.min(1,this.session.state.score.altitude/1500)),this.ui.updateHud(this.session.state,()=>this.goalText(this.runMeta.cfg,n_(this.runMeta))),this.session.terminal&&this.finishRun()}let i=this.session?this.session.state:null;this.renderer.render(i,t,document.hidden)}deriveActions(){this.ui.setActions([["Pause (P)",()=>this.actions.pause(),!0],...this.session&&this.session.allowUndo?[["Undo (Z)",()=>this.actions.undo()]]:[],["Restart",()=>this.actions.restartRun()],["Leave",()=>this.actions.leaveRun()]])}makeActions(){return{quickPlay:()=>{this.analytics.track("retry",{via:"quick-play"});let e=Xs(),t=e.find((i,s)=>s===0||this.progress.stagesCompleted[e[s-1].id]&&!this.progress.stagesCompleted[i.id])||e[0];this.actions.playStage(t)},openJourney:()=>this.ui.showJourney(this.progress),openLearn:()=>this.ui.showLearn(this.progress),openPractice:()=>this.ui.showPractice(),openChallenges:()=>this.ui.showChallenges(),openProfile:()=>this.ui.showProfile({progress:this.progress,platform:this.platform}),toTitle:()=>this.toTitle("navigation"),playStage:e=>{this.startRun({seed:e.seed,difficulty:e.difficulty,goal:e.goal,mechanics:e.mechanics},{mode:"journey",label:()=>Kl(e),theme:e.theme,ranked:!1,allowUndo:!1,stage:e,stageId:e.id,par:e.parSeconds,reason:"journey stage selected"}),e.tutorial&&!this.progress.tutorialsDone.includes(e.tutorial)&&Ma.find(i=>i.id===e.tutorial)&&this.ui.announce(R("Tip: a lesson for this mechanic is available in Learn."))},playDaily:()=>{let e=cc();this.startRun({seed:e.seed,difficulty:e.difficulty,goal:{type:"none",target:0},mechanics:["bud","drift","crumb","spring","wisp","thorn"]},{mode:"daily",label:()=>e.date?R("Daily {date}",{date:e.date}):R("Daily challenge"),theme:e.theme,ranked:!1,allowUndo:!1,reason:"daily start"})},playPractice:(e,t)=>{this.startRun({seed:t,difficulty:e,goal:{type:"none",target:0}},{mode:"practice",label:()=>R("Practice ({tier})",{tier:R(si[e].label)}),theme:Jt[t%Jt.length].key,ranked:!1,allowUndo:!0,reason:"practice start"})},playChallenge:e=>{this.startRun({seed:e.seed,difficulty:e.difficulty,goal:e.goal,moveLimitTicks:e.moveLimitTicks||0},{mode:"challenge",label:()=>R("Challenge: {name}",{name:R(e.name)}),theme:e.theme,ranked:!1,allowUndo:!1,reason:"challenge start"})},playTutorial:e=>this.startTutorial(e),skipTutorial:()=>{this.tutorial=null,this.ui.hideTutorialOverlay()},pause:()=>this.pause("player"),resume:()=>this.resume("player"),leaveRun:()=>this.toTitle("run left"),restartRun:()=>{if(!this.runMeta)return this.toTitle("no run");this.analytics.track("retry",{mode:this.runMeta.mode});let e=this.runMeta;e.mode==="journey"&&e.stage?this.actions.playStage(e.stage):this.startRun({...e.cfg},{...e,reason:"retry"})},replayRun:()=>{if(!this.session)return;let e=this.session.buildEnvelope(),t=ks.replaySettle(e);this.ui.announce(t.matchesTerminal?R("Replay verified: identical end state, score {n}.",{n:t.score.total}):R("Replay mismatch \u2014 local only.")),this.ui.closeScreen(),this.setState("active","replay playback");let i={...this.runMeta.cfg};this.session=new ks(i,{mode:this.runMeta.mode,ranked:!1,allowUndo:!1,onEvents:(s,r)=>this.onSimEvents(s,r)}),this.replayPlayback={commands:e.commands,idx:0,speed:4}},undo:()=>{this.session&&this.session.undo()&&this.ui.announce(R("Undone to last landing."))},steerStart:e=>{this.touchDir=e},steerStop:()=>{this.touchDir=0},settingsChanged:()=>{this.applySettingsLocal(),this.platform.pushSettings(this.settings),this.analytics.track("settings-change",{})},signIn:()=>this.platform.signIn(),copyInvite:async()=>{let e=this.platform.inviteLink();if(e)try{await navigator.clipboard.writeText(e),this.ui.toast(this.ui.sh.copied)}catch{this.ui.toast(this.ui.sh.copyFailed+": "+e)}},graphicsInfo:e=>this.renderer&&this.renderer.ok?this.renderer.graphicsInfo(e):null,resetTutorials:()=>{this.progress.tutorialsDone=[],zs(this.progress),this.platform.queueCloudSave(this.progress),this.ui.announce(R("Tutorials reset \u2014 find them under Learn."))}}}replayTick(){let e=this.replayPlayback;if(e){for(let t=0;t<e.speed&&!this.session.terminal;t++){for(;e.idx<e.commands.length&&e.commands[e.idx].tick<=this.session.state.tick+1;)Gs(this.session.state,e.commands[e.idx]),e.idx++;this.session.tick()}if(this.session.terminal){let t=this.session.state;this.replayPlayback=null,this.finishRun()}}}},zf=new Vh(document.getElementById("app"));window.__game=zf;zf.start().catch(n=>{console.error(n),document.getElementById("app").innerHTML='<div class="screen open"><div class="panel"><h1>Skybound Spring</h1><p></p></div></div>',document.querySelector("#app .panel p").textContent=R("Failed to start: {error}",{error:String(n&&n.message||n)})});
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
