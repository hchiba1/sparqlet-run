# sparqlet-run
## 概要
https://github.com/dbcls/sparqlist の lib/ をそのまま活用、bin/sparqlet-run.mjs を新たに記述.
```
sparqlet-run example.md
```
のように、ローカルにあるmdファイルを実行できる.


## Install
```
npm install
```
(オプショナル) パスに入れるためには、続けて `npm link` する.

## Usage
```
./bin/sparqlet-run.mjs example.md
```
`npm link` してあれば
```
sparqlet-run example.md
```
