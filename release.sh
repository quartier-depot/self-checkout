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

echo "1 - Pulling latest changes --------------------------------------------"
git pull

echo "2 - Determining version -----------------------------------------------"
VERSION=$(cat ./snap/snapcraft.yaml | grep "^version:" | awk '{print $2}' | tr -d '"')
echo "Using version $VERSION from snapcraft.yaml"

echo "3 - Creating tag ------------------------------------------------------"
if git rev-parse "v$VERSION" >/dev/null 2>&1; then
    echo "Error: Tag v$VERSION already exists"
    exit 1
fi
git tag -a "v$VERSION" -m "$VERSION"
git push origin "$VERSION"

echo "4 - Building React ----------------------------------------------------"
npm clean-install
npm run build

echo "5 - Testing React -----------------------------------------------------"
npm run test

echo "6 - Building snap -----------------------------------------------------"
snapcraft

echo "7 - Pushing to snapcraft ---------------------------------------------"
snapcraft push quartier-depot-self-checkout_${VERSION}_amd64.snap --release=stable
snapcraft list-revisions quartier-depot-self-checkout
