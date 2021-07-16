#!/bin/sh

for i in $(sparqlet-ls); do
    echo $i
    sparqlet-run --github $i.md -n5 --trace
done
