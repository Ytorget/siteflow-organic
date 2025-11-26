# Real-Time Collaboration Research for Siteflow Fas 3

## Executive Summary

This document provides research on implementing real-time collaboration for Siteflow's Fas 3 planning phase, where team members collaborate on 9 planning documents with live presence tracking, edit locking, real-time chat, and progress updates.

**Key Recommendation**: Use **edit locking** (pessimistic concurrency) over OT/CRDT for MVP simplicity. Phoenix Channels + Phoenix Presence provide everything needed for a robust, scalable solution.

---

## 1. Conflict Resolution Strategy Recommendation

### Recommended: Edit Locking (Pessimistic Concurrency)

For Siteflow's MVP, **simple edit locking** is strongly recommended over Operational Transform (OT) or CRDTs.

#### Why Edit Locking for Siteflow?

**Your Use Case Characteristics:**
- 9 distinct planning documents (not simultaneous editing of same paragraph)
- Small teams (typically 2-5 people collaborating per project)
- Documents are markdown content (structured, not free-form text)
- MVP timeline - need working solution fast
- Clear workflow: one person edits a document at a time

**Edit Locking Advantages:**
- **Simplicity**: 10x easier to implement than OT or CRDT
- **Predictable**: Users understand "someone is editing this"
- **No conflicts**: By design - only one editor at a time
- **Fast to build**: Can be production-ready in days, not months
- **Easy to debug**: No complex transformation algorithms
- **Sufficient**: For 9 separate documents, locking is perfectly adequate

**OT/CRDT Disadvantages for Your Case:**
- OT: "Notoriously difficult... frequently flawed without formal verification"
- CRDT: "Subtle algorithms defined in academic papers, often challenging to read"
- Both require major engineering investment (weeks/months)
- Over-engineering for separate documents (would make sense for Google Docs-style paragraph-level collaboration)
- "Building feature-rich and robust co-editors from scratch involves major investment of engineering resources, which is unaffordable to many"

#### Industry Reality

> "CRDT variations have made broad claims of superiority over OT solutions... However, over one decade later, CRDT solutions are rarely found in working co-editors."

> "For an MVP, you might want to consider starting with simpler approaches before diving into full OT or CRDT implementations."

---

## 2. Phoenix Channel Architecture

### Channel Structure for Project-Based Collaboration

Phoenix Channels use a **topic-based architecture** perfect for project rooms:

```elixir
# Channel routing in user_socket.ex
channel "project:*", Siteflow.ProjectChannel
channel "user:*", Siteflow.UserChannel
```

### Recommended Topic Structure

```
project:123              -> Project-wide updates (checklist, progress)
project:123:planning     -> Planning session room
project:123:chat         -> Project chat
project:123:document:1   -> Specific document editing
project:123:document:2   -> Another document editing
...
user:456                 -> User-specific notifications
```

### Channel Implementation Example

```elixir
defmodule Siteflow.ProjectChannel do
  use Phoenix.Channel
  alias Siteflow.Presence

  # Join project room
  def join("project:" <> project_id, _params, socket) do
    # Authorize user has access to project
    if authorized?(socket, project_id) do
      send(self(), :after_join)
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # Track presence after join
  def handle_info(:after_join, socket) do
    push(socket, "presence_state", Presence.list(socket))

    # Track user presence with metadata
    {:ok, _} = Presence.track(socket, socket.assigns.user_id, %{
      online_at: inspect(System.system_time(:second)),
      username: socket.assigns.username,
      current_document: nil,  # Updated when editing starts
      editing: false
    })

    {:noreply, socket}
  end

  # Handle document editing start
  def handle_in("document:start_editing", %{"document_id" => doc_id}, socket) do
    case acquire_document_lock(doc_id, socket.assigns.user_id) do
      {:ok, lock} ->
        # Update presence to show editing
        Presence.update(socket, socket.assigns.user_id, %{
          current_document: doc_id,
          editing: true
        })

        # Broadcast to others
        broadcast!(socket, "document:locked", %{
          document_id: doc_id,
          user_id: socket.assigns.user_id,
          username: socket.assigns.username
        })

        {:reply, {:ok, %{lock_acquired: true}}, socket}

      {:error, :already_locked} ->
        {:reply, {:error, %{reason: "Document is being edited by another user"}}, socket}
    end
  end

  # Handle document save
  def handle_in("document:save", %{"document_id" => doc_id, "content" => content}, socket) do
    # Save to database
    case DocumentService.save(doc_id, content, socket.assigns.user_id) do
      {:ok, document} ->
        # Broadcast update to all (except sender)
        broadcast_from!(socket, "document:updated", %{
          document_id: doc_id,
          content: content,
          updated_by: socket.assigns.username,
          updated_at: document.updated_at
        })

        {:reply, {:ok, %{saved: true}}, socket}

      {:error, reason} ->
        {:reply, {:error, %{reason: reason}}, socket}
    end
  end

  # Handle document editing stop
  def handle_in("document:stop_editing", %{"document_id" => doc_id}, socket) do
    release_document_lock(doc_id, socket.assigns.user_id)

    # Update presence
    Presence.update(socket, socket.assigns.user_id, %{
      current_document: nil,
      editing: false
    })

    # Broadcast unlock
    broadcast!(socket, "document:unlocked", %{
      document_id: doc_id,
      user_id: socket.assigns.user_id
    })

    {:reply, {:ok, %{lock_released: true}}, socket}
  end

  # Handle chat messages
  def handle_in("chat:message", %{"text" => text}, socket) do
    # Optionally persist to database
    message = %{
      id: generate_id(),
      text: text,
      user_id: socket.assigns.user_id,
      username: socket.assigns.username,
      timestamp: DateTime.utc_now()
    }

    # Save asynchronously
    Task.start(fn -> MessageService.save(message) end)

    # Broadcast immediately (don't wait for DB)
    broadcast!(socket, "chat:new_message", message)

    {:reply, {:ok, message}, socket}
  end

  # Handle checklist updates
  def handle_in("checklist:toggle", %{"item_id" => item_id, "checked" => checked}, socket) do
    case ChecklistService.toggle(item_id, checked, socket.assigns.user_id) do
      {:ok, updated_item} ->
        # Broadcast to all
        broadcast!(socket, "checklist:updated", %{
          item_id: item_id,
          checked: checked,
          updated_by: socket.assigns.username
        })

        # Calculate and broadcast progress
        progress = calculate_progress(socket.assigns.project_id)
        broadcast!(socket, "progress:updated", %{progress: progress})

        {:reply, {:ok, updated_item}, socket}

      {:error, reason} ->
        {:reply, {:error, %{reason: reason}}, socket}
    end
  end

  # Clean up on disconnect
  def terminate(_reason, socket) do
    # Release any locks held by this user
    release_all_locks(socket.assigns.user_id)
    :ok
  end
end
```

