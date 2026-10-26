# Wortle

[![Build and Deploy](https://github.com/mdr/wortle/actions/workflows/build.yml/badge.svg)](https://github.com/mdr/wortle/actions/workflows/build.yml)

A daily plant identification quiz game.

https://wortle.app

## Development

Use [Nix](https://nixos.org/) for a reproducible dev environment:

```sh
nix develop
task        # list available commands
task dev    # start dev server
task check  # run all checks
```

### Fresh clone setup

```sh
direnv allow                        # optional: auto-load the nix shell on cd (or prefix commands with `nix develop -c`)
task install
pre-commit install                  # git hooks aren't cloned
task env:local                      # write apps/{admin,game}/.env.local
```

`task env:local` needs `pulumi login` and the 1Password CLI signed in to `my.1password.com`. It points local dev at the dev database and `*-dev` buckets, and refuses to overwrite existing `.env.local` files.
