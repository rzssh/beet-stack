{
  description = "BEET Stack development shell";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs =
    { nixpkgs, ... }:
    let
      pkgs = nixpkgs.legacyPackages.x86_64-linux;
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
    in
    {
      devShells.x86_64-linux.default = pkgs.mkShell {
        packages = with pkgs; [
          bun
          nodejs_22
          postgresql_17
        ];
        NIX_LD = pkgs.stdenv.cc.bintools.dynamicLinker;
        NIX_LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath nativeLibraries;
      };
    };
}
