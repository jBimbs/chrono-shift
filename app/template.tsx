import Nav from "@/components/Nav";

const SHELL_CSS = `
.page-fade { animation: page-fade 0.35s ease-out backwards; }
@keyframes page-fade { from { opacity: 0; } to { opacity: 1; } }

.page-slide { animation: page-slide 0.35s ease-out backwards; }
@keyframes page-slide { from { transform: translateY(8px); } to { transform: none; } }

@media (prefers-reduced-motion: reduce) {
  .page-fade, .page-slide { animation: none; }
}

/* Page frame: nav on top, page fills the rest */
.app-shell { display: flex; flex-direction: column; min-height: 100dvh; }
.app-body { flex: 1 1 auto; display: flex; flex-direction: column; }
.page-main {
  position: relative;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* Fixed, non-scrollable pages on laptops and desktops */
@media (min-width: 1024px) and (min-height: 680px) {
  html, body { height: 100%; overflow: hidden; }
  .app-shell { height: 100dvh; overflow: hidden; }
  .app-body { min-height: 0; }
  .page-main { min-height: 0; overflow: hidden; }
}
`;

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SHELL_CSS }} />
      <div className="page-fade app-shell">
        <Nav />
        <div className="page-slide app-body">{children}</div>
      </div>
    </>
  );
}