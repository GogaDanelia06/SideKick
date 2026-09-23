"use client";

import { useUrlTab } from "@/hooks/useUrlTab";
import type { ChannelGuide, Tutorial } from "@prisma/client";
import { IconPlugConnected, IconVideo } from "@tabler/icons-react";
import { AdminHeading } from "@/components/admin/ui/AdminHeading";
import { SectionLayout, SectionRail, type RailItem } from "@/components/admin/ui/SectionRail";
import { TutorialsEditor } from "./TutorialsEditor";
import { ChannelGuidesEditor } from "./ChannelGuidesEditor";

const SECTIONS: RailItem[] = [
  { key: "tutorials", label: "admin.tutorials.admin.tutorials", icon: IconVideo },
  { key: "channels", label: "admin.tutorials.admin.channelSetup", icon: IconPlugConnected },
];

const SECTION_KEYS = SECTIONS.map((s) => s.key);

export function TutorialsAdmin({
  tutorials,
  guides,
}: {
  tutorials: Tutorial[];
  guides: ChannelGuide[];
}) {
  const [active, setActive] = useUrlTab("section", SECTION_KEYS, SECTION_KEYS[0]);

  return (
    <>
      <AdminHeading
        title={"admin.tutorials.admin.helpContent"}
        subtitle={"admin.tutorials.admin.subtitle"}
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
