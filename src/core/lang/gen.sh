#!/bin/bash
ord() {
  LC_CTYPE=C printf '%d' "'$1"
}
hash(){
    text=$1
    node -e "var hash, i, text;text='$1';hash = 5381;i = text.length;while (i) {hash = (hash * 33) ^ text.charCodeAt(--i);}; console.log(hash >>> 0)"
    
}
echo "{" > "tmp.json"
grep --include=\*.coffee -roh "$1" -e '__("[^"]*"' |while read -r line ; do 
    SUBSTRING=$(echo $line| cut -d'"' -f 2)
    hs=$(hash "$SUBSTRING")
    echo -e "\t\"$hs\":\"$SUBSTRING\"," >> "tmp.json"
done
grep --include=\*.html -roh './src/' -e '"__(.*)"' | while read -r line; do
    SUBSTRING=${line:4:-2}
    hs=$(hash "$SUBSTRING")
    echo -e "\t\"$hs\":\"$SUBSTRING\"," >> "tmp.json"
done
echo "}" >> "tmp.json"
# remove duplicate entry
echo "remove duplicate line"
echo ""> $2
awk '!a[$0]++' "tmp.json" >> $2
rm tmp.json