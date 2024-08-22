set dotenv-load

export EDITOR := 'vim'

alias r := run

default:
  just --list

fmt:
  prettier --write .
  isort .
  yapf --in-place --recursive .

dev:
  bunx concurrently \
    --kill-others \
    --names 'server,client' \
    --prefix-colors 'green.bold,magenta.bold' \
    --prefix '[{name}] ' \
    --prefix-length 2 \
    --success first \
    --handle-input \
    --timestamp-format 'HH:mm:ss' \
    --color \
    -- \
    'python3 app.py' \
    'bun run dev'

run:
  python3 app.py
