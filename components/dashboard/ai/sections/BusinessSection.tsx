"use client";

import type { Business } from "@prisma/client";
import { IconBuildingStore } from "@tabler/icons-react";
import { AreaField, TextField } from "../parts";
import { SectionForm } from "../SectionForm";

export function BusinessSection({ business }: { business: Business | null }) {
  return (
    <SectionForm
      section="business"
      icon={IconBuildingStore}
      title={"dashboard.ai.businessSection.businessInformation"}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="name"
          required
          label={"dashboard.ai.businessSection.companyName"}
          defaultValue={business?.name}
        />
        <TextField
          name="field"
          label={"dashboard.ai.businessSection.industry"}
          defaultValue={business?.field}
        />
        <TextField
          name="email"
          type="email"
          label={"dashboard.ai.businessSection.email"}
          defaultValue={business?.email}
          placeholder="info@company.ge"
        />
        <TextField
          name="phone"
          label={"dashboard.ai.businessSection.phoneNumber"}
          defaultValue={business?.phone}
          placeholder="+995 5XX XX XX XX"
        />
        <TextField
          name="contactInfo"
          label={"dashboard.ai.businessSection.otherContactDetails"}
          defaultValue={business?.contactInfo}
          placeholder={"dashboard.ai.businessSection.viberTelegramFax"}
        />
        <TextField
          name="workingHours"
          label={"dashboard.ai.businessSection.workingHours"}
          defaultValue={business?.workingHours}
          placeholder={"dashboard.ai.businessSection.placeholder"}
        />
        <TextField
          name="site"
          label={"dashboard.ai.businessSection.website"}
          defaultValue={business?.site}
          placeholder="www.company.ge"
        />
        <TextField
          name="branches"
          label={"dashboard.ai.businessSection.branchLocations"}
          defaultValue={business?.branches}
          placeholder={"dashboard.ai.businessSection.placeholder2"}
        />
      </div>

      <AreaField
        name="description"
        label={"dashboard.ai.businessSection.detailedDescription"}
        defaultValue={business?.description}
        rows={4}
      />

      <AreaField
        name="extra"
        label={"dashboard.ai.businessSection.additionalInformation"}
        defaultValue={business?.extra}
        rows={3}
      />
    </SectionForm>
  );
}
