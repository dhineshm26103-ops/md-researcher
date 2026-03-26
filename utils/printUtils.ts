
/**
 * Triggers a browser print dialog with specific layout overrides.
 * Ensures the page is scrolled to top for correct capture.
 */
export const triggerPDFExport = (
  title: string,
  printClass: string,
  onStart: () => void,
  onEnd: () => void
) => {
  onStart();
  
  const originalTitle = document.title;
  document.title = title.replace(/[^a-z0-9]/gi, '_');
  
  // Ensure we are at the top of the scroll container for consistent rendering
  const container = document.getElementById('root');
  if (container) container.scrollTop = 0;
  window.scrollTo(0, 0);
  
  // Add global printing classes
  document.body.classList.add('is-printing', printClass);

  const cleanup = () => {
    document.body.classList.remove('is-printing', printClass);
    document.title = originalTitle;
    onEnd();
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup);

  // Allow layout, charts, and images to settle
  setTimeout(() => {
    try {
      window.print();
    } catch (e) {
      console.error("Print failed:", e);
      cleanup();
    }
    // Safety fallback for browsers that don't trigger afterprint reliably
    setTimeout(cleanup, 3000);
  }, 1200);
};
