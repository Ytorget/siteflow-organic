defmodule BackendWeb.Plugs.RateLimit do
  @moduledoc """
  Rate limiting plug using Hammer.

  Limits requests per IP address to prevent abuse.
  """

  import Plug.Conn
  import Phoenix.Controller, only: [json: 2]

  @doc """
  Initialize the plug with rate limit options.

  Options:
  - limit: Maximum number of requests (default: 60)
  - period: Time period in milliseconds (default: 60_000 = 1 minute)
  - scope: Custom scope for rate limiting (default: "api")
  """
  def init(opts) do
    %{
      limit: Keyword.get(opts, :limit, 60),
      period: Keyword.get(opts, :period, 60_000),
      scope: Keyword.get(opts, :scope, "api")
    }
  end

  def call(conn, opts) do
    # Get client identifier (IP address)
    client_id = get_client_id(conn)

    # Create rate limit key
    key = "#{opts.scope}:#{client_id}"

    # Check rate limit
    case Hammer.check_rate(key, opts.period, opts.limit) do
      {:allow, _count} ->
        # Request allowed
        conn

      {:deny, limit} ->
        # Rate limit exceeded
        conn
        |> put_status(:too_many_requests)
        |> json(%{
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again later.",
          limit: limit,
          period_seconds: div(opts.period, 1000)
        })
        |> halt()
    end
  end

  defp get_client_id(conn) do
    # Try to get real IP from X-Forwarded-For header (for proxies/load balancers)
    case get_req_header(conn, "x-forwarded-for") do
      [ip | _] ->
        # Take the first IP if multiple are present
        ip |> String.split(",") |> hd() |> String.trim()

      [] ->
        # Fall back to remote_ip
        case conn.remote_ip do
          {a, b, c, d} -> "#{a}.#{b}.#{c}.#{d}"
          {a, b, c, d, e, f, g, h} -> "#{a}:#{b}:#{c}:#{d}:#{e}:#{f}:#{g}:#{h}"
          _ -> "unknown"
        end
    end
  end
end
