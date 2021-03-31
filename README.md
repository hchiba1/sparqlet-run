# sparqlet-run
## 概要
https://github.com/dbcls/sparqlist の lib/\*.mjs を利用、bin/sparqlet-run.mjs を新たに記述.
```
sparqlet-run example.md
```
のように、ローカルにあるmdファイルを実行できる.

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
エンドポイントを変えて実行:
```
$ sparqlet-run homologene_category.md -e https://integbio.jp/togosite/sparql
```
繰り返し時間測定:
```
$ sparqlet-run homologene_category.md -n 3
386 ms
304 ms
305 ms
```
トレース時間も取得:
```
$ sparqlet-run homologene_category.md -n3 -t
total   input_genes:js  input_branch:js main:sparql     return:js
364 ms  1 ms    1 ms    361 ms  1 ms
300 ms  0 ms    1 ms    298 ms  1 ms
217 ms  1 ms    1 ms    213 ms  2 ms
```
タブ区切り出力(beta):
```
$ sparqlet-run homologene_category.md --tsv
categoryId      label   count
1       human   172
2       chimpanzee      560
...
```
カラムを揃える(beta):
```
$ sparqlet-run homologene_category.md -c
categoryId label        count
1          human        172
2          chimpanzee   560
...
```

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