### Broadcasting Patterns

**Broadcast to everyone (including sender):**
```elixir
broadcast!(socket, "event:name", payload)
```

**Broadcast to everyone except sender:**
```elixir
broadcast_from!(socket, "event:name", payload)
```

**Send to specific socket:**
```elixir
push(socket, "event:name", payload)
```

---

## 3. Phoenix Presence Implementation

### What is Phoenix Presence?

> "Phoenix Presence is a distributed process tracking system that lets you track which users are connected to a given topic and exposes metadata about each one — such as their name, role, or current action."

### Setting Up Presence

```elixir
# lib/siteflow/presence.ex
defmodule Siteflow.Presence do
  use Phoenix.Presence,
    otp_app: :siteflow,
    pubsub_server: Siteflow.PubSub
end

# In application.ex
children = [
  Siteflow.Presence,
  # ... other children
]
```

### Tracking Users in Planning Session

```elixir
# When user joins project channel
def handle_info(:after_join, socket) do
  # Get current presence state
  push(socket, "presence_state", Presence.list(socket))

  # Track this user with metadata
  {:ok, _} = Presence.track(socket, socket.assigns.user_id, %{
    online_at: inspect(System.system_time(:second)),
    username: socket.assigns.username,
    email: socket.assigns.email,
    avatar_url: socket.assigns.avatar_url,
    current_document: nil,
    editing: false,
    role: socket.assigns.role  # "admin" or "customer"
  })

  {:noreply, socket}
end
```

### Updating Presence Metadata

```elixir
# When user starts editing document
Presence.update(socket, socket.assigns.user_id, fn meta ->
  Map.merge(meta, %{
    current_document: "planning_document_3",
    editing: true,
    editing_since: DateTime.utc_now()
  })
end)
```

### Client-Side Presence Handling (React)

```javascript
// Listen for presence updates
channel.on("presence_state", state => {
  const presences = Phoenix.Presence.syncState(presenceState, state);
  setPresenceState(presences);
  updateUserList(presences);
});

channel.on("presence_diff", diff => {
  const presences = Phoenix.Presence.syncDiff(presenceState, diff);
  setPresenceState(presences);
  updateUserList(presences);
});

// Helper to get list of users
function updateUserList(presences) {
  const users = Phoenix.Presence.list(presences, (id, { metas }) => {
    const latest = metas[0]; // Get most recent metadata
    return {
      id,
      username: latest.username,
      avatar: latest.avatar_url,
      editing: latest.editing,
      currentDocument: latest.current_document
    };
  });

  setOnlineUsers(users);
}
```

### Presence Features

- **Distributed**: Works across multiple server nodes automatically
- **Automatic cleanup**: Users removed when they disconnect
- **Conflict resolution**: Built-in CRDT (for presence only, not documents!)
- **Metadata flexibility**: Store any data about user state

---

## 4. Edit Locking Implementation

### Database Schema

```sql
-- Documents table
CREATE TABLE planning_documents (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    document_type VARCHAR(50) NOT NULL,  -- e.g., 'technical_spec', 'design_system'
    title VARCHAR(255) NOT NULL,
    content TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_edited_by INTEGER REFERENCES users(id)
);

-- Document locks table (pessimistic locking)
CREATE TABLE document_locks (
    document_id INTEGER PRIMARY KEY REFERENCES planning_documents(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    locked_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,  -- Auto-release after 30 minutes
    UNIQUE(document_id)
);

-- Create index for faster lock checks
CREATE INDEX idx_document_locks_expires ON document_locks(expires_at);
```

### Lock Management Functions

