## 🧠 Brainstorm: Dynamic Database & Settings Screen Configuration

### Context
The goal is to transition the application from a static mock-data-driven system to a **dynamic platform** where Admin and HR roles can manage organizational rules, policies, and permissions through a **Settings Screen**. The solution must adhere to the O-S-C-P (Organizational-Position-Classification-Person) model and the architectural streamline diagram provided.

---

### Option A: Metadata-Driven Resource Model (The "Config-First" approach)
In this approach, we move all hardcoded logic and metadata (currently in `lib/rbac.ts` and `mock-data.ts` helpers) into the database resources. The Settings Screen becomes a UI for these metadata files.

✅ **Pros:**
- **High Flexibility:** Admin can create new Leave Types, Job Families, or Organizational Levels without changing a single line of code.
- **Single Source of Truth:** Code only handles the "how" (rendering), while Data handles the "what" (structure).
- **Direct Mapping:** Perfectly matches the "Policy & System" cluster in our Streamline Map.

❌ **Cons:**
- **Parsing Complexity:** Requires more complex logic in the frontend to handle dynamic schema definitions.
- **Data Integrity Risk:** Settings changes could break existing employee records if not carefully validated.

📊 **Effort:** Medium

---

### Option B: Unified Permission & RBAC Resource Management
Currently, permissions are hardcoded in `lib/rbac.ts`. This option proposes migrating the entire RBAC system into a `permissions.json` and `system_config.json` resource. The Settings Screen would feature a "Security Matrix" editor.

✅ **Pros:**
- **Dynamic Access Control:** HR can adjust permissions for specific roles on the fly (e.g., giving an HR Specialist temporary "Delete" access).
- **Auditability:** Changes to permissions are stored as data updates, making it easier to track who changed what.
- **Diagram Alignment:** Directly implements the "Permission" flow highlighted in the complex architectural diagram.

❌ **Cons:**
- **Security Overhead:** Requires robust error handling to prevent "Locked Out" scenarios where an Admin accidentally removes their own access.
- **Performance:** Permission checks might become slightly more expensive (need to read/parse data before routing).

📊 **Effort:** Medium

---

### Option C: Business Rule & Workflow Engine (The "Logic-as-Data" approach)
Focus on the workflows seen in the complex diagram. This moves approval chains (e.g., who approves P-001's leave?) into a `workflow_definitions.json` resource. 

✅ **Pros:**
- **Process Automation:** Admin can set up multi-level approval flows (e.g., Manager -> HR -> Finance) via the Settings Screen.
- **Scalability:** Easily handles complex organizational hierarchies where approval paths vary by department.
- **Wowed User:** This is a "Premium" enterprise feature that significantly increases the app's value.

❌ **Cons:**
- **High Implementation Effort:** Requires building a workflow parser and state machine.
- **UI Complexity:** Building a user-friendly "Approval Flow Builder" is a significant design task.

📊 **Effort:** High

---

## 💡 Recommendation

**Option A + B (Combined)** is the recommended starting point.

1.  **Phase 1 (Option B):** Externalize `rbac.ts` into `permissions.json`. This is the low-hanging fruit that makes the Settings Screen immediately useful for Admin/Security management.
2.  **Phase 2 (Option A):** Move "Policy" data (Leave Types, Holidays, Job Levels) into fully editable CRUD resources. This fulfills the user's requirement to let Admin/HR "setup data".

### 🛠️ Suggested Database Adjustments:
1.  **[NEW]** `permissions.json`: Stores the matrix of Role -> Module -> Action.
2.  **[NEW]** `system_settings.json`: Stores site-wide config (Company Name, Logo, Localization symbols).
3.  **[EXPAND]** `leave_policy_rules.json`: Add a `condition` or `formula` field to make entitlement dynamic.
4.  **[EXPAND]** `job_classifications.json`: Include nested `benefit_package` definitions.

What direction would you like to explore for the initial implementation of the Settings Screen?
