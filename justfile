set dotenv-load

export EDITOR := 'vim'

alias r := run

default:
  just --list

fmt:
  yapf --in-place --recursive .

dev:
  bun run dev 

run:
  python3 app.py