```elixir
defmodule Siteflow.DocumentLock do
  import Ecto.Query
  alias Siteflow.Repo
  alias Siteflow.DocumentLock

  @lock_timeout_minutes 30

  def acquire_lock(document_id, user_id) do
    # Clean up expired locks first
    clean_expired_locks()

    expires_at = DateTime.utc_now() |> DateTime.add(@lock_timeout_minutes * 60, :second)

    # Try to insert lock
    %DocumentLock{}
    |> DocumentLock.changeset(%{
      document_id: document_id,
      user_id: user_id,
      expires_at: expires_at
    })
    |> Repo.insert()
    |> case do
      {:ok, lock} -> {:ok, lock}
      {:error, _} ->
        # Check if current user already has lock (refresh it)
        case get_lock(document_id) do
          %{user_id: ^user_id} = lock ->
            # Refresh expiration
            lock
            |> Ecto.Changeset.change(%{expires_at: expires_at})
            |> Repo.update()

          _ ->
            {:error, :already_locked}
        end
    end
  end

  def release_lock(document_id, user_id) do
    from(l in DocumentLock,
      where: l.document_id == ^document_id and l.user_id == ^user_id
    )
    |> Repo.delete_all()

    :ok
  end

  def release_all_locks(user_id) do
    from(l in DocumentLock, where: l.user_id == ^user_id)
    |> Repo.delete_all()

    :ok
  end

  def get_lock(document_id) do
    from(l in DocumentLock,
      where: l.document_id == ^document_id,
      preload: [:user]
    )
    |> Repo.one()
  end

  def is_locked?(document_id) do
    clean_expired_locks()

    from(l in DocumentLock, where: l.document_id == ^document_id)
    |> Repo.exists?()
  end

  defp clean_expired_locks do
    now = DateTime.utc_now()

    from(l in DocumentLock, where: l.expires_at < ^now)
    |> Repo.delete_all()
  end
end
```

### Alternative: PostgreSQL Advisory Locks

For even simpler implementation without database table:

```elixir
defmodule Siteflow.DocumentLock do
  alias Siteflow.Repo

  def acquire_lock(document_id) do
    # Try to acquire advisory lock
    query = "SELECT pg_try_advisory_lock($1)"

    case Repo.query(query, [document_id]) do
      {:ok, %{rows: [[true]]}} -> {:ok, :locked}
      {:ok, %{rows: [[false]]}} -> {:error, :already_locked}
      error -> error
    end
  end

  def release_lock(document_id) do
    query = "SELECT pg_advisory_unlock($1)"
    Repo.query(query, [document_id])
    :ok
  end
end
```

**Note**: Advisory locks are automatically released when connection closes, which is perfect for real-time scenarios but requires careful connection management.

---

## 5. WebSocket Event Patterns

### Complete Event List for Siteflow

```javascript
// === PRESENCE EVENTS ===
"presence_state"        // Initial list of online users
"presence_diff"         // User joined/left or metadata changed

// === DOCUMENT EDITING EVENTS ===
"document:start_editing"   -> Client requests edit lock
"document:locked"          <- Server broadcasts lock acquired
"document:unlocked"        <- Server broadcasts lock released
"document:save"            -> Client saves content
"document:updated"         <- Server broadcasts content updated
"document:auto_save"       -> Client auto-saves (every 10 seconds)

// === CHAT EVENTS ===
"chat:message"             -> Client sends message
"chat:new_message"         <- Server broadcasts new message
"chat:typing"              -> Client indicates typing
"chat:stop_typing"         -> Client stops typing

// === CHECKLIST EVENTS ===
"checklist:toggle"         -> Client checks/unchecks item
"checklist:updated"        <- Server broadcasts item toggled
"progress:updated"         <- Server broadcasts progress percentage

// === PROJECT EVENTS ===
"project:updated"          <- Server broadcasts project metadata change
"project:status_change"    <- Server broadcasts status change
```

### Message Payload Structures

```javascript
// presence_state
{
  "user_123": {
    metas: [{
      online_at: "1699123456",
      username: "John Doe",
      avatar_url: "/avatars/123.jpg",
      current_document: "planning_doc_3",
      editing: true,
      role: "admin"
    }]
  },
  "user_456": { ... }
}

// document:locked
{
  document_id: 3,
  user_id: 123,
  username: "John Doe",
  locked_at: "2024-11-15T14:30:00Z"
}

// document:updated
{
  document_id: 3,
  content: "# Planning Document\n\nNew content...",
  updated_by: "John Doe",
  updated_at: "2024-11-15T14:35:00Z",
  version: 5
}

// chat:new_message
{
  id: "msg_789",
  text: "Let's update the timeline",
  user_id: 123,
  username: "John Doe",
  avatar_url: "/avatars/123.jpg",
  timestamp: "2024-11-15T14:30:00Z"
}

// checklist:updated
{
  item_id: 42,
  checked: true,
  updated_by: "John Doe",
  timestamp: "2024-11-15T14:30:00Z"
}

// progress:updated
{
  progress: 67.5,  // percentage
  completed_items: 27,
  total_items: 40
}
```

---

## 6. React + Phoenix Channels Integration

### Setup Phoenix Client

```bash
npm install phoenix
```

### Socket Context Provider

