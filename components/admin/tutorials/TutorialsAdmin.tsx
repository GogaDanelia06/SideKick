"use client";

import { useState } from "react";
import type { ChannelGuide, Tutorial } from "@prisma/client";
import { IconPlugConnected, IconVideo } from "@tabler/icons-react";
import { AdminHeading } from "@/components/admin/ui/AdminHeading";
import { SectionLayout, SectionRail, type RailItem } from "@/components/admin/ui/SectionRail";
import { TutorialsEditor } from "./TutorialsEditor";
import { ChannelGuidesEditor } from "./ChannelGuidesEditor";

const SECTIONS: RailItem[] = [
  { key: "tutorials", label: { ka: "ვიდეო ინსტრუქციები", en: "Tutorials" }, icon: IconVideo },
  { key: "channels", label: { ka: "არხების დაკავშირება", en: "Channel setup" }, icon: IconPlugConnected },
];

export function TutorialsAdmin({
  tutorials,
  guides,
}: {
  tutorials: Tutorial[];
  guides: ChannelGuide[];
}) {
  const [active, setActive] = useState(SECTIONS[0]!.key);

  return (
    <>
      <AdminHeading
        title={{ ka: "ინსტრუქციები", en: "Help content" }}
        subtitle={{
          ka: "ვიდეოები და ტექსტი, რომელსაც მომხმარებელი დაშბორდში ხედავს.",
          en: "The videos and text customers see inside their dashboard.",
        }}
      />

      <SectionLayout rail={<SectionRail items={SECTIONS} active={active} onSelect={setActive} />}>
        {active === "tutorials" ? (
          <TutorialsEditor tutorials={tutorials} />
        ) : (
          <ChannelGuidesEditor guides={guides} />
        )}
      </SectionLayout>
    </>
  );
}
