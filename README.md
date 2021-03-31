# sparqlet-run
## 概要
https://github.com/dbcls/sparqlist の lib/ をそのまま活用して、bin/sparqlet-run.mjs を記述.
```
sparqlet-run example.md
```
のように、ローカルにあるmdファイルを実行できる.


## Install
```
npm install
```
オプショナルで
```
npm link
```

## Usage
```
./bin/sparqlet-run.mjs example.md
```
`npm link` してあれば
```
sparqlet-run example.md
```