```typescript
// contexts/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'phoenix';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Get auth token from localStorage or context
    const token = localStorage.getItem('auth_token');

    if (!token) return;

    // Create socket connection
    const newSocket = new Socket('ws://localhost:4000/socket', {
      params: { token },
      logger: (kind, msg, data) => {
        console.log(`${kind}: ${msg}`, data);
      }
    });

    // Connect
    newSocket.connect();

    // Handle connection events
    newSocket.onOpen(() => {
      console.log('Socket connected');
      setConnected(true);
    });

    newSocket.onError((error) => {
      console.error('Socket error:', error);
      setConnected(false);
    });

    newSocket.onClose(() => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
```

### Custom useChannel Hook

```typescript
// hooks/useChannel.ts
import { useEffect, useRef, useState } from 'react';
import { Channel } from 'phoenix';
import { useSocket } from '../contexts/SocketContext';

interface UseChannelOptions {
  onJoin?: (response: any) => void;
  onError?: (error: any) => void;
  onClose?: () => void;
}

export function useChannel(
  topic: string,
  options: UseChannelOptions = {}
) {
  const { socket } = useSocket();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [joined, setJoined] = useState(false);
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    if (!socket) return;

    // Create and join channel
    const newChannel = socket.channel(topic, {});
    channelRef.current = newChannel;

    newChannel
      .join()
      .receive('ok', (response) => {
        console.log(`Joined ${topic}`, response);
        setJoined(true);
        options.onJoin?.(response);
      })
      .receive('error', (error) => {
        console.error(`Failed to join ${topic}:`, error);
        options.onError?.(error);
      });

    newChannel.onError((error) => {
      console.error(`Channel error on ${topic}:`, error);
      setJoined(false);
    });

    newChannel.onClose(() => {
      console.log(`Channel ${topic} closed`);
      setJoined(false);
      options.onClose?.();
    });

    setChannel(newChannel);

    // Leave channel on unmount
    return () => {
      newChannel.leave();
    };
  }, [socket, topic]);

  const push = (event: string, payload: any) => {
    if (!channel) {
      console.warn('Cannot push - channel not connected');
      return Promise.reject('Channel not connected');
    }

    return new Promise((resolve, reject) => {
      channel
        .push(event, payload)
        .receive('ok', resolve)
        .receive('error', reject)
        .receive('timeout', () => reject('timeout'));
    });
  };

  const on = (event: string, callback: (payload: any) => void) => {
    if (!channel) return;

    const ref = channel.on(event, callback);

    // Return cleanup function
    return () => {
      channel.off(event, ref);
    };
  };

  return { channel, joined, push, on };
}
```

### Custom usePresence Hook

```typescript
// hooks/usePresence.ts
import { useEffect, useState } from 'react';
import { Channel, Presence as PhoenixPresence } from 'phoenix';

interface PresenceUser {
  id: string;
  username: string;
  avatar_url?: string;
  editing: boolean;
  current_document?: string;
  role?: string;
}

export function usePresence(channel: Channel | null) {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [presenceState, setPresenceState] = useState<any>({});

  useEffect(() => {
    if (!channel) return;

    // Handle initial presence state
    const presenceStateRef = channel.on('presence_state', (state) => {
      const synced = PhoenixPresence.syncState(presenceState, state);
      setPresenceState(synced);
      updateUserList(synced);
    });

    // Handle presence changes
    const presenceDiffRef = channel.on('presence_diff', (diff) => {
      const synced = PhoenixPresence.syncDiff(presenceState, diff);
      setPresenceState(synced);
      updateUserList(synced);
    });

    function updateUserList(state: any) {
      const userList = PhoenixPresence.list(state, (id, { metas }) => {
        const meta = metas[0]; // Most recent
        return {
          id,
          username: meta.username,
          avatar_url: meta.avatar_url,
          editing: meta.editing,
          current_document: meta.current_document,
          role: meta.role
        };
      });

      setUsers(userList);
    }

    // Cleanup
    return () => {
      channel.off('presence_state', presenceStateRef);
      channel.off('presence_diff', presenceDiffRef);
    };
  }, [channel]);

  return { users };
}
```

### Example: Planning Document Component

