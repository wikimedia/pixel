#!/usr/bin/env bash

repos=( $(echo $1 | jq -rc 'keys_unsorted | join(" ")') )

for repo in "${repos[@]}"; do
	echo "Cloning $repo..."
	path=$( echo $1 | jq -rc ".[\"$repo\"].path" )
	git clone "https://gerrit.wikimedia.org/r/$repo.git" $path
done

ls extensions
git -C "extensions/VisualEditor" submodule update --init
composer install --no-dev --quiet
