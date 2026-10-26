// Server-side image analysis. Never expose OPENAI_API_KEY in browser code.
const GROUPS = ['Cased caddisfly','Caseless caddisfly','Mayfly (Ephemeridae)','Blue-winged olive (Ephemerellidae)','Flat-bodied stone clinger (Heptageniidae)','Olives (Baetidae)','Stoneflies (Plecoptera)','Freshwater shrimp'];
const LIMIT=7*1024*1024;
const response=(status,obj)=>new Response(JSON.stringify(obj),{status,headers:{'content-type':'application/json','cache-control':'no-store','access-control-allow-origin':'*'}});
export default async (request)=>{
  if(request.method!=='POST')return response(405,{error:'POST an image.'});
  const key=process.env.OPENAI_API_KEY;
  if(!key)return response(503,{error:'AI is not configured on the host.'});
  try{
    const form=await request.formData();const file=form.get('image');
    if(!(file instanceof File)||!['image/jpeg','image/png','image/webp'].includes(file.type))return response(400,{error:'Use a JPEG, PNG or WebP photo.'});
    if(file.size>LIMIT)return response(413,{error:'Image too large (7 MB maximum).'});
    const bytes=new Uint8Array(await file.arrayBuffer());
    const b64=Buffer.from(bytes).toString('base64');
    const instruction=`You are assisting a UK Riverfly Monitoring Initiative field recorder. Inspect the provided sample photograph. Return a JSON object with a suggestions array containing ONLY visually supported groups from this exact list: ${JSON.stringify(GROUPS)}. Each item has group (exact string), count (nonnegative integer: number of DISTINCT VISIBLE individuals, not inferred totals), notes (short uncertainty/visibility caveat). Also include overall_notes (string). Do not hallucinate taxa. Distinguishing closely related aquatic larvae from a photo may be impossible; omit uncertain groups or clearly flag uncertainty. Do not infer whole-sample abundance. If photo is unsuitable return empty suggestions. Do not claim scientific verification.`;
    const ai=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{authorization:`Bearer ${key}`,'content-type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_VISION_MODEL||'gpt-4.1-mini',max_output_tokens:900,input:[{role:'user',content:[{type:'input_text',text:instruction},{type:'input_image',image_url:`data:${file.type};base64,${b64}`}]}],text:{format:{type:'json_schema',name:'riverfly_analysis',strict:true,schema:{type:'object',additionalProperties:false,properties:{suggestions:{type:'array',items:{type:'object',additionalProperties:false,properties:{group:{type:'string',enum:GROUPS},count:{type:'integer'},notes:{type:'string'}},required:['group','count','notes']}},overall_notes:{type:'string'}},required:['suggestions','overall_notes']}}}})});
    if(!ai.ok)return response(502,{error:'AI service unavailable. Try again later.'});
    const data=await ai.json();const raw=(data.output||[]).flatMap(o=>o.content||[]).filter(c=>c.type==='output_text').map(c=>c.text).join('');
    const parsed=JSON.parse(raw);const suggestions=(parsed.suggestions||[]).filter(x=>GROUPS.includes(x.group)&&Number.isInteger(x.count)&&x.count>=0).map(x=>({group:x.group,count:x.count,notes:String(x.notes||'').slice(0,350)}));
    return response(200,{suggestions,overall_notes:String(parsed.overall_notes||'').slice(0,800),disclaimer:'AI counts visible individuals only. Confirm before recording.'});
  }catch(e){return response(500,{error:'Could not analyse this photograph. Try a smaller clear image.'});}
};
