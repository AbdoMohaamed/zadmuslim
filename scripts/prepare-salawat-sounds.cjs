// Convert local MP3 reminders to PCM WAV for iOS. Uses an installed Playwright browser.
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.ZAD_PLAYWRIGHT_MODULE || 'playwright');
const root=path.resolve(__dirname,'..');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
const page=await browser.newPage();fs.mkdirSync(path.join(root,'assets/audio/notifications'),{recursive:true});
for(const [input,output]of [['salawat','salawat'],['salawat-1','salawat_1'],['salawat-2','salawat_2']]){
 const raw=fs.readFileSync(path.join(root,'assets/audio',input+'.mp3')).toString('base64');
 const result=await page.evaluate(async base64=>{const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));const ctx=new AudioContext({sampleRate:22050});const decoded=await ctx.decodeAudioData(bytes.buffer);if(decoded.duration>=30)throw Error('Sound must be under 30 seconds: '+decoded.duration);const mono=new Float32Array(decoded.length);for(let c=0;c<decoded.numberOfChannels;c++){const samples=decoded.getChannelData(c);for(let i=0;i<mono.length;i++)mono[i]+=samples[i]/decoded.numberOfChannels;}await ctx.close();return {samples:Array.from(mono),sampleRate:decoded.sampleRate,duration:decoded.duration};},raw);
 const data=Buffer.alloc(44+result.samples.length*2);data.write('RIFF');data.writeUInt32LE(data.length-8,4);data.write('WAVEfmt ',8);data.writeUInt32LE(16,16);data.writeUInt16LE(1,20);data.writeUInt16LE(1,22);data.writeUInt32LE(result.sampleRate,24);data.writeUInt32LE(result.sampleRate*2,28);data.writeUInt16LE(2,32);data.writeUInt16LE(16,34);data.write('data',36);data.writeUInt32LE(data.length-44,40);result.samples.forEach((value,i)=>data.writeInt16LE(Math.round(Math.max(-1,Math.min(1,value))*32767),44+i*2));
 fs.writeFileSync(path.join(root,'assets/audio/notifications',output+'.wav'),data);console.log(input+': '+result.duration.toFixed(2)+' seconds');
}
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
