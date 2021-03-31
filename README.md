# sparqlet-run
## 概要
https://github.com/dbcls/sparqlist の lib/\*.mjs を利用して、bin/sparqlet-run.mjs を作成.
```
$ sparqlet-run example.md
```
のように、ローカルにあるmdファイルを実行し、結果を確認する.

## Example
```
$ sparqlet-run homologene_category.md
[
  { categoryId: '1', label: 'human', count: 172 },
  { categoryId: '2', label: 'chimpanzee', count: 560 },
  { categoryId: '3', label: 'primates', count: 498 },
  { categoryId: '4', label: 'mouse, rat', count: 285 },
  { categoryId: '5', label: 'mammal', count: 2907 },
  { categoryId: '6', label: 'chicken', count: 633 },
  { categoryId: '7', label: 'frog', count: 1483 },
  { categoryId: '8', label: 'zebrafish', count: 6637 },
  { categoryId: '9', label: 'insect, worm', count: 2890 },
  { categoryId: '10', label: 'fungi', count: 580 },
  { categoryId: '11', label: 'plant', count: 2484 }
]
323 ms
```
パラメータ指定:
```
$ sparqlet-run homologene_category.md categoryIds=1
[ { categoryId: '1', label: 'human', count: 172 } ]
385 ms
```
エンドポイントを一時的に変えてみる:
```
$ sparqlet-run homologene_category.md -e https://integbio.jp/togosite/sparql
```
繰り返し実行(時間測定のみ):
```
$ sparqlet-run homologene_category.md -n 3
386 ms
304 ms
305 ms
```

## Install
ES6 Modulesを利用しているため、Node.js v14以上推奨.
```
$ cd sparqlet-run
$ npm install
```
パスに入れるためには、続けて `$ npm link` する.

## Usage
```
$ ./bin/sparqlet-run.mjs example.md
```
`$ npm link` してあれば
```
$ sparqlet-run example.md
```
