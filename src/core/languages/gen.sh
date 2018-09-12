#!/bin/bash
# Copyright 2017-2018 Xuan Sang LE <xsang.le AT gmail DOT com>

# AnTOS Web desktop is is licensed under the GNU General Public
# License v3.0, see the LICENCE file for more information

# This program is free software: you can redistribute it and/or
# modify it under the terms of the GNU General Public License as
# published by the Free Software Foundation, either version 3 of 
# the License, or (at your option) any later version.

# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
# General Public License for more details.

# You should have received a copy of the GNU General Public License
#along with this program. If not, see https://www.gnu.org/licenses/.

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
grep --include=\*.{coffee,html,tag} -roh "$1" -e '\"__([^\"]*)\"' | while read -r line; do
    len=$(( ${#line} - 6 ))
    #echo $len
    #echo $line
    SUBSTRING=${line:4:len}
    #echo $SUBSTRING
    if  test -f "$2"   && [ ! -z "$(grep  -F "\"$SUBSTRING\":" "$2")" ]
    then
        echo "Ignore: $SUBSTRING"
    else
        echo -e "\t\"$SUBSTRING\":\"$SUBSTRING\"," >> "tmp.json"
    fi
done
if test -f tmp.json
then
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
else
    echo "Nothing change"
fi