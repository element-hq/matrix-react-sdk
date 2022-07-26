#!/usr/bin/env sh

cd `dirname $0`

{
    echo "// autogenerated by rethemendex.sh"

    # we used to have exclude /themes from the find at this point.
    # as themes are no longer a spurious subdirectory of css/, we don't
    # need it any more.
    find . -iname _\*.pcss | fgrep -v _components.pcss | LC_ALL=C sort |
        while read i; do
            echo "@import \"$i\";"
        done
} > _components.pcss