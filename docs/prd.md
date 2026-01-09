Private S3 Browser UI

1) Overview

You store mixed content (images, videos, PDFs, markdown, etc.) in private S3 buckets as a “personal repository.” AWS Console works but is not pleasant for casual browsing and previewing. This project provides a clean web UI to:
	•	list buckets
	•	list objects like a local file explorer (paginated, sortable)
	•	preview images/videos inline
	•	download everything else
	•	authenticate to AWS using API keys from environment variables (minimal setup)

2) Goals

Primary goals
	•	Make private S3 content pleasant to browse, like Google Drive / Finder (but minimal).
	•	Enable inline previews for common media: images + videos.
	•	Keep it read-only by default (safe and simple).

Non-goals (v1)
	•	Uploading, deleting, moving, renaming, tagging, lifecycle policies
	•	Sharing/public links
	•	Multi-user permissions and IAM federation/SSO
	•	Full-text search inside file contents (PDF/OCR/Markdown indexing)

3) Target users
	•	You (primary): a technical user with S3 buckets and objects, wants quick browsing and preview.
	•	Optionally: small team / household users later, but v1 assumes single-user.

4) Key use cases
	1.	“I want to open my S3 like a folder tree and quickly find stuff.”
	2.	“I want to preview an image/video without downloading.”
	3.	“I want to download PDFs/archives/docs when I need them.”
	4.	“I want a quick sense of size and freshness (Last Modified).”

5) Product requirements

5.1 Bucket browser
	•	Show list of accessible buckets.
	•	For each bucket show:
	•	bucket name
	•	region (if available)
	•	optional: total object count (non-goal if expensive; can be omitted v1)
	•	Click bucket → open object list.

Acceptance criteria
	•	Buckets render within a reasonable time (<2s typical for normal accounts).
	•	Errors are user-friendly (e.g., invalid credentials, permissions, no buckets).

⸻

5.2 Object browser (file-list view)

Behaves like a folder view:
	•	List objects with:
	•	filename (key)
	•	last modified date
	•	size (human readable + raw bytes on hover/secondary)
	•	Pagination (S3 list is paginated; UI should match)
	•	Sorting:
	•	default: Last modified desc (most recent first)
	•	optional toggle: name asc/desc, size asc/desc
	•	“Folders” via prefix delimiter /:
	•	show “directories” as items
	•	click directory → list objects under that prefix
	•	Breadcrumb navigation: bucket / prefix1 / prefix2

Acceptance criteria
	•	User can navigate into/out of prefixes quickly.
	•	User sees at least 3 columns: Name, Last modified, Size.
	•	Pagination controls are visible and consistent.

⸻

5.3 Preview

Image preview
	•	For common image formats: jpg, jpeg, png, webp, gif
	•	Clicking an image opens a preview panel/modal with zoom-to-fit and actual-size option.

Video preview
	•	For common video formats: mp4, webm, mov (note: browser compatibility varies)
	•	Inline player with play/pause/seek.

Other files
	•	Download action.
	•	(Optional v1 bonus) PDF preview if easy, otherwise download only.

Implementation requirement
	•	Use pre-signed URLs for preview and download (keeps bucket private, no public ACL).
	•	Pre-signed URLs should have short TTL (e.g., 1–15 minutes).

Acceptance criteria
	•	Image preview loads and displays without downloading manually.
	•	Video preview plays in-browser for supported formats.
	•	Non-media files always have a download button.

⸻

5.4 Credentials + Configuration
	•	Read AWS credentials from environment variables:
	•	AWS_ACCESS_KEY_ID
	•	AWS_SECRET_ACCESS_KEY
	•	AWS_REGION (optional default)
	•	AWS_SESSION_TOKEN (optional for temporary creds)
	•	Optional envs for product behavior:
	•	S3BROWSER_DEFAULT_REGION
	•	S3BROWSER_PRESIGN_TTL_SECONDS
	•	S3BROWSER_BUCKET_ALLOWLIST (comma-separated) (optional security feature)
	•	S3BROWSER_READONLY=true (default)

Acceptance criteria
	•	App runs with only env vars + minimal config.
	•	Clear error if env vars missing or invalid.

⸻

6) User stories (with acceptance criteria)

Bucket browsing
	1.	As a user, I want to see a list of my S3 buckets so I can choose where to browse.
	•	Given valid AWS creds, when I open the app, I see my bucket list.
	•	If I lack permission, I see a clear message (“Access denied to ListBuckets”).
	2.	As a user, I want to click a bucket and see its contents like a folder view.
	•	Clicking a bucket loads an object list for that bucket.
	•	Breadcrumb shows the bucket root.

Object list and navigation
	3.	As a user, I want to see objects in a paginated list so big buckets are manageable.
	•	I can go Next/Previous page.
	•	UI doesn’t freeze on large buckets.
	4.	As a user, I want to navigate folders/prefixes so I can browse logically.
	•	Prefixes show as folder items.
	•	Clicking a folder updates the list and breadcrumb.
	5.	As a user, I want to sort by last modified so I can find recent files quickly.
	•	Default sorting is most recent first.
	•	I can change sorting to name/size.

Preview and download
	6.	As a user, I want to preview images so I can quickly identify them without downloading.
	•	Clicking an image opens a preview.
	•	Preview loads via a pre-signed URL.
	7.	As a user, I want to play videos so I can view them directly in the UI.
	•	Clicking a video opens a player.
	•	Player supports play/pause/seek and uses a pre-signed URL.
	8.	As a user, I want to download any object so I can open it locally.
	•	Each item has a download action.
	•	Download uses pre-signed URL and works without making bucket public.

Credential handling
	9.	As a user, I want the app to use env-based AWS keys so setup is simple and safe.
	•	App does not require storing keys in the database.
	•	If keys are missing, the app shows a setup hint.

⸻

7) UX requirements
	•	Clean, modern “file explorer” layout:
	•	left sidebar: bucket list
	•	main: object list
	•	top: breadcrumb + sort + optional search box (search can be v1.1)
	•	Object rows with recognizable icons by type (image/video/doc/archive)
	•	Preview experience:
	•	modal or side panel
	•	“Download” always available from preview
	•	Loading skeletons for list + preview
	•	Empty states: “No objects in this folder”

8) Technical approach (high-level)

Suggested architecture
	•	Backend (API):
	•	Lists buckets
	•	Lists objects with delimiter/prefix and pagination token
	•	Generates pre-signed URLs for GET object (preview/download)
	•	Frontend:
	•	Calls API
	•	Renders file explorer and preview components

Security notes (v1)
	•	Do not expose AWS keys to the browser (keep creds server-side).
	•	Use pre-signed URLs; never make buckets public.
	•	Optional allowlist of buckets for safety (especially if deployed).

9) Metrics / Success criteria
	•	Time-to-first-bucket-list < 2 seconds (typical)
	•	Time-to-open-preview < 2 seconds for common image sizes (typical network)
	•	0 cases where app requires public bucket ACL
	•	User (you) uses it at least weekly as “S3 drive”

10) Milestones
	•	MVP (v1):
	•	bucket list
	•	object list w/ prefix navigation + pagination
	•	image/video preview via pre-signed URLs
	•	download for all
	•	env-based AWS creds
	•	v1.1 (nice-to-have):
	•	quick search by substring (client-side for current page; server-side later)
	•	PDF preview
	•	“copy s3://…” and “copy pre-signed URL”
	•	favorites / pinned buckets or prefixes