```typescript
// components/PlanningDocument.tsx
import React, { useEffect, useState } from 'react';
import { useChannel } from '../hooks/useChannel';
import { usePresence } from '../hooks/usePresence';

interface PlanningDocumentProps {
  projectId: number;
  documentId: number;
}

export const PlanningDocument: React.FC<PlanningDocumentProps> = ({
  projectId,
  documentId
}) => {
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [lockedBy, setLockedBy] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Join project channel
  const { channel, joined, push, on } = useChannel(`project:${projectId}:planning`);

  // Track online users
  const { users } = usePresence(channel);

  useEffect(() => {
    if (!channel) return;

    // Listen for document locked
    const cleanupLocked = on('document:locked', (payload) => {
      if (payload.document_id === documentId) {
        setLockedBy(payload.username);
        setIsEditing(false);
      }
    });

    // Listen for document unlocked
    const cleanupUnlocked = on('document:unlocked', (payload) => {
      if (payload.document_id === documentId) {
        setLockedBy(null);
      }
    });

    // Listen for document updates
    const cleanupUpdated = on('document:updated', (payload) => {
      if (payload.document_id === documentId) {
        setContent(payload.content);
        // Show toast: "Updated by {username}"
      }
    });

    return () => {
      cleanupLocked?.();
      cleanupUnlocked?.();
      cleanupUpdated?.();
    };
  }, [channel, documentId]);

  const handleStartEditing = async () => {
    try {
      await push('document:start_editing', { document_id: documentId });
      setIsEditing(true);
    } catch (error) {
      alert('Document is being edited by someone else');
    }
  };

  const handleStopEditing = async () => {
    await push('document:stop_editing', { document_id: documentId });
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await push('document:save', {
        document_id: documentId,
        content: content
      });
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  // Auto-save every 10 seconds when editing
  useEffect(() => {
    if (!isEditing) return;

    const interval = setInterval(() => {
      handleSave();
    }, 10000);

    return () => clearInterval(interval);
  }, [isEditing, content]);

  return (
    <div className="planning-document">
      <div className="header">
        <h2>Planning Document {documentId}</h2>

        {/* Online users indicator */}
        <div className="online-users">
          {users.map(user => (
            <div key={user.id} className="user-avatar" title={user.username}>
              <img src={user.avatar_url} alt={user.username} />
              {user.editing && user.current_document === `${documentId}` && (
                <span className="editing-indicator">✏️</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {lockedBy && (
        <div className="locked-banner">
          🔒 {lockedBy} is currently editing this document
        </div>
      )}

      {isEditing ? (
        <>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="editor"
          />
          <div className="actions">
            <button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={handleStopEditing}>Stop Editing</button>
          </div>
        </>
      ) : (
        <>
          <div className="preview" dangerouslySetInnerHTML={{ __html: content }} />
          <button
            onClick={handleStartEditing}
            disabled={!!lockedBy}
          >
            {lockedBy ? 'Locked' : 'Start Editing'}
          </button>
        </>
      )}
    </div>
  );
};
```

---

## 7. Database Schema Considerations

### Complete Schema for Siteflow Planning

```sql
-- Projects table (already exists)
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Planning documents (9 per project)
CREATE TABLE planning_documents (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    document_type VARCHAR(50) NOT NULL,
    -- Document types: 'technical_spec', 'design_system', 'content_structure',
    -- 'feature_list', 'timeline', 'budget', 'risk_analysis', 'success_metrics', 'deployment_plan'
    title VARCHAR(255) NOT NULL,
    content TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_edited_by INTEGER REFERENCES users(id)
);

-- Document locks (edit locking)
CREATE TABLE document_locks (
    document_id INTEGER PRIMARY KEY REFERENCES planning_documents(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    locked_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,  -- Auto-release after 30 minutes
    UNIQUE(document_id)
);

-- Planning checklist items
CREATE TABLE planning_checklist_items (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    checked BOOLEAN DEFAULT FALSE,
    order_index INTEGER,
    checked_by INTEGER REFERENCES users(id),
    checked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Chat messages (project-specific)
CREATE TABLE project_chat_messages (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    read_by INTEGER[] DEFAULT '{}'  -- Array of user IDs who have read
);

-- Planning progress tracking
CREATE TABLE planning_progress (
    project_id INTEGER PRIMARY KEY REFERENCES projects(id),
    total_items INTEGER NOT NULL,
    completed_items INTEGER NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_planning_docs_project ON planning_documents(project_id);
CREATE INDEX idx_document_locks_expires ON document_locks(expires_at);
CREATE INDEX idx_checklist_project ON planning_checklist_items(project_id);
CREATE INDEX idx_chat_project ON project_chat_messages(project_id);
CREATE INDEX idx_chat_created ON project_chat_messages(created_at DESC);
```

### Key Schema Decisions

1. **`last_edited_by` field**: Track who last touched each document
2. **`version` field**: Simple version counter (increment on each save)
3. **`expires_at` in locks**: Auto-release stale locks (user closed browser without releasing)
4. **`read_by` array in chat**: Track unread messages per user
5. **Separate progress table**: Denormalized for fast reads (updated via trigger or service)

---

## 8. Performance Considerations

### Phoenix Channels Scalability

**Proven Performance:**
- **2 million concurrent WebSocket connections** on a single 40-core server
- **100,000+ simultaneous users** in production e-commerce sites
- **2 million messages/second** at Discord during peak times

**For Siteflow's Scale:**
- Expected: 10-100 concurrent planning sessions
- Each session: 2-5 users
- Total concurrent users: 20-500
- **Verdict**: Phoenix can handle this with minimal resources

### Optimization Strategies

#### 1. Channel-Level Optimizations

```elixir
# Use broadcast_from! to avoid sending back to sender
broadcast_from!(socket, "event:name", payload)

# Use handle_out/3 to filter broadcasts per user
def handle_out("sensitive:data", payload, socket) do
  if authorized?(socket, payload) do
    push(socket, "sensitive:data", payload)
  end
  {:noreply, socket}
end
```

#### 2. Database Optimizations

```elixir
# Async saves for non-critical data (chat)
def handle_in("chat:message", payload, socket) do
  # Broadcast immediately
  broadcast!(socket, "chat:new_message", payload)

  # Save asynchronously
  Task.start(fn ->
    ChatService.save_message(payload)
  end)

  {:noreply, socket}
end
```

