Here is the updated UI specification. It retains the structure of the "Master-Detail" design (based on the `ui-1.jpg` mockup) but now explicitly defines the **Dark Mode** color system and behavior to match the dark aesthetic you requested.

### 1. High-Level Concept & Aesthetic

* **Visual Style:** A professional, density-comfortable "Management Console." It balances the utility of a file explorer with the sleekness of a modern SaaS app.
* **Theme Strategy:** A "System-preference" default with a manual toggle.
* **Light Mode:** Clean, high-contrast, clinical (White/Light Gray/Royal Blue).
* **Dark Mode:** Deep, immersive, low-eye-strain (Charcoal/Gunmetal/Electric Blue).


* **Layout:** **3-Column Layout:** Navigation (Left) + Content (Center) + Inspector/Preview (Right).

---

### 2. The Color System (Light vs. Dark)

This table defines how the palette adapts between modes.

| UI Element | Light Mode Definition | Dark Mode Definition |
| --- | --- | --- |
| **Main Background** | Pure White (`#FFFFFF`) | Deep Charcoal / Slate (`#0F172A`) |
| **Sidebar/Panel Bg** | Very Light Gray (`#F9FAFB`) | Darker Gunmetal (`#1E293B`) |
| **Borders/Dividers** | Light Gray (`#E5E7EB`) | Subtle Dark Gray (`#334155`) |
| **Primary Text** | Near Black (`#111827`) | Off-White / Gray-50 (`#F9FAFB`) |
| **Secondary Text** | Medium Gray (`#6B7280`) | Muted Gray (`#9CA3AF`) |
| **Accent / Primary** | Royal Blue (`#2563EB`) | Electric Blue (`#3B82F6`) |
| **Hover State** | Pale Blue Wash (`#EFF6FF`) | Dark Blue Tint (`#1E3A8A`) |

---

### 3. Layout Structure (Wireframe)

The wireframe remains consistent, but the "feel" changes significantly in Dark Mode due to the receding backgrounds.

```
+--------------------------------------------------------------------------------------------------+
|  Header: S3 Browser (Dark: #1E293B / Light: #FFFFFF)                                             |
+------------------+-------------------------------------------------------+-----------------------+
| LEFT SIDEBAR     | MAIN CONTENT AREA                                     | INSPECTOR PANEL       |
| (Secondary Bg)   | (Primary Bg)                                          | (Secondary Bg)        |
|                  |                                                       |                       |
| Buckets          | Breadcrumbs: bucket / trips / ...                     | Header: tokyo1.jpg    |
|                  +-------------------------------------------------------+                       |
| [Active Bucket]  | [View v] [Sort v] [Filter v]            [ Search ]    | [ X ]                 |
| - my-media-bucket|                                                       |                       |
|                  | Name             Last Modified       Action           | +-------------------+ |
| - docs-archive   | 📁 japan-trip/   11/20/2010          Open             | |                 | |
|                  | 🖼️ tokyo1.jpg    12/01/2024          Preview          | |      IMAGE      | |
| - backup-files   | 🎬 day3.mp4      11/20/2020          Preview          | |     PREVIEW     | |
|                  | 📄 notes.md      11/20/2010          Download         | |                 | |
|                  |                                                       | +-------------------+ |
|                  |                                                       |                       |
|                  |                                                       | 📄 tokyo1.jpg         |
|                  |                                                       | Modified: Dec 01 2024 |
|                  |                                                       | Size: 2.4 MB          |
|                  |                                                       |                       |
|                  |                                                       | [ Download ] [Copy..] |
+------------------+-------------------------------------------------------+-----------------------+
| Footer           | Footer: <  Page 3 of 10  >                            |                       |
+------------------+-------------------------------------------------------+-----------------------+

```

---

### 4. Detailed Component Breakdown & Dark Mode Specifics

#### A. Left Sidebar (Bucket Navigation)

* **Background:**
* *Light:* Light gray (`#F9FAFB`).
* *Dark:* A distinct dark panel (`#1E293B`) separated from the main content by a 1px dark border (`#334155`).


* **Active Selection:**
* *Both Modes:* A solid Blue rounded rectangle (`#3B82F6` in Dark Mode for better pop). Text inside is White.


* **Inactive Items:**
* *Dark Mode:* Text is light gray (`#D1D5DB`). On hover, the background becomes a slightly lighter charcoal (`#334155`).



#### B. Main Content Area (The Browser)

* **Background:**
* *Light:* White.
* *Dark:* The deepest shade (`#0F172A`). This makes the content feel like it is "sitting on" the page.


* **Top Toolbar (Filters & Search):**
* **Dropdowns:** In Dark Mode, these are dark buttons with light borders. When clicked, the dropdown menu is a floating dark card (`#1E293B`) with white text.
* **Search Bar:** Dark gray input background (`#1F2937`) with light text.


* **The Object List (Table):**
* **Headers:** Muted text (`#9CA3AF`) with a bottom border.
* **Rows:**
* *Default:* Transparent background.
* *Hover (Dark):* A very subtle dark blue tint (`rgba(59, 130, 246, 0.1)`) or lighter gray (`#1F2937`).


* **Icons:**
* Folder Icons: Bright Yellow/Gold (`#FBBF24`) — stands out nicely against dark.
* Image Icons: Cyan/Light Blue (`#38BDF8`).
* Video Icons: Purple/Indigo (`#818CF8`).


* **Actions:** The "Preview" text link is the primary accent color (`#60A5FA` - a lighter blue than standard to ensure readability on dark).



#### C. The Inspector Panel (Right Preview Sidebar)

* **Surface:**
* *Dark Mode:* Matches the Left Sidebar (`#1E293B`). This frames the main content in the center.


* **Separation:** A 1px border on the left (`#334155`).
* **Preview Area:**
* Images/Videos are displayed against a black or very deep checkered background to ensure true color representation.


* **Metadata Text:** High contrast white for values (`2.4 MB`), muted gray for labels (`Size`).
* **Buttons:**
* **Download:** Solid Blue (`#3B82F6`).
* **Copy URI:** Transparent background with a white border (`border-gray-600`) and white text.



### 5. Implementation Note for Developer (CSS/Tailwind)

When building this, use CSS variables or Tailwind's `dark:` modifier.

* **Example approach:**
* App Container: `bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100`
* Sidebars: `bg-gray-50 dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700`
* Primary Button: `bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400` (Dark mode buttons are often slightly lighter to appear "glowing" or more visible).