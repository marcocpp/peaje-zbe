#!/usr/bin/env bash
# Installs everything needed to run the ZBE Toll demo on Linux (apt, dnf or
# pacman) or macOS (Homebrew). Safe to run more than once: tools that are
# already installed are skipped.
#
#   scripts/install-prereqs.sh           # install what is missing
#   scripts/install-prereqs.sh --check   # only report what is missing
#
# Installs: system packages (git, curl, jq, openssl, build tools), Docker,
# Node.js >= 22.12 (via nvm if needed), Rust + the wasm32v1-none target, and
# Stellar CLI + the scaffold and registry plugins at the versions the project
# was built with. Finally runs `npm install`.
set -euo pipefail

STELLAR_CLI_VERSION=28.1.0
SCAFFOLD_VERSION=0.0.33
REGISTRY_VERSION=0.2.0
NODE_MIN=22.12.0
NVM_VERSION=v0.40.3

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHECK_ONLY=false
[ "${1:-}" = "--check" ] && CHECK_ONLY=true

MISSING=()
step() { printf '\n\033[1;36m→ %s\033[0m\n' "$*"; }
ok() { printf '  \033[32m✔\033[0m %s\n' "$*"; }
miss() {
  printf '  \033[33m✘\033[0m %s\n' "$*"
  MISSING+=("$1")
}
has() { command -v "$1" >/dev/null 2>&1; }

# version_ge A B: true if A >= B (dotted versions)
version_ge() { [ "$(printf '%s\n%s\n' "$2" "$1" | sort -V | head -1)" = "$2" ]; }

load_env() {
  # shellcheck disable=SC1091
  [ -f "$HOME/.cargo/env" ] && . "$HOME/.cargo/env"
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  # shellcheck disable=SC1091
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  return 0
}

detect_os() {
  case "$(uname -s)" in
    Darwin) OS=macos ;;
    Linux)
      if has apt-get; then
        OS=apt
      elif has dnf; then
        OS=dnf
      elif has pacman; then
        OS=pacman
      else
        OS=linux-unknown
      fi
      ;;
    *) OS=unknown ;;
  esac
}

sudo_run() {
  if [ "$(id -u)" -eq 0 ]; then "$@"; else sudo "$@"; fi
}

# ---------- System packages ----------

install_system_packages() {
  step "System packages (git, curl, jq, openssl, build tools)"
  local need=false
  for t in git curl jq openssl cc pkg-config; do has "$t" || need=true; done
  if ! $need; then
    ok "already installed"
    return
  fi
  if $CHECK_ONLY; then
    miss "system packages (git, curl, jq, openssl, cc, pkg-config)"
    return
  fi
  case "$OS" in
    apt)
      sudo_run apt-get update
      sudo_run apt-get install -y git curl jq openssl ca-certificates \
        build-essential pkg-config libssl-dev libudev-dev libdbus-1-dev
      ;;
    dnf)
      sudo_run dnf install -y git curl jq openssl ca-certificates gcc gcc-c++ \
        make pkgconf-pkg-config openssl-devel systemd-devel dbus-devel
      ;;
    pacman)
      sudo_run pacman -S --needed --noconfirm git curl jq openssl base-devel \
        pkgconf systemd-libs dbus
      ;;
    macos)
      if ! has brew; then
        echo "  Homebrew is required on macOS: https://brew.sh" >&2
        exit 1
      fi
      xcode-select -p >/dev/null 2>&1 || xcode-select --install || true
      brew install git curl jq openssl pkg-config
      ;;
    *)
      echo "  Unsupported system: install git, curl, jq, openssl and a C toolchain manually." >&2
      exit 1
      ;;
  esac
  ok "installed"
}

# ---------- Docker ----------

install_docker() {
  step "Docker (runs the local Stellar network)"
  if has docker && docker info >/dev/null 2>&1; then
    ok "$(docker --version)"
    return
  fi
  if $CHECK_ONLY; then
    if has docker; then
      miss "docker daemon not reachable (is it running? is your user in the docker group?)"
    else
      miss "docker"
    fi
    return
  fi
  if ! has docker; then
    case "$OS" in
      apt) sudo_run apt-get install -y docker.io ;;
      dnf) sudo_run dnf install -y moby-engine || sudo_run dnf install -y docker ;;
      pacman) sudo_run pacman -S --needed --noconfirm docker ;;
      macos)
        brew install --cask docker
        echo "  Open Docker Desktop once so the daemon starts, then re-run this script."
        ;;
    esac
  fi
  if [ "$OS" != macos ]; then
    sudo_run systemctl enable --now docker || true
    if ! id -nG "$USER" | grep -qw docker; then
      sudo_run usermod -aG docker "$USER"
      DOCKER_RELOGIN=true
    fi
  fi
  ok "installed"
}