#### 3. Auto-save Strategy

**Client-side debouncing:**
```javascript
// Auto-save with debounce
const debouncedSave = useMemo(
  () => debounce((content) => {
    push('document:auto_save', { document_id, content });
  }, 2000),  // Wait 2 seconds after typing stops
  [push, documentId]
);

// On content change
useEffect(() => {
  if (isEditing) {
    debouncedSave(content);
  }
}, [content, isEditing]);
```

#### 4. Message Payload Optimization

```elixir
# Don't send full document on every update
# Only send diff or changed fields
def handle_in("document:save", %{"document_id" => id, "content" => content}, socket) do
  # Save full content
  DocumentService.save(id, content)

  # Broadcast only metadata (others can fetch if needed)
  broadcast_from!(socket, "document:updated", %{
    document_id: id,
    updated_by: socket.assigns.username,
    updated_at: DateTime.utc_now(),
    # Don't send content - let clients refetch if they need it
  })
end
```

### Horizontal Scaling (When Needed)

Phoenix supports clustering out-of-the-box via PubSub:

```elixir
# config/prod.exs
config :siteflow, Siteflow.PubSub,
  adapter: Phoenix.PubSub.PG2,  # Works across nodes
  name: Siteflow.PubSub
```

When you scale to multiple servers:
- PubSub automatically broadcasts across nodes
- Presence syncs across cluster
- No code changes needed

**For Siteflow**: Single server will be sufficient for years.

---

## 9. Implementation Roadmap

### Phase 1: Basic Real-Time (Week 1)

**Goal**: Get WebSocket connection and basic broadcasting working

- [ ] Set up Phoenix Channels in backend
- [ ] Create `ProjectChannel` with basic join/leave
- [ ] Implement Socket context in React
- [ ] Create `useChannel` hook
- [ ] Test basic message broadcasting (chat)
- [ ] Add simple presence tracking

**Deliverable**: Users can join a project room and see who's online

### Phase 2: Edit Locking (Week 2)

**Goal**: Prevent concurrent document editing

- [ ] Create `document_locks` table
- [ ] Implement lock acquire/release in channel
- [ ] Add `document:start_editing` / `document:stop_editing` events
- [ ] Build lock UI in React (disabled state when locked)
- [ ] Add lock timeout (auto-release after 30 min)
- [ ] Handle disconnect (release all user locks)

**Deliverable**: Only one person can edit a document at a time

### Phase 3: Document Editing (Week 3)

**Goal**: Real-time document updates

- [ ] Create `planning_documents` table
- [ ] Implement save/update logic
- [ ] Add auto-save (every 10 seconds)
- [ ] Broadcast `document:updated` to other users
- [ ] Show "Updated by X" notifications
- [ ] Add version tracking

**Deliverable**: Changes saved and broadcast to team

### Phase 4: Chat & Checklist (Week 4)

**Goal**: Project communication and progress tracking

- [ ] Create `project_chat_messages` table
- [ ] Implement chat events (`chat:message`, `chat:new_message`)
- [ ] Add checklist toggle events
- [ ] Calculate and broadcast progress updates
- [ ] Show unread message count
- [ ] Add typing indicators (optional)

**Deliverable**: Team can chat and check off tasks together

### Phase 5: Polish & Optimization (Week 5)

**Goal**: Production-ready collaboration

- [ ] Add reconnection handling
- [ ] Implement optimistic UI updates
- [ ] Add error handling and retry logic
- [ ] Performance testing (100+ concurrent users)
- [ ] Add loading states and skeleton UI
- [ ] Write E2E tests for collaboration flows

**Deliverable**: Robust, production-ready system

---

## 10. Real-World Examples & Case Studies

### Slab (Knowledge Base Platform)

**Company**: Slab - collaborative knowledge base
**Scale**: 7,000+ companies (Asana, Discord, Glossier)
**Team Size**: 6 engineers

**Technology Stack:**
- Elixir + Phoenix
- Phoenix Channels for real-time
- Phoenix Presence for user tracking
- Operational Transformation for document editing

**Key Learnings:**
> "I was looking for a framework that offered a complete toolset for building web apps with the same developer experience as Django and Rails, but designed for real-time applications."

> "To track users editing a document and give each a different cursor color, we used Phoenix Presence."

**Why they chose Phoenix over Rails/Node:**
- Better WebSocket support
- Built-in real-time primitives
- Superior performance for concurrent connections
- Complete framework (not just library)

**Architecture:**
1. Phoenix Channels for broadcasts
2. Phoenix PubSub for async messaging
3. Phoenix Presence for user tracking
4. Elixir Tasks for async processing (email, notifications)
5. OTP for distributed systems

**Outcome**: Successfully scaled to thousands of companies with just 6 engineers.

### Key Takeaway for Siteflow

Slab's success with Phoenix demonstrates that:
- Phoenix is production-proven for collaborative editing
- Small teams can build sophisticated real-time features
- Edit locking + Presence covers 80% of collaboration needs
- OT/CRDT can be added later if needed (they started simpler)

---

## 11. Code Examples Repository

### Useful Open Source Examples

