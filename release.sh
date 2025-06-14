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


echo "3 - Building React ----------------------------------------------------"
npm clean-install
if ! npm run build; then
    echo "Error: React build failed"
    exit 1
fi

echo "4 - Testing React -----------------------------------------------------"
if ! npx vitest run; then
    echo "Error: React tests failed"
    exit 1
fi

echo "5 - Building snap -----------------------------------------------------"
if ! snapcraft; then
    echo "Error: Snapcraft build failed"
    exit 1
fi

echo "6 - Pushing to snapcraft ---------------------------------------------"
snapcraft push quartier-depot-self-checkout_${VERSION}_amd64.snap --release=stable
snapcraft list-revisions quartier-depot-self-checkout

echo "7 - Creating and pushing tag -----------------------------------------"
if git rev-parse "$VERSION" >/dev/null 2>&1; then
    echo "Error: Tag $VERSION already exists"
    exit 1
fi
git tag -a "$VERSION" -m "$VERSION"
git push origin "$VERSION"
