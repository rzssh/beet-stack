{ self, lib }:
{ pkgs, config, ... }:
let
  cfg = config.beet-stack;
  appDir = "${cfg.package}/app";
  backupDest = cfg.backup.destination;
in
{
  options.beet-stack = {
    enable = lib.mkEnableOption "BEET Stack standalone API service";

    package = lib.mkOption {
      type = lib.types.package;
      default = self.packages.${pkgs.stdenv.hostPlatform.system}.server;
      defaultText = lib.literalExpression "beet-stack.packages.\${system}.server";
      description = "BEET Stack production package (compiled server + migrator).";
    };

    port = lib.mkOption {
      type = lib.types.port;
      default = 3001;
      description = "Port the standalone API listens on (SERVICE_PORT).";
    };

    environmentFile = lib.mkOption {
      type = lib.types.nullOr lib.types.path;
      default = null;
      example = "/run/secrets/beet-stack.env";
      description = ''
        Environment file holding production secrets, at minimum:
        DATABASE_URL, AUTH_SECRET, TRUSTED_ORIGINS, NODE_ENV.
      '';
    };

    domain = lib.mkOption {
      type = lib.types.str;
      default = "localhost";
      description = "Public hostname for the optional Caddy reverse proxy.";
    };

    enableCaddy = lib.mkOption {
      type = lib.types.bool;
      default = false;
      description = "Enable a Caddy virtualHost with automatic TLS terminating at this host.";
    };

    enableBackup = lib.mkOption {
      type = lib.types.bool;
      default = false;
      description = "Enable a periodic pg_dump backup of the database.";
    };

    backup = {
      schedule = lib.mkOption {
        type = lib.types.str;
        default = "*-*-* 03:00:00";
        description = "systemd OnCalendar expression for the backup timer.";
      };
      destination = lib.mkOption {
        type = lib.types.path;
        default = "/var/lib/beet-stack-backup";
        description = "Directory (StateDirectory) where compressed dumps are written.";
      };
    };
  };

  config = lib.mkIf cfg.enable {
    assertions = [
      {
        assertion = cfg.enableBackup -> cfg.environmentFile != null;
        message = "beet-stack.enableBackup requires beet-stack.environmentFile (DATABASE_URL).";
      }
    ];

    systemd.services.beet-stack = {
      description = "BEET Stack standalone API";
      after = [ "network-online.target" ];
      wants = [ "network-online.target" ];
      wantedBy = [ "multi-user.target" ];

      environment = {
        NODE_ENV = "production";
        BEET_APP_DIR = appDir;
        SERVICE_PORT = toString cfg.port;
        HOME = "/run/beet-stack";
        TMPDIR = "/tmp";
      };

      serviceConfig = {
        Type = "exec";
        EnvironmentFile = lib.mkIf (cfg.environmentFile != null) cfg.environmentFile;
        DynamicUser = true;
        RuntimeDirectory = "beet-stack";
        RuntimeDirectoryMode = "0700";
        ExecStart = "${pkgs.bash}/bin/sh ${appDir}/entrypoint.sh";
        Restart = "on-failure";
        RestartSec = 5;
        NoNewPrivileges = true;
        ProtectSystem = "strict";
        ProtectHome = true;
        PrivateTmp = true;
        PrivateDevices = true;
        ProtectKernelTunables = true;
        ProtectKernelModules = true;
        ProtectKernelLogs = true;
        ProtectControlGroups = true;
        RestrictAddressFamilies = [
          "AF_INET"
          "AF_INET6"
        ];
        RestrictNamespaces = true;
        RestrictRealtime = true;
        RestrictSUIDSGID = true;
        LockPersonality = true;
        RemoveIPC = true;
        CapabilityBoundingSet = [ ];
        AmbientCapabilities = [ ];
        SystemCallArchitectures = "native";
      };
    };

    services.caddy = lib.mkIf cfg.enableCaddy {
      enable = lib.mkDefault true;
      virtualHosts.${cfg.domain}.extraConfig = ''
        reverse_proxy 127.0.0.1:${toString cfg.port}
      '';
    };

    systemd.services.beet-stack-backup = lib.mkIf cfg.enableBackup {
      description = "BEET Stack PostgreSQL backup";
      serviceConfig = {
        Type = "oneshot";
        DynamicUser = true;
        StateDirectory = lib.removePrefix "/var/lib/" (toString backupDest);
        ExecStart = "${pkgs.bash}/bin/sh -c '${pkgs.postgresql}/bin/pg_dump \"$DATABASE_URL\" | ${pkgs.gzip}/bin/gzip > \"${toString backupDest}/beet-stack-$(date +%%F-%%H%%M).sql.gz\"'";
        ProtectSystem = "strict";
        PrivateTmp = true;
        NoNewPrivileges = true;
      };
      serviceConfig.EnvironmentFile = lib.mkIf (cfg.environmentFile != null) cfg.environmentFile;
    };

    systemd.timers.beet-stack-backup = lib.mkIf cfg.enableBackup {
      description = "Periodic BEET Stack PostgreSQL backup";
      wantedBy = [ "timers.target" ];
      timerConfig = {
        OnCalendar = cfg.backup.schedule;
        Persistent = true;
      };
    };
  };
}
