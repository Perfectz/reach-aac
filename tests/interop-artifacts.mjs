// Verify captured synthetic exports; does not contact another service or use user data.
import {readFile,writeFile} from 'node:fs/promises';
import {loadBoard,unzip} from '@shayc/open-board-format';
import assert from 'node:assert/strict';
const source=JSON.parse(await readFile('artifacts/reach-interop-2.obf','utf8'));
const archive=await readFile('artifacts/asterics-roundtrip-with-root.obz');
const parsed=await loadBoard(archive),board=parsed.archive.rootBoard,files=await unzip(archive);
const layout=b=>b.grid.order.map(row=>row.map(id=>id===null?null:b.buttons.find(button=>button.id===id)?.label));
assert.deepEqual(layout(board),layout(source));
assert.equal(board.grid.columns,source.grid.columns);assert.equal(board.grid.rows,source.grid.rows);
const imagesEqual=source.buttons.every(original=>{
 const returned=board.buttons.find(b=>b.label===original.label),a=source.images.find(i=>i.id===original.image_id),b=board.images.find(i=>i.id===returned.image_id);
 return a&&b&&Buffer.from(a.data.split(',')[1],'base64').equals(Buffer.from(files.get(b.path)));
});assert.equal(imagesEqual,true);
const report={date:'2026-09-13',source:'Reach synthetic English 5-position pack',destination:'https://grid.asterics.eu/',layoutAndLabelsPreserved:true,iconBytesPreserved:imagesEqual,sourceRecordings:source.sounds.length,returnedRecordings:board.sounds?.length||0,returnedIconAttribution:board.images.every(i=>!!i.license&&!!i.ext_reach_license_text),rootRequired:'Selecting Home care as home grid before OBZ export produced a valid root manifest.',completeRoundTripIntoReach:false};
await writeFile('artifacts/asterics-interop-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
