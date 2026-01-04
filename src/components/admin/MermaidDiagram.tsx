import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface MermaidDiagramProps {
  chart: string;
  title?: string;
  className?: string;
}

// Initialize mermaid with configuration
mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
  fontFamily: "Inter, sans-serif",
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: "basis",
  },
});

export function MermaidDiagram({ chart, title, className }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current) return;

      setIsLoading(true);
      setError(null);

      try {
        // Clear previous content
        containerRef.current.innerHTML = "";
        
        // Generate unique ID for this diagram
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Render the diagram
        const { svg } = await mermaid.render(id, chart);
        
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.error("Mermaid render error:", err);
        setError("Gagal merender diagram");
      } finally {
        setIsLoading(false);
      }
    };

    renderDiagram();
  }, [chart]);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 2));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleReset = () => setScale(1);

  return (
    <Card className={className}>
      {title && (
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{title}</CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={scale <= 0.5}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground w-12 text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={scale >= 2}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {error && (
          <div className="text-center py-8 text-destructive">
            <p>{error}</p>
          </div>
        )}
        <div
          className="overflow-auto"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            transition: "transform 0.2s ease-in-out",
          }}
        >
          <div
            ref={containerRef}
            className={`mermaid-container ${isLoading ? "hidden" : ""}`}
            style={{ minHeight: isLoading ? 0 : "auto" }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Predefined diagrams for FIM website
export const architectureDiagram = `
flowchart TB
    subgraph Client["🖥️ Client Layer"]
        Browser["Browser"]
        ReactApp["React + Vite App"]
    end
    
    subgraph Frontend["📱 Frontend (React)"]
        Router["React Router"]
        Components["UI Components<br/>(shadcn/ui)"]
        TanStack["TanStack Query"]
        Context["Auth Context"]
    end
    
    subgraph Backend["☁️ Backend (Supabase)"]
        Auth["Supabase Auth"]
        Database["PostgreSQL DB"]
        Storage["File Storage"]
        EdgeFn["Edge Functions"]
        RLS["Row Level Security"]
    end
    
    subgraph External["🔗 External Services"]
        Resend["Resend API"]
    end
    
    Browser --> ReactApp
    ReactApp --> Router
    Router --> Components
    Components --> TanStack
    TanStack --> Context
    Context --> Auth
    TanStack --> Database
    Components --> Storage
    EdgeFn --> Resend
    Database --> RLS
`;

export const databaseDiagram = `
erDiagram
    articles ||--o{ article_comments : has
    profiles ||--o{ articles : writes
    profiles ||--o{ user_roles : has
    profiles ||--o{ admin_sessions : owns
    profiles ||--o{ admin_notifications : receives
    
    articles {
        uuid id PK
        text title
        text content
        text slug
        enum status
        enum category
        uuid author_id FK
        timestamp published_at
    }
    
    profiles {
        uuid id PK
        text username
        text email
        text full_name
        boolean is_active
    }
    
    user_roles {
        uuid id PK
        uuid user_id FK
        enum role
    }
    
    admin_sessions {
        uuid id PK
        uuid user_id FK
        text session_token
        timestamp last_activity
    }
`;

export const authFlowDiagram = `
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Supabase Auth
    participant DB as Database
    participant E as Edge Function
    
    U->>F: Enter credentials
    F->>A: signInWithPassword()
    A->>DB: Check login_attempts
    
    alt Rate limited
        A-->>F: Error: Too many attempts
        F-->>U: Show rate limit message
    else Valid login
        A->>DB: Verify credentials
        A-->>F: Return session
        F->>DB: Fetch profile & role
        F->>E: notify-login()
        E->>DB: Create audit log
        F-->>U: Redirect to dashboard
    end
`;

export const articleFlowDiagram = `
flowchart LR
    subgraph Moderator
        M1[Create Article] --> M2[Edit Content]
        M2 --> M3[Submit for Approval]
    end
    
    subgraph SuperAdmin
        M3 --> SA1{Review}
        SA1 -->|Approve| SA2[Published]
        SA1 -->|Reject| SA3[Rejected]
        SA1 -->|Revise| SA4[Request Revision]
        SA4 --> M2
    end
    
    subgraph Public
        SA2 --> P1[View on Blog]
        P1 --> P2[Increment Views]
    end
`;

export const securityDiagram = `
flowchart TB
    subgraph Request["📨 Incoming Request"]
        Req[API Request]
    end
    
    subgraph Auth["🔐 Authentication"]
        JWT[JWT Validation]
        Session[Session Check]
    end
    
    subgraph RLS["🛡️ Row Level Security"]
        Policy1[Check user_id]
        Policy2[Check role]
        Policy3[Check ownership]
    end
    
    subgraph Audit["📝 Audit"]
        Log[Audit Log]
    end
    
    Req --> JWT
    JWT --> Session
    Session --> Policy1
    Policy1 --> Policy2
    Policy2 --> Policy3
    Policy3 --> Log
`;
