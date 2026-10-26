const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),android=path.join(root,'android/app/src/main/res/raw'),ios=path.join(root,'ios/App/App');
const project=path.join(root,'ios/App/App.xcodeproj/project.pbxproj');let pbx=fs.readFileSync(project,'utf8');
const sounds=[['salawat','salawat'],['salawat-1','salawat_1'],['salawat-2','salawat_2']];
sounds.forEach(([web,native],index)=>{
 const wav=path.join(root,'assets/audio/notifications',native+'.wav'),data=fs.readFileSync(wav);
 if(data.toString('ascii',0,4)!=='RIFF'||data.readUInt16LE(20)!==1||(data.length-44)/data.readUInt32LE(28)>=30)throw Error('Invalid iOS sound: '+wav);
 fs.mkdirSync(android,{recursive:true});fs.copyFileSync(path.join(root,'assets/audio',web+'.mp3'),path.join(android,native+'.mp3'));fs.copyFileSync(wav,path.join(ios,native+'.wav'));
 const ref='A5A10000000000000000000'+(index*2+1),build='A5A10000000000000000000'+(index*2+2),name=native+'.wav';
 if(!pbx.includes(ref)){
 pbx=pbx.replace('/* Begin PBXBuildFile section */','/* Begin PBXBuildFile section */\n\t\t'+build+' /* '+name+' in Resources */ = {isa = PBXBuildFile; fileRef = '+ref+' /* '+name+' */; };');
 pbx=pbx.replace('/* Begin PBXFileReference section */','/* Begin PBXFileReference section */\n\t\t'+ref+' /* '+name+' */ = {isa = PBXFileReference; lastKnownFileType = audio.wav; path = '+name+'; sourceTree = "<group>"; };');
 pbx=pbx.replace('95SW00012DB07C7200EA8C01 /* salawat.mp3 */,','95SW00012DB07C7200EA8C01 /* salawat.mp3 */,\n\t\t\t\t'+ref+' /* '+name+' */,');
 pbx=pbx.replace('95SW00022DB07C7200EA8C01 /* salawat.mp3 in Resources */,','95SW00022DB07C7200EA8C01 /* salawat.mp3 in Resources */,\n\t\t\t\t'+build+' /* '+name+' in Resources */,');
 }
});fs.writeFileSync(project,pbx);
console.log('Salawat sound resources synchronized for Android and iOS.');
