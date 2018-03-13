# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# General application configuration
config :checker,
  ecto_repos: [Checker.Repo]

# Configures the endpoint
config :checker, CheckerWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "fOiRRHo+ULI6ULi94CRA9cvC6HuSAzv4tFQ/HTCmOwo1XQe2gpWvBhtol/t8aueY",
  render_errors: [view: CheckerWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: Checker.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"
