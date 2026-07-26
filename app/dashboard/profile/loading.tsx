import { Skeleton } from "@/components/dashboard/ui/Skeleton";
import { Panel } from "@/components/dashboard/ui/Panel";

function FormBlock({ fields }: { fields: number }) {
  return (
    <Panel className="p-5">
      <Skeleton className="h-4 w-32" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="mt-2 h-10 w-full rounded-[8px]" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-5 h-10 w-28 rounded-[8px]" />
    </Panel>
  );
}

export default function Loading() {
  return (
    <div className="grid gap-4">
      <FormBlock fields={4} />
      <FormBlock fields={4} />
    </div>
  );
}
