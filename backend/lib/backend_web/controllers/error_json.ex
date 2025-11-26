defmodule BackendWeb.ErrorJSON do
  @moduledoc """
  This module is invoked by your endpoint in case of errors on JSON requests.

  See config/config.exs.
  """

  def render("401.json", _assigns) do
    %{error: "Unauthorized", message: "Authentication required"}
  end

  def render("403.json", _assigns) do
    %{error: "Forbidden", message: "You don't have permission to access this resource"}
  end

  def render("404.json", _assigns) do
    %{error: "Not Found", message: "Resource not found"}
  end

  def render("500.json", _assigns) do
    %{error: "Internal Server Error", message: "Something went wrong"}
  end

  # By default, Phoenix returns the status message from
  # the template name. For example, "404.json" becomes
  # "Not Found".
  def render(template, _assigns) do
    %{error: Phoenix.Controller.status_message_from_template(template)}
  end
end
