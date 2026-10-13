"use client";

import { useId, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface IncludeUnbilledCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function IncludeUnbilledCheckbox({
  checked,
  onChange,
  disabled = false,
}: IncludeUnbilledCheckboxProps) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className="flex w-fit max-w-full items-start gap-2 text-sm text-foreground-muted cursor-pointer has-disabled:opacity-60"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        className="mt-0.5 h-4 w-4 shrink-0 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      />
      <span>Incluir compras de TC pendientes de facturación del período anterior</span>
    </label>
  );
}

export function DashboardUnbilledCheckbox({ checked }: { checked: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleChange(include: boolean) {
    const params = new URLSearchParams(searchParams.toString());
    if (include) params.set("includeUnbilled", "1");
    else params.delete("includeUnbilled");
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  return (
    <IncludeUnbilledCheckbox checked={checked} onChange={handleChange} disabled={isPending} />
  );
}
