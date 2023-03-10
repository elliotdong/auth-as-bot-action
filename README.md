# Auth as bot Action
A GitHub Action Script to get PAT(person access token) as a Github APP Bot

## Usage



```

name: Release

on:
  push:
    branches:
      - main

concurrency: ${{ github.workflow }}-${{ github.ref }}

jobs:
  release:
    name: Release

    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup PNPM
        uses: pnpm/action-setup@v2.2.1

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 16
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build Packages
        run: pnpm run build
      
+     - name: Get Elliot Kong Token
+       run: npx @elliotdong/auth-as-bot-action
+       env:
+         GITHUB_APP_PEM: ${{ secrets.ELLIOT_GITHUB_PEM }}
+         GITHUB_APP_ID: ${{ secrets.ELLIOT_APP_ID }}
+         EXPORT_NAME: GITHUB_TOKEN
+         ACCOUNT_ID: ${{ github.repository_owner_id }}

      - name: Create Release Pull Request or Publish
        id: changesets
        uses: changesets/action@v1
        with:
          # Note: pnpm install after versioning is necessary to refresh lockfile
          version: pnpm run version
          publish: pnpm exec changeset publish
          commit: '[ci] release'
          title: '[ci] release'
        env:
          # Needs access to publish to npm
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

```