1. **alchemy-book** - Collaborative text editor in Elixir/Phoenix
   - GitHub: `rudi-c/alchemy-book`
   - Live demo: alchemy.digitalfreepen.com
   - Uses CRDT for conflict resolution

2. **Phoenix LiveView Collaborative Examples**
   - Various demos: collaborative painting, Kanban boards, chat
   - GitHub: `dwyl/PWA-Liveview`
   - Shows presence tracking patterns

3. **use-phoenix-channel** - React hooks library
   - NPM: `use-phoenix-channel`
   - GitHub: `alexgriff/use-phoenix-channel`
   - Production-ready React integration

---

## 12. Recommended Libraries & Tools

### Backend (Elixir/Phoenix)

```elixir
# mix.exs
defp deps do
  [
    {:phoenix, "~> 1.7"},
    {:phoenix_pubsub, "~> 2.1"},  # Built-in with Phoenix
    {:phoenix_html, "~> 3.3"},
    {:phoenix_live_reload, "~> 1.4", only: :dev},
    {:ecto_sql, "~> 3.10"},
    {:postgrex, ">= 0.0.0"},
    {:jason, "~> 1.4"},
    {:cors_plug, "~> 3.0"},  # For React frontend
    {:guardian, "~> 2.3"},   # JWT auth (if not using)
  ]
end
```

### Frontend (React/TypeScript)

```json
{
  "dependencies": {
    "phoenix": "^1.7.10",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/phoenix": "^1.6.0",
    "typescript": "^5.0.0"
  }
}
```

### Optional Enhancements

- **react-markdown**: Render markdown documents
- **monaco-editor**: Rich text editing (like VS Code)
- **framer-motion**: Smooth animations for UI updates
- **react-hot-toast**: Toast notifications for updates

---

## 13. Testing Strategy

### Backend Tests (ExUnit)

```elixir
# test/siteflow_web/channels/project_channel_test.exs
defmodule SiteflowWeb.ProjectChannelTest do
  use SiteflowWeb.ChannelCase

  test "joining a project channel" do
    {:ok, _, socket} = socket("user:123", %{user_id: 123})
      |> subscribe_and_join(ProjectChannel, "project:1")

    assert socket.assigns.project_id == 1
  end

  test "acquiring document lock" do
    {:ok, _, socket} = join_project(123, 1)

    ref = push(socket, "document:start_editing", %{"document_id" => 5})
    assert_reply ref, :ok, %{lock_acquired: true}

    # Verify lock in database
    assert DocumentLock.get_lock(5) != nil
  end

  test "lock prevents concurrent editing" do
    {:ok, _, socket1} = join_project(123, 1)
    {:ok, _, socket2} = join_project(456, 1)

    # User 123 acquires lock
    push(socket1, "document:start_editing", %{"document_id" => 5})

    # User 456 tries to acquire lock
    ref = push(socket2, "document:start_editing", %{"document_id" => 5})
    assert_reply ref, :error, %{reason: "Document is being edited"}
  end
end
```

### Frontend Tests (Vitest + React Testing Library)

```typescript
// hooks/useChannel.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useChannel } from './useChannel';
import { SocketProvider } from '../contexts/SocketContext';

describe('useChannel', () => {
  it('joins channel on mount', async () => {
    const { result } = renderHook(() => useChannel('project:1'), {
      wrapper: SocketProvider
    });

    await waitFor(() => {
      expect(result.current.joined).toBe(true);
    });
  });

  it('pushes messages to channel', async () => {
    const { result } = renderHook(() => useChannel('project:1'), {
      wrapper: SocketProvider
    });

    await waitFor(() => expect(result.current.joined).toBe(true));

    const response = await result.current.push('chat:message', {
      text: 'Hello'
    });

    expect(response).toBeDefined();
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/collaboration.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Real-time Collaboration', () => {
  test('two users see each other online', async ({ browser }) => {
    // Create two browser contexts (two users)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Both join same project
    await page1.goto('/admin/projects/1/planning');
    await page2.goto('/admin/projects/1/planning');

    // User 1 should see User 2 in presence list
    await expect(page1.locator('.user-avatar').count()).toBe(2);
    await expect(page2.locator('.user-avatar').count()).toBe(2);
  });

  test('edit lock prevents concurrent editing', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    await page1.goto('/admin/projects/1/planning');
    await page2.goto('/admin/projects/1/planning');

    // User 1 starts editing
    await page1.click('button:text("Start Editing")');

    // User 2 should see lock indicator
    await expect(page2.locator('.locked-banner')).toBeVisible();
    await expect(page2.locator('button:text("Start Editing")')).toBeDisabled();
  });
});
```

---

## 14. Security Considerations

### Authentication & Authorization

```elixir
defmodule SiteflowWeb.UserSocket do
  use Phoenix.Socket

  # Verify auth token on connection
  def connect(%{"token" => token}, socket, _connect_info) do
    case Guardian.decode_and_verify(token) do
      {:ok, %{"user_id" => user_id}} ->
        {:ok, assign(socket, :user_id, user_id)}

      {:error, _} ->
        :error
    end
  end

  # Require token
  def connect(_, _socket, _connect_info), do: :error
end
```

### Channel Authorization

