import type { HeroMock } from "@/lib/content/hero";
import { ICON_NAMES } from "@/lib/content/icons";
import { normalizeYouTubeUrl } from "@/lib/dashboard/youtube";
import { field, parsed, safeUrl } from "./fields";

export type BoxKind = "benefit" | "service";

export type BoxData = { icon: string; titleKa: string; titleEn: string; bodyKa: string; bodyEn: string };

const HERO_MOCKS: ReadonlySet<string> = new Set<HeroMock>(["chat", "dashboard", "tester"]);

const DEFAULT_ICON = "IconSparkles";

export function parseFaq(fd: FormData) {
  const data = {
    questionKa: field(fd, "questionKa"),
    questionEn: field(fd, "questionEn"),
    answerKa: field(fd, "answerKa"),
    answerEn: field(fd, "answerEn"),
  };
  const complete = data.questionKa && data.questionEn && data.answerKa && data.answerEn;
  return parsed(data, complete ? null : "all_fields_required");
}

export function parseSlide(fd: FormData) {
  const mediaUrl = field(fd, "mediaUrl");
  const mock = field(fd, "mock");
  const data = {
    mediaUrl: mediaUrl ? safeUrl(mediaUrl, "") : null,
    mediaType: field(fd, "mediaType") || null,
    mock: HERO_MOCKS.has(mock) ? mock : null,
    badgeKa: field(fd, "badgeKa"),
    badgeEn: field(fd, "badgeEn"),
    titleKa: field(fd, "titleKa"),
    titleEn: field(fd, "titleEn"),
    textKa: field(fd, "textKa"),
    textEn: field(fd, "textEn"),
    ctaLabelKa: field(fd, "ctaLabelKa"),
    ctaLabelEn: field(fd, "ctaLabelEn"),
    ctaUrl: safeUrl(field(fd, "ctaUrl"), "/pricing"),
  };
  return parsed(data, data.titleKa && data.titleEn ? null : "title_required");
}

export function parseBox(fd: FormData) {
  const icon = field(fd, "icon");
  const data: BoxData = {
    icon: ICON_NAMES.includes(icon) ? icon : DEFAULT_ICON,
    titleKa: field(fd, "titleKa"),
    titleEn: field(fd, "titleEn"),
    bodyKa: field(fd, "bodyKa"),
    bodyEn: field(fd, "bodyEn"),
  };
  return parsed(data, data.titleKa && data.titleEn ? null : "title_required");
}

export function parseLegalSection(fd: FormData) {
  const data = {
    headingKa: field(fd, "headingKa"),
    headingEn: field(fd, "headingEn"),
    bodyKa: field(fd, "bodyKa"),
    bodyEn: field(fd, "bodyEn"),
    bulletsKa: field(fd, "bulletsKa"),
    bulletsEn: field(fd, "bulletsEn"),
  };
  return parsed(data, data.headingKa && data.headingEn ? null : "heading_required");
}

export function parseTutorial(fd: FormData) {
  const youtubeUrl = normalizeYouTubeUrl(field(fd, "youtubeUrl"));
  const data = {
    titleKa: field(fd, "titleKa"),
    titleEn: field(fd, "titleEn"),
    descKa: field(fd, "descKa"),
    descEn: field(fd, "descEn"),
    categoryKa: field(fd, "categoryKa"),
    categoryEn: field(fd, "categoryEn"),
    youtubeUrl: youtubeUrl ?? "",
  };
  return parsed(data, !data.titleKa ? "title_required" : !youtubeUrl ? "bad_url" : null);
}
