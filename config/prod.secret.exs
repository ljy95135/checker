use Mix.Config

# In this file, we keep production configuration that
# you'll likely want to automate and keep away from
# your version control system.
#
# You should document the content of this
# file or create a script for recreating it, since it's
# kept out of version control and might be hard to recover
# or recreate for your teammates (or yourself later on).
config :checker, CheckerWeb.Endpoint,
  secret_key_base: "xdERh+KdT7MIIMNAbXNwkOFLkX5y1NXSkx5kutmTVzDwv+pz2q/+PoKRgU+x47K5"

# Configure your database
config :checker, Checker.Repo,
  adapter: Ecto.Adapters.Postgres,
  username: "checker",
  password: "Ahxe2boo8Hoo",
  database: "checker_prod",
  pool_size: 15
