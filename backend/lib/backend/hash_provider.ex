defmodule Backend.HashProvider do
  @moduledoc """
  A PBKDF2-based hash provider for AshAuthentication.
  Uses pbkdf2_elixir which is pure Elixir and doesn't require a C compiler.
  """

  @behaviour AshAuthentication.HashProvider

  @impl AshAuthentication.HashProvider
  def hash(password) do
    {:ok, Pbkdf2.hash_pwd_salt(password)}
  end

  @impl AshAuthentication.HashProvider
  def valid?(password, hash) do
    Pbkdf2.verify_pass(password, hash)
  end

  @impl AshAuthentication.HashProvider
  def simulate do
    Pbkdf2.no_user_verify()
    false
  end
end
