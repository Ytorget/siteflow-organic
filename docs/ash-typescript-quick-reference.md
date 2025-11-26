# Ash TypeScript Quick Reference

**Quick reference for Siteflow team - Full details in ash-typescript-integration-guide.md**

---

## Installation (Backend)

```bash
mix igniter.install ash_typescript --framework react
```

## Basic Configuration

### config/config.exs

```elixir
config :ash_typescript,
  output_file: "assets/js/ash_rpc.ts",
  input_field_formatter: :camel_case,
  output_field_formatter: :camel_case,
  generate_zod_schemas: true,
  zod_schema_suffix: "ZodSchema"
```

### Ash Resource

```elixir
defmodule MyApp.Projects.Project do
  use Ash.Resource,
    domain: MyApp.Projects,
    extensions: [AshTypescript.Resource]

  typescript do
    type_name "Project"
  end

  attributes do
    uuid_primary_key :id
    attribute :name, :string, allow_nil?: false
    attribute :status, :atom, constraints: [one_of: [:planning, :active, :completed]]
  end

  actions do
    defaults [:read, :destroy]
    create :create do
      accept [:name, :status]
    end
  end
end
```

### Ash Domain

```elixir
defmodule MyApp.Projects do
  use Ash.Domain,
    extensions: [AshTypescript.Rpc]

  resources do
    resource MyApp.Projects.Project
  end

  typescript_rpc do
    resource MyApp.Projects.Project do
      rpc_action :list_projects, :read
      rpc_action :create_project, :create
    end
  end
end
```

### Generate TypeScript

```bash
mix ash.codegen --dev
```

---

## Frontend Usage

### Install Dependencies

```bash
npm install @tanstack/react-query react-hook-form @hookform/resolvers zod
```

### CSRF Helper

```typescript
// lib/csrf.ts
export function buildCSRFHeaders(): Record<string, string> {
  const token = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute('content');

  return token ? { 'x-csrf-token': token } : {};
}
```

### Custom Hook Pattern

```typescript
// hooks/useProjects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listProjects, createProject } from '../ash_rpc';
import { buildCSRFHeaders } from '../lib/csrf';

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters?) => [...projectKeys.lists(), filters] as const,
};

export function useProjects(filters?) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: async () => {
      const result = await listProjects({
        fields: ['id', 'name', 'status'],
        filter: filters,
        headers: buildCSRFHeaders(),
      });

      if (!result.success) {
        throw new Error(result.errors?.map(e => e.message).join(', '));
      }

      return result.data.results;
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input) => {
      const result = await createProject({
        fields: ['id', 'name', 'status'],
        input,
        headers: buildCSRFHeaders(),
      });

      if (!result.success) {
        throw new Error(result.errors?.map(e => e.message).join(', '));
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
```

### Component Usage

```typescript
import { useProjects, useCreateProject } from '../hooks/useProjects';

export function ProjectsPage() {
  const { data, isLoading } = useProjects();
  const createProject = useCreateProject();

  const handleCreate = async () => {
    await createProject.mutateAsync({
      name: 'New Project',
      status: 'planning'
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={handleCreate}>Create</button>
      {data?.map(p => <div key={p.id}>{p.name}</div>)}
    </div>
  );
}
```

### Form with Zod Schema

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectZodSchema } from '../ash_rpc';

export function ProjectForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(createProjectZodSchema),
  });

  const onSubmit = async (data) => {
    // Handle submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}

      <select {...register('status')}>
        <option value="planning">Planning</option>
        <option value="active">Active</option>
      </select>

      <button type="submit">Create</button>
    </form>
  );
}
```

---

## Common Patterns

### Filtering

```typescript
const { data } = useProjects({
  filter: {
    status: { in: ['active', 'planning'] },
    name: { contains: 'website' }
  }
});
```

### Sorting

```typescript
const result = await listProjects({
  fields: ['id', 'name'],
  sort: ['-createdAt', 'name'] // Desc createdAt, Asc name
});
```

### Pagination

```typescript
const { data } = useProjects({
  page: { limit: 25, offset: 0 }
});

// Keyset pagination
const { data } = useProjects({
  page: { limit: 25, after: cursor }
});
```

### Loading Relationships

```typescript
const result = await getProject({
  id: projectId,
  fields: [
    'id',
    'name',
    { customer: ['id', 'name', 'email'] },
    { tasks: ['id', 'title', 'status'] }
  ]
});
```

---

## Error Handling

```typescript
try {
  await createProject.mutateAsync(data);
} catch (err) {
  if (err instanceof Error) {
    // Parse Ash errors
    setError('root', { message: err.message });
  }
}
```

---

## Authentication

### Backend Plug

```elixir
defmodule MyAppWeb.Plugs.SetActor do
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    current_user = get_session(conn, :current_user_id)
      |> case do
        nil -> nil
        user_id -> MyApp.Accounts.get_user!(user_id)
      end

    Ash.PlugHelpers.set_actor(conn, current_user)
  end
end
```

### Frontend (Automatic)

Actor is set server-side via plug. Frontend just sends CSRF token:

```typescript
await createProject({
  fields: ['id', 'name'],
  input: { name: 'Project' },
  headers: buildCSRFHeaders()  // CSRF only
});
```

---

## Development Workflow

1. Modify Ash resource
2. Run `mix ash.codegen --dev`
3. Fix TypeScript compilation errors
4. Test frontend
5. Commit changes

---

## Key Files

- **Generated**: `assets/js/ash_rpc.ts` (DO NOT EDIT)
- **Config**: `config/config.exs`
- **Resources**: `lib/my_app/*/resource.ex`
- **Domains**: `lib/my_app/*.ex`
- **Hooks**: `assets/js/hooks/use*.ts`
- **Components**: `assets/js/pages/**/*.tsx`

---

## Resources

- Full Guide: `docs/ash-typescript-integration-guide.md`
- Docs: https://hexdocs.pm/ash_typescript
- Demo: https://github.com/ChristianAlexander/ash_typescript_demo
