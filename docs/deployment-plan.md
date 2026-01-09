This implementation plan bridges the gap between the PRD/UI designs and the actual code. It breaks the project down into logical, sequential phases to ensure a smooth build.

---

# Implementation Plan: Private S3 Browser UI

## 1. Project Overview & Tech Stack

* **Goal:** Build a read-only, fast, private S3 file explorer with a 3-column "Master-Detail" layout.
* **Architecture:** Single Page Application (SPA) consuming a lightweight Backend API.
* **Stack:**
* **Frontend:** React (Vite), Tailwind CSS, Phosphor Icons (or Heroicons), `react-query` (for caching/state).
* **Backend:** Node.js (Express or Fastify) or Next.js (API Routes).
* **SDK:** `@aws-sdk/client-s3`.
* **Deploy:** Dockerized container (or Vercel/Netlify for Next.js).



---

## 2. Phase 1: Backend & AWS Integration (Foundation)

**Objective:** reliable communication with S3 and secure URL generation.

* **Task 1.1: Environment Setup**
* Initialize repo (TypeScript recommended).
* Configure `dotenv` to read: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3BROWSER_BUCKET_ALLOWLIST`.


* **Task 1.2: API Endpoint - `GET /api/buckets**`
* Use `ListBucketsCommand`.
* Filter results based on `S3BROWSER_BUCKET_ALLOWLIST` (if set).
* Return JSON: `[{ name: "string", creationDate: "date" }]`.


* **Task 1.3: API Endpoint - `GET /api/files**`
* Accept query params: `bucket`, `prefix` (folder path), `delimiter` (usually `/`).
* Use `ListObjectsV2Command`.
* **Crucial:** Handle "CommonPrefixes" (folders) vs "Contents" (files) in the response.
* Implement pagination using `ContinuationToken`.


* **Task 1.4: API Endpoint - `POST /api/presign**`
* Accept body: `{ bucket, key, operation: 'getObject' }`.
* Use `getSignedUrl` from `@aws-sdk/s3-request-presigner`.
* Set TTL (e.g., 900 seconds).



---

## 3. Phase 2: Frontend "Skeleton" & State

**Objective:** A working UI that displays raw data without styling perfection.

* **Task 2.1: Project Init**
* Setup Vite + React + Tailwind.
* Define Color System in `tailwind.config.js` (see UI Spec for Hex codes).
* Install icon library.


* **Task 2.2: State Management**
* Setup `react-query` or `SWR` for fetching buckets and files.
* Create a global store (Zustand or Context) for:
* `currentBucket`
* `currentPrefix` (folder path)
* `selectedFile` (for the Inspector panel)




* **Task 2.3: Basic Routing/Layout**
* Implement the 3-column grid structure (Sidebar, Main, Inspector).
* Make the columns responsive (Inspector slides over on mobile, sits next to content on desktop).



---

## 4. Phase 3: Core UI Implementation (The "Master-Detail" View)

**Objective:** Build the specific UI components defined in the Dark/Light mode designs.

* **Task 3.1: Left Sidebar (Bucket List)**
* Fetch and map `GET /api/buckets`.
* Implement "Active" state styling (Solid Blue bg).


* **Task 3.2: Main Content (File Browser)**
* **Breadcrumbs:** Split `currentPrefix` by `/` and render clickable links.
* **Data Table:**
* Columns: Icon, Name, Modified, Size.
* Row Click:
* If Folder -> Update `currentPrefix`.
* If File -> Update `selectedFile` (opens Inspector).




* **Pagination:** Next/Prev buttons utilizing the S3 `ContinuationToken`.


* **Task 3.3: Inspector Panel (Right Sidebar)**
* Create a conditional component that renders when `selectedFile` is not null.
* **Preview Logic:**
* Call `/api/presign` on mount.
* If Image -> Render `<img>`.
* If Video -> Render `<video>`.
* Else -> Show file icon.


* **Actions:** "Download" button (direct link to presigned URL).



---

## 5. Phase 4: Polish & Themes

**Objective:** Make it look professional and support Dark Mode.

* **Task 4.1: Dark Mode Implementation**
* Enable `darkMode: 'class'` in Tailwind.
* Create a Theme Toggle (Sun/Moon icon).
* Apply `dark:` classes to all backgrounds, borders, and text as per the UI Spec (e.g., `bg-white dark:bg-slate-900`).


* **Task 4.2: Sorting & Filtering (Client-side v1)**
* Implement "Sort by Date/Name/Size" logic on the currently fetched page of data.


* **Task 4.3: Loading States**
* Add Skeleton loaders (shimmer effect) for the table rows while data fetches.