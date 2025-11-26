# Ash TypeScript Integration Guide

**Complete Guide for Auto-Generating TypeScript Types and Zod Schemas from Ash Framework Resources**

Version: 1.0
Last Updated: November 15, 2025
Ash TypeScript Version: 0.7.1

---

## Table of Contents

1. [Overview](#overview)
2. [Complete Setup Guide](#complete-setup-guide)
3. [Generated Code Examples](#generated-code-examples)
4. [TanStack Query Integration Patterns](#tanstack-query-integration-patterns)
5. [React Hook Form with Zod Schemas](#react-hook-form-with-zod-schemas)
6. [Advanced Features](#advanced-features)
7. [Code Organization Best Practices](#code-organization-best-practices)
8. [Versioning Strategy](#versioning-strategy)
9. [Full Stack Example](#full-stack-example)
10. [Production Considerations](#production-considerations)

---

## Overview

**Ash TypeScript** is an official Ash Framework package that automatically generates type-safe TypeScript clients directly from your Elixir Ash resources. It provides end-to-end type safety between your Elixir backend and TypeScript frontend with zero manual API type definitions.

### Key Features

- **Zero-Config TypeScript Generation** - Automatic type generation from Ash resources
- **End-to-End Type Safety** - Catch integration errors at compile time
- **Smart Field Selection** - Full type inference with field selection
- **RPC Client Generation** - Type-safe function calls for all action types
- **Zod Schema Generation** - Runtime validation for React Hook Form
- **Phoenix Channels Support** - Real-time WebSocket RPC functions
- **Multitenancy Ready** - Automatic tenant parameter handling
- **Lifecycle Hooks** - Inject custom logic (auth, telemetry, etc.)

### System Requirements

- Elixir 1.15 or later
- Ash 3.0 or later
- Phoenix Framework
- Node.js 16+
- TypeScript 4.9+

---

## Complete Setup Guide

### Installation

#### Option 1: Basic Installation

```bash
mix igniter.install ash_typescript
```

#### Option 2: Full-Stack Phoenix + React Setup (Recommended)

```bash
mix igniter.install ash_typescript --framework react
```

This automatically sets up:
- `package.json` with React 19 & TypeScript
- React components with TypeScript
- Tailwind CSS integration
- esbuild configuration
- TypeScript compilation
- Welcome page at `/ash-typescript`

### Backend Configuration

#### Step 1: Configure Elixir Application

Add to `config/config.exs`:

```elixir
config :ash_typescript,
  # Output file path
  output_file: "assets/js/ash_rpc.ts",

  # API endpoints
  run_endpoint: "/rpc/run",
  validate_endpoint: "/rpc/validate",

  # Field formatting (camelCase for JS convention)
  input_field_formatter: :camel_case,
  output_field_formatter: :camel_case,

  # Zod schema generation (REQUIRED for React Hook Form)
  generate_zod_schemas: true,
  zod_import_path: "zod",
  zod_schema_suffix: "ZodSchema",

  # Validation functions
  generate_validation_functions: true,

  # Phoenix Channels (for real-time features)
  generate_phx_channel_rpc_actions: false,
  phoenix_import_path: "phoenix",

  # Multitenancy
  require_tenant_parameters: false,

  # Warnings
  warn_on_missing_rpc_config: true,
  warn_on_non_rpc_references: true
```

#### Step 2: Define Ash Resources with TypeScript Extension

```elixir
# lib/my_app/projects/project.ex
defmodule MyApp.Projects.Project do
  use Ash.Resource,
    domain: MyApp.Projects,
    extensions: [AshTypescript.Resource]  # Add this extension

  # TypeScript configuration
  typescript do
    type_name "Project"  # TypeScript type name
  end

  attributes do
    uuid_primary_key :id

    attribute :name, :string do
      allow_nil? false
      constraints min_length: 1, max_length: 100
    end

    attribute :description, :string

    attribute :status, :atom do
      constraints one_of: [:planning, :active, :completed, :on_hold]
      default :planning
    end

    attribute :priority, :atom do
      constraints one_of: [:low, :medium, :high, :urgent]
      default :medium
    end

    attribute :start_date, :date
    attribute :end_date, :date

    create_timestamp :created_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :customer, MyApp.Customers.Customer
    has_many :tasks, MyApp.Projects.Task
    has_many :tickets, MyApp.Support.Ticket
  end

  actions do
    defaults [:read, :destroy]

    read :list do
      pagination offset?: true, keyset?: true, default_limit: 25
    end

    create :create do
      accept [:name, :description, :status, :priority, :start_date, :end_date]
      argument :customer_id, :uuid, allow_nil?: false

      change manage_relationship(:customer_id, :customer, type: :append)
    end

    update :update do
      accept [:name, :description, :status, :priority, :start_date, :end_date]
    end
  end
end
```

#### Step 3: Configure Domain with RPC Extension

```elixir
# lib/my_app/projects.ex
defmodule MyApp.Projects do
  use Ash.Domain,
    extensions: [AshTypescript.Rpc]  # Add this extension

  resources do
    resource MyApp.Projects.Project
    resource MyApp.Projects.Task
  end

  # TypeScript RPC configuration
  typescript_rpc do
    # Expose Project resource actions
    resource MyApp.Projects.Project do
      rpc_action :list_projects, :list
      rpc_action :get_project, :read
      rpc_action :create_project, :create
      rpc_action :update_project, :update
      rpc_action :delete_project, :destroy
    end

    # Expose Task resource actions
    resource MyApp.Projects.Task do
      rpc_action :list_tasks, :list
      rpc_action :create_task, :create
      rpc_action :update_task, :update
      rpc_action :complete_task, :complete  # Custom action
    end
  end
end
```

#### Step 4: Set Up Phoenix Router

```elixir
# lib/my_app_web/router.ex
defmodule MyAppWeb.Router do
  use MyAppWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
    plug :fetch_session
    # Set actor from session/token
    plug MyAppWeb.Plugs.SetActor
  end

  scope "/rpc", MyAppWeb do
    pipe_through :api

    # AshTypescript RPC endpoints
    post "/run", AshTypescriptController, :run
    post "/validate", AshTypescriptController, :validate
  end
end
```

#### Step 5: Create RPC Controller

```elixir
# lib/my_app_web/controllers/ash_typescript_controller.ex
defmodule MyAppWeb.AshTypescriptController do
  use MyAppWeb, :controller

  def run(conn, params) do
    # The actor should already be set by SetActor plug
    result = AshTypescript.Rpc.run_action(:my_app, conn, params)
    json(conn, result)
  end

  def validate(conn, params) do
    result = AshTypescript.Rpc.validate_action(:my_app, conn, params)
    json(conn, result)
  end
end
```

#### Step 6: Set Actor Context (Authentication)

```elixir
# lib/my_app_web/plugs/set_actor.ex
defmodule MyAppWeb.Plugs.SetActor do
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    # Get current user from session/token
    current_user = get_session(conn, :current_user_id)
      |> case do
        nil -> nil
        user_id -> MyApp.Accounts.get_user!(user_id)
      end

    # Set actor for Ash authorization
    conn
    |> Ash.PlugHelpers.set_actor(current_user)
  end
end
```

### Frontend Configuration

#### Step 7: Generate TypeScript Code

```bash
cd /path/to/phoenix/app
mix ash.codegen --dev
```

This generates `assets/js/ash_rpc.ts` with:
- TypeScript type definitions
- RPC function calls
- Zod validation schemas
- Type-safe field selection types

#### Step 8: Install Frontend Dependencies

```bash
cd assets
npm install --save \
  @tanstack/react-query \
  react-hook-form \
  @hookform/resolvers \
  zod
```

#### Step 9: Configure TypeScript

```json
// assets/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./js/*"]
    }
  },
  "include": ["js/**/*"],
  "exclude": ["node_modules"]
}
```

#### Step 10: Set Up CSRF Protection

```typescript
// assets/js/lib/csrf.ts
export function buildCSRFHeaders(): Record<string, string> {
  const token = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute('content');

  if (!token) {
    console.warn('CSRF token not found');
    return {};
  }

  return {
    'x-csrf-token': token
  };
}
```

Ensure your Phoenix layout has the CSRF meta tag:

```heex
<!-- lib/my_app_web/components/layouts/root.html.heex -->
<meta name="csrf-token" content={get_csrf_token()} />
```

---

## Generated Code Examples

### Example 1: Generated TypeScript Types

After running `mix ash.codegen`, you get fully-typed interfaces:

```typescript
// assets/js/ash_rpc.ts (GENERATED - DO NOT EDIT)

// ==================== Type Definitions ====================

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: string | null;  // ISO date string
  endDate: string | null;
  customerId: string;
  createdAt: string;  // ISO datetime string
  updatedAt: string;

  // Relationships (only included if loaded)
  customer?: Customer;
  tasks?: Task[];
  tickets?: Ticket[];
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
  projectId: string;
  assignedToId: string | null;
  createdAt: string;
  updatedAt: string;

  // Relationships
  project?: Project;
  assignedTo?: User;
}

// ==================== Filter Types ====================

export interface ProjectFilterInput {
  id?: StringFilterInput;
  name?: StringFilterInput;
  status?: {
    eq?: Project['status'];
    in?: Project['status'][];
  };
  priority?: {
    eq?: Project['priority'];
    in?: Project['priority'][];
  };
  customerId?: StringFilterInput;
  createdAt?: DateTimeFilterInput;

  // Logical operators
  and?: ProjectFilterInput[];
  or?: ProjectFilterInput[];
  not?: ProjectFilterInput;
}

export interface StringFilterInput {
  eq?: string;
  not_eq?: string;
  in?: string[];
  contains?: string;
  starts_with?: string;
  ends_with?: string;
}

export interface DateTimeFilterInput {
  eq?: string;
  gt?: string;
  gte?: string;
  lt?: string;
  lte?: string;
}

// ==================== Pagination Types ====================

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  // Keyset pagination
  after?: string;
  before?: string;
}

export interface PageInfo {
  startCursor: string | null;
  endCursor: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ==================== Field Selection Types ====================

export type ProjectFields =
  | 'id'
  | 'name'
  | 'description'
  | 'status'
  | 'priority'
  | 'startDate'
  | 'endDate'
  | 'customerId'
  | 'createdAt'
  | 'updatedAt'
  | { customer: CustomerFields | CustomerFields[] }
  | { tasks: TaskFields | TaskFields[] }
  | { tickets: TicketFields | TicketFields[] };

export type ListProjectsFields = ProjectFields | ProjectFields[];

// ==================== Input Types ====================

export interface CreateProjectInput {
  name: string;
  description?: string;
  status?: 'planning' | 'active' | 'completed' | 'on_hold';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  startDate?: string;
  endDate?: string;
  customerId: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: 'planning' | 'active' | 'completed' | 'on_hold';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  startDate?: string;
  endDate?: string;
}

// ==================== Result Types ====================

export interface ListProjectsResult<Fields extends ListProjectsFields> {
  success: boolean;
  data?: {
    results: PickFields<Project, Fields>[];
    count: number;
    pageInfo: PageInfo;
  };
  errors?: AshError[];
}

export interface GetProjectResult<Fields extends ProjectFields[]> {
  success: boolean;
  data?: PickFields<Project, Fields>;
  errors?: AshError[];
}

export interface CreateProjectResult<Fields extends ProjectFields[]> {
  success: boolean;
  data?: PickFields<Project, Fields>;
  errors?: AshError[];
}

export interface AshError {
  field: string | null;
  message: string;
  code: string;
  vars: Record<string, any>;
}

// ==================== Zod Schemas ====================

import { z } from 'zod';

export const createProjectZodSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  status: z.enum(['planning', 'active', 'completed', 'on_hold']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  startDate: z.string().optional(),  // ISO date
  endDate: z.string().optional(),
  customerId: z.string().uuid(),
});

export const updateProjectZodSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  status: z.enum(['planning', 'active', 'completed', 'on_hold']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// ==================== RPC Functions ====================

export async function listProjects<Fields extends ListProjectsFields>(
  config: {
    fields: Fields;
    filter?: ProjectFilterInput;
    sort?: string | string[];
    page?: PaginationOptions;
    headers?: Record<string, string>;
  }
): Promise<ListProjectsResult<Fields>> {
  const response = await fetch('/rpc/run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
    body: JSON.stringify({
      action: 'list_projects',
      fields: config.fields,
      filter: config.filter,
      sort: config.sort,
      page: config.page,
    }),
  });

  return response.json();
}

export async function getProject<Fields extends ProjectFields[]>(
  config: {
    id: string;
    fields: Fields;
    headers?: Record<string, string>;
  }
): Promise<GetProjectResult<Fields>> {
  const response = await fetch('/rpc/run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
    body: JSON.stringify({
      action: 'get_project',
      id: config.id,
      fields: config.fields,
    }),
  });

  return response.json();
}

export async function createProject<Fields extends ProjectFields[]>(
  config: {
    fields: Fields;
    input: CreateProjectInput;
    headers?: Record<string, string>;
  }
): Promise<CreateProjectResult<Fields>> {
  const response = await fetch('/rpc/run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
    body: JSON.stringify({
      action: 'create_project',
      fields: config.fields,
      input: config.input,
    }),
  });

  return response.json();
}

export async function updateProject<Fields extends ProjectFields[]>(
  config: {
    id: string;
    fields: Fields;
    input: UpdateProjectInput;
    headers?: Record<string, string>;
  }
): Promise<CreateProjectResult<Fields>> {
  const response = await fetch('/rpc/run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
    body: JSON.stringify({
      action: 'update_project',
      id: config.id,
      fields: config.fields,
      input: config.input,
    }),
  });

  return response.json();
}

// ==================== Validation Functions ====================

export async function validateCreateProject(
  config: {
    input: CreateProjectInput;
    headers?: Record<string, string>;
  }
): Promise<{ success: boolean; errors?: AshError[] }> {
  const response = await fetch('/rpc/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
    body: JSON.stringify({
      action: 'create_project',
      input: config.input,
    }),
  });

  return response.json();
}
```

### Example 2: Using Generated Functions

```typescript
// Simple usage
import { listProjects, createProject } from './ash_rpc';
import { buildCSRFHeaders } from './lib/csrf';

async function loadProjects() {
  const result = await listProjects({
    fields: ['id', 'name', 'status', 'priority'],
    filter: {
      status: { in: ['active', 'planning'] }
    },
    sort: ['-createdAt'],
    page: { limit: 25, offset: 0 },
    headers: buildCSRFHeaders()
  });

  if (result.success) {
    console.log('Projects:', result.data.results);
    console.log('Total:', result.data.count);
  } else {
    console.error('Errors:', result.errors);
  }
}

// With nested relationships
async function loadProjectWithDetails(projectId: string) {
  const result = await getProject({
    id: projectId,
    fields: [
      'id',
      'name',
      'description',
      'status',
      { customer: ['id', 'name', 'email'] },
      { tasks: ['id', 'title', 'status', 'dueDate'] }
    ],
    headers: buildCSRFHeaders()
  });

  if (result.success) {
    // TypeScript knows exact shape based on fields selected
    console.log('Project:', result.data.name);
    console.log('Customer:', result.data.customer?.name);
    console.log('Tasks:', result.data.tasks?.length);
  }
}
```

---

## TanStack Query Integration Patterns

### Setup TanStack Query

```typescript
// assets/js/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

```typescript
// assets/js/App.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/query-client';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Custom Hooks Pattern

Create custom hooks that wrap the generated RPC functions:

```typescript
// assets/js/hooks/useProjects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  type Project,
  type ProjectFilterInput,
  type CreateProjectInput,
  type UpdateProjectInput,
  type PaginationOptions,
} from '../ash_rpc';
import { buildCSRFHeaders } from '../lib/csrf';

// ==================== Query Keys ====================

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters?: ProjectFilterInput, page?: PaginationOptions) =>
    [...projectKeys.lists(), { filters, page }] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

// ==================== List Projects ====================

export interface UseProjectsOptions {
  filters?: ProjectFilterInput;
  page?: PaginationOptions;
  sort?: string | string[];
}

export function useProjects(options: UseProjectsOptions = {}) {
  const { filters, page, sort } = options;

  return useQuery({
    queryKey: projectKeys.list(filters, page),
    queryFn: async () => {
      const result = await listProjects({
        fields: [
          'id',
          'name',
          'description',
          'status',
          'priority',
          'startDate',
          'endDate',
          'createdAt',
          'updatedAt',
          { customer: ['id', 'name'] }
        ],
        filter: filters,
        page,
        sort,
        headers: buildCSRFHeaders(),
      });

      if (!result.success) {
        throw new Error(result.errors?.map(e => e.message).join(', ') || 'Failed to load projects');
      }

      return result.data;
    },
  });
}

// ==================== Get Project ====================

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(projectId!),
    queryFn: async () => {
      const result = await getProject({
        id: projectId!,
        fields: [
          'id',
          'name',
          'description',
          'status',
          'priority',
          'startDate',
          'endDate',
          'createdAt',
          'updatedAt',
          { customer: ['id', 'name', 'email'] },
          { tasks: ['id', 'title', 'status', 'priority', 'dueDate'] },
          { tickets: ['id', 'subject', 'status', 'priority'] }
        ],
        headers: buildCSRFHeaders(),
      });

      if (!result.success) {
        throw new Error(result.errors?.map(e => e.message).join(', ') || 'Failed to load project');
      }

      return result.data;
    },
    enabled: !!projectId,
  });
}

// ==================== Create Project ====================

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      const result = await createProject({
        fields: [
          'id',
          'name',
          'description',
          'status',
          'priority',
          'startDate',
          'endDate',
          'createdAt',
        ],
        input,
        headers: buildCSRFHeaders(),
      });

      if (!result.success) {
        throw new Error(result.errors?.map(e => e.message).join(', ') || 'Failed to create project');
      }

      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

// ==================== Update Project ====================

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateProjectInput }) => {
      const result = await updateProject({
        id,
        fields: [
          'id',
          'name',
          'description',
          'status',
          'priority',
          'startDate',
          'endDate',
          'updatedAt',
        ],
        input,
        headers: buildCSRFHeaders(),
      });

      if (!result.success) {
        throw new Error(result.errors?.map(e => e.message).join(', ') || 'Failed to update project');
      }

      return result.data;
    },
    onSuccess: (data) => {
      // Invalidate specific project and list
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

// ==================== Delete Project ====================

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const result = await deleteProject({
        id: projectId,
        headers: buildCSRFHeaders(),
      });

      if (!result.success) {
        throw new Error(result.errors?.map(e => e.message).join(', ') || 'Failed to delete project');
      }

      return result.data;
    },
    onSuccess: (_, projectId) => {
      // Remove from cache and invalidate list
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
```

### Using the Custom Hooks in Components

```typescript
// assets/js/pages/admin/Projects.tsx
import React, { useState } from 'react';
import { useProjects, useCreateProject } from '../../hooks/useProjects';
import type { ProjectFilterInput } from '../../ash_rpc';

export function ProjectsPage() {
  const [filters, setFilters] = useState<ProjectFilterInput>({});
  const [page, setPage] = useState({ limit: 25, offset: 0 });

  // Fetch projects
  const { data, isLoading, error, refetch } = useProjects({
    filters,
    page,
    sort: ['-createdAt'],
  });

  // Create project mutation
  const createProject = useCreateProject();

  const handleCreateProject = async () => {
    try {
      await createProject.mutateAsync({
        name: 'New Project',
        description: 'Project description',
        customerId: 'customer-uuid',
        status: 'planning',
        priority: 'medium',
      });
      // No need to manually refetch - TanStack Query handles it
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  if (isLoading) {
    return <div>Loading projects...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>Projects ({data.count})</h1>

      <button onClick={handleCreateProject} disabled={createProject.isPending}>
        {createProject.isPending ? 'Creating...' : 'Create Project'}
      </button>

      <div className="grid gap-4">
        {data.results.map(project => (
          <div key={project.id} className="border p-4 rounded">
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <span className="badge">{project.status}</span>
            <span className="badge">{project.priority}</span>
            {project.customer && (
              <p>Customer: {project.customer.name}</p>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex gap-2">
        <button
          onClick={() => setPage(p => ({ ...p, offset: Math.max(0, p.offset - p.limit) }))}
          disabled={page.offset === 0}
        >
          Previous
        </button>
        <button
          onClick={() => setPage(p => ({ ...p, offset: p.offset + p.limit }))}
          disabled={!data.pageInfo.hasNextPage}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

---

## React Hook Form with Zod Schemas

### Complete Form Pattern

```typescript
// assets/js/components/modals/CreateProjectModal.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateProject } from '../../hooks/useProjects';
import {
  createProjectZodSchema,
  type CreateProjectInput,
} from '../../ash_rpc';

interface CreateProjectModalProps {
  customerId?: string;
  onClose: () => void;
  onSuccess?: (project: Project) => void;
}

export function CreateProjectModal({
  customerId,
  onClose,
  onSuccess,
}: CreateProjectModalProps) {
  const createProject = useCreateProject();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectZodSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      customerId: customerId || '',
    },
  });

  const onSubmit = async (data: CreateProjectInput) => {
    try {
      const project = await createProject.mutateAsync(data);
      onSuccess?.(project);
      onClose();
    } catch (err) {
      // Handle validation errors from backend
      if (err instanceof Error) {
        const message = err.message;

        // Parse Ash validation errors
        if (message.includes('name')) {
          setError('name', { message });
        } else {
          setError('root', { message });
        }
      }
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Create Project</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Name */}
          <div className="form-group">
            <label htmlFor="name">Project Name *</label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && (
              <span className="error-message">{errors.name.message}</span>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={4}
              {...register('description')}
              className={errors.description ? 'error' : ''}
            />
            {errors.description && (
              <span className="error-message">{errors.description.message}</span>
            )}
          </div>

          {/* Status */}
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select id="status" {...register('status')}>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
            {errors.status && (
              <span className="error-message">{errors.status.message}</span>
            )}
          </div>

          {/* Priority */}
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select id="priority" {...register('priority')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            {errors.priority && (
              <span className="error-message">{errors.priority.message}</span>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                id="startDate"
                type="date"
                {...register('startDate')}
              />
              {errors.startDate && (
                <span className="error-message">{errors.startDate.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                id="endDate"
                type="date"
                {...register('endDate')}
              />
              {errors.endDate && (
                <span className="error-message">{errors.endDate.message}</span>
              )}
            </div>
          </div>

          {/* Root errors */}
          {errors.root && (
            <div className="error-banner">
              {errors.root.message}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

### Advanced: Custom Validation Combining Zod + Backend

```typescript
// assets/js/components/forms/ProjectForm.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  createProjectZodSchema,
  validateCreateProject,
  type CreateProjectInput,
} from '../../ash_rpc';
import { buildCSRFHeaders } from '../../lib/csrf';

// Extend Zod schema with custom frontend validation
const extendedSchema = createProjectZodSchema.extend({
  // Custom: end date must be after start date
  endDate: z.string().optional(),
}).refine(
  (data) => {
    if (!data.startDate || !data.endDate) return true;
    return new Date(data.endDate) > new Date(data.startDate);
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

export function ProjectForm() {
  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(extendedSchema),
    mode: 'onBlur', // Validate on blur for better UX
  });

  // Real-time backend validation on blur
  const handleFieldBlur = async (field: keyof CreateProjectInput) => {
    const value = form.getValues(field);

    // Only validate if field has value
    if (!value) return;

    try {
      const result = await validateCreateProject({
        input: { [field]: value } as any,
        headers: buildCSRFHeaders(),
      });

      if (!result.success) {
        const error = result.errors?.find(e => e.field === field);
        if (error) {
          form.setError(field, { message: error.message });
        }
      }
    } catch (err) {
      console.error('Validation error:', err);
    }
  };

  return (
    <form>
      <input
        {...form.register('name')}
        onBlur={() => handleFieldBlur('name')}
      />
      {/* Rest of form */}
    </form>
  );
}
```

---

## Advanced Features

### Filtering and Sorting

```typescript
// Complex filtering
import { useProjects } from '../hooks/useProjects';
import type { ProjectFilterInput } from '../ash_rpc';

function ProjectsWithAdvancedFiltering() {
  const [filters, setFilters] = useState<ProjectFilterInput>({
    // Combine multiple conditions
    and: [
      { status: { in: ['active', 'planning'] } },
      { priority: { eq: 'high' } },
      {
        or: [
          { name: { contains: 'website' } },
          { description: { contains: 'website' } }
        ]
      }
    ],
    // Date range filter
    createdAt: {
      gte: '2025-01-01T00:00:00Z',
      lte: '2025-12-31T23:59:59Z'
    }
  });

  const { data } = useProjects({
    filters,
    sort: ['-priority', '-createdAt'], // Sort by priority desc, then createdAt desc
    page: { limit: 50 }
  });

  // ...
}
```

### Pagination Strategies

```typescript
// Offset pagination
function OffsetPaginatedProjects() {
  const [page, setPage] = useState({ limit: 25, offset: 0 });
  const { data } = useProjects({ page });

  return (
    <>
      {/* Content */}
      <Pagination
        currentPage={Math.floor(page.offset / page.limit) + 1}
        totalPages={Math.ceil((data?.count || 0) / page.limit)}
        onPageChange={(p) => setPage({ limit: 25, offset: (p - 1) * 25 })}
      />
    </>
  );
}

// Keyset (cursor) pagination - better for large datasets
function KeysetPaginatedProjects() {
  const [cursor, setCursor] = useState<{ after?: string; before?: string }>({});
  const { data } = useProjects({
    page: { limit: 25, ...cursor }
  });

  return (
    <>
      {/* Content */}
      <div className="flex gap-2">
        <button
          onClick={() => setCursor({ before: data?.pageInfo.startCursor })}
          disabled={!data?.pageInfo.hasPreviousPage}
        >
          Previous
        </button>
        <button
          onClick={() => setCursor({ after: data?.pageInfo.endCursor })}
          disabled={!data?.pageInfo.hasNextPage}
        >
          Next
        </button>
      </div>
    </>
  );
}
```

### Loading Relationships

```typescript
// Lazy load relationships on demand
import { getProject } from '../ash_rpc';

function ProjectDetailWithLazyLoading({ projectId }: { projectId: string }) {
  const [includeRelationships, setIncludeRelationships] = useState(false);

  const { data } = useQuery({
    queryKey: ['project', projectId, includeRelationships],
    queryFn: async () => {
      const result = await getProject({
        id: projectId,
        fields: [
          'id',
          'name',
          'description',
          'status',
          ...(includeRelationships
            ? [
                { customer: ['id', 'name', 'email'] },
                { tasks: ['id', 'title', 'status'] },
                { tickets: ['id', 'subject', 'status'] }
              ]
            : []
          )
        ] as any,
        headers: buildCSRFHeaders()
      });

      if (!result.success) throw new Error('Failed to load');
      return result.data;
    }
  });

  return (
    <div>
      <h1>{data?.name}</h1>

      {!includeRelationships ? (
        <button onClick={() => setIncludeRelationships(true)}>
          Load Related Data
        </button>
      ) : (
        <>
          <h3>Customer: {data?.customer?.name}</h3>
          <h3>Tasks: {data?.tasks?.length}</h3>
          <h3>Tickets: {data?.tickets?.length}</h3>
        </>
      )}
    </div>
  );
}
```

### File Uploads

File uploads require special handling since they're not part of standard RPC actions:

```elixir
# Backend: Define custom file upload action
defmodule MyApp.Projects.Project do
  # ... other code

  actions do
    # Custom action for file upload
    update :attach_file do
      accept []
      argument :file_data, :map, allow_nil?: false

      change fn changeset, _context ->
        case changeset.arguments[:file_data] do
          %{path: path, filename: filename} ->
            # Handle file storage (S3, local, etc.)
            file_url = MyApp.FileStorage.upload(path, filename)
            Ash.Changeset.change_attribute(changeset, :attachment_url, file_url)

          _ ->
            Ash.Changeset.add_error(changeset, field: :file_data, message: "Invalid file")
        end
      end
    end
  end
end
```

```typescript
// Frontend: Upload file with multipart/form-data
async function uploadProjectFile(projectId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('project_id', projectId);

  const response = await fetch('/api/projects/upload', {
    method: 'POST',
    headers: buildCSRFHeaders(),
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  return response.json();
}

// Usage in component
function ProjectFileUpload({ projectId }: { projectId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      await uploadProjectFile(projectId, file);
      alert('File uploaded successfully');
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Uploading...' : 'Upload File'}
      </button>
    </div>
  );
}
```

### Custom Actions and Complex Workflows

```elixir
# Backend: Define custom action
defmodule MyApp.Projects.Project do
  actions do
    # Custom workflow action
    update :complete_project do
      accept []

      change fn changeset, context ->
        project = changeset.data

        # Business logic
        if project.status != :active do
          Ash.Changeset.add_error(
            changeset,
            field: :status,
            message: "Can only complete active projects"
          )
        else
          # Check all tasks are completed
          incomplete_tasks = MyApp.Projects.Task
            |> Ash.Query.filter(project_id == ^project.id and status != :completed)
            |> Ash.read!(actor: context.actor)

          if length(incomplete_tasks) > 0 do
            Ash.Changeset.add_error(
              changeset,
              field: :tasks,
              message: "All tasks must be completed first"
            )
          else
            changeset
            |> Ash.Changeset.change_attribute(:status, :completed)
            |> Ash.Changeset.change_attribute(:completed_at, DateTime.utc_now())
          end
        end
      end
    end
  end
end

# Expose in domain
typescript_rpc do
  resource MyApp.Projects.Project do
    rpc_action :complete_project, :complete_project
  end
end
```

```typescript
// Generated function (simplified)
export async function completeProject(config: {
  id: string;
  fields: ProjectFields[];
  headers?: Record<string, string>;
}): Promise<CompleteProjectResult> {
  // ... implementation
}

// Usage
import { completeProject } from '../ash_rpc';

function ProjectCompleteButton({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();

  const complete = useMutation({
    mutationFn: () => completeProject({
      id: projectId,
      fields: ['id', 'status', 'completedAt'],
      headers: buildCSRFHeaders()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  const handleComplete = async () => {
    try {
      const result = await complete.mutateAsync();
      if (!result.success) {
        // Show validation errors
        alert(result.errors?.map(e => e.message).join('\n'));
      } else {
        alert('Project completed!');
      }
    } catch (err) {
      alert('Failed to complete project');
    }
  };

  return (
    <button onClick={handleComplete} disabled={complete.isPending}>
      {complete.isPending ? 'Completing...' : 'Complete Project'}
    </button>
  );
}
```

### Real-Time Updates with Phoenix Channels

#### Backend Setup

```elixir
# config/config.exs
config :ash_typescript,
  generate_phx_channel_rpc_actions: true,
  phoenix_import_path: "phoenix"

# lib/my_app_web/channels/user_socket.ex
defmodule MyAppWeb.UserSocket do
  use Phoenix.Socket

  channel "ash_typescript_rpc:*", MyAppWeb.AshTypescriptRpcChannel

  def connect(%{"token" => token}, socket, _connect_info) do
    case MyApp.Accounts.verify_token(token) do
      {:ok, user} ->
        socket = socket
          |> assign(:ash_actor, user)
          |> assign(:ash_tenant, user.tenant_id)
        {:ok, socket}

      {:error, _} ->
        :error
    end
  end

  def id(socket), do: "user:#{socket.assigns.ash_actor.id}"
end

# lib/my_app_web/channels/ash_typescript_rpc_channel.ex
defmodule MyAppWeb.AshTypescriptRpcChannel do
  use Phoenix.Channel

  def join("ash_typescript_rpc:" <> user_id, _payload, socket) do
    if socket.assigns.ash_actor.id == user_id do
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  def handle_in("run", params, socket) do
    result = AshTypescript.Rpc.run_action(:my_app, socket, params)
    {:reply, {:ok, result}, socket}
  end

  def handle_in("validate", params, socket) do
    result = AshTypescript.Rpc.validate_action(:my_app, socket, params)
    {:reply, {:ok, result}, socket}
  end
end

# lib/my_app_web/endpoint.ex
defmodule MyAppWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :my_app

  socket "/socket", MyAppWeb.UserSocket,
    websocket: true,
    longpoll: false
end
```

#### Frontend Setup

```typescript
// assets/js/lib/socket.ts
import { Socket } from 'phoenix';

let socket: Socket | null = null;
let rpcChannel: any = null;

export function connectSocket(authToken: string): Promise<any> {
  return new Promise((resolve, reject) => {
    socket = new Socket('/socket', {
      params: { token: authToken },
      logger: (kind, msg, data) => {
        console.log(`${kind}: ${msg}`, data);
      }
    });

    socket.connect();

    // Get user ID from token or state
    const userId = 'user-123'; // Replace with actual user ID

    rpcChannel = socket.channel(`ash_typescript_rpc:${userId}`, {});

    rpcChannel.join()
      .receive('ok', () => {
        console.log('Connected to RPC channel');
        resolve(rpcChannel);
      })
      .receive('error', (resp: any) => {
        console.error('Failed to join channel', resp);
        reject(resp);
      });
  });
}

export function disconnectSocket() {
  if (rpcChannel) {
    rpcChannel.leave();
  }
  if (socket) {
    socket.disconnect();
  }
}

export function getRpcChannel() {
  return rpcChannel;
}
```

#### Using Channel-based RPC

```typescript
// Generated channel functions (example)
import { getRpcChannel } from './lib/socket';
import { listProjectsChannel, createProjectChannel } from './ash_rpc';

function RealtimeProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const channel = getRpcChannel();

    if (!channel) {
      console.error('Channel not connected');
      return;
    }

    // Load projects via channel
    listProjectsChannel({
      channel,
      fields: ['id', 'name', 'status', 'priority'],
      filter: { status: { in: ['active', 'planning'] } },
      resultHandler: (result) => {
        if (result.success) {
          setProjects(result.data.results);
          setLoading(false);
        } else {
          console.error('Failed to load projects:', result.errors);
        }
      },
      errorHandler: (error) => {
        console.error('Channel error:', error);
        setLoading(false);
      },
      timeoutHandler: () => {
        console.error('Request timed out');
        setLoading(false);
      }
    });

    // Subscribe to broadcast updates (if implemented in backend)
    channel.on('project_created', (payload: any) => {
      setProjects(prev => [...prev, payload.project]);
    });

    channel.on('project_updated', (payload: any) => {
      setProjects(prev =>
        prev.map(p => p.id === payload.project.id ? payload.project : p)
      );
    });

    return () => {
      channel.off('project_created');
      channel.off('project_updated');
    };
  }, []);

  const handleCreateProject = () => {
    const channel = getRpcChannel();

    createProjectChannel({
      channel,
      fields: ['id', 'name', 'status'],
      input: {
        name: 'Real-time Project',
        customerId: 'customer-123',
        status: 'planning'
      },
      resultHandler: (result) => {
        if (result.success) {
          console.log('Project created:', result.data);
          // Update handled by broadcast
        } else {
          console.error('Failed to create:', result.errors);
        }
      },
      errorHandler: (error) => console.error('Error:', error),
      timeoutHandler: () => console.error('Timeout')
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={handleCreateProject}>Create Project</button>
      <ul>
        {projects.map(p => (
          <li key={p.id}>{p.name} - {p.status}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Code Organization Best Practices

### Recommended Folder Structure

```
customer-portal/
├── assets/
│   ├── js/
│   │   ├── ash_rpc.ts              # GENERATED - DO NOT EDIT
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   │
│   │   ├── lib/                    # Utility libraries
│   │   │   ├── csrf.ts
│   │   │   ├── socket.ts
│   │   │   └── query-client.ts
│   │   │
│   │   ├── hooks/                  # Custom React Query hooks
│   │   │   ├── useProjects.ts
│   │   │   ├── useCustomers.ts
│   │   │   ├── useTickets.ts
│   │   │   └── useTasks.ts
│   │   │
│   │   ├── components/             # Reusable components
│   │   │   ├── common/
│   │   │   ├── modals/
│   │   │   ├── forms/
│   │   │   └── layout/
│   │   │
│   │   ├── pages/                  # Page components
│   │   │   ├── admin/
│   │   │   └── customer/
│   │   │
│   │   └── types/                  # Custom TypeScript types (non-generated)
│   │       └── ui.types.ts
│   │
│   └── css/
│       └── app.css
│
├── lib/
│   ├── my_app/
│   │   ├── projects/
│   │   │   ├── project.ex          # Ash Resource
│   │   │   └── task.ex
│   │   ├── projects.ex             # Ash Domain with RPC config
│   │   │
│   │   ├── customers/
│   │   │   └── customer.ex
│   │   ├── customers.ex
│   │   │
│   │   └── support/
│   │       ├── ticket.ex
│   │       └── support.ex
│   │
│   └── my_app_web/
│       ├── controllers/
│       │   └── ash_typescript_controller.ex
│       ├── channels/
│       │   ├── user_socket.ex
│       │   └── ash_typescript_rpc_channel.ex
│       └── plugs/
│           └── set_actor.ex
│
└── config/
    └── config.exs                   # AshTypescript configuration
```

### Organizing Generated Code

**DO:**
- Keep `ash_rpc.ts` in a predictable location (e.g., `assets/js/ash_rpc.ts`)
- Never manually edit generated files
- Add generated file to `.gitignore` if regenerating on deploy
- Create wrapper hooks around generated functions

**DON'T:**
- Modify generated code directly
- Split generated code into multiple files
- Copy-paste generated types elsewhere

### Managing Multiple Domains

If you have multiple Ash domains:

```elixir
# config/config.exs
config :ash_typescript,
  # Generate separate files per domain
  domains: [
    %{
      domain: MyApp.Projects,
      output_file: "assets/js/generated/projects_rpc.ts"
    },
    %{
      domain: MyApp.Support,
      output_file: "assets/js/generated/support_rpc.ts"
    }
  ]
```

```typescript
// Re-export from single entry point
// assets/js/api/index.ts
export * from '../generated/projects_rpc';
export * from '../generated/support_rpc';
```

---

## Versioning Strategy

### When Backend Changes, How to Update Frontend

#### Strategy 1: Lock-Step Deployment (Recommended for Monorepos)

Both frontend and backend are deployed together:

```bash
# Development workflow
1. Update Ash resource
2. Run: mix ash.codegen --dev
3. Fix TypeScript compilation errors
4. Test frontend
5. Commit both changes together
6. Deploy as single unit
```

**Pros:**
- Always in sync
- No compatibility issues
- Simple CI/CD

**Cons:**
- Requires coordinated deployments
- Can't deploy frontend/backend independently

#### Strategy 2: API Versioning (For Separate Repos)

Maintain multiple API versions:

```elixir
# lib/my_app_web/router.ex
scope "/rpc/v1" do
  post "/run", AshTypescriptV1Controller, :run
  post "/validate", AshTypescriptV1Controller, :validate
end

scope "/rpc/v2" do
  post "/run", AshTypescriptV2Controller, :run
  post "/validate", AshTypescriptV2Controller, :validate
end
```

```elixir
# config/config.exs
config :ash_typescript,
  run_endpoint: "/rpc/v2/run",  # Update version
  validate_endpoint: "/rpc/v2/validate"
```

**Frontend version management:**

```typescript
// .env.development
VITE_API_VERSION=v2

// .env.production
VITE_API_VERSION=v1  # Still on v1 until ready
```

#### Strategy 3: Feature Flags

Use feature flags for gradual rollout:

```elixir
# Backend
defmodule MyApp.Projects.Project do
  actions do
    # New action (v2)
    create :create_v2 do
      # New fields/behavior
    end

    # Keep old action for compatibility
    create :create do
      # Old behavior
    end
  end
end
```

```typescript
// Frontend
const useNewAPI = import.meta.env.VITE_USE_NEW_API === 'true';

const createProject = useNewAPI ? createProjectV2 : createProject;
```

### Handling Breaking Changes

1. **Communicate changes** - Document what changed and why
2. **Deprecation warnings** - Warn before removing old APIs
3. **Migration guides** - Provide step-by-step guides
4. **Automated migration** - Use TypeScript compiler to catch issues

### CI/CD Integration

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: erlef/setup-beam@v1
        with:
          elixir-version: '1.15'
          otp-version: '26'
      - run: mix deps.get
      - run: mix compile --warnings-as-errors
      - run: mix test

  frontend:
    runs-on: ubuntu-latest
    needs: backend  # Ensure backend builds first
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      # Generate TypeScript code
      - uses: erlef/setup-beam@v1
        with:
          elixir-version: '1.15'
          otp-version: '26'
      - run: mix deps.get
      - run: mix ash.codegen --check  # Verify generated code is up to date

      # Build frontend
      - run: cd assets && npm ci
      - run: cd assets && npm run build
      - run: cd assets && npm run type-check
      - run: cd assets && npm test
```

---

## Full Stack Example

### Complete Feature: Project Management

#### Backend Resource

```elixir
# lib/my_app/projects/project.ex
defmodule MyApp.Projects.Project do
  use Ash.Resource,
    domain: MyApp.Projects,
    extensions: [AshTypescript.Resource],
    authorizers: [Ash.Policy.Authorizer]

  typescript do
    type_name "Project"
  end

  attributes do
    uuid_primary_key :id
    attribute :name, :string, allow_nil?: false
    attribute :description, :string
    attribute :status, :atom, constraints: [one_of: [:planning, :active, :completed]], default: :planning
    attribute :priority, :atom, constraints: [one_of: [:low, :medium, :high]], default: :medium

    timestamps()
  end

  relationships do
    belongs_to :customer, MyApp.Customers.Customer
    belongs_to :owner, MyApp.Accounts.User
    has_many :tasks, MyApp.Projects.Task
  end

  actions do
    defaults [:read, :destroy]

    read :list do
      pagination offset?: true, default_limit: 25
      prepare build(sort: [created_at: :desc])
    end

    create :create do
      accept [:name, :description, :status, :priority]
      argument :customer_id, :uuid, allow_nil?: false

      change manage_relationship(:customer_id, :customer, type: :append)
      change relate_actor(:owner)
    end

    update :update do
      accept [:name, :description, :status, :priority]
    end
  end

  policies do
    policy action_type(:read) do
      authorize_if actor_attribute_equals(:role, :admin)
      authorize_if relates_to_actor_via(:owner)
      authorize_if relates_to_actor_via([:customer, :users])
    end

    policy action_type([:create, :update, :destroy]) do
      authorize_if actor_attribute_equals(:role, :admin)
      authorize_if relates_to_actor_via(:owner)
    end
  end
end
```

#### Backend Domain

```elixir
# lib/my_app/projects.ex
defmodule MyApp.Projects do
  use Ash.Domain,
    extensions: [AshTypescript.Rpc]

  resources do
    resource MyApp.Projects.Project
    resource MyApp.Projects.Task
  end

  typescript_rpc do
    resource MyApp.Projects.Project do
      rpc_action :list_projects, :list
      rpc_action :get_project, :read
      rpc_action :create_project, :create
      rpc_action :update_project, :update
      rpc_action :delete_project, :destroy
    end
  end
end
```

#### Frontend Hook

```typescript
// assets/js/hooks/useProjects.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  type Project,
  type CreateProjectInput,
  type UpdateProjectInput,
  type ProjectFilterInput,
} from '../ash_rpc';
import { buildCSRFHeaders } from '../lib/csrf';

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters?: ProjectFilterInput) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

export function useProjects(filters?: ProjectFilterInput) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: async () => {
      const result = await listProjects({
        fields: ['id', 'name', 'description', 'status', 'priority', 'createdAt', { customer: ['id', 'name'] }],
        filter: filters,
        headers: buildCSRFHeaders(),
      });

      if (!result.success) {
        throw new Error(result.errors?.map(e => e.message).join(', ') || 'Failed to load projects');
      }

      return result.data.results;
    },
  });
}

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(projectId!),
    queryFn: async () => {
      const result = await getProject({
        id: projectId!,
        fields: [
          'id',
          'name',
          'description',
          'status',
          'priority',
          'createdAt',
          'updatedAt',
          { customer: ['id', 'name', 'email'] },
          { owner: ['id', 'name', 'email'] },
          { tasks: ['id', 'title', 'status', 'dueDate'] }
        ],
        headers: buildCSRFHeaders(),
      });

      if (!result.success) {
        throw new Error(result.errors?.map(e => e.message).join(', ') || 'Failed to load project');
      }

      return result.data;
    },
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      const result = await createProject({
        fields: ['id', 'name', 'status', 'createdAt'],
        input,
        headers: buildCSRFHeaders(),
      });

      if (!result.success) {
        throw new Error(result.errors?.map(e => e.message).join(', ') || 'Failed to create project');
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateProjectInput }) => {
      const result = await updateProject({
        id,
        fields: ['id', 'name', 'status', 'updatedAt'],
        input,
        headers: buildCSRFHeaders(),
      });

      if (!result.success) {
        throw new Error(result.errors?.map(e => e.message).join(', ') || 'Failed to update project');
      }

      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const result = await deleteProject({
        id: projectId,
        headers: buildCSRFHeaders(),
      });

      if (!result.success) {
        throw new Error(result.errors?.map(e => e.message).join(', ') || 'Failed to delete project');
      }

      return result.data;
    },
    onSuccess: (_, projectId) => {
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
```

#### Frontend Component

```typescript
// assets/js/pages/admin/Projects.tsx
import React, { useState } from 'react';
import { useProjects, useDeleteProject } from '../../hooks/useProjects';
import { CreateProjectModal } from '../../components/modals/CreateProjectModal';
import type { ProjectFilterInput } from '../../ash_rpc';

export function ProjectsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filters: ProjectFilterInput | undefined =
    statusFilter === 'all'
      ? undefined
      : { status: { eq: statusFilter as any } };

  const { data: projects, isLoading, error, refetch } = useProjects(filters);
  const deleteProject = useDeleteProject();

  const handleDelete = async (projectId: string, projectName: string) => {
    if (!confirm(`Delete project "${projectName}"?`)) return;

    try {
      await deleteProject.mutateAsync(projectId);
    } catch (err) {
      alert(`Failed to delete: ${err}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Projects ({projects?.length || 0})</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Project
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-4 py-2 rounded"
        >
          <option value="all">All Statuses</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects?.map((project) => (
          <div
            key={project.id}
            className="border rounded-lg p-4 hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
            <p className="text-gray-600 mb-3">{project.description}</p>

            <div className="flex gap-2 mb-3">
              <span className={`px-2 py-1 rounded text-xs ${
                project.status === 'active' ? 'bg-green-100 text-green-800' :
                project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {project.status}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${
                project.priority === 'high' ? 'bg-red-100 text-red-800' :
                project.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {project.priority}
              </span>
            </div>

            {project.customer && (
              <p className="text-sm text-gray-500 mb-3">
                Customer: {project.customer.name}
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => window.location.href = `/admin/projects/${project.id}`}
                className="flex-1 bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
              >
                View
              </button>
              <button
                onClick={() => handleDelete(project.id, project.name)}
                disabled={deleteProject.isPending}
                className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {projects?.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No projects found. Create one to get started!
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
```

#### Frontend Modal

```typescript
// assets/js/components/modals/CreateProjectModal.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateProject } from '../../hooks/useProjects';
import {
  createProjectZodSchema,
  type CreateProjectInput,
  type Project,
} from '../../ash_rpc';

interface CreateProjectModalProps {
  customerId?: string;
  onClose: () => void;
  onSuccess?: (project: Project) => void;
}

export function CreateProjectModal({
  customerId,
  onClose,
  onSuccess,
}: CreateProjectModalProps) {
  const createProject = useCreateProject();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectZodSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'planning',
      priority: 'medium',
      customerId: customerId || '',
    },
  });

  const onSubmit = async (data: CreateProjectInput) => {
    try {
      const project = await createProject.mutateAsync(data);
      onSuccess?.(project);
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError('root', { message: err.message });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Create Project</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Project Name *
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className={`w-full border rounded px-3 py-2 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              {...register('description')}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-1">
              Status
            </label>
            <select
              id="status"
              {...register('status')}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium mb-1">
              Priority
            </label>
            <select
              id="priority"
              {...register('priority')}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Customer ID (if not pre-filled) */}
          {!customerId && (
            <div>
              <label htmlFor="customerId" className="block text-sm font-medium mb-1">
                Customer ID *
              </label>
              <input
                id="customerId"
                type="text"
                {...register('customerId')}
                className={`w-full border rounded px-3 py-2 ${
                  errors.customerId ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.customerId && (
                <p className="text-red-500 text-sm mt-1">{errors.customerId.message}</p>
              )}
            </div>
          )}

          {/* Root errors */}
          {errors.root && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.root.message}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

## Production Considerations

### Performance Optimization

1. **Field Selection** - Only request fields you need
2. **Pagination** - Use keyset pagination for large datasets
3. **Caching** - Configure TanStack Query staleTime appropriately
4. **Code Splitting** - Lazy load pages and modals

```typescript
// Lazy load pages
const ProjectsPage = lazy(() => import('./pages/admin/Projects'));
const CustomersPage = lazy(() => import('./pages/admin/Customers'));

// Use Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/admin/projects" element={<ProjectsPage />} />
    <Route path="/admin/customers" element={<CustomersPage />} />
  </Routes>
</Suspense>
```

### Error Handling

```typescript
// Centralized error handler
import { QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'react-toastify';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(`Query error: ${error.message}`);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error(`Mutation error: ${error.message}`);
    },
  }),
});
```

### Security

1. **CSRF Protection** - Always include CSRF tokens
2. **Actor Context** - Set actor in Phoenix plug
3. **Authorization** - Use Ash policies on backend
4. **Input Validation** - Both Zod (frontend) and Ash (backend)

### Monitoring

```typescript
// Add telemetry to lifecycle hooks
config :ash_typescript,
  rpc_action_before_request_hook: """
  (action, config, context) => {
    console.log(`[RPC] ${action} starting`, { config });
    context.startTime = Date.now();
    return config;
  }
  """,
  rpc_action_after_request_hook: """
  (action, result, context) => {
    const duration = Date.now() - context.startTime;
    console.log(`[RPC] ${action} completed in ${duration}ms`, { result });

    // Send to analytics
    if (window.analytics) {
      window.analytics.track('RPC Call', {
        action,
        duration,
        success: result.success
      });
    }

    return result;
  }
  """
```

### Testing

```typescript
// Mock generated functions for testing
import { vi } from 'vitest';
import * as ashRpc from '../ash_rpc';

vi.mock('../ash_rpc', () => ({
  listProjects: vi.fn(),
  createProject: vi.fn(),
  getProject: vi.fn(),
}));

// In test
it('loads projects', async () => {
  vi.mocked(ashRpc.listProjects).mockResolvedValue({
    success: true,
    data: {
      results: [{ id: '1', name: 'Test Project', status: 'active' }],
      count: 1,
      pageInfo: { hasNextPage: false, hasPreviousPage: false }
    }
  });

  render(<ProjectsPage />);

  await waitFor(() => {
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });
});
```

---

## Summary

**Ash TypeScript provides:**
- Automatic TypeScript type generation from Ash resources
- End-to-end type safety from Elixir to TypeScript
- Zod schemas for React Hook Form integration
- RPC functions for all CRUD operations
- Phoenix Channels support for real-time features
- Multitenancy and authorization integration

**Best Practices:**
- Wrap generated functions in custom TanStack Query hooks
- Use React Hook Form with generated Zod schemas
- Organize code with clear separation of concerns
- Deploy frontend and backend together when possible
- Use lifecycle hooks for auth, telemetry, and logging
- Test both frontend and backend comprehensively

**Resources:**
- Official Docs: https://hexdocs.pm/ash_typescript
- Demo Repo: https://github.com/ChristianAlexander/ash_typescript_demo
- Ash Framework: https://ash-hq.org
- TanStack Query: https://tanstack.com/query
- React Hook Form: https://react-hook-form.com

---

**Next Steps for Siteflow:**

1. Install Ash TypeScript in your Phoenix backend
2. Configure existing or new Ash resources with TypeScript extension
3. Set up RPC endpoints and actor authentication
4. Generate TypeScript code and integrate with customer-portal
5. Replace localStorage with Ash-backed API calls
6. Migrate React Hook Form schemas to generated Zod schemas
7. Test end-to-end type safety and validation
8. Deploy and monitor
