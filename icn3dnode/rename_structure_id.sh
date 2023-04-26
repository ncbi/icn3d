#!/bin/sh

if [ $# != 2 ]
then
  echo "Usage: rename_structure_id.sh [file name] [structure name]"
  exit 1
fi

filename="$1"
structure="$2"

echo "HEADER                                                        $structure" > ${filename}_tmp
cat $filename >> ${filename}_tmp
mv ${filename}_tmp ${filename}
