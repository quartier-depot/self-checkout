#!/bin/bash

# Check if user is logged in to snapcraft
if ! snapcraft whoami >/dev/null 2>&1; then
    echo "Error: Not logged in to snapcraft. Please run 'snapcraft login' first."
    exit 1
fi

# Check if the current branch is the main branch
if [ "$(git rev-parse --abbrev-ref HEAD)" != "main" ]; then
    echo "Error: Not on the main branch. Please switch to the main branch first."
    exit 1
fi

# Check if the current branch is clean
if ! git diff-index --quiet HEAD --; then
    echo "Error: The current branch is not clean. Please commit or stash your changes first."
    exit 1
fi

git pull

VERSION=$(cat ./snap/snapcraft.yaml | grep "^version:" | awk '{print $2}' | tr -d '"')
echo "Using version $VERSION from snapcraft.yaml"

# Check if tag already exists
if git rev-parse "v$VERSION" >/dev/null 2>&1; then
    echo "Error: Tag v$VERSION already exists"
    exit 1
fi

git tag -a "v$VERSION" -m "$VERSION"
git push origin "$VERSION"

npm clean-install
npm run build

snapcraft
snapcraft push quartier-depot-self-checkout_${VERSION}_amd64.snap --release=stable
snapcraft list-revisions quartier-depot-self-checkout