# ---------- Node.js ----------

install_node() {
  step "Node.js >= $NODE_MIN"
  load_env
  if has node && version_ge "$(node -v | tr -d v)" "$NODE_MIN"; then
    ok "node $(node -v), npm $(npm -v)"
    return
  fi
  if $CHECK_ONLY; then
    miss "node >= $NODE_MIN (found: $(node -v 2>/dev/null || echo none))"
    return
  fi
  if [ ! -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]; then
    curl -fsSL "https://raw.githubusercontent.com/nvm-sh/nvm/$NVM_VERSION/install.sh" | bash
  fi
  load_env
  nvm install --lts
  nvm alias default 'lts/*'
  ok "node $(node -v) via nvm"
}

# ---------- Rust ----------

install_rust() {
  step "Rust + wasm32v1-none target"
  load_env
  if ! has rustup; then
    if $CHECK_ONLY; then
      miss "rustup"
      return
    fi
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal
    load_env
  fi
  if $CHECK_ONLY; then
    if (cd "$ROOT" && rustup target list --installed 2>/dev/null | grep -q wasm32v1-none); then
      ok "$(cd "$ROOT" && rustc --version)"
    else
      miss "rust toolchain from rust-toolchain.toml with target wasm32v1-none"
    fi
    return
  fi
  # Installs the toolchain and targets pinned in rust-toolchain.toml
  (cd "$ROOT" && rustup toolchain install && rustup target add wasm32v1-none)
  ok "$(cd "$ROOT" && rustc --version)"
}

# ---------- Stellar CLI ----------

cargo_tool() {
  # cargo_tool <crate> <version> <check command> <expected version>
  local crate=$1 version=$2 check=$3
  if $check 2>/dev/null | grep -q "$version"; then
    ok "$crate $version"
    return
  fi
  if $CHECK_ONLY; then
    miss "$crate $version"
    return
  fi
  if ! has cargo-binstall; then
    curl -L --proto '=https' --tlsv1.2 -sSf \
      https://raw.githubusercontent.com/cargo-bins/cargo-binstall/main/install-from-binstall-release.sh | bash
    load_env
  fi
  # Prebuilt binary if available, otherwise compiles from source (slower)
  cargo binstall -y --locked "$crate@$version" || cargo install --locked "$crate" --version "$version"
  ok "$crate $version"
}

install_stellar() {
  step "Stellar CLI and plugins"
  load_env
  if ! has cargo; then
    $CHECK_ONLY && {
      miss "stellar-cli, stellar-scaffold-cli, stellar-registry-cli (need Rust first)"
      return
    }
  fi
  cargo_tool stellar-cli "$STELLAR_CLI_VERSION" "stellar --version"
  cargo_tool stellar-scaffold-cli "$SCAFFOLD_VERSION" "stellar-scaffold --version"
  cargo_tool stellar-registry-cli "$REGISTRY_VERSION" "stellar-registry version"
}

# ---------- Project ----------

install_project() {
  step "Project dependencies (npm install)"
  if $CHECK_ONLY; then
    if [ -d "$ROOT/node_modules" ]; then ok "node_modules present"; else miss "npm install"; fi
    return
  fi
  load_env
  (cd "$ROOT" && npm install)
  ok "done"
}

# ---------- Main ----------

detect_os
DOCKER_RELOGIN=false
echo "ZBE Toll · prerequisites ($OS)$($CHECK_ONLY && echo ' · check only')"

install_system_packages
install_docker
install_node
install_rust
install_stellar
install_project

echo
if $CHECK_ONLY; then
  if [ ${#MISSING[@]} -eq 0 ]; then
    printf '\033[1;32m✅ Everything is installed.\033[0m Run: npm run dev\n'
  else
    printf '\033[1;33m%d missing.\033[0m Run scripts/install-prereqs.sh to install them.\n' "${#MISSING[@]}"
    exit 1
  fi
else
  printf '\033[1;32m✅ Prerequisites installed.\033[0m\n'
  echo "  Open a new terminal (so PATH picks up cargo and node), then run: npm run dev"
  if $DOCKER_RELOGIN; then
    echo "  ⚠️  You were added to the docker group: log out and back in (or run 'newgrp docker') first."
  fi
fi
