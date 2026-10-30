import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import type { TeamMember } from "@/lib/dashboard/queries";
import { MembersTable } from "./MembersTable";
import { teamAccess } from "./teamMessages";

vi.mock("@/lib/dashboard/actions/team", () => ({ removeTeamMember: vi.fn(), updateMemberRole: vi.fn() }));
vi.mock("@/lib/dashboard/actions/teamInvite", () => ({ resendTeamInvite: vi.fn() }));

const member = (id: string, role: TeamMember["role"]) =>
  ({ id, userId: id, businessId: "b1", role, user: { id, name: id, email: `${id}@x.ge` } }) as unknown as TeamMember;

const MEMBERS = [member("owner", "OWNER"), member("admin", "ADMIN"), member("op", "OPERATOR"), member("viewer", "VIEWER")];

const actionButtons = (role: string, self: string) => {
  const access = teamAccess(role);
  const html = renderToStaticMarkup(
    <LanguageProvider>
      <MembersTable members={MEMBERS} currentUserId={self} pending={false} run={() => {}} {...access} />
    </LanguageProvider>,
  );
  return html.match(/aria-haspopup="dialog"/g)?.length ?? 0;
};

describe("teamAccess()", () => {
  it("lets an owner give every role", () => {
    expect(teamAccess("OWNER")).toMatchObject({ canManage: true, grantable: ["OWNER", "ADMIN", "OPERATOR", "VIEWER"] });
  });

  it("lets an admin give admin, operator and viewer, never owner", () => {
    expect(teamAccess("ADMIN")).toMatchObject({ canManage: true, grantable: ["ADMIN", "OPERATOR", "VIEWER"] });
  });

  it.each(["OPERATOR", "VIEWER"])("gives a %s no team controls", (role) => {
    expect(teamAccess(role).canManage).toBe(false);
  });
});

describe("member actions", () => {
  it("shows an owner the actions on every row", () => {
    expect(actionButtons("OWNER", "owner")).toBe(4);
  });

  it("hides the owner's row from an admin", () => {
    expect(actionButtons("ADMIN", "admin")).toBe(3);
  });

  it.each(["OPERATOR", "VIEWER"])("shows a %s no actions at all", (role) => {
    expect(actionButtons(role, role === "OPERATOR" ? "op" : "viewer")).toBe(0);
  });
});
