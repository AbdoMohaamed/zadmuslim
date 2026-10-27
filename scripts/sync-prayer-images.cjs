const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
for(const prayer of ['fajr','dhuhr','asr','maghrib','isha']){
 const source=path.join(root,'assets/images/prayers',`pre_${prayer}.jpg`);
 const target=path.join(root,'android/app/src/main/res/drawable',`pre_${prayer}.jpg`);
 fs.copyFileSync(source,target);
}
