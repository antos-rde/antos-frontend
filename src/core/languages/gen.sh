#!/bin/bash
ord() {
  LC_CTYPE=C printf '%d' "'$1"
}
grep --include=\*.coffee -roh "$1" -e '__("[^"]*"' | while read -r line ; do 
    SUBSTRING=$(echo $line| cut -d'"' -f 2)
    echo -e "\t\"$SUBSTRING\":\"$SUBSTRING\"," >> "tmp.json"
done
grep --include=\*.{coffee,html} -roh "$1" -e '"__(.*)"' | while read -r line; do
    len=$(( ${#line} - 6 ))
    #echo $len
    SUBSTRING=${line:4:len}
    #echo $SUBSTRING
    echo -e "\t\"$SUBSTRING\":\"$SUBSTRING\"," >> "tmp.json"
done
sort tmp.json > tmp1.json
awk '!a[$0]++' "tmp1.json" > tmp.json
sed '$ s/.$//' tmp.json > tmp1.json
# remove duplicate entry
echo "remove duplicate line"
echo "{"> $2
cat tmp1.json >> $2
echo "}" >> $2
rm tmp.json tmp1.json