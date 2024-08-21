set dotenv-load

export EDITOR := 'vim'

alias r := run

default:
  just --list

fmt:
  prettier --write .
  yapf --in-place --recursive .

dev:
  bun run dev 

run:
  python3 app.py
