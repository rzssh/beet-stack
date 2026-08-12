#!/usr/bin/env sh
set -eu
: "${SERVICE_PORT:=3001}"
export SERVICE_PORT
bun -e "(async()=>{try{const r=await fetch('http://127.0.0.1:'+process.env.SERVICE_PORT+'/health');if(!r.ok)process.exit(1)}catch{process.exit(1)}})()"
