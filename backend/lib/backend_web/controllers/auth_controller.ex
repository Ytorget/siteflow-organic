defmodule BackendWeb.AuthController do
  use BackendWeb, :controller

  alias Backend.Accounts
  alias Backend.Accounts.User

  def register(conn, %{"user" => user_params}) do
    # Use the register action defined in the User resource
    # Valid inputs: :password, :email, :first_name, :last_name, :company_id
    case Ash.create(User, %{
           email: user_params["email"],
           password: user_params["password"],
           first_name: user_params["first_name"],
           last_name: user_params["last_name"],
           company_id: user_params["company_id"]
         },
         action: :register_with_password,
         domain: Accounts,
         authorize?: false
       ) do
      {:ok, user} ->
        # Generate token for the new user
        case AshAuthentication.Jwt.token_for_user(user) do
          {:ok, token, _claims} ->
            conn
            |> put_status(:created)
            |> json(%{
              user: user_to_json(user),
              token: token
            })

          {:error, _reason} ->
            conn
            |> put_status(:created)
            |> json(%{
              user: user_to_json(user),
              message: "User created but token generation failed"
            })
        end

      {:error, error} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: format_error(error)})
    end
  end

  def sign_in(conn, %{"user" => %{"email" => email, "password" => password}}) do
    # Use the sign_in action defined in the User resource
    query =
      User
      |> Ash.Query.for_read(:sign_in_with_password, %{email: email, password: password})

    case Ash.read_one(query, domain: Accounts, authorize?: false) do
      {:ok, user} when not is_nil(user) ->
        case AshAuthentication.Jwt.token_for_user(user) do
          {:ok, token, _claims} ->
            json(conn, %{
              user: user_to_json(user),
              token: token
            })

          {:error, _reason} ->
            conn
            |> put_status(:internal_server_error)
            |> json(%{error: "Failed to generate token"})
        end

      {:ok, nil} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Invalid email or password"})

      {:error, _error} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Invalid email or password"})
    end
  end

  def sign_out(conn, _params) do
    # For JWT-based auth, we just return success
    # The client should discard the token
    json(conn, %{message: "Signed out successfully"})
  end

  defp user_to_json(user) do
    %{
      id: user.id,
      email: to_string(user.email),
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      company_id: user.company_id
    }
  end

  defp format_error(%Ash.Error.Invalid{errors: errors}) do
    errors
    |> Enum.map(fn error ->
      case error do
        %{field: field, message: message} -> "#{field}: #{message}"
        %{message: message} -> message
        error -> inspect(error)
      end
    end)
    |> Enum.join(", ")
  end

  defp format_error(error) when is_binary(error), do: error
  defp format_error(error), do: inspect(error)
end
