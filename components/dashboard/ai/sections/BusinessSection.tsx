"use client";

import type { Business } from "@prisma/client";
import { IconBuildingStore } from "@tabler/icons-react";
import { saveBusinessInfo } from "@/lib/dashboard/actions";
import { AreaField, SectionForm, TextField } from "../parts";

export function BusinessSection({ business }: { business: Business | null }) {
  return (
    <SectionForm
      icon={IconBuildingStore}
      title={{ ka: "ბიზნესის ინფორმაცია", en: "Business information" }}
      action={saveBusinessInfo}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="name"
          required
          label={{ ka: "კომპანიის დასახელება", en: "Company name" }}
          defaultValue={business?.name}
        />
        <TextField
          name="field"
          label={{ ka: "საქმიანობის სფერო", en: "Industry" }}
          defaultValue={business?.field}
        />
        <TextField
          name="email"
          type="email"
          label={{ ka: "იმეილი", en: "Email" }}
          defaultValue={business?.email}
          placeholder="info@company.ge"
        />
        <TextField
          name="phone"
          label={{ ka: "ტელეფონის ნომერი", en: "Phone number" }}
          defaultValue={business?.phone}
          placeholder="+995 5XX XX XX XX"
        />
        <TextField
          name="contactInfo"
          label={{ ka: "სხვა საკონტაქტო ინფორმაცია", en: "Other contact details" }}
          defaultValue={business?.contactInfo}
          placeholder="Viber, Telegram, ფაქსი…"
        />
        <TextField
          name="workingHours"
          label={{ ka: "სამუშაო საათები", en: "Working hours" }}
          defaultValue={business?.workingHours}
          placeholder="ორშ–პარ 10:00–18:00"
        />
        <TextField
          name="site"
          label={{ ka: "საიტი", en: "Website" }}
          defaultValue={business?.site}
          placeholder="www.company.ge"
        />
        <TextField
          name="branches"
          label={{ ka: "ფილიალების მდებარეობა", en: "Branch locations" }}
          defaultValue={business?.branches}
          placeholder="მისამართები გამოყავით მძიმით: თბილისი …, ბათუმი …"
        />
      </div>

      <AreaField
        name="description"
        label={{ ka: "საქმიანობის დეტალური აღწერა", en: "Detailed description" }}
        defaultValue={business?.description}
        rows={4}
      />

      <AreaField
        name="extra"
        label={{ ka: "დამატებითი ინფორმაცია", en: "Additional information" }}
        defaultValue={business?.extra}
        rows={3}
      />
    </SectionForm>
  );
}
