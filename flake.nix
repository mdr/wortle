{
  description = "Wortle development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_24
            pnpm
            git
            pre-commit
            go-task
            ngrok
            trivy
            gitleaks
            gh
            delta
            rclone
            jq
            _1password-cli
            pulumi
            pulumiPackages.pulumi-nodejs
          ];

          shellHook = ''
            if [ -t 0 ]; then
              echo "🌿 Wortle dev environment"
              echo "Run 'task' to see available commands"
            fi
          '';
        };
      });
}
