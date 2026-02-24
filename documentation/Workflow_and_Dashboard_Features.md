# TaxConsultGuru: Full Project Workflow & Dashboard Documentation

TaxConsultGuru is a specialized platform designed to bridge the gap between clients seeking tax/financial services and Chartered Accountants (CAs). The platform operates on a "Managed Bridge" model where an Admin oversees all interactions to ensure quality and security.

---

## 1. Project Workflow Lifecycle

The project follows a linear but highly controlled workflow for every service request:

### Phase 1: Service Request (Client)
- **Selection**: Client browses the service catalog (ITR Filing, GST Registration, Audit, etc.).
- **Requirement Drafting**: Client provides specific details and requirements for the needed service.
- **Submission**: Request is submitted and enters the "Searching" state.

### Phase 2: Professional Matching (CA)
- **Broadcast**: The platform broadcasts the request to all online CAs.
- **Acceptance**: A CA reviews the budget and description and "Accepts" the job.
- **Transition**: The request status changes to "Pending Approval".

### Phase 3: Bridge Activation (Admin)
- **Review**: Admin reviews the matched pair (Client and CA).
- **Approval**: Admin approves the match, making the job "Active".
- **Bridge Setup**: Two distinct chat channels are created:
    - **Channel A**: Admin <-> Client
    - **Channel B**: Admin <-> CA

### Phase 4: Managed Fulfillment (Admin Mediator)
- **Masked Communication**: 
    - Clients talk to "TCG Expert Team" (Admin).
    - CAs talk to "TCG Admin Desk" (Admin).
- **Information Forwarding**: Admin reviews messages from the CA and "Forwards" relevant updates/documents to the Client (and vice versa).
- **Quality Control**: Admin ensures all technical tax work meets platform standards before delivery.

---

## 2. Admin Dashboard (Command Center)

The Admin Dashboard is the nerve center of the platform, providing "God Mode" oversight.

### Key Features:
- **Bridge Chat Interface**: 
    - Split-screen chat view for every active job.
    - One-click "Forward to Client/CA" buttons for rapid mediation.
    - Identity masking to preserve platform integrity.
- **Live Activity Feed**: 
    - Real-time terminal-style log of all system events (logins, requests, approvals, messages).
- **Team Management**:
    - Manage Admin staff.
    - Track online/offline status of all users (CAs and Clients).
- **Request Oversight**:
    - Central list of all pending and active jobs.
    - Master "Approve" control for newly matched requests.
- **System Stats**: Quick glance cards for online users, pending approvals, and total active jobs.

---

## 3. CA Dashboard (Professional Portal)

Designed for speed and professional efficiency, focusing on job acquisition and reporting.

### Key Features:
- **Live Job Listening**:
    - Real-time "Radar" mode that pulses when active.
    - Real-time notifications for new service requests matching CA expertise.
- **Opportunity Management**:
    - "Quick Accept" popups for incoming jobs with budget and description previews.
    - History of accepted jobs with status tracking (Pending vs. Active).
- **Admin Desk Communication**:
    - Secure channel to report progress to the Admin.
    - Receives instructions and client attachments directly from the Admin team.
- **Availability Toggle**: Simple Online/Offline switch to control job flow.

---

## 4. Client Dashboard (Service Portal)

Focused on user experience and simple access to complex financial services.

### Key Features:
- **Service Catalog**: 
    - Visual grid of all available tax and consulting services.
    - Transparent "starting from" pricing for each service.
- **Request Tracking**:
    - Real-time status indicators (Searching, Processing, Active).
    - Visual feedback during the "Matchmaking" phase.
- **Expert Team Chat**:
    - Direct line to the "TCG Expert Team".
    - History of all interactions and advice provided per request.
- **Profile Management**: Simple view of client identity and active engagements.

---

## 5. Technical Highlights
- **Role-Based Access Control (RBAC)**: Strict segregation of data between Admin, CA, and Client.
- **Managed Communication Pattern**: Prevents direct CA-Client contact, ensuring the platform remains the trusted intermediary.
- **Real-time Synchronization**: Uses a context-based backend (MockBackendContext) for instantaneous state updates across dashboards.
