import { useEffect, useRef } from 'react';
import { useBrowserStore } from '../store/browserStore';
import { parseS3Uri, ParsedS3Uri } from '../utils/s3Uri';

// Declare global type for deep link target
declare global {
  interface Window {
    __deepLinkTarget?: ParsedS3Uri;
  }
}

/**
 * Hook to handle deep-linking via URL parameters
 * Parses ?uri=s3://bucket/path/file.jpg and navigates to the appropriate location
 */
export function useDeepLink() {
  const hasProcessed = useRef(false);
  const { setBucket, setPrefix } = useBrowserStore();

  useEffect(() => {
    // Only process once
    if (hasProcessed.current) return;

    const params = new URLSearchParams(window.location.search);
    const uri = params.get('uri');

    if (!uri) return;

    const parsed = parseS3Uri(uri);
    if (!parsed) {
      console.warn('[DeepLink] Invalid S3 URI:', uri);
      return;
    }

    hasProcessed.current = true;
    console.log('[DeepLink] Navigating to:', parsed);

    // Store target for file selection after data loads
    window.__deepLinkTarget = parsed;

    // Navigate to bucket and prefix
    setBucket(parsed.bucket);
    if (parsed.prefix) {
      setPrefix(parsed.prefix);
    }
  }, [setBucket, setPrefix]);
}
