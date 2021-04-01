# sparqlet-run

https://github.com/dbcls/sparqlist の lib/\*.mjs を利用して、bin/sparqlet-run.mjs を作成.

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
ES ModulesなどNode.jsの新しい機能を利用している. Node.jsのv14.13.0以上が必要.
```
$ cd sparqlet-run
$ npm install
```
パスに入れるためには、続けて `$ npm link` .

## Usage
```
$ ./bin/sparqlet-run.mjs
```
もしくは、`$ npm link` してあれば、
```
$ sparqlet-run
```
