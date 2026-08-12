{
  description = "BEET Stack: dev shell, reproducible production package, OCI image, and NixOS module";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs =
    { self, nixpkgs, ... }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
      lib = pkgs.lib;

      # Drop racily-created internal .bin shims so two installs hash identically.
      normalization = ''
        find node_modules/.bun -type d -name .bin -exec rm -rf {} + 2>/dev/null || true
      '';

      nativeLibraries = with pkgs; [
        alsa-lib
        at-spi2-atk
        at-spi2-core
        atk
        cairo
        cups
        dbus
        expat
        glib
        gtk3
        libdrm
        libgbm
        libglvnd
        libnotify
        libpulseaudio
        libx11
        libxcomposite
        libxdamage
        libxext
        libxfixes
        libxkbcommon
        libxrandr
        libxcb
        nspr
        nss
        pango
        stdenv.cc.cc
        systemd
        wayland
      ];

      repoSrc = lib.cleanSourceWith {
        src = ./.;
        name = "beet-stack-source";
        filter =
          path: type:
          !(
            lib.hasInfix "/node_modules" path
            || lib.hasInfix "/.git" path
            || lib.hasInfix "/.direnv" path
            || lib.hasInfix "/.turbo" path
            || lib.hasInfix "/.cache" path
            || lib.hasInfix "/.expo" path
            || lib.hasInfix "/.tanstack" path
            || lib.hasInfix "/dist" path
            || lib.hasSuffix "/.env" path
            || lib.hasSuffix "/.env.production" path
            || lib.hasSuffix "/apps/server/server" path
            || lib.hasSuffix "/flake.nix" path  # avoid self-referential fixed-output hash
            || lib.hasSuffix "/flake.lock" path
          );
      };

      # Fixed-output so it gets network in the sandbox. Emits the full tree
      # (bun's isolated per-workspace node_modules). flake.nix is excluded above
      # so the output hash is a stable fixed point; dontFixup avoids the shebang
      # patching that would inject store-path references the FOD forbids.
      bunDeps = pkgs.stdenv.mkDerivation {
        pname = "beet-stack-node-deps";
        version = "0.0.1";
        src = repoSrc;
        nativeBuildInputs = [
          pkgs.bun
          pkgs.cacert
        ];
        impureEnvVars = lib.fetchers.proxyImpureEnvVars;
        SSL_CERT_FILE = "${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt";
        dontFixup = true;
        buildPhase = ''
          export HOME="$TMPDIR"
          export BUN_INSTALL_CACHE_DIR="$TMPDIR/bun-cache"
          bun install --frozen-lockfile --ignore-scripts
          ${normalization}
        '';
        installPhase = ''
          cp -r . $out
        '';
        outputHashMode = "recursive";
        outputHashAlgo = "sha256";
        outputHash = "sha256-3M7xWJCQbcCLdS9kHLeULH7DDXaWYrG7UdEmarZqOiM=";
      };

      app = pkgs.stdenv.mkDerivation {
        pname = "beet-stack";
        version = "0.0.1";
        src = bunDeps;
        nativeBuildInputs = [ pkgs.bun ];
        buildPhase = ''
          export HOME="$TMPDIR"
          bun run --filter=@beet/server build
          cp deploy/migrate.ts packages/db/_beet_migrate.ts
          ( cd packages/db && bun build --compile _beet_migrate.ts --outfile "$TMPDIR/migrate" )
          rm packages/db/_beet_migrate.ts
        '';
        installPhase = ''
          mkdir -p $out/app/packages/db
          cp apps/server/server $out/app/server
          cp "$TMPDIR/migrate" $out/app/migrate
          cp -r packages/db/migrations $out/app/packages/db/migrations
          cp ${./deploy/entrypoint.sh} $out/app/entrypoint.sh
          cp ${./deploy/healthcheck.sh} $out/app/healthcheck.sh
          cp ${./deploy/migrate.ts} $out/app/migrate.ts
          chmod +x $out/app/server $out/app/migrate $out/app/entrypoint.sh $out/app/healthcheck.sh
        '';
      };

      runtimeShell = "${pkgs.busybox}/bin/sh";

      # TMPDIR/HOME for UID 1000. World-writable modes avoid a chown step; the
      # sandboxed builder cannot run fakeRootCommands to mkdir /home.
      runtimeDirs = pkgs.runCommand "beet-stack-runtime-dirs" { } ''
        mkdir -p $out/home/bun $out/tmp
        chmod 1777 $out/tmp
        chmod 0777 $out/home/bun
      '';

      ociImage = pkgs.dockerTools.buildLayeredImage {
        name = "beet-stack";
        tag = "latest";
        contents = [
          app
          runtimeDirs
          pkgs.bun
          pkgs.cacert
          pkgs.busybox
        ];
        config = {
          User = "1000:1000";
          WorkingDir = "/app";
          Entrypoint = [
            runtimeShell
            "/app/entrypoint.sh"
          ];
          ExposedPorts = {
            "3001/tcp" = { };
          };
          Env = [
            "NODE_ENV=production"
            "BEET_APP_DIR=/app"
            "SERVICE_PORT=3001"
            "HOME=/home/bun"
            "TMPDIR=/tmp"
            "SSL_CERT_FILE=${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt"
          ];
          Healthcheck = {
            Test = [
              "CMD"
              runtimeShell
              "/app/healthcheck.sh"
            ];
            Interval = 30000000000;
            Timeout = 5000000000;
            StartPeriod = 15000000000;
            Retries = 3;
          };
        };
      };

      nixosModule = import ./nixos/beet-stack.nix { inherit self lib; };

      nixosEval = nixpkgs.lib.nixosSystem {
        inherit system pkgs;
        modules = [
          nixosModule
          (
            { ... }:
            {
              beet-stack = {
                enable = true;
                environmentFile = "/run/secrets/beet-stack.env";
                domain = "beet.example";
                enableCaddy = true;
                enableBackup = true;
              };
            }
          )
        ];
      };
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        packages = with pkgs; [
          bun
          nodejs_22
          postgresql_17
        ];
        NIX_LD = pkgs.stdenv.cc.bintools.dynamicLinker;
        NIX_LD_LIBRARY_PATH = lib.makeLibraryPath nativeLibraries;
      };

      packages.${system} = {
        inherit app ociImage;
        server = app;
        node-deps = bunDeps;
        default = app;
      };

      overlays.default = final: _prev: {
        beet-stack = self.packages.${final.system}.server;
      };

      nixosModules.beet-stack = nixosModule;
      nixosModules.default = nixosModule;

      checks.${system} = {
        inherit app ociImage;
        nixos-module =
          let
            cfg = nixosEval.config;
            mainEnvFile = cfg.systemd.services.beet-stack.serviceConfig.EnvironmentFile or null;
            envFileAsserted = lib.assertMsg (mainEnvFile != null)
              "beet-stack: main service must apply cfg.environmentFile";
          in
          assert envFileAsserted;
          pkgs.runCommand "beet-stack-nixos-module-check"
            {
              execStart = cfg.systemd.services.beet-stack.serviceConfig.ExecStart;
              backupUnit = cfg.systemd.services.beet-stack-backup.serviceConfig.ExecStart;
              caddyVhost = cfg.services.caddy.virtualHosts."beet.example".extraConfig;
              timerUnit = cfg.systemd.timers.beet-stack-backup.timerConfig.OnCalendar;
            }
            "echo ok > $out";
      };
    };
}
