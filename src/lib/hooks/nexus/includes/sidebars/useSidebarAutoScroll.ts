"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";

interface Options {
  sidebarScrollContainerSelector: string;
  sidebarActiveDropdownKey: string | null;
  sidebarScrollMaxAttempts?: number;
  sidebarScrollRetryDelay?: number;
  scrollBehavior?: ScrollBehavior;
  observeMutations?: boolean; // Option to observe DOM changes
}

export function useSidebarAutoScroll({
  sidebarScrollContainerSelector,
  sidebarActiveDropdownKey,
  sidebarScrollMaxAttempts = 20,
  sidebarScrollRetryDelay = 100,
  scrollBehavior = "smooth",
  observeMutations = false, // Off by default for performance
}: Options) {
  // Use a Set to track multiple active keys if needed
  const processedKeys = useRef<Set<string>>(new Set());
  const attemptCount = useRef(0);
  const rafId = useRef<number | null>(null);
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mutationObserver = useRef<MutationObserver | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  // Memoize the selector to prevent unnecessary recalculations
  const selector = useMemo(() => 
    sidebarActiveDropdownKey ? `[target-scroll-item-accordion-key="${sidebarActiveDropdownKey}"]` : null,
    [sidebarActiveDropdownKey]
  );

  const centerElementInContainer = useCallback((
    container: HTMLElement,
    element: HTMLElement
  ): number => {
    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    const elementRelativeTop = elementRect.top - containerRect.top;
    
    const scrollTop = 
      container.scrollTop + 
      elementRelativeTop - 
      (containerRect.height / 2) + 
      (elementRect.height / 2);

    // Add boundary checks
    const maxScroll = container.scrollHeight - containerRect.height;
    return Math.max(0, Math.min(scrollTop, maxScroll));
  }, []);

  const getElements = useCallback(() => {
    if (!sidebarActiveDropdownKey || !selector) return { container: null, element: null };

    // Cache elements if they're still valid
    if (containerRef.current && document.body.contains(containerRef.current)) {
      const element = document.querySelector(selector) as HTMLElement | null;
      if (element && document.body.contains(element)) {
        return { container: containerRef.current, element };
      }
    }

    // Otherwise, query fresh
    const container = document.querySelector(sidebarScrollContainerSelector) as HTMLElement | null;
    const element = document.querySelector(selector) as HTMLElement | null;
    
    // Update cache
    if (container) containerRef.current = container;
    if (element) elementRef.current = element;
    
    return { container, element };
  }, [sidebarActiveDropdownKey, sidebarScrollContainerSelector, selector]);

  const isElementReady = useCallback((element: HTMLElement): boolean => {
    // Fast checks first
    const elementRect = element.getBoundingClientRect();
    if (elementRect.height === 0) return false;

    // Check if element or its parents are hidden
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return false;
    }

    // Check if any parent is hidden
    let parent = element.parentElement;
    while (parent) {
      const parentStyle = window.getComputedStyle(parent);
      if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden') {
        return false;
      }
      parent = parent.parentElement;
    }

    return true;
  }, []);

  const attemptScroll = useCallback((): boolean => {
    if (!sidebarActiveDropdownKey || !selector) return false;

    // Check if we've already processed this key
    if (processedKeys.current.has(sidebarActiveDropdownKey)) return true;

    const { container, element } = getElements();
    if (!container || !element) return false;

    if (!isElementReady(element)) return false;

    // Verify container is scrollable
    const containerStyle = window.getComputedStyle(container);
    const isScrollable = containerStyle.overflowY === 'auto' || 
                        containerStyle.overflowY === 'scroll' ||
                        container.scrollHeight > container.clientHeight;
    
    if (!isScrollable) return false;

    const scrollTop = centerElementInContainer(container, element);
    
    // Only scroll if position is significantly different
    const SCROLL_THRESHOLD = 5; // pixels
    if (Math.abs(container.scrollTop - scrollTop) > SCROLL_THRESHOLD) {
      container.scrollTo({
        top: scrollTop,
        behavior: scrollBehavior,
      });
    }

    // Mark as processed
    processedKeys.current.add(sidebarActiveDropdownKey);
    return true;
  }, [sidebarActiveDropdownKey, selector, getElements, isElementReady, centerElementInContainer, scrollBehavior]);

  // Cleanup all resources
  const cleanup = useCallback(() => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }
    if (mutationObserver.current) {
      mutationObserver.current.disconnect();
      mutationObserver.current = null;
    }
  }, []);

  useEffect(() => {
    if (!sidebarActiveDropdownKey) {
      // Clear processed keys when no active key
      processedKeys.current.clear();
      containerRef.current = null;
      elementRef.current = null;
      return cleanup;
    }

    const tryScroll = () => {
      if (attemptCount.current >= sidebarScrollMaxAttempts) {
        // Still couldn't find element after max attempts, clear from processed
        // so it can try again if needed
        processedKeys.current.delete(sidebarActiveDropdownKey);
        return;
      }

      const success = attemptScroll();
      
      if (!success) {
        attemptCount.current++;
        timeoutId.current = setTimeout(() => {
          rafId.current = requestAnimationFrame(tryScroll);
        }, sidebarScrollRetryDelay);
      }
    };

    // Initial attempt
    rafId.current = requestAnimationFrame(() => {
      rafId.current = requestAnimationFrame(tryScroll);
    });

    // Set up mutation observer if enabled (for dynamic content)
    if (observeMutations && sidebarActiveDropdownKey) {
      mutationObserver.current = new MutationObserver((mutations) => {
        // Check if our element was added/modified
        const relevantMutation = mutations.some(mutation => 
          Array.from(mutation.addedNodes).some(node => 
            node.nodeType === 1 && (node as Element).matches?.(selector || '')
          )
        );
        
        if (relevantMutation) {
          // Reset attempt count and try again
          attemptCount.current = 0;
          tryScroll();
        }
      });

      mutationObserver.current.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['target-scroll-item-accordion-key', 'style', 'class'],
      });
    }

    // Handle page load
    if (document.readyState !== "complete") {
      const handleLoad = () => {
        attemptCount.current = 0;
        tryScroll();
      };
      window.addEventListener("load", handleLoad);
      return () => {
        window.removeEventListener("load", handleLoad);
        cleanup();
      };
    }

    return cleanup;
  }, [sidebarActiveDropdownKey, selector, attemptScroll, sidebarScrollMaxAttempts, sidebarScrollRetryDelay, observeMutations, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return null;
}