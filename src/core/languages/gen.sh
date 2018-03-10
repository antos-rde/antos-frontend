#!/bin/bash
ord() {
  LC_CTYPE=C printf '%d' "'$1"
}
grep --include=\*.{coffee,tag} -roh "$1" -e '__("[^"]*"' | while read -r line ; do 
    SUBSTRING=$(echo $line| cut -d'"' -f 2)
    if  test -f "$2"   && [ ! -z "$(grep -F "\"$SUBSTRING\":" "$2")" ]
    then
        echo "Ignore: $SUBSTRING"
    else
        echo -e "\t\"$SUBSTRING\":\"$SUBSTRING\"," >> "tmp.json"
    fi
done
grep --include=\*.{coffee,html,tag} -roh "$1" -e '\"__\([^\"]*\)\"' | while read -r line; do
    len=$(( ${#line} - 6 ))
    #echo $len
    SUBSTRING=${line:4:len}
    #echo $SUBSTRING
    if  test -f "$2"   && [ ! -z "$(grep  -F "\"$SUBSTRING\":" "$2")" ]
    then
        echo "Ignore: $SUBSTRING"
    else
        echo -e "\t\"$SUBSTRING\":\"$SUBSTRING\"," >> "tmp.json"
    fi
done
sort tmp.json > tmp1.json
awk '!a[$0]++' "tmp1.json" > tmp.json
sed '$ s/.$//' tmp.json > tmp1.json
# remove duplicate entry
if test -f $2
then
    cp $2 "$2.old"
    sed '$ s/.$//' $2 > tmp.json
    cat tmp.json > $2
    echo "," >> $2
    cat tmp1.json >> $2
    echo "}" >> "$2"
else
     echo "{"> "$2"
    cat tmp1.json >> "$2"
    echo "}" >> "$2"
fi
rm tmp.json tmp1.json