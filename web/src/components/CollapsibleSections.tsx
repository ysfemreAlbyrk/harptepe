import { useLayoutEffect, useRef, type ReactNode } from 'react';

interface CollapsibleSectionsProps {
  children: ReactNode;
  className?: string;
}

export function CollapsibleSections({ children, className }: CollapsibleSectionsProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const container = root;

    const sections = () => Array.from(container.querySelectorAll<HTMLElement>(':scope > .control-section'));

    function updateSection(section: HTMLElement, collapsed: boolean) {
      section.classList.toggle('collapsed', collapsed);
      section.querySelector(':scope > .section-heading')?.setAttribute('aria-expanded', String(!collapsed));
    }

    function collapseOthers(section: HTMLElement, shouldOpen: boolean) {
      sections().forEach((item) => updateSection(item, true));
      if (shouldOpen) updateSection(section, false);
    }

    function headingFor(target: HTMLElement) {
      if (target.closest('button, input, select, textarea, a')) return null;
      const heading = target.closest<HTMLElement>('.section-heading');
      if (!heading || !container.contains(heading)) return null;
      const section = heading.parentElement;
      return section?.classList.contains('control-section') ? { heading, section } : null;
    }

    sections().forEach((section, index) => {
      section.classList.add('collapsible-control');
      const heading = section.querySelector<HTMLElement>(':scope > .section-heading');
      heading?.setAttribute('role', 'button');
      heading?.setAttribute('tabindex', '0');
      updateSection(section, index !== 0);
    });

    function onClick(event: MouseEvent) {
      const match = headingFor(event.target as HTMLElement);
      if (!match) return;
      collapseOthers(match.section, match.section.classList.contains('collapsed'));
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const match = headingFor(event.target as HTMLElement);
      if (!match) return;
      event.preventDefault();
      collapseOthers(match.section, match.section.classList.contains('collapsed'));
    }

    container.addEventListener('click', onClick);
    container.addEventListener('keydown', onKeyDown);
    return () => {
      container.removeEventListener('click', onClick);
      container.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}
