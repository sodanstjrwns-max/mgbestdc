import sharp from 'sharp';
const meta = await sharp('/tmp/home_full.png').metadata();
console.log('dims', meta.width, meta.height);
const segs = [[0,1100],[1100,1300],[2400,1300],[3700,1300],[5000,1300],[6300,1630]];
let i=1;
for(const [top,h] of segs){
  const ht = Math.min(h, meta.height-top);
  if(ht<=0) continue;
  await sharp('/tmp/home_full.png').extract({left:0,top,width:meta.width,height:ht}).toFile(`/tmp/hf_${i}.png`);
  i++;
}
console.log('cropped', i-1);
