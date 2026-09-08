'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { createPortal } from 'react-dom';


type TooltipPosition =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right';


interface TooltipState {
  target: HTMLElement;
  text: string;
  position: TooltipPosition;
}


interface Coordinates {
  top: number;
  left: number;
}


const TOOLTIP_GAP = 9;
const SCREEN_PADDING = 8;


export function GlobalTooltip() {
  const tooltipRef =
    useRef<HTMLDivElement>(null);


  const [
    tooltip,
    setTooltip,
  ] = useState<TooltipState | null>(
    null,
  );


  const [
    coordinates,
    setCoordinates,
  ] = useState<Coordinates | null>(
    null,
  );


  /* =========================================================
     CHECK WHETHER DEVICE REALLY SUPPORTS HOVER
  ========================================================= */

  function canShowTooltip() {
    return window.matchMedia(
      '(hover: hover) and (pointer: fine)',
    ).matches;
  }


  /* =========================================================
     POSITION TOOLTIP

     Because this tooltip is rendered in document.body,
     overflow-hidden cards cannot clip it.
  ========================================================= */

  useLayoutEffect(() => {
    if (
      !tooltip ||
      !tooltipRef.current
    ) {
      return;
    }


    const targetRect =
      tooltip.target.getBoundingClientRect();


    const tooltipRect =
      tooltipRef.current.getBoundingClientRect();


    const tooltipWidth =
      tooltipRect.width;

    const tooltipHeight =
      tooltipRect.height;


    let requestedPosition =
      tooltip.position;


    /* =======================================================
       AUTO FLIP WHEN THERE IS NOT ENOUGH SPACE
    ======================================================= */

    if (
      requestedPosition === 'top' &&
      targetRect.top <
        tooltipHeight +
          TOOLTIP_GAP +
          SCREEN_PADDING
    ) {
      requestedPosition =
        'bottom';
    }


    if (
      requestedPosition === 'bottom' &&
      window.innerHeight -
        targetRect.bottom <
        tooltipHeight +
          TOOLTIP_GAP +
          SCREEN_PADDING
    ) {
      requestedPosition =
        'top';
    }


    if (
      requestedPosition === 'left' &&
      targetRect.left <
        tooltipWidth +
          TOOLTIP_GAP +
          SCREEN_PADDING
    ) {
      requestedPosition =
        'right';
    }


    if (
      requestedPosition === 'right' &&
      window.innerWidth -
        targetRect.right <
        tooltipWidth +
          TOOLTIP_GAP +
          SCREEN_PADDING
    ) {
      requestedPosition =
        'left';
    }


    let top = 0;
    let left = 0;


    /* =======================================================
       CALCULATE POSITION
    ======================================================= */

    if (
      requestedPosition === 'top'
    ) {
      top =
        targetRect.top -
        tooltipHeight -
        TOOLTIP_GAP;

      left =
        targetRect.left +
        targetRect.width / 2 -
        tooltipWidth / 2;
    }


    if (
      requestedPosition === 'bottom'
    ) {
      top =
        targetRect.bottom +
        TOOLTIP_GAP;

      left =
        targetRect.left +
        targetRect.width / 2 -
        tooltipWidth / 2;
    }


    if (
      requestedPosition === 'left'
    ) {
      top =
        targetRect.top +
        targetRect.height / 2 -
        tooltipHeight / 2;

      left =
        targetRect.left -
        tooltipWidth -
        TOOLTIP_GAP;
    }


    if (
      requestedPosition === 'right'
    ) {
      top =
        targetRect.top +
        targetRect.height / 2 -
        tooltipHeight / 2;

      left =
        targetRect.right +
        TOOLTIP_GAP;
    }


    /* =======================================================
       KEEP TOOLTIP INSIDE VIEWPORT
    ======================================================= */

    left = Math.max(
      SCREEN_PADDING,
      Math.min(
        left,
        window.innerWidth -
          tooltipWidth -
          SCREEN_PADDING,
      ),
    );


    top = Math.max(
      SCREEN_PADDING,
      Math.min(
        top,
        window.innerHeight -
          tooltipHeight -
          SCREEN_PADDING,
      ),
    );


    setCoordinates({
      top,
      left,
    });
  }, [tooltip]);


  /* =========================================================
     GLOBAL TOOLTIP EVENTS
  ========================================================= */

  useEffect(() => {
    function showTooltip(
      element: HTMLElement,
    ) {
      if (!canShowTooltip()) {
        return;
      }


      if (
        element.getAttribute(
          'data-tooltip-clicked',
        ) === 'true'
      ) {
        return;
      }


      const text =
        element.getAttribute(
          'data-tooltip',
        );


      if (!text) {
        return;
      }


      const positionAttribute =
        element.getAttribute(
          'data-tooltip-position',
        );


      const position: TooltipPosition =
        positionAttribute === 'top' ||
        positionAttribute === 'bottom' ||
        positionAttribute === 'left' ||
        positionAttribute === 'right'
          ? positionAttribute
          : 'bottom';


      setCoordinates(null);


      setTooltip({
        target: element,
        text,
        position,
      });
    }


    /* =======================================================
       POINTER ENTER
    ======================================================= */

    function handlePointerOver(
      event: PointerEvent,
    ) {
      const target =
        event.target as HTMLElement;


      const element =
        target.closest<HTMLElement>(
          '[data-tooltip]',
        );


      if (!element) {
        return;
      }


      const relatedTarget =
        event.relatedTarget as
          | Node
          | null;


      if (
        relatedTarget &&
        element.contains(
          relatedTarget,
        )
      ) {
        return;
      }


      showTooltip(element);
    }


    /* =======================================================
       POINTER LEAVE
    ======================================================= */

    function handlePointerOut(
      event: PointerEvent,
    ) {
      const target =
        event.target as HTMLElement;


      const element =
        target.closest<HTMLElement>(
          '[data-tooltip]',
        );


      if (!element) {
        return;
      }


      const relatedTarget =
        event.relatedTarget as
          | Node
          | null;


      if (
        relatedTarget &&
        element.contains(
          relatedTarget,
        )
      ) {
        return;
      }


      element.removeAttribute(
        'data-tooltip-clicked',
      );


      setTooltip((current) => {
        if (
          current?.target === element
        ) {
          return null;
        }

        return current;
      });


      setCoordinates(null);
    }


    /* =======================================================
       CLICK / TAP

       Hide immediately after click.
       It only becomes available again after pointer leaves.
    ======================================================= */

    function handlePointerDown(
      event: PointerEvent,
    ) {
      const target =
        event.target as HTMLElement;


      const element =
        target.closest<HTMLElement>(
          '[data-tooltip]',
        );


      if (!element) {
        return;
      }


      element.setAttribute(
        'data-tooltip-clicked',
        'true',
      );


      setTooltip(null);
      setCoordinates(null);
    }


    /* =======================================================
       KEYBOARD FOCUS
    ======================================================= */

    function handleFocusIn(
      event: FocusEvent,
    ) {
      const target =
        event.target as HTMLElement;


      const element =
        target.closest<HTMLElement>(
          '[data-tooltip]',
        );


      if (!element) {
        return;
      }


      if (
        element.getAttribute(
          'data-tooltip-clicked',
        ) === 'true'
      ) {
        return;
      }


      showTooltip(element);
    }


    function handleFocusOut(
      event: FocusEvent,
    ) {
      const target =
        event.target as HTMLElement;


      const element =
        target.closest<HTMLElement>(
          '[data-tooltip]',
        );


      if (!element) {
        return;
      }


      element.removeAttribute(
        'data-tooltip-clicked',
      );


      setTooltip(null);
      setCoordinates(null);
    }


    /* =======================================================
       SCROLL

       Hide tooltip instead of leaving floating text behind.
    ======================================================= */

    function handleScroll() {
      setTooltip(null);
      setCoordinates(null);
    }


    document.addEventListener(
      'pointerover',
      handlePointerOver,
    );

    document.addEventListener(
      'pointerout',
      handlePointerOut,
    );

    document.addEventListener(
      'pointerdown',
      handlePointerDown,
    );

    document.addEventListener(
      'focusin',
      handleFocusIn,
    );

    document.addEventListener(
      'focusout',
      handleFocusOut,
    );

    window.addEventListener(
      'scroll',
      handleScroll,
      true,
    );


    return () => {
      document.removeEventListener(
        'pointerover',
        handlePointerOver,
      );

      document.removeEventListener(
        'pointerout',
        handlePointerOut,
      );

      document.removeEventListener(
        'pointerdown',
        handlePointerDown,
      );

      document.removeEventListener(
        'focusin',
        handleFocusIn,
      );

      document.removeEventListener(
        'focusout',
        handleFocusOut,
      );

      window.removeEventListener(
        'scroll',
        handleScroll,
        true,
      );
    };
  }, []);


  if (
        !tooltip ||
        typeof document === 'undefined'
    ) {
        return null;
    }


    return createPortal(
        <div
            ref={tooltipRef}
            role="tooltip"
            style={{
                top:
                    coordinates?.top ??
                    -9999,

                left:
                    coordinates?.left ??
                    -9999,

                visibility:
                    coordinates
                        ? 'visible'
                        : 'hidden',
            }}
            className="
            pointer-events-none
            fixed
            z-[25]

            max-w-[360px]
            whitespace-nowrap

            rounded-lg

            border
            border-white/10

            bg-[#111827]

            px-2.5
            py-1.5

            text-[11px]
            font-medium
            leading-4
            text-white

            shadow-[0_10px_35px_rgba(0,0,0,.28)]

            cf-global-tooltip
      "
        >
            {tooltip.text}
        </div>,

    document.body,
  );
}