#!/bin/sh

if [ $# != 2 ]
then
  # The "structure name" for PDBs should be 4-5 chars. 
  # The "structure name" for AlphaFold structures should be at least 6 chars. 
  echo "Usage: rename_structure_id.sh [file name] [structure name]"
  exit 1
fi

filename="$1"
structure="$2"

echo "HEADER                                                        $structure" > ${filename}_tmp
cat $filename >> ${filename}_tmp
mv ${filename}_tmp ${filename}
