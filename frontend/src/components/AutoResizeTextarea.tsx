"use client";

import { TextareaHTMLAttributes, useEffect, useRef } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
    value: string;
};

export default function AutoResizeTextarea({ value, className = "", ...props }: Props) {
    const ref = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        // Reset height to recalc, then set to scroll height
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    }, [value]);

    return (
        <textarea
            ref={ref}
            value={value}
            {...props}
            className={`w-full overflow-hidden resize-none ${className}`}
        />
    );
}
