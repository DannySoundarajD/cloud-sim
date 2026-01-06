# CloudSim — User Journey Walkthrough

## 1. Purpose and Scope

This document provides a **complete architectural walkthrough of CloudSim**, following the **actual user journey** from first interaction through cloud execution. It is intended to be read alongside the architecture diagram and serves as a narrative explanation of how system components collaborate at runtime.

## 2. System Context Overview

CloudSim is composed of four primary layers:

- **User Interaction Layer**: (Browser)
- **Frontend Application Layer**:
  - React (UI Framework)
  - TypeScript (Type-safe JavaScript)
  - Axios (HTTP Client for API calls)
  - Vite (Build tool, dev server)
  - Tailwind CSS (Styling)
- **Backend Orchestration Layer**: (FastAPI + PostgreSQL)
- **Infrastructure & Persistence Layer**: (AWS EC2, CloudWatch, Cost Explorer)

The following diagram establishes the architectural context used throughout this walkthrough.

![System Context Overview](./images/cloudsim_architecture.png)

## 3. Entry Point: User Interaction and Frontend Boundary

All CloudSim workflows begin with user interaction in the browser. The frontend operates as a single-page application (SPA) responsible solely for presentation, navigation, and request orchestration. No cloud credentials or business logic are present in this layer.

```mermaid
flowchart LR
    User --> Browser
    Browser -->|UI Events| ReactApp[React SPA]
```

## 4. Authentication and Session Establishment Flow

![Authentication Flow](./images/login_flow.png)

Authentication is the first architectural gate. Users submit credentials via the login interface, which are transmitted securely to the backend. The backend validates credentials against the database and issues a signed JWT embedding identity and role claims.

Once issued, the JWT enables stateless communication across the system.

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as Backend Auth
    participant DB as PostgreSQL

    U->>FE: Submit credentials
    FE->>API: POST /auth/login
    API->>DB: Validate user
    DB-->>API: User + role
    API-->>FE: JWT token
```

## 5. Dashboard Load Walkthrough

![Dashboard Load Walkthrough](./images/frontend.png)

After authentication, the dashboard is the primary landing view. Its purpose is to present a real-time inventory of EC2 instances. The frontend requests instance data without assumptions about infrastructure state.

The backend performs authorization checks and queries AWS directly, ensuring the dashboard reflects live cloud data.

```mermaid
sequenceDiagram
    participant FE as Frontend Dashboard
    participant API as EC2 Routes
    participant AWS as AWS EC2

    FE->>API: GET /ec2/instances
    API->>API: Authorize role
    API->>AWS: DescribeInstances
    AWS-->>API: Instance metadata
    API-->>FE: Normalized response
```

## 6. Instance Lifecycle Operations

![Instance Lifecycle Operations](./images/launchInstance.png)

Lifecycle actions (start, stop, reboot, terminate) are initiated by explicit user intent. The frontend sends an intent-based request and immediately relinquishes control. All enforcement and execution occur in the backend and AWS.

Instance state transitions are asynchronous and eventually consistent.

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant API as EC2 Routes
    participant AWS as AWS EC2

    FE->>API: POST /ec2/start
    API->>API: Check permissions
    API->>AWS: StartInstances
    AWS-->>API: Acknowledgement
    API-->>FE: Action accepted
```

## 7. Instance Details Aggregation Flow

![Instance Details Aggregation Flow](./images/instanceDetail.png)

The instance details page requires data from multiple AWS subsystems. Rather than exposing this complexity to the frontend, the backend aggregates and normalizes the data into a single response model.

This design preserves frontend simplicity while maintaining backend control.

```mermaid
flowchart TB
    FE[Frontend Details View]
    API[Backend Aggregator]
    EC2[AWS EC2]
    VPC[AWS Networking]
    EBS[AWS Storage]

    FE --> API
    API --> EC2
    API --> VPC
    API --> EBS
    EC2 --> API
    VPC --> API
    EBS --> API
    API --> FE
```

## 8. Monitoring and Metrics Flow

![Monitoring and Metrics Flow](./images/monitoringInstance.png)

Monitoring workflows allow users to inspect instance performance over time. The frontend specifies the instance and time range, while the backend handles CloudWatch semantics and data shaping.

This separation enables reusable visualization components and consistent metric interpretation.

```mermaid
sequenceDiagram
    participant FE as Monitoring UI
    participant API as Monitoring Routes
    participant CW as CloudWatch

    FE->>API: GET /metrics?instanceId
    API->>CW: GetMetricStatistics
    CW-->>API: Raw datapoints
    API-->>FE: Chart-ready metrics
```

## 9. Administrative Workflow

![Administrative Workflow](./images/adminSetting.png)
Administrative actions reuse the same architectural pipeline but require elevated role claims. This ensures a consistent execution model while enforcing least-privilege access.

Admin operations may interact with both persistent storage and cloud services.

```mermaid
sequenceDiagram
    participant Admin as Admin User
    participant FE as Admin Panel
    participant API as Admin Routes
    participant DB as PostgreSQL
    participant AWS as AWS

    Admin->>FE: Admin action
    FE->>API: Authorized request
    API->>API: Role validation
    API->>DB: Update users
    API->>AWS: Enforce infra policy
    API-->>FE: Result
```

## 10. Error Propagation and Resilience

All errors are handled centrally by the backend. AWS and validation errors are mapped to standardized HTTP responses. The frontend interprets these responses and provides user-friendly feedback without exposing internal system details.

```mermaid
flowchart LR
    AWS -->|Error| API
    API -->|HTTP Error| FE
    FE -->|UI Feedback| User
```

## 11. End-to-End Architectural Summary

From the user’s perspective, CloudSim provides a clean, predictable interface for managing infrastructure. From the system’s perspective, it enforces strict separation of concerns:

- Frontend expresses intent
- Backend enforces policy and orchestration
- AWS executes infrastructure state
