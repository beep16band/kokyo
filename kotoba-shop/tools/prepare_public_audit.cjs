// Extract a locally installed @sparticuz/chromium package without tar ownership changes.
// Usage: node prepare_public_audit.cjs PACKAGE_DIRECTORY OUTPUT_DIRECTORY
const fs=require('node:fs');
const path=require('node:path');
const zlib=require('node:zlib');
const {execFileSync}=require('node:child_process');
const [packageDir,outputDir]=process.argv.slice(2);
if(!packageDir||!outputDir)throw Error('Provide package directory and private output directory');
const src=path.resolve(packageDir),out=path.resolve(outputDir);
const metadata=JSON.parse(fs.readFileSync(path.join(src,'package.json'),'utf8'));
if(metadata.name!=='@sparticuz/chromium')throw Error('Expected @sparticuz/chromium package');
fs.mkdirSync(out,{recursive:true});
for(const name of ['chromium.br','fonts.tar.br','swiftshader.tar.br']){
 fs.writeFileSync(path.join(out,name.slice(0,-3)),zlib.brotliDecompressSync(fs.readFileSync(path.join(src,'bin',name))));
}
execFileSync('python3',['-c',
 'import pathlib,sys,tarfile\np=pathlib.Path(sys.argv[1])\nfor name in ["fonts","swiftshader"]:\n with tarfile.open(p/(name+".tar")) as t:\n  t.extractall(p/name if name=="fonts" else p,filter="data")',out],{stdio:'inherit'});
const executable=path.join(out,'chromium');fs.chmodSync(executable,0o700);
console.log(JSON.stringify({package:metadata.name,version:metadata.version,executablePath:executable}));
