# Stub module for bcrypt_elixir - we use pbkdf2_elixir instead
# This is only needed because ash_authentication has bcrypt as a non-optional dependency

defmodule Bcrypt do
  @moduledoc false

  # Stub - we use Backend.HashProvider (PBKDF2) instead
  def hash_pwd_salt(_password), do: raise "Bcrypt not available on Windows - use PBKDF2"
  def verify_pass(_password, _hash), do: raise "Bcrypt not available on Windows - use PBKDF2"
  def no_user_verify, do: :ok
end