```elixir
defmodule SiteflowWeb.ProjectChannel do
  def join("project:" <> project_id, _params, socket) do
    user_id = socket.assigns.user_id

    # Check if user has access to this project
    if ProjectService.user_has_access?(user_id, project_id) do
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end
end
```

### Input Validation

```elixir
def handle_in("document:save", payload, socket) do
  with {:ok, validated} <- validate_document_save(payload),
       :ok <- authorize_document_edit(socket, validated.document_id),
       {:ok, document} <- DocumentService.save(validated) do

    broadcast_from!(socket, "document:updated", %{
      document_id: validated.document_id,
      updated_by: socket.assigns.username
    })

    {:reply, {:ok, document}, socket}
  else
    {:error, reason} ->
      {:reply, {:error, %{reason: reason}}, socket}
  end
end

defp validate_document_save(payload) do
  # Use Ecto changeset or custom validation
  schema = %{
    document_id: :integer,
    content: :string
  }

  # Return {:ok, validated} or {:error, reason}
end
```

### Rate Limiting

```elixir
# Prevent spam/abuse
defmodule SiteflowWeb.ProjectChannel do
  use Phoenix.Channel

  @max_messages_per_minute 60

  def handle_in("chat:message", _payload, socket) do
    if rate_limit_exceeded?(socket) do
      {:reply, {:error, %{reason: "Rate limit exceeded"}}, socket}
    else
      # Process message
      track_message_rate(socket)
      # ... rest of logic
    end
  end
end
```

---

## 15. Monitoring & Debugging

### Phoenix Built-in Telemetry

```elixir
# lib/siteflow_web/telemetry.ex
defmodule SiteflowWeb.Telemetry do
  use Supervisor

  def start_link(arg) do
    Supervisor.start_link(__MODULE__, arg, name: __MODULE__)
  end

  def init(_arg) do
    children = [
      {:telemetry_poller, measurements: periodic_measurements(), period: 10_000}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end

  # Track channel metrics
  defp periodic_measurements do
    [
      {SiteflowWeb.Endpoint, :channel_count, []},
      {SiteflowWeb.Endpoint, :presence_count, []}
    ]
  end
end
```

### Logging Channel Events

```elixir
def handle_in(event, payload, socket) do
  Logger.info("Channel event received",
    event: event,
    user_id: socket.assigns.user_id,
    project_id: socket.assigns.project_id
  )

  # ... handle event
end
```

### Client-Side Debugging

```javascript
// Enable Phoenix socket logging
const socket = new Socket('ws://localhost:4000/socket', {
  params: { token },
  logger: (kind, msg, data) => {
    console.log(`[${kind}] ${msg}`, data);
  }
});
```

---

## Conclusion

### Recommended Architecture for Siteflow

**Backend (Phoenix)**
```
Phoenix Channels (WebSocket)
├── ProjectChannel (project:*)
│   ├── Document editing events
│   ├── Checklist updates
│   └── Chat messages
├── Phoenix Presence
│   └── Online user tracking
└── PostgreSQL
    ├── planning_documents
    ├── document_locks (edit locking)
    ├── project_chat_messages
    └── planning_checklist_items
```

**Frontend (React)**
```
React App
├── SocketProvider (Context)
├── useChannel (Custom Hook)
├── usePresence (Custom Hook)
└── Components
    ├── PlanningDocument (with edit locking)
    ├── OnlineUsers (presence list)
    ├── ProjectChat
    └── PlanningChecklist
```

### Why This Works for Siteflow

1. **Simple**: Edit locking is vastly simpler than OT/CRDT
2. **Sufficient**: 9 separate documents don't need paragraph-level collaboration
3. **Scalable**: Phoenix proven to 2M connections (you need ~500 max)
4. **Fast to build**: 4-5 weeks to production
5. **Maintainable**: Small team can own this
6. **Extensible**: Can add OT later if needed (Slab did this)

### Next Steps

1. Set up Phoenix backend with Channels
2. Implement basic Socket + Channel connection in React
3. Build edit locking mechanism
4. Add presence tracking
5. Implement chat and checklist features
6. Test with real users
7. Launch MVP

**Total estimated time**: 5-6 weeks for full implementation.

---

## Additional Resources

### Documentation
- [Phoenix Channels Guide](https://hexdocs.pm/phoenix/channels.html)
- [Phoenix Presence Guide](https://hexdocs.pm/phoenix/presence.html)
- [Phoenix JavaScript Client](https://hexdocs.pm/phoenix/js/)
- [Real-Time Phoenix Book](https://pragprog.com/titles/sbsockets/real-time-phoenix/)

### Case Studies
- [Slab: Real-time collaboration with Elixir](http://elixir-lang.org/blog/2020/11/17/real-time-collaboration-with-elixir-at-slab/)
- [Phoenix: The Road to 2 Million WebSocket Connections](https://phoenixframework.org/blog/the-road-to-2-million-websocket-connections)

### Example Code
- [alchemy-book](https://github.com/rudi-c/alchemy-book) - Collaborative editor
- [use-phoenix-channel](https://github.com/alexgriff/use-phoenix-channel) - React hooks

### Community
- [Elixir Forum](https://elixirforum.com/)
- [Phoenix Discord](https://discord.gg/elixir